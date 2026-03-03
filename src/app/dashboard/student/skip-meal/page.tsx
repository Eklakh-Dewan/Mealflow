'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { SkipForward, CheckCircle, AlertCircle } from 'lucide-react'

export default function StudentSkipMealPage() {
    const api = useApiClient()
    const [date, setDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 1)
        return d.toISOString().split('T')[0]
    })
    const [existingSkips, setExistingSkips] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

    useEffect(() => {
        api('/api/skip-meal/my').then((data: any) => {
            setExistingSkips((data || []).map((s: any) => s.date.split('T')[0]))
        }).catch(() => { })
    }, [api])

    const alreadySkipped = existingSkips.includes(date)
    const minDate = new Date(); minDate.setDate(minDate.getDate() + 1)
    const minDateStr = minDate.toISOString().split('T')[0]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (alreadySkipped) return
        setLoading(true); setResult(null)
        try {
            await api('/api/skip-meal', { method: 'POST', body: JSON.stringify({ date }) })
            setResult({ success: true, message: `✅ Meal skip registered for ${new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}. This will be deducted from your bill.` })
            setExistingSkips(s => [...s, date])
        } catch (e: any) {
            setResult({ success: false, message: e.message })
        }
        finally { setLoading(false) }
    }

    return (
        <DashboardLayout title="Skip a Meal" allowedRoles={['STUDENT']}>
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Skip a Meal</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Let your mess know in advance – skipped meals are deducted from your bill</p>
                </div>

                {result && (
                    <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
                        {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {result.message}
                    </div>
                )}

                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Select Date to Skip</label>
                            <input type="date" className="form-input" value={date} min={minDateStr} onChange={e => setDate(e.target.value)} required />
                            <p className="form-hint">Must be at least 1 day in advance (before midnight)</p>
                        </div>

                        {alreadySkipped && (
                            <div className="alert alert-warning">
                                <SkipForward size={16} style={{ flexShrink: 0 }} />
                                You&apos;ve already registered a skip for {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}.
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading || alreadySkipped} style={{ justifyContent: 'center' }}>
                            <SkipForward size={16} />
                            {loading ? 'Submitting...' : alreadySkipped ? 'Already Skipped' : 'Request Skip'}
                        </button>
                    </form>
                </div>

                {existingSkips.length > 0 && (
                    <div className="card" style={{ marginTop: '1.5rem' }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Your Upcoming Skips</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {existingSkips.filter(d => d >= new Date().toISOString().split('T')[0]).sort().map(d => (
                                <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(210,153,34,0.08)', borderRadius: 6 }}>
                                    <SkipForward size={14} style={{ color: 'var(--accent-orange)' }} />
                                    <span style={{ fontSize: '0.875rem' }}>{new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
