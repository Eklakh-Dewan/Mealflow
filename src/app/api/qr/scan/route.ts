import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'
import jwt from 'jsonwebtoken'

// POST /api/qr/scan - Student scans QR to mark attendance
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('You are not enrolled in any mess', 403)

        const body = await req.json()
        const { token } = body

        if (!token) return apiError('QR token is required')

        // Verify the JWT token
        let tokenPayload: { tenantId: string; date: string; type: string }
        try {
            tokenPayload = jwt.verify(token, process.env.JWT_SECRET!) as {
                tenantId: string
                date: string
                type: string
            }
        } catch {
            return apiError('QR code is invalid or expired', 400)
        }

        if (tokenPayload.type !== 'QR_ATTENDANCE') {
            return apiError('Invalid QR code type', 400)
        }

        // Ensure student is marking attendance for their own mess
        if (tokenPayload.tenantId !== user.tenantId) {
            return apiError('This QR code belongs to a different mess', 403)
        }

        // Find QR token in DB
        const qrToken = await prisma.qRToken.findUnique({ where: { token } })
        if (!qrToken) return apiError('QR token not found', 404)

        // Check expiry
        if (new Date() > qrToken.expiresAt) {
            return apiError('QR code has expired', 410)
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check duplicate attendance
        const existing = await prisma.attendance.findUnique({
            where: { userId_date: { userId: user.userId, date: today } },
        })
        if (existing) {
            return apiError('Attendance already marked for today', 409)
        }

        // Mark attendance
        const attendance = await prisma.attendance.create({
            data: {
                userId: user.userId,
                tenantId: user.tenantId,
                qrTokenId: qrToken.id,
                date: today,
            },
        })

        return apiResponse({
            message: 'Attendance marked successfully!',
            attendance,
        }, 201)
    } catch (err) {
        console.error('[POST /api/qr/scan]', err)
        return apiError('Internal server error', 500)
    }
}, ['STUDENT'])
