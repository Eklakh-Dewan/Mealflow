import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        const token = authHeader?.replace('Bearer ', '')
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const decoded = verifyToken(token)
        if (!decoded || decoded.role !== 'STUDENT')
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        // Find the student's active plan
        const studentPlan = await prisma.studentPlan.findFirst({
            where: { userId: decoded.userId, isActive: true },
            include: {
                mealPlan: { select: { name: true, price: true, totalMeals: true } },
            },
        })

        // Get latest bill
        const latestBill = await prisma.billing.findFirst({
            where: { userId: decoded.userId },
            orderBy: { month: 'desc' },
        })

        return NextResponse.json({
            success: true,
            data: {
                planName: studentPlan?.mealPlan?.name ?? null,
                planPrice: studentPlan?.mealPlan?.price ?? null,
                totalMeals: studentPlan?.mealPlan?.totalMeals ?? null,
                latestBill: latestBill
                    ? {
                        month: latestBill.month,
                        mealsTaken: latestBill.mealsTaken,
                        mealsSkipped: latestBill.mealsSkipped,
                        amount: latestBill.amount,
                    }
                    : null,
            },
        })
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
