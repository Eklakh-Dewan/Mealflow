'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
    LayoutDashboard, UtensilsCrossed, CalendarDays, Users,
    QrCode, SkipForward, Receipt, MessageSquare, CreditCard,
    Settings, ChevronRight, LogOut, ShieldCheck, Building2,
    Menu as MenuIcon, X
} from 'lucide-react'
import { useState } from 'react'

const ownerNav = [
    { label: 'Overview', href: '/dashboard/owner', icon: LayoutDashboard },
    { label: 'Meal Plans', href: '/dashboard/owner/meal-plans', icon: UtensilsCrossed },
    { label: 'Weekly Menu', href: '/dashboard/owner/menu', icon: CalendarDays },
    { label: 'Students', href: '/dashboard/owner/students', icon: Users },
    { label: 'QR Code', href: '/dashboard/owner/qr', icon: QrCode },
    { label: 'Attendance', href: '/dashboard/owner/attendance', icon: ChevronRight },
    { label: 'Skip Requests', href: '/dashboard/owner/skip-meals', icon: SkipForward },
    { label: 'Billing', href: '/dashboard/owner/billing', icon: Receipt },
    { label: 'Feedback', href: '/dashboard/owner/feedback', icon: MessageSquare },
    { label: 'Subscription', href: '/dashboard/owner/subscription', icon: CreditCard },
]

const studentNav = [
    { label: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'Mark Attendance', href: '/dashboard/student/attendance', icon: QrCode },
    { label: 'Skip Meal', href: '/dashboard/student/skip-meal', icon: SkipForward },
    { label: 'My Bill', href: '/dashboard/student/billing', icon: Receipt },
    { label: 'Feedback', href: '/dashboard/student/feedback', icon: MessageSquare },
]

const adminNav = [
    { label: 'All Tenants', href: '/dashboard/admin', icon: Building2 },
    { label: 'Super Admin', href: '/dashboard/admin/tenants', icon: ShieldCheck },
]

export default function Sidebar() {
    const { user, tenant, logout } = useAuth()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const navItems = user?.role === 'OWNER' ? ownerNav
        : user?.role === 'STUDENT' ? studentNav
            : adminNav

    const sidebar = (
        <aside
            style={{
                width: '240px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: 0,
                flexShrink: 0,
                overflowY: 'auto',
            }}
        >
            {/* Logo */}
            <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'linear-gradient(135deg, #2ea043, #388bfd)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 800, color: '#fff',
                    }}>M</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>MealFlow</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            {user?.role === 'SUPER_ADMIN' ? 'Admin Panel'
                                : user?.role === 'OWNER' ? 'Owner Dashboard'
                                    : 'Student Portal'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tenant info */}
            {tenant && (
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                        {user?.role === 'OWNER' ? 'Your Mess' : 'Enrolled At'}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tenant.name}
                    </div>
                    {tenant.subscriptionTier && (
                        <span className="badge badge-green" style={{ marginTop: '0.3rem', fontSize: '0.65rem' }}>
                            {tenant.subscriptionTier}
                        </span>
                    )}
                </div>
            )}

            {/* Nav */}
            <nav style={{ flex: 1, padding: '0.75rem 0.5rem' }}>
                {navItems.map(({ label, href, icon: Icon }) => {
                    const active = pathname === href || (href !== '/dashboard/owner' && href !== '/dashboard/student' && href !== '/dashboard/admin' && pathname.startsWith(href))
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.6rem',
                                padding: '0.55rem 0.75rem',
                                borderRadius: '6px',
                                marginBottom: '2px',
                                fontSize: '0.875rem',
                                fontWeight: active ? 600 : 400,
                                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: active ? 'rgba(56,139,253,0.12)' : 'transparent',
                                borderLeft: active ? '2px solid var(--accent-blue)' : '2px solid transparent',
                                textDecoration: 'none',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'
                                        ; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    (e.currentTarget as HTMLElement).style.background = 'transparent'
                                        ; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    )
                })}
            </nav>

            {/* User footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #388bfd, #bc8cff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8rem', color: '#fff', flexShrink: 0,
                    }}>
                        {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email}
                        </div>
                    </div>
                </div>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
                    <LogOut size={14} /> Sign Out
                </button>
            </div>
        </aside>
    )

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="btn btn-secondary btn-sm"
                style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 200, display: 'none' }}
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
                id="mobile-menu-btn"
            >
                {open ? <X size={18} /> : <MenuIcon size={18} />}
            </button>

            {/* Desktop sidebar */}
            <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
          #sidebar-desktop { display: none !important; }
          #sidebar-mobile { display: ${open ? 'flex' : 'none'} !important; position: fixed; top:0; left:0; z-index: 150; height:100vh; }
          #sidebar-overlay { display: ${open ? 'block' : 'none'} !important; }
        }
      `}</style>

            <div id="sidebar-desktop" style={{ display: 'flex' }}>{sidebar}</div>

            {/* Mobile overlay */}
            <div id="sidebar-overlay" style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 140 }} onClick={() => setOpen(false)} />
            <div id="sidebar-mobile" style={{ display: 'none', flexDirection: 'column' }}>{sidebar}</div>
        </>
    )
}
