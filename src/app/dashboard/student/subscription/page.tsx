'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { CreditCard, Zap, CheckCircle, AlertCircle } from 'lucide-react'

declare global { interface Window { Razorpay: any } }

const TIERS = [
    { key: 'STUDENT_MONTHLY', label: 'Monthly', price: 0, desc: 'Pay per your mess plan each month', color: 'var(--accent)' },
]

export default function StudentSubscriptionPage() {
    const api = useApiClient()
    const [subInfo, setSubInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api('/api/subscription/student-status').then(setSubInfo).catch(() => { }).finally(() => setLoading(false))
    }, [api])

    return (
        <DashboardLayout title="My Subscription" allowedRoles={['STUDENT']}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Subscription</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your current meal plan and billing details</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
                    </div>
                ) : subInfo ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card" style={{ borderColor: 'rgba(46,160,67,0.3)', background: 'rgba(46,160,67,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(46,160,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CreditCard size={22} style={{ color: 'var(--accent)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Plan</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                                        {subInfo.planName ?? 'No plan enrolled'}
                                    </div>
                                    {subInfo.planPrice && (
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{subInfo.planPrice.toLocaleString('en-IN')}/month · {subInfo.totalMeals} meals</div>
                                    )}
                                </div>
                                {subInfo.planName && <span className="badge badge-green">Active</span>}
                            </div>
                        </div>

                        {subInfo.latestBill && (
                            <div className="card">
                                <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>Latest Bill</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                                    {[
                                        { label: 'Meals Taken', value: subInfo.latestBill.mealsTaken, color: 'var(--accent)' },
                                        { label: 'Meals Skipped', value: subInfo.latestBill.mealsSkipped, color: 'var(--accent-orange)' },
                                        { label: 'Amount Due', value: `₹${subInfo.latestBill.amount.toLocaleString('en-IN')}`, color: 'var(--accent-blue)' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
                                    For {new Date(subInfo.latestBill.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        )}

                        {!subInfo.planName && (
                            <div className="alert alert-info">
                                <Zap size={16} style={{ flexShrink: 0 }} />
                                <span>You are not enrolled in any meal plan yet. Ask your mess owner to assign you a plan.</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="alert alert-warning"><AlertCircle size={16} />Could not load subscription info.</div>
                )}
            </div>
        </DashboardLayout>
    )
}
