'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { Building2, Users, TrendingUp, ShieldOff, ShieldCheck, AlertTriangle } from 'lucide-react'

interface Tenant {
    id: string
    name: string
    subscriptionTier: string
    billingStatus: string
    createdAt: string
    inviteCode: string
    owner: { id: string; name: string; email: string }
    _count: { students: number }
}

interface AdminData {
    tenants: Tenant[]
    totalRevenue: number
    totalTenants: number
    activeTenants: number
}

const TIER_BADGE: Record<string, string> = {
    FREE: 'badge-gray', BASIC: 'badge-blue', STANDARD: 'badge-green',
    PREMIUM: 'badge-orange', ENTERPRISE: 'badge-purple',
}

export default function AdminDashboard() {
    const api = useApiClient()
    const [data, setData] = useState<AdminData | null>(null)
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [filter, setFilter] = useState('')

    const load = () =>
        api('/api/admin/tenants').then(setData).catch(() => { }).finally(() => setLoading(false))

    useEffect(() => { load() }, [api])

    const handleAction = async (tenantId: string, action: 'suspend' | 'activate') => {
        setActionLoading(tenantId)
        try {
            await api(`/api/admin/tenants/${tenantId}`, { method: 'PATCH', body: JSON.stringify({ action }) })
            load()
        } catch (e: any) { alert(e.message) }
        finally { setActionLoading(null) }
    }

    const filtered = data?.tenants.filter(t =>
        !filter || t.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.owner.email.toLowerCase().includes(filter.toLowerCase())
    ) ?? []

    return (
        <DashboardLayout title="Admin Panel" allowedRoles={['SUPER_ADMIN']}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Super Admin Panel</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Platform-wide overview of all mess tenants and revenue</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56,139,253,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Building2 size={16} style={{ color: 'var(--accent-blue)' }} />
                        </div>
                        <span className="stat-label">Total Messes</span>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{loading ? '—' : data?.totalTenants}</div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(46,160,67,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                        </div>
                        <span className="stat-label">Active Messes</span>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent)' }}>{loading ? '—' : data?.activeTenants}</div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(210,153,34,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={16} style={{ color: 'var(--accent-orange)' }} />
                        </div>
                        <span className="stat-label">Total Revenue</span>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-orange)', fontSize: '1.4rem' }}>
                        {loading ? '—' : `₹${(data?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
                    </div>
                </div>

                <div className="stat-card">
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(248,81,73,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldOff size={16} style={{ color: 'var(--accent-red)' }} />
                        </div>
                        <span className="stat-label">Suspended</span>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--accent-red)' }}>
                        {loading ? '—' : (data?.totalTenants ?? 0) - (data?.activeTenants ?? 0)}
                    </div>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '1rem' }}>
                <input
                    className="form-input"
                    style={{ maxWidth: 360 }}
                    placeholder="Search by mess name or owner email..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            {/* Tenants table */}
            {loading ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card empty-state">
                    <Building2 size={40} style={{ opacity: 0.4 }} />
                    <h3>No mess tenants found</h3>
                    <p>{filter ? 'Try a different search term' : 'No owners have registered yet'}</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mess Name</th>
                                    <th>Owner</th>
                                    <th>Plan</th>
                                    <th>Students</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{t.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{t.inviteCode}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{t.owner.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.owner.email}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${TIER_BADGE[t.subscriptionTier] ?? 'badge-gray'}`}>
                                                {t.subscriptionTier}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{t._count.students}</td>
                                        <td>
                                            <span className={`badge ${t.billingStatus === 'ACTIVE' ? 'badge-green' : t.billingStatus === 'SUSPENDED' ? 'badge-red' : 'badge-orange'}`}>
                                                {t.billingStatus}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td>
                                            {t.billingStatus === 'ACTIVE' ? (
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleAction(t.id, 'suspend')}
                                                    disabled={actionLoading === t.id}
                                                    style={{ gap: '0.3rem' }}
                                                >
                                                    <ShieldOff size={13} />
                                                    {actionLoading === t.id ? '...' : 'Suspend'}
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={() => handleAction(t.id, 'activate')}
                                                    disabled={actionLoading === t.id}
                                                    style={{ gap: '0.3rem', color: 'var(--accent)', borderColor: 'var(--accent)' }}
                                                >
                                                    <ShieldCheck size={13} />
                                                    {actionLoading === t.id ? '...' : 'Activate'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Showing {filtered.length} of {data?.totalTenants ?? 0} tenants
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
