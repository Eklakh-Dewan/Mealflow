'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { MessageSquare } from 'lucide-react'

interface Feedback {
    id: string
    category: string
    message: string
    isRead: boolean
    createdAt: string
    user: { id: string; name: string; email: string }
}

const CATEGORY_LABELS: Record<string, string> = {
    FOOD_QUALITY: '🍕 Food Quality',
    SERVICE: '⚡ Service',
    CLEANLINESS: '🧹 Cleanliness',
    BILLING: '💳 Billing',
    OTHER: '💬 Other',
}

const CATEGORY_BADGE: Record<string, string> = {
    FOOD_QUALITY: 'badge-orange', SERVICE: 'badge-blue', CLEANLINESS: 'badge-green', BILLING: 'badge-red', OTHER: 'badge-gray',
}

export default function FeedbackPage() {
    const api = useApiClient()
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api('/api/feedback').then(setFeedbacks).catch(() => { }).finally(() => setLoading(false))
    }, [api])

    const unreadCount = feedbacks.filter(f => !f.isRead).length

    return (
        <DashboardLayout title="Feedback" allowedRoles={['OWNER']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        Student Feedback {unreadCount > 0 && <span className="badge badge-blue" style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>{unreadCount} new</span>}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Reviews and complaints from your students</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
            ) : feedbacks.length === 0 ? (
                <div className="card empty-state">
                    <MessageSquare size={40} style={{ opacity: 0.4 }} />
                    <h3>No feedback yet</h3>
                    <p>Students haven&apos;t submitted any feedback</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {feedbacks.map(f => (
                        <div key={f.id} className="card" style={{ borderLeft: f.isRead ? '1px solid var(--border)' : '3px solid var(--accent-blue)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #388bfd, #bc8cff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                        {f.user.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{f.user.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{f.user.email}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span className={`badge ${CATEGORY_BADGE[f.category] || 'badge-gray'}`}>{CATEGORY_LABELS[f.category] || f.category}</span>
                                    {!f.isRead && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>New</span>}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>{f.message}</p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
