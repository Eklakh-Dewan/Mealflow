import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'
import { getPriceForTier } from '@/lib/subscription'
import Razorpay from 'razorpay'
import { SubscriptionTier } from '@prisma/client'

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// POST /api/subscription/create-order
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const body = await req.json()
        const { plan } = body

        const validPlans: SubscriptionTier[] = ['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE']
        if (!validPlans.includes(plan)) {
            return apiError('Invalid plan selected')
        }

        const amount = getPriceForTier(plan as SubscriptionTier)
        if (amount === 0) return apiError('Cannot create payment order for free plan')

        const options = {
            amount: amount * 100, // Razorpay expects paise
            currency: 'INR',
            receipt: `mealflow_${user.tenantId}_${Date.now()}`,
            notes: {
                tenantId: user.tenantId,
                plan,
            },
        }

        const order = await razorpay.orders.create(options)

        // Store pending transaction
        await prisma.transaction.create({
            data: {
                tenantId: user.tenantId,
                razorpayOrderId: order.id,
                amount,
                plan: plan as SubscriptionTier,
                status: 'PENDING',
            },
        })

        return apiResponse({
            orderId: order.id,
            amount,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID,
        })
    } catch (err) {
        console.error('[POST /api/subscription/create-order]', err)
        return apiError('Failed to create payment order', 500)
    }
}, ['OWNER'])
