import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { tenantId: string } }) {
    try {
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const decoded = verifyToken(token)
        if (!decoded || decoded.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const { action } = await req.json() // 'suspend' | 'activate'
        if (!['suspend', 'activate'].includes(action))
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

        const tenant = await prisma.tenant.update({
            where: { id: params.tenantId },
            data: { billingStatus: action === 'suspend' ? 'SUSPENDED' : 'ACTIVE' },
        })

        return NextResponse.json({ success: true, data: { tenant } })
    } catch (err) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
