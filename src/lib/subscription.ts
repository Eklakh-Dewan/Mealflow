import { SubscriptionTier } from '@prisma/client'

export interface TierConfig {
    tier: SubscriptionTier
    maxStudents: number
    pricePerMonth: number // INR
    label: string
}

export const SUBSCRIPTION_TIERS: TierConfig[] = [
    {
        tier: 'FREE',
        maxStudents: 10,
        pricePerMonth: 0,
        label: 'Free (Up to 10 students)',
    },
    {
        tier: 'BASIC',
        maxStudents: 50,
        pricePerMonth: 2999,
        label: 'Basic (Up to 50 students)',
    },
    {
        tier: 'STANDARD',
        maxStudents: 100,
        pricePerMonth: 4999,
        label: 'Standard (Up to 100 students)',
    },
    {
        tier: 'PREMIUM',
        maxStudents: 300,
        pricePerMonth: 7999,
        label: 'Premium (Up to 300 students)',
    },
    {
        tier: 'ENTERPRISE',
        maxStudents: 99999,
        pricePerMonth: 14999,
        label: 'Enterprise (300+ students)',
    },
]

export function getTierConfig(tier: SubscriptionTier): TierConfig {
    return SUBSCRIPTION_TIERS.find((t) => t.tier === tier)!
}

export function getRequiredTierForCount(studentCount: number): SubscriptionTier {
    if (studentCount < 10) return 'FREE'
    if (studentCount < 50) return 'BASIC'
    if (studentCount < 100) return 'STANDARD'
    if (studentCount < 300) return 'PREMIUM'
    return 'ENTERPRISE'
}

export function getMaxStudentsForTier(tier: SubscriptionTier): number {
    return getTierConfig(tier).maxStudents
}

export function getPriceForTier(tier: SubscriptionTier): number {
    return getTierConfig(tier).pricePerMonth
}

export function canAddStudent(
    currentStudentCount: number,
    subscriptionTier: SubscriptionTier
): { allowed: boolean; message?: string; requiredTier?: SubscriptionTier } {
    const config = getTierConfig(subscriptionTier)
    if (currentStudentCount >= config.maxStudents) {
        const requiredTier = getRequiredTierForCount(currentStudentCount + 1)
        return {
            allowed: false,
            message: `Your current plan allows up to ${config.maxStudents} students. Please upgrade to ${requiredTier} plan to add more students.`,
            requiredTier,
        }
    }
    return { allowed: true }
}

export function getUpgradePath(
    currentTier: SubscriptionTier
): TierConfig | null {
    const currentIndex = SUBSCRIPTION_TIERS.findIndex(
        (t) => t.tier === currentTier
    )
    if (currentIndex === -1 || currentIndex === SUBSCRIPTION_TIERS.length - 1) {
        return null
    }
    return SUBSCRIPTION_TIERS[currentIndex + 1]
}
