import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, comparePassword, signToken } from '@/lib/auth'
import { apiResponse, apiError } from '@/lib/middleware'
import { Role } from '@prisma/client'
import { getMaxStudentsForTier } from '@/lib/subscription'

// POST /api/auth/register
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, password, role } = body

        if (!name || !email || !password) {
            return apiError('Name, email, and password are required')
        }

        if (!['OWNER', 'STUDENT'].includes(role)) {
            return apiError('Role must be OWNER or STUDENT')
        }

        if (password.length < 8) {
            return apiError('Password must be at least 8 characters')
        }

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            return apiError('Email already registered', 409)
        }

        const passwordHash = await hashPassword(password)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role as Role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                tenantId: true,
                createdAt: true,
            },
        })

        // If OWNER, auto-create tenant
        let tenant = null
        if (role === 'OWNER') {
            tenant = await prisma.tenant.create({
                data: {
                    name: `${name}'s Mess`,
                    ownerId: user.id,
                    subscriptionTier: 'FREE',
                    maxStudents: getMaxStudentsForTier('FREE'),
                    billingStatus: 'ACTIVE',
                },
            })
            await prisma.user.update({
                where: { id: user.id },
                data: { tenantId: tenant.id },
            })
        }

        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: tenant?.id ?? null,
        })

        return apiResponse({ user: { ...user, tenantId: tenant?.id ?? null }, token }, 201)
    } catch (err) {
        console.error('[POST /api/auth/register]', err)
        return apiError('Internal server error', 500)
    }
}
