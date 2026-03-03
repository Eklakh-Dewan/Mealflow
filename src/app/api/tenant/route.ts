import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// GET /api/tenant - Get owner's tenant
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) {
            return apiError('No tenant associated with your account', 404)
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                _count: { select: { students: true, mealPlans: true } },
            },
        })

        if (!tenant) return apiError('Tenant not found', 404)

        // For OWNER, ensure they own this tenant
        if (user.role === 'OWNER' && tenant.ownerId !== user.userId) {
            return apiError('Forbidden', 403)
        }

        return apiResponse(tenant)
    } catch (err) {
        console.error('[GET /api/tenant]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER', 'SUPER_ADMIN'])

// PUT /api/tenant - Update tenant profile
export const PUT = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const body = await req.json()
        const { name, address, phone } = body

        const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } })
        if (!tenant) return apiError('Tenant not found', 404)
        if (tenant.ownerId !== user.userId) return apiError('Forbidden', 403)

        const updated = await prisma.tenant.update({
            where: { id: user.tenantId },
            data: {
                ...(name && { name }),
                ...(address !== undefined && { address }),
                ...(phone !== undefined && { phone }),
            },
        })

        return apiResponse(updated)
    } catch (err) {
        console.error('[PUT /api/tenant]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])
