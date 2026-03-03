import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// GET /api/meal-plans - List all meal plans for tenant
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const plans = await prisma.mealPlan.findMany({
            where: { tenantId: user.tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { studentPlans: { where: { status: 'ACTIVE' } } } },
            },
        })

        return apiResponse(plans)
    } catch (err) {
        console.error('[GET /api/meal-plans]', err)
        return apiError('Internal server error', 500)
    }
})

// POST /api/meal-plans - Create new meal plan (OWNER only)
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const body = await req.json()
        const { name, description, price, totalMeals } = body

        if (!name || price == null || totalMeals == null) {
            return apiError('Name, price, and totalMeals are required')
        }
        if (price < 0 || totalMeals < 1) {
            return apiError('Invalid price or totalMeals')
        }

        // Verify owner of tenant
        const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } })
        if (!tenant || tenant.ownerId !== user.userId) {
            return apiError('Forbidden', 403)
        }

        const plan = await prisma.mealPlan.create({
            data: {
                tenantId: user.tenantId,
                name,
                description,
                price: Number(price),
                totalMeals: Number(totalMeals),
                isActive: true,
            },
        })

        return apiResponse(plan, 201)
    } catch (err) {
        console.error('[POST /api/meal-plans]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])
