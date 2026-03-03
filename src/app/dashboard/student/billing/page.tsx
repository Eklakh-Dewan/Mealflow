'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { Receipt } from 'lucide-react'

export default function StudentBillingPage() {
    const api = useApiClient()
    const [bills, setBills] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api('/api/billing').then(setBills).catch(() => { }).finally(() => setLoading(false))
    }, [api])

    return (
        <DashboardLayout title="My Bills" allowedRoles={['STUDENT']}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>My Billing History</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Bills are generated monthly based on your attendance and skipped meals</p>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
            ) : bills.length === 0 ? (
                <div className="card empty-state">
                    <Receipt size={40} style={{ opacity: 0.4 }} />
                    <h3>No bills yet</h3>
                    <p>Your billing history will appear here once your mess owner generates monthly bills</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bills.map((b, i) => (
                        <div key={b.id} className="card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>
                                        {new Date(b.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <span>✅ Meals taken: <strong style={{ color: 'var(--accent)' }}>{b.mealsTaken}</strong></span>
                                        <span>⏭ Skipped: <strong style={{ color: 'var(--accent-orange)' }}>{b.mealsSkipped}</strong></span>
                                        <span>📋 Total: {b.totalMeals}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-orange)' }}>₹{b.amount.toLocaleString('en-IN')}</div>
                                    {i === 0 && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Latest</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
