import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, apiResponse, apiError } from '@/lib/middleware'
import { getMaxStudentsForTier } from '@/lib/subscription'
import crypto from 'crypto'
import { SubscriptionTier } from '@prisma/client'

// POST /api/subscription/verify
export const POST = withAuth(async (req: NextRequest, _ctx, user) => {
    try {
        if (!user.tenantId) return apiError('No tenant found', 404)

        const body = await req.json()
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = body

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !plan) {
            return apiError('Missing payment verification fields')
        }

        // Verify Razorpay signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex')

        if (expectedSignature !== razorpaySignature) {
            return apiError('Payment verification failed: invalid signature', 400)
        }

        // Update transaction
        await prisma.transaction.update({
            where: { razorpayOrderId },
            data: {
                razorpayPaymentId,
                razorpaySignature,
                status: 'SUCCESS',
            },
        })

        // Update tenant subscription
        const maxStudents = getMaxStudentsForTier(plan as SubscriptionTier)
        await prisma.tenant.update({
            where: { id: user.tenantId },
            data: {
                subscriptionTier: plan as SubscriptionTier,
                maxStudents,
                billingStatus: 'ACTIVE',
            },
        })

        return apiResponse({
            message: 'Subscription upgraded successfully',
            plan,
            maxStudents,
        })
    } catch (err) {
        console.error('[POST /api/subscription/verify]', err)
        return apiError('Payment verification failed', 500)
    }
}, ['OWNER'])
