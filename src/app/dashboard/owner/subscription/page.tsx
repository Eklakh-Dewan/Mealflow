'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react'

interface SubStatus {
    currentTier: string
    maxStudents: number
    currentStudentCount: number
    pricePerMonth: number
    billingStatus: string
    upgradeTo?: { tier: string; price: number; maxStudents: number } | null
    allTiers: Record<string, { maxStudents: number; pricePerMonth: number }>
    lastPayment?: { createdAt: string; amount: number } | null
}

declare global { interface Window { Razorpay: any } }

export default function SubscriptionPage() {
    const api = useApiClient()
    const [status, setStatus] = useState<SubStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [paying, setPaying] = useState<string | null>(null)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const load = () => api('/api/subscription/status').then(setStatus).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [api])

    const handleUpgrade = async (tier: string) => {
        setPaying(tier); setError('')
        try {
            const order = await api('/api/subscription/create-order', { method: 'POST', body: JSON.stringify({ plan: tier }) })
            const rzp = new window.Razorpay({
                key: order.keyId,
                amount: order.amount * 100,
                currency: 'INR',
                name: 'MealFlow',
                description: `Upgrade to ${tier} plan`,
                order_id: order.orderId,
                handler: async (response: any) => {
                    try {
                        await api('/api/subscription/verify', { method: 'POST', body: JSON.stringify({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature, plan: tier }) })
                        setSuccess(`🎉 Upgraded to ${tier}!`)
                        load()
                    } catch (e: any) { setError(e.message) }
                },
                prefill: {},
                theme: { color: '#388bfd' },
            })
            rzp.open()
        } catch (e: any) { setError(e.message) }
        finally { setPaying(null) }
    }

    const tiers = [
        { key: 'FREE', label: 'Free', price: 0, max: 10, color: 'var(--text-secondary)', features: ['Up to 10 students', 'Basic QR attendance', 'Menu management'] },
        { key: 'BASIC', label: 'Basic', price: 2999, max: 50, color: 'var(--accent-blue)', features: ['Up to 50 students', 'All Free features', 'Skip meal tracking'] },
        { key: 'STANDARD', label: 'Standard', price: 4999, max: 100, color: 'var(--accent)', features: ['Up to 100 students', 'All Basic features', 'Monthly billing'] },
        { key: 'PREMIUM', label: 'Premium', price: 7999, max: 300, color: 'var(--accent-orange)', features: ['Up to 300 students', 'All Standard features', 'Priority support'] },
        { key: 'ENTERPRISE', label: 'Enterprise', price: 14999, max: 99999, color: 'var(--accent-purple)', features: ['Unlimited students', 'All Premium features', 'Dedicated support'] },
    ]

    return (
        <DashboardLayout title="Subscription" allowedRoles={['OWNER']}>
            {/* Load Razorpay SDK */}
            <script src="https://checkout.razorpay.com/v1/checkout.js" async />

            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Subscription Plans</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Choose a plan based on your student count</p>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={16} />{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={16} />{success}</div>}

            {/* Current plan summary */}
            {status && (
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(56,139,253,0.3)', background: 'rgba(56,139,253,0.05)', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <CreditCard size={28} style={{ color: 'var(--accent-blue)' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current Plan</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{status.currentTier} {status.pricePerMonth > 0 ? `— ₹${status.pricePerMonth.toLocaleString('en-IN')}/mo` : '— Free'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                {status.currentStudentCount} of {status.maxStudents} students used
                            </div>
                        </div>
                        <span className={`badge ${status.billingStatus === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>{status.billingStatus}</span>
                    </div>
                    {status.lastPayment && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                            Last payment: ₹{status.lastPayment.amount.toLocaleString('en-IN')} on {new Date(status.lastPayment.createdAt).toLocaleDateString('en-IN')}
                        </div>
                    )}
                </div>
            )}

            {/* Tier Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {tiers.map(t => {
                    const isCurrent = status?.currentTier === t.key
                    const isUpgrade = status && status.pricePerMonth < t.price
                    return (
                        <div key={t.key} className="card" style={{ borderColor: isCurrent ? t.color : 'var(--border)', position: 'relative', background: isCurrent ? 'rgba(56,139,253,0.05)' : 'var(--bg-card)' }}>
                            {isCurrent && <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}><span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Current</span></div>}
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: t.color, marginBottom: '0.25rem' }}>{t.label}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                                {t.price === 0 ? 'Free' : `₹${t.price.toLocaleString('en-IN')}`}
                                {t.price > 0 && <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span>}
                            </div>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                                {t.features.map(f => (
                                    <li key={f} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem' }}>
                                        <span style={{ color: t.color }}>✓</span> {f}
                                    </li>
                                ))}
                            </ul>
                            {!isCurrent && isUpgrade && t.key !== 'FREE' && (
                                <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', background: t.color, borderColor: t.color }} onClick={() => handleUpgrade(t.key)} disabled={paying === t.key}>
                                    <Zap size={13} /> {paying === t.key ? 'Processing...' : `Upgrade`}
                                </button>
                            )}
                            {isCurrent && <div style={{ padding: '0.4rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your current plan</div>}
                        </div>
                    )
                })}
            </div>
        </DashboardLayout>
    )
}
