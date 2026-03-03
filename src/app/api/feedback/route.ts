import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// POST /api/feedback - Student submits feedback
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('You are not enrolled in any mess', 403)

        const body = await req.json()
        const { category, message } = body

        if (!message || message.trim().length < 10) {
            return apiError('Feedback message must be at least 10 characters')
        }

        const validCategories = ['FOOD_QUALITY', 'SERVICE', 'CLEANLINESS', 'BILLING', 'OTHER']
        const feedbackCategory = validCategories.includes(category) ? category : 'OTHER'

        const feedback = await prisma.feedback.create({
            data: {
                userId: user.userId,
                tenantId: user.tenantId,
                category: feedbackCategory,
                message: message.trim(),
            },
        })

        return apiResponse(feedback, 201)
    } catch (err) {
        console.error('[POST /api/feedback]', err)
        return apiError('Internal server error', 500)
    }
}, ['STUDENT'])

// GET /api/feedback - Owner views all feedback
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const feedbacks = await prisma.feedback.findMany({
            where: { tenantId: user.tenantId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        })

        // Mark all as read
        await prisma.feedback.updateMany({
            where: { tenantId: user.tenantId, isRead: false },
            data: { isRead: true },
        })

        return apiResponse(feedbacks)
    } catch (err) {
        console.error('[GET /api/feedback]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])
