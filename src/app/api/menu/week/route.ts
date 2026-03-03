import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// GET /api/menu/week - Get week menu (7 days from today)
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 7)

        const menus = await prisma.menu.findMany({
            where: {
                tenantId: user.tenantId,
                date: { gte: today, lt: nextWeek },
            },
            orderBy: { date: 'asc' },
        })

        return apiResponse(menus)
    } catch (err) {
        console.error('[GET /api/menu/week]', err)
        return apiError('Internal server error', 500)
    }
})
