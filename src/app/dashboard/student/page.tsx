'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient, useAuth } from '@/lib/auth-context'
import { UtensilsCrossed, CalendarCheck, SkipForward, Receipt } from 'lucide-react'

export default function StudentDashboard() {
    const { user, tenant } = useAuth()
    const api = useApiClient()
    const [menu, setMenu] = useState<any>(null)
    const [bills, setBills] = useState<any[]>([])
    const [attendance, setAttendance] = useState<any[]>([])
    const [loadingMenu, setLoadingMenu] = useState(true)

    useEffect(() => {
        api('/api/menu').then(setMenu).catch(() => { }).finally(() => setLoadingMenu(false))
        api('/api/billing').then(setBills).catch(() => { })
        api('/api/attendance').then((d: any) => setAttendance(d?.records || [])).catch(() => { })
    }, [api])

    const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    const thisMonthBill = bills[0]
    const attendanceCount = attendance.length

    return (
        <DashboardLayout title="My Dashboard" allowedRoles={['STUDENT']}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Hello, {user?.name?.split(' ')[0]}! 👋</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{today}</p>
                {tenant && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Enrolled at: <strong style={{ color: 'var(--text-primary)' }}>{tenant.name}</strong></p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(46,160,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CalendarCheck size={16} style={{ color: 'var(--accent)' }} /></div>
                        <span className="stat-label">Meals Attended</span>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{attendanceCount}</div>
                    <span className="stat-label">this month</span>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(210,153,34,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Receipt size={16} style={{ color: 'var(--accent-orange)' }} /></div>
                        <span className="stat-label">Latest Bill</span>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
                        {thisMonthBill ? `₹${thisMonthBill.amount.toLocaleString('en-IN')}` : '—'}
                    </div>
                    <span className="stat-label">{thisMonthBill ? new Date(thisMonthBill.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'no bill yet'}</span>
                </div>
            </div>

            {/* Today's menu */}
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <UtensilsCrossed size={18} style={{ color: 'var(--accent-blue)' }} />
                    <h3 style={{ fontWeight: 600 }}>Today&apos;s Menu</h3>
                </div>
                {loadingMenu ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 36 }} />)}
                    </div>
                ) : !menu ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                        <UtensilsCrossed size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                        <p>No menu set for today</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {menu.meals?.breakfast && (
                            <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'rgba(210,153,34,0.08)', borderRadius: 8, borderLeft: '3px solid var(--accent-orange)' }}>
                                <span style={{ minWidth: 80, fontWeight: 600, color: 'var(--accent-orange)', fontSize: '0.8rem' }}>☀ Breakfast</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{menu.meals.breakfast.join(', ')}</span>
                            </div>
                        )}
                        {menu.meals?.lunch && (
                            <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'rgba(46,160,67,0.08)', borderRadius: 8, borderLeft: '3px solid var(--accent)' }}>
                                <span style={{ minWidth: 80, fontWeight: 600, color: 'var(--accent)', fontSize: '0.8rem' }}>🌞 Lunch</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{menu.meals.lunch.join(', ')}</span>
                            </div>
                        )}
                        {menu.meals?.dinner && (
                            <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'rgba(56,139,253,0.08)', borderRadius: 8, borderLeft: '3px solid var(--accent-blue)' }}>
                                <span style={{ minWidth: 80, fontWeight: 600, color: 'var(--accent-blue)', fontSize: '0.8rem' }}>🌙 Dinner</span>
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{menu.meals.dinner.join(', ')}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Quick links */}
            <div className="card" style={{ marginTop: '1rem' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {[
                        { label: 'Mark Attendance', href: '/dashboard/student/attendance', icon: '📷', color: 'rgba(46,160,67,0.1)', border: 'rgba(46,160,67,0.2)' },
                        { label: 'Skip a Meal', href: '/dashboard/student/skip-meal', icon: '⏭', color: 'rgba(210,153,34,0.1)', border: 'rgba(210,153,34,0.2)' },
                        { label: 'View My Bill', href: '/dashboard/student/billing', icon: '📄', color: 'rgba(56,139,253,0.1)', border: 'rgba(56,139,253,0.2)' },
                        { label: 'Give Feedback', href: '/dashboard/student/feedback', icon: '💬', color: 'rgba(188,140,255,0.1)', border: 'rgba(188,140,255,0.2)' },
                    ].map(({ label, href, icon, color, border }) => (
                        <a key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', padding: '0.875rem', borderRadius: 8, background: color, border: `1px solid ${border}`, textDecoration: 'none', transition: 'transform 0.15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>{label}</span>
                        </a>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    )
}
