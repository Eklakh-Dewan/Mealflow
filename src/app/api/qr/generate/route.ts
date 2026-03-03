import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'
import jwt from 'jsonwebtoken'

// POST /api/qr/generate - Owner generates daily QR token
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        // Verify tenant ownership
        const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } })
        if (!tenant || tenant.ownerId !== user.userId) return apiError('Forbidden', 403)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if QR already generated for today
        const existing = await prisma.qRToken.findUnique({
            where: { tenantId_date: { tenantId: user.tenantId, date: today } },
        })

        if (existing) {
            return apiResponse({
                token: existing.token,
                date: existing.date,
                expiresAt: existing.expiresAt,
                alreadyGenerated: true,
            })
        }

        // Generate JWT-signed QR token valid for 24hr
        const expiresAt = new Date(today)
        expiresAt.setHours(23, 59, 59, 999)

        const tokenPayload = {
            tenantId: user.tenantId,
            date: today.toISOString().split('T')[0],
            type: 'QR_ATTENDANCE',
        }
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '24h' })

        const qrToken = await prisma.qRToken.create({
            data: {
                tenantId: user.tenantId,
                token,
                date: today,
                expiresAt,
                createdById: user.userId,
            },
        })

        return apiResponse(qrToken, 201)
    } catch (err) {
        console.error('[POST /api/qr/generate]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])
