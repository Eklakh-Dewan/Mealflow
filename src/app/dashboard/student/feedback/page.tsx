'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react'

const CATEGORIES = [
    { value: 'FOOD_QUALITY', label: '🍕 Food Quality' },
    { value: 'SERVICE', label: '⚡ Service' },
    { value: 'CLEANLINESS', label: '🧹 Cleanliness' },
    { value: 'BILLING', label: '💳 Billing' },
    { value: 'OTHER', label: '💬 Other' },
]

const RATINGS = [
    { emoji: '😞', value: 1 }, { emoji: '😐', value: 2 }, { emoji: '🙂', value: 3 },
    { emoji: '😊', value: 4 }, { emoji: '😍', value: 5 },
]

export default function StudentFeedbackPage() {
    const api = useApiClient()
    const [category, setCategory] = useState('FOOD_QUALITY')
    const [message, setMessage] = useState('')
    const [rating, setRating] = useState(4)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const [past, setPast] = useState<any[]>([])

    useEffect(() => {
        api('/api/feedback/my').then(setPast).catch(() => { })
    }, [api])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setResult(null)
        try {
            await api('/api/feedback', { method: 'POST', body: JSON.stringify({ category, message, rating }) })
            setResult({ success: true, message: '✅ Thank you for your feedback! Your mess owner has been notified.' })
            setMessage(''); setCategory('FOOD_QUALITY'); setRating(4)
            api('/api/feedback/my').then(setPast).catch(() => { })
        } catch (e: any) {
            setResult({ success: false, message: e.message })
        }
        finally { setLoading(false) }
    }

    return (
        <DashboardLayout title="Feedback" allowedRoles={['STUDENT']}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Share Feedback</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Help your mess improve by sharing your experience</p>
                </div>

                {result && (
                    <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
                        {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {result.message}
                    </div>
                )}

                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {CATEGORIES.map(c => (
                                    <button key={c.value} type="button" onClick={() => setCategory(c.value)} style={{
                                        padding: '0.4rem 0.875rem', borderRadius: 20, border: '1px solid',
                                        borderColor: category === c.value ? 'var(--accent-blue)' : 'var(--border)',
                                        background: category === c.value ? 'rgba(56,139,253,0.1)' : 'var(--bg-secondary)',
                                        color: category === c.value ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.15s',
                                    }}>{c.label}</button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Rating</label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                {RATINGS.map(r => (
                                    <button key={r.value} type="button" onClick={() => setRating(r.value)} style={{
                                        fontSize: rating === r.value ? '2rem' : '1.5rem', background: 'none', border: 'none', cursor: 'pointer',
                                        transition: 'transform 0.15s', transform: rating === r.value ? 'scale(1.2)' : 'scale(1)',
                                        filter: rating === r.value ? 'none' : 'grayscale(0.5)',
                                    }}>{r.emoji}</button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Your Message</label>
                            <textarea className="form-input" rows={4} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us about your experience..." required style={{ resize: 'vertical' }} />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading || !message.trim()} style={{ alignSelf: 'flex-start' }}>
                            <Send size={15} /> {loading ? 'Sending...' : 'Submit Feedback'}
                        </button>
                    </form>
                </div>

                {past.length > 0 && (
                    <div>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Your Previous Feedback</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {past.slice(0, 5).map((f: any) => (
                                <div key={f.id} className="card" style={{ padding: '0.875rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>{CATEGORIES.find(c => c.value === f.category)?.label}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
