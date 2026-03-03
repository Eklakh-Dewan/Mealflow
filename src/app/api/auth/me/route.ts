import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// GET /api/auth/me
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        inviteCode: true,
                        subscriptionTier: true,
                        maxStudents: true,
                        billingStatus: true,
                        suspendedAt: true,
                        _count: { select: { students: true } },
                    },
                },
                ownedTenant: {
                    select: {
                        id: true,
                        name: true,
                        inviteCode: true,
                        subscriptionTier: true,
                        maxStudents: true,
                        billingStatus: true,
                        suspendedAt: true,
                        _count: { select: { students: true } },
                    },
                },
            },
        })

        if (!dbUser) return apiError('User not found', 404)

        return apiResponse(dbUser)
    } catch (err) {
        console.error('[GET /api/auth/me]', err)
        return apiError('Internal server error', 500)
    }
})
