import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// PUT /api/meal-plans/[id] - Update meal plan
export const PUT = withAuth(async (req: NextRequest, ctx, user) => {
    try {
        const { id } = await ctx.params
        const body = await req.json()
        const { name, description, price, totalMeals, isActive } = body

        const plan = await prisma.mealPlan.findFirst({
            where: { id, tenantId: user.tenantId! },
        })
        if (!plan) return apiError('Meal plan not found', 404)

        const updated = await prisma.mealPlan.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(price != null && { price: Number(price) }),
                ...(totalMeals != null && { totalMeals: Number(totalMeals) }),
                ...(isActive !== undefined && { isActive }),
            },
        })

        return apiResponse(updated)
    } catch (err) {
        console.error('[PUT /api/meal-plans/[id]]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])

// DELETE /api/meal-plans/[id] - Delete meal plan
export const DELETE = withAuth(async (req: NextRequest, ctx, user) => {
    try {
        const { id } = await ctx.params

        const plan = await prisma.mealPlan.findFirst({
            where: { id, tenantId: user.tenantId! },
            include: { _count: { select: { studentPlans: { where: { status: 'ACTIVE' } } } } },
        })
        if (!plan) return apiError('Meal plan not found', 404)

        if (plan._count.studentPlans > 0) {
            return apiError(
                `Cannot delete plan with ${plan._count.studentPlans} active subscribers. Deactivate instead.`,
                409
            )
        }

        await prisma.mealPlan.delete({ where: { id } })
        return apiResponse({ message: 'Meal plan deleted' })
    } catch (err) {
        console.error('[DELETE /api/meal-plans/[id]]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])
