'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { Plus, Edit2, Trash2, Users, X, AlertCircle, CheckCircle, UtensilsCrossed } from 'lucide-react'

interface MealPlan {
    id: string
    name: string
    description?: string
    price: number
    totalMeals: number
    isActive: boolean
    _count?: { studentPlans: number }
}

export default function MealPlansPage() {
    const api = useApiClient()
    const [plans, setPlans] = useState<MealPlan[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<MealPlan | null>(null)
    const [form, setForm] = useState({ name: '', description: '', price: '', totalMeals: '' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const load = () => api('/api/meal-plans').then(setPlans).catch(() => { }).finally(() => setLoading(false))
    useEffect(() => { load() }, [api])

    const openCreate = () => { setEditing(null); setForm({ name: '', description: '', price: '', totalMeals: '' }); setError(''); setShowModal(true) }
    const openEdit = (p: MealPlan) => { setEditing(p); setForm({ name: p.name, description: p.description || '', price: String(p.price), totalMeals: String(p.totalMeals) }); setError(''); setShowModal(true) }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true); setError('')
        try {
            if (editing) {
                await api(`/api/meal-plans/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
                setSuccess('Plan updated!')
            } else {
                await api('/api/meal-plans', { method: 'POST', body: JSON.stringify(form) })
                setSuccess('Plan created!')
            }
            setShowModal(false); load()
            setTimeout(() => setSuccess(''), 3000)
        } catch (e: any) { setError(e.message) }
        finally { setSaving(false) }
    }

    const handleDelete = async (id: string, count: number) => {
        if (count > 0) return alert('Cannot delete a plan with active subscribers. Deactivate it instead.')
        if (!confirm('Delete this meal plan?')) return
        try { await api(`/api/meal-plans/${id}`, { method: 'DELETE' }); load() } catch (e: any) { alert(e.message) }
    }

    const handleToggle = async (p: MealPlan) => {
        try { await api(`/api/meal-plans/${p.id}`, { method: 'PUT', body: JSON.stringify({ isActive: !p.isActive }) }); load() } catch { }
    }

    return (
        <DashboardLayout title="Meal Plans" allowedRoles={['OWNER']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Meal Plans</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Define subscription plans for your students</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Plan</button>
            </div>

            {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}><CheckCircle size={16} />{success}</div>}

            {loading ? (
                <div style={{ display: 'grid', gap: '1rem' }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}</div>
            ) : plans.length === 0 ? (
                <div className="empty-state card">
                    <UtensilsCrossed size={40} />
                    <h3>No meal plans yet</h3>
                    <p>Create your first meal plan to get started</p>
                    <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={openCreate}><Plus size={16} /> Create Plan</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {plans.map(plan => (
                        <div key={plan.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <h3 style={{ fontWeight: 600 }}>{plan.name}</h3>
                                    <span className={`badge ${plan.isActive ? 'badge-green' : 'badge-gray'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                                {plan.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{plan.description}</p>}
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>💰 ₹{plan.price.toLocaleString('en-IN')}/mo</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🍽️ {plan.totalMeals} meals</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={13} /> {plan._count?.studentPlans ?? 0} students</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(plan)}>{plan.isActive ? 'Deactivate' : 'Activate'}</button>
                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(plan)}><Edit2 size={13} /></button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(plan.id, plan._count?.studentPlans ?? 0)}><Trash2 size={13} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3 style={{ fontWeight: 600 }}>{editing ? 'Edit Meal Plan' : 'Create Meal Plan'}</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowModal(false)}><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Plan Name</label>
                                    <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Monthly Full Board" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description (optional)</label>
                                    <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Includes breakfast, lunch & dinner" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Price (₹/month)</label>
                                        <input className="form-input" type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="3500" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Total Meals</label>
                                        <input className="form-input" type="number" min="1" value={form.totalMeals} onChange={e => setForm(f => ({ ...f, totalMeals: e.target.value }))} required placeholder="75" />
                                    </div>
                                </div>
                                {error && <div className="alert alert-error"><AlertCircle size={16} />{error}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Plan' : 'Create Plan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}

