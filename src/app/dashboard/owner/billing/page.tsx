'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { Receipt, Play, AlertCircle, CheckCircle } from 'lucide-react'

interface Bill {
    id: string
    month: string
    mealsTaken: number
    mealsSkipped: number
    totalMeals: number
    amount: number
    user: { id: string; name: string; email: string }
}

export default function BillingPage() {
    const api = useApiClient()
    const [bills, setBills] = useState<Bill[]>([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [month, setMonth] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 1)
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    })

    const load = () => api('/api/billing').then(setBills).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [api])

    const generateBills = async () => {
        setGenerating(true); setError(''); setSuccess('')
        try {
            const res = await api('/api/billing/generate', { method: 'POST', body: JSON.stringify({ month }) })
            setSuccess(res.message || 'Bills generated!'); load()
        } catch (e: any) { setError(e.message) }
        finally { setGenerating(false) }
    }

    const totalRevenue = bills.reduce((sum, b) => sum + b.amount, 0)

    return (
        <DashboardLayout title="Billing" allowedRoles={['OWNER']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Monthly Billing</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Generate and view student bills based on attendance</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="month" className="form-input" style={{ width: 'auto' }} value={month} onChange={e => setMonth(e.target.value)} />
                    <button className="btn btn-primary" onClick={generateBills} disabled={generating}>
                        <Play size={15} /> {generating ? 'Generating...' : 'Generate Bills'}
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}><AlertCircle size={16} />{error}</div>}
            {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={16} />{success}</div>}

            {bills.length > 0 && (
                <div className="stat-card" style={{ marginBottom: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <Receipt size={28} style={{ color: 'var(--accent-orange)' }} />
                    <div>
                        <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
                        <div className="stat-label">Total Billed ({bills.length} students)</div>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)}</div>
            ) : bills.length === 0 ? (
                <div className="card empty-state">
                    <Receipt size={40} style={{ opacity: 0.4 }} />
                    <h3>No bills generated yet</h3>
                    <p>Select a month and click &quot;Generate Bills&quot; to create billing records</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Month</th>
                                    <th>Meals Taken</th>
                                    <th>Meals Skipped</th>
                                    <th>Total Meals</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{b.user.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.user.email}</div>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{new Date(b.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</td>
                                        <td><span className="badge badge-green">{b.mealsTaken}</span></td>
                                        <td><span className="badge badge-orange">{b.mealsSkipped}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{b.totalMeals}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-orange)' }}>₹{b.amount.toLocaleString('en-IN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
