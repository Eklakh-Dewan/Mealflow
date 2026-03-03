import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// GET /api/menu - Get menu for a date (defaults to today)
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const { searchParams } = new URL(req.url)
        const dateStr = searchParams.get('date')
        const date = dateStr ? new Date(dateStr) : new Date()
        date.setHours(0, 0, 0, 0)

        const menu = await prisma.menu.findUnique({
            where: { tenantId_date: { tenantId: user.tenantId, date } },
        })

        if (!menu) return apiResponse(null)
        return apiResponse(menu)
    } catch (err) {
        console.error('[GET /api/menu]', err)
        return apiError('Internal server error', 500)
    }
})

// POST /api/menu - Create or update menu for a date (OWNER only)
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const body = await req.json()
        const { date: dateStr, meals, dayType } = body

        if (!dateStr || !meals) {
            return apiError('Date and meals are required')
        }

        const date = new Date(dateStr)
        date.setHours(0, 0, 0, 0)

        // Validate meals structure
        if (!meals.breakfast && !meals.lunch && !meals.dinner) {
            return apiError('At least one meal period (breakfast/lunch/dinner) required')
        }

        const menu = await prisma.menu.upsert({
            where: { tenantId_date: { tenantId: user.tenantId, date } },
            update: { meals, dayType },
            create: { tenantId: user.tenantId, date, meals, dayType },
        })

        return apiResponse(menu)
    } catch (err) {
        console.error('[POST /api/menu]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])
