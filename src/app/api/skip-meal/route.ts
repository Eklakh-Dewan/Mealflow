import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

const SKIP_CUTOFF_HOUR = 9 // 9 AM cutoff for skipping today's lunch
const SKIP_CUTOFF_ADVANCE_DAYS = 1 // must request at least 1 day in advance

// POST /api/skip-meal - Student requests to skip a meal
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('You are not enrolled in any mess', 403)

        const body = await req.json()
        const { date: dateStr } = body

        if (!dateStr) return apiError('Date is required')

        const skipDate = new Date(dateStr)
        skipDate.setHours(0, 0, 0, 0)

        const now = new Date()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Cannot skip past meals
        if (skipDate < today) {
            return apiError('Cannot skip meals for past dates')
        }

        // Same-day cutoff validation
        if (
            skipDate.getTime() === today.getTime() &&
            now.getHours() >= SKIP_CUTOFF_HOUR
        ) {
            return apiError(
                `Skip requests for today must be submitted before ${SKIP_CUTOFF_HOUR}:00 AM`,
                400
            )
        }

        // Check duplicate skip
        const existing = await prisma.skipMeal.findUnique({
            where: { userId_date: { userId: user.userId, date: skipDate } },
        })
        if (existing) {
            return apiError('You have already requested to skip this date', 409)
        }

        // Verify student has active plan for this tenant
        const activePlan = await prisma.studentPlan.findFirst({
            where: {
                userId: user.userId,
                status: 'ACTIVE',
                startDate: { lte: skipDate },
                endDate: { gte: skipDate },
            },
        })
        if (!activePlan) {
            return apiError('No active meal plan found for this date', 403)
        }

        const skipMeal = await prisma.skipMeal.create({
            data: {
                userId: user.userId,
                tenantId: user.tenantId,
                date: skipDate,
            },
        })

        return apiResponse({ message: 'Skip meal request submitted', skipMeal }, 201)
    } catch (err) {
        console.error('[POST /api/skip-meal]', err)
        return apiError('Internal server error', 500)
    }
}, ['STUDENT'])

// GET /api/skip-meal - View skip requests (Owner: all, Student: own)
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const { searchParams } = new URL(req.url)
        const dateStr = searchParams.get('date')

        const where: Record<string, unknown> = { tenantId: user.tenantId }

        if (user.role === 'STUDENT') {
            where.userId = user.userId
        }

        if (dateStr) {
            const date = new Date(dateStr)
            date.setHours(0, 0, 0, 0)
            where.date = date
        }

        const skips = await prisma.skipMeal.findMany({
            where,
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { date: 'desc' },
        })

        return apiResponse(skips)
    } catch (err) {
        console.error('[GET /api/skip-meal]', err)
        return apiError('Internal server error', 500)
    }
})
