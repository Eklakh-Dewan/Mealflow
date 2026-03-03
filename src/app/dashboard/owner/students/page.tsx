'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { Users, Copy, CheckCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

interface Student {
    id: string
    name: string
    email: string
    createdAt: string
    studentPlans: Array<{ mealPlan: { name: string; price: number; totalMeals: number } }>
}

export default function StudentsPage() {
    const api = useApiClient()
    const { tenant } = useAuth()
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        api('/api/students').then(setStudents).catch(() => { }).finally(() => setLoading(false))
    }, [api])

    const copyCode = () => {
        if (tenant?.inviteCode) { navigator.clipboard.writeText(tenant.inviteCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    }

    return (
        <DashboardLayout title="Students" allowedRoles={['OWNER']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Students ({students.length})</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>All students enrolled in your mess</p>
                </div>
                {tenant?.inviteCode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.5rem 1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Invite Code:</span>
                        <code style={{ fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', fontFamily: 'monospace' }}>{tenant.inviteCode}</code>
                        <button className="btn btn-secondary btn-sm" onClick={copyCode}>
                            {copied ? <CheckCheck size={13} style={{ color: 'var(--accent)' }} /> : <Copy size={13} />}
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div style={{ display: 'grid', gap: '0.75rem' }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 72 }} />)}</div>
            ) : students.length === 0 ? (
                <div className="card empty-state">
                    <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <h3>No students yet</h3>
                    <p>Share your invite code <strong style={{ color: 'var(--accent)' }}>{tenant?.inviteCode}</strong> to get started</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Meal Plan</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((s, i) => (
                                    <tr key={s.id}>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{i + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #388bfd, #bc8cff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                                    {s.name[0].toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{s.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.email}</td>
                                        <td>
                                            {s.studentPlans[0]
                                                ? <span className="badge badge-green">{s.studentPlans[0].mealPlan.name}</span>
                                                : <span className="badge badge-gray">No Plan</span>}
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                            {new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
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
