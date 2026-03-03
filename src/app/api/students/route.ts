import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'
import { canAddStudent } from '@/lib/subscription'

// POST /api/students/join - Student joins a mess via invite code
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (user.tenantId) {
            return apiError('You are already enrolled in a mess', 409)
        }

        const body = await req.json()
        const { inviteCode, mealPlanId } = body

        if (!inviteCode) return apiError('Invite code is required')

        // Find tenant by invite code
        const tenant = await prisma.tenant.findUnique({
            where: { inviteCode },
            include: { _count: { select: { students: true } } },
        })

        if (!tenant) return apiError('Invalid invite code', 404)
        if (tenant.suspendedAt) return apiError('This mess is currently suspended', 403)
        if (tenant.billingStatus !== 'ACTIVE') return apiError('This mess has an inactive billing status', 403)

        // Backend-enforced plan limit check
        const check = canAddStudent(tenant._count.students, tenant.subscriptionTier)
        if (!check.allowed) {
            return apiError(check.message!, 402)
        }

        // Assign student to tenant
        await prisma.user.update({
            where: { id: user.userId },
            data: { tenantId: tenant.id },
        })

        // Subscribe to meal plan if provided
        if (mealPlanId) {
            const plan = await prisma.mealPlan.findFirst({
                where: { id: mealPlanId, tenantId: tenant.id, isActive: true },
            })
            if (!plan) return apiError('Invalid or inactive meal plan', 404)

            const start = new Date()
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
            const end = new Date(start)
            end.setMonth(end.getMonth() + 1)
            end.setDate(0)

            await prisma.studentPlan.create({
                data: {
                    userId: user.userId,
                    mealPlanId,
                    startDate: start,
                    endDate: end,
                    status: 'ACTIVE',
                },
            })
        }

        return apiResponse({
            message: `Successfully joined ${tenant.name}!`,
            tenantId: tenant.id,
            tenantName: tenant.name,
        })
    } catch (err) {
        console.error('[POST /api/students/join]', err)
        return apiError('Internal server error', 500)
    }
}, ['STUDENT'])

// GET /api/students - Owner lists all students in their mess
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const students = await prisma.user.findMany({
            where: { tenantId: user.tenantId, role: 'STUDENT' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                studentPlans: {
                    where: { status: 'ACTIVE' },
                    include: { mealPlan: { select: { name: true, price: true, totalMeals: true } } },
                    take: 1,
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return apiResponse(students)
    } catch (err) {
        console.error('[GET /api/students]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])
