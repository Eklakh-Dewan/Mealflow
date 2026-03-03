'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { useAuth } from '@/lib/auth-context'
import { Users, UtensilsCrossed, CalendarCheck, TrendingUp, Copy, CheckCheck, AlertTriangle } from 'lucide-react'

interface Stats {
    currentTier: string
    maxStudents: number
    currentStudentCount: number
    pricePerMonth: number
    billingStatus: string
    upgradeTo?: { tier: string; price: number } | null
}

interface AnalyticsData {
    totalStudents: number
    totalPlans: number
}

export default function OwnerDashboard() {
    const { user, tenant } = useAuth()
    const api = useApiClient()
    const [stats, setStats] = useState<Stats | null>(null)
    const [copied, setCopied] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api('/api/subscription/status')
            .then(data => setStats(data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [api])

    const copyInviteCode = () => {
        if (tenant?.inviteCode) {
            navigator.clipboard.writeText(tenant.inviteCode)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const usagePercent = stats ? Math.round((stats.currentStudentCount / stats.maxStudents) * 100) : 0

    return (
        <DashboardLayout title="Dashboard" allowedRoles={['OWNER']}>
            {/* Welcome */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Welcome back, {user?.name?.split(' ')[0]} 👋
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Here&apos;s a snapshot of your mess operation.
                </p>
            </div>

            {/* Invite code banner */}
            {tenant?.inviteCode && (
                <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(46,160,67,0.3)', background: 'rgba(46,160,67,0.05)', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Your Mess Invite Code</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.15em', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{tenant.inviteCode}</p>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={copyInviteCode} style={{ gap: '0.4rem' }}>
                            {copied ? <><CheckCheck size={14} style={{ color: 'var(--accent)' }} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                        </button>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Share this code with students to let them join your mess.</p>
                </div>
            )}

            {/* Subscription alert */}
            {stats?.upgradeTo && usagePercent >= 80 && (
                <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                    <span>You&apos;ve used <strong>{usagePercent}%</strong> of your student limit ({stats.currentStudentCount}/{stats.maxStudents}).
                        <a href="/dashboard/owner/subscription" style={{ color: 'var(--accent-orange)', fontWeight: 600, marginLeft: '0.25rem' }}>Upgrade to {stats.upgradeTo.tier}</a>
                    </span>
                </div>
            )}

            {/* Stats grid */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(46,160,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={18} style={{ color: 'var(--accent)' }} />
                            </div>
                            <span className="stat-label">Active Students</span>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.currentStudentCount ?? 0}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(usagePercent, 100)}%`, height: '100%', background: usagePercent > 80 ? 'var(--accent-orange)' : 'var(--accent)', borderRadius: 2, transition: 'width 0.5s' }} />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{stats?.currentStudentCount}/{stats?.maxStudents}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(56,139,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <UtensilsCrossed size={18} style={{ color: 'var(--accent-blue)' }} />
                            </div>
                            <span className="stat-label">Plan</span>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--accent-blue)', fontSize: '1.25rem' }}>{stats?.currentTier ?? 'FREE'}</div>
                        <span className={`badge ${stats?.billingStatus === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.7rem' }}>
                            {stats?.billingStatus ?? 'ACTIVE'}
                        </span>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(210,153,34,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={18} style={{ color: 'var(--accent-orange)' }} />
                            </div>
                            <span className="stat-label">Monthly Plan Cost</span>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
                            {stats && stats.pricePerMonth > 0 ? `₹${stats.pricePerMonth.toLocaleString('en-IN')}` : 'Free'}
                        </div>
                        <span className="stat-label">per month</span>
                    </div>

                    <div className="stat-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(188,140,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CalendarCheck size={18} style={{ color: 'var(--accent-purple)' }} />
                            </div>
                            <span className="stat-label">Capacity</span>
                        </div>
                        <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{stats?.maxStudents ?? 10}</div>
                        <span className="stat-label">max students</span>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="card">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
                    {[
                        { label: 'Generate QR', href: '/dashboard/owner/qr', icon: '📱', color: 'rgba(46,160,67,0.1)', border: 'rgba(46,160,67,0.2)' },
                        { label: 'Add Menu', href: '/dashboard/owner/menu', icon: '🍽️', color: 'rgba(56,139,253,0.1)', border: 'rgba(56,139,253,0.2)' },
                        { label: 'View Students', href: '/dashboard/owner/students', icon: '👥', color: 'rgba(188,140,255,0.1)', border: 'rgba(188,140,255,0.2)' },
                        { label: 'Generate Bills', href: '/dashboard/owner/billing', icon: '📄', color: 'rgba(210,153,34,0.1)', border: 'rgba(210,153,34,0.2)' },
                    ].map(({ label, href, icon, color, border }) => (
                        <a key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem', borderRadius: 8, background: color, border: `1px solid ${border}`, textDecoration: 'none', transition: 'transform 0.15s', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
