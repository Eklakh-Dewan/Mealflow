import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'

// GET /api/attendance - View attendance logs (Owner = all students, Student = own)
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const { searchParams } = new URL(req.url)
        const dateStr = searchParams.get('date')
        const studentId = searchParams.get('studentId')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const skip = (page - 1) * limit

        const where: Record<string, unknown> = { tenantId: user.tenantId }

        if (user.role === 'STUDENT') {
            where.userId = user.userId
        } else if (studentId) {
            where.userId = studentId
        }

        if (dateStr) {
            const date = new Date(dateStr)
            date.setHours(0, 0, 0, 0)
            where.date = date
        }

        const [records, total] = await Promise.all([
            prisma.attendance.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { date: 'desc' },
                skip,
                take: limit,
            }),
            prisma.attendance.count({ where }),
        ])

        return apiResponse({ records, total, page, limit })
    } catch (err) {
        console.error('[GET /api/attendance]', err)
        return apiError('Internal server error', 500)
    }
})
