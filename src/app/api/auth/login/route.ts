import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, signToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/middleware'

// POST /api/auth/login
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return apiError('Email and password are required')
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        subscriptionTier: true,
                        billingStatus: true,
                        suspendedAt: true,
                    },
                },
                ownedTenant: {
                    select: {
                        id: true,
                        name: true,
                        subscriptionTier: true,
                        billingStatus: true,
                        suspendedAt: true,
                    },
                },
            },
        })

        if (!user) {
            return apiError('Invalid credentials', 401)
        }

        const isValid = await comparePassword(password, user.passwordHash)
        if (!isValid) {
            return apiError('Invalid credentials', 401)
        }

        // Determine tenant - owners have ownedTenant, students have tenant
        const activeTenant = user.ownedTenant ?? user.tenant

        // Check if tenant is suspended
        if (activeTenant?.suspendedAt && user.role !== 'SUPER_ADMIN') {
            return apiError(
                'Your mess account has been suspended. Please contact support.',
                403
            )
        }

        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: activeTenant?.id ?? null,
        })

        const { passwordHash: _, ...safeUser } = user

        return apiResponse({
            user: safeUser,
            token,
            tenant: activeTenant,
        })
    } catch (err) {
        console.error('[POST /api/auth/login]', err)
        return apiError('Internal server error', 500)
    }
}
