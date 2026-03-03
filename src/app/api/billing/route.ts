import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// POST /api/billing/generate - Owner generates monthly billing for all students
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        // Verify ownership
        const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } })
        if (!tenant || tenant.ownerId !== user.userId) return apiError('Forbidden', 403)

        const body = await req.json()
        const { month: monthStr } = body // "YYYY-MM" format

        let month: Date
        if (monthStr) {
            month = new Date(`${monthStr}-01`)
        } else {
            // Default to previous month
            const now = new Date()
            month = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        }
        month.setHours(0, 0, 0, 0)

        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
        monthEnd.setHours(23, 59, 59, 999)

        // Get all active students for this tenant
        const students = await prisma.user.findMany({
            where: { tenantId: user.tenantId, role: 'STUDENT' },
            include: {
                studentPlans: {
                    where: {
                        status: 'ACTIVE',
                        startDate: { lte: monthEnd },
                        endDate: { gte: month },
                    },
                    include: { mealPlan: true },
                },
            },
        })

        const results = []

        for (const student of students) {
            const activePlan = student.studentPlans[0]
            if (!activePlan) continue

            // Count attendance in month
            const mealsTaken = await prisma.attendance.count({
                where: {
                    userId: student.id,
                    tenantId: user.tenantId,
                    date: { gte: month, lte: monthEnd },
                },
            })

            // Count skips in month
            const mealsSkipped = await prisma.skipMeal.count({
                where: {
                    userId: student.id,
                    tenantId: user.tenantId,
                    date: { gte: month, lte: monthEnd },
                },
            })

            const totalMeals = activePlan.mealPlan.totalMeals
            // Billing = proportion of meals taken × plan price
            const amount =
                totalMeals > 0
                    ? Number(
                        ((mealsTaken / totalMeals) * activePlan.mealPlan.price).toFixed(2)
                    )
                    : 0

            // Upsert billing record
            const billing = await prisma.billing.upsert({
                where: { userId_month: { userId: student.id, month } },
                update: { mealsTaken, mealsSkipped, totalMeals, amount },
                create: {
                    userId: student.id,
                    tenantId: user.tenantId,
                    month,
                    mealsTaken,
                    mealsSkipped,
                    totalMeals,
                    amount,
                },
            })

            results.push({ student: { id: student.id, name: student.name }, billing })
        }

        return apiResponse({
            message: `Billing generated for ${results.length} students`,
            month: monthStr || month.toISOString().split('T')[0],
            records: results,
        })
    } catch (err) {
        console.error('[POST /api/billing/generate]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])

// GET /api/billing - Student views own bills, Owner views all
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const where: Record<string, unknown> = { tenantId: user.tenantId }
        if (user.role === 'STUDENT') {
            where.userId = user.userId
        }

        const bills = await prisma.billing.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { month: 'desc' },
        })

        return apiResponse(bills)
    } catch (err) {
        console.error('[GET /api/billing]', err)
        return apiError('Internal server error', 500)
    }
})
