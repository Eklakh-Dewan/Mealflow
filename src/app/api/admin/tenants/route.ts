import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const decoded = verifyToken(token)
        if (!decoded || decoded.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const tenants = await prisma.tenant.findMany({
            include: {
                owner: { select: { id: true, name: true, email: true } },
                _count: { select: { students: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        // Total revenue from all transactions
        const revenue = await prisma.transaction.aggregate({ _sum: { amount: true } })

        return NextResponse.json({
            success: true,
            data: {
                tenants,
                totalRevenue: revenue._sum.amount ?? 0,
                totalTenants: tenants.length,
                activeTenants: tenants.filter(t => t.billingStatus === 'ACTIVE').length,
            },
        })
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
