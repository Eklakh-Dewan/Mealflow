'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { SkipForward, CalendarDays } from 'lucide-react'

interface SkipRequest {
    id: string
    date: string
    requestedAt: string
    user: { id: string; name: string; email: string }
}

export default function SkipMealsPage() {
    const api = useApiClient()
    const [skips, setSkips] = useState<SkipRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState('')

    const load = async () => {
        setLoading(true)
        try {
            const params = dateFilter ? `?date=${dateFilter}` : ''
            const data = await api(`/api/skip-meal${params}`)
            setSkips(data)
        } catch { }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [api])

    // group by date
    const grouped = skips.reduce<Record<string, SkipRequest[]>>((acc, s) => {
        const key = s.date.split('T')[0]
        acc[key] = acc[key] || []
        acc[key].push(s)
        return acc
    }, {})

    return (
        <DashboardLayout title="Skip Requests" allowedRoles={['OWNER']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Skip Meal Requests</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Students who requested to skip meals</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                    <button className="btn btn-primary btn-sm" onClick={load}>Filter</button>
                    {dateFilter && <button className="btn btn-secondary btn-sm" onClick={() => { setDateFilter(''); setTimeout(load, 0) }}>Clear</button>}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}</div>
            ) : skips.length === 0 ? (
                <div className="card empty-state">
                    <SkipForward size={40} style={{ opacity: 0.4 }} />
                    <h3>No skip requests</h3>
                    <p>No students have requested to skip meals {dateFilter ? 'on this date' : 'yet'}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([date, items]) => (
                        <div key={date}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <CalendarDays size={15} style={{ color: 'var(--text-secondary)' }} />
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                </h3>
                                <span className="badge badge-orange">{items.length} skip{items.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Email</th>
                                            <th>Requested At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(s => (
                                            <tr key={s.id}>
                                                <td style={{ fontWeight: 500 }}>{s.user.name}</td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.user.email}</td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(s.requestedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    )
}
