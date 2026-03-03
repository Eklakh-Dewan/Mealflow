import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'
import { SUBSCRIPTION_TIERS, getTierConfig, getUpgradePath } from '@/lib/subscription'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { SubscriptionTier } from '@prisma/client'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// GET /api/subscription/status
export const GET = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const tenant = await prisma.tenant.findUnique({
            where: { id: user.tenantId },
            include: { _count: { select: { students: true } } },
        })

        if (!tenant) return apiError('Tenant not found', 404)

        const currentStudentCount = tenant._count.students
        const tierConfig = getTierConfig(tenant.subscriptionTier)
        const upgradePath = getUpgradePath(tenant.subscriptionTier)
        const lastTransaction = await prisma.transaction.findFirst({
            where: { tenantId: tenant.id, status: 'SUCCESS' },
            orderBy: { createdAt: 'desc' },
        })

        return apiResponse({
            currentTier: tenant.subscriptionTier,
            maxStudents: tierConfig.maxStudents,
            currentStudentCount,
            pricePerMonth: tierConfig.pricePerMonth,
            billingStatus: tenant.billingStatus,
            upgradeTo: upgradePath,
            lastPayment: lastTransaction,
            allTiers: SUBSCRIPTION_TIERS,
        })
    } catch (err) {
        console.error('[GET /api/subscription/status]', err)
        return apiError('Internal server error', 500)
    }
}, ['OWNER'])

