'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { Search, CalendarDays } from 'lucide-react'

interface AttendanceRecord {
    id: string
    date: string
    user: { id: string; name: string; email: string }
}

export default function AttendancePage() {
    const api = useApiClient()
    const [records, setRecords] = useState<AttendanceRecord[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState('')
    const [page, setPage] = useState(1)
    const limit = 20

    const load = async (p = 1) => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(p), limit: String(limit) })
            if (dateFilter) params.set('date', dateFilter)
            const data = await api(`/api/attendance?${params}`)
            setRecords(data.records); setTotal(data.total); setPage(p)
        } catch { }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [api])

    return (
        <DashboardLayout title="Attendance Logs" allowedRoles={['OWNER']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Attendance Logs</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track student meal attendance by date</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
                    <button className="btn btn-primary btn-sm" onClick={() => load(1)}><Search size={14} /> Filter</button>
                    {dateFilter && <button className="btn btn-secondary btn-sm" onClick={() => { setDateFilter(''); setTimeout(() => load(1), 0) }}>Clear</button>}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Email</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}><td colSpan={4}><div className="skeleton" style={{ height: 20 }} /></td></tr>
                                ))
                            ) : records.length === 0 ? (
                                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                                    <CalendarDays size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                                    <div>No attendance records found</div>
                                </td></tr>
                            ) : records.map((r, i) => (
                                <tr key={r.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{(page - 1) * limit + i + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{r.user.name}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{r.user.email}</td>
                                    <td>
                                        <span className="badge badge-green">
                                            {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {total > limit && (
                    <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => load(page - 1)}>← Prev</button>
                            <button className="btn btn-secondary btn-sm" disabled={page * limit >= total} onClick={() => load(page + 1)}>Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
