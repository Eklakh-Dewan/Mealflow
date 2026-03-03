'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X, AlertCircle } from 'lucide-react'

interface Menu {
    id?: string
    date: string
    meals: { breakfast?: string[]; lunch?: string[]; dinner?: string[] }
    dayType?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDates(offset = 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - day + 1 + offset * 7)
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        return d
    })
}

export default function MenuPage() {
    const api = useApiClient()
    const [weekOffset, setWeekOffset] = useState(0)
    const [menus, setMenus] = useState<Record<string, Menu>>({})
    const [loading, setLoading] = useState(true)
    const [editDate, setEditDate] = useState<string | null>(null)
    const [form, setForm] = useState({ breakfast: '', lunch: '', dinner: '', dayType: 'weekday' })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const weekDates = getWeekDates(weekOffset)

    const load = async () => {
        setLoading(true)
        try {
            const data = await api('/api/menu/week')
            const map: Record<string, Menu> = {}
            data.forEach((m: Menu) => { map[m.date.split('T')[0]] = m })
            setMenus(map)
        } catch { }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [api, weekOffset])

    const openEdit = (date: Date) => {
        const key = date.toISOString().split('T')[0]
        const existing = menus[key]
        setForm({
            breakfast: existing?.meals.breakfast?.join(', ') || '',
            lunch: existing?.meals.lunch?.join(', ') || '',
            dinner: existing?.meals.dinner?.join(', ') || '',
            dayType: existing?.dayType || 'weekday',
        })
        setEditDate(key)
        setError('')
    }

    const handleSave = async () => {
        if (!editDate) return
        setSaving(true); setError('')
        try {
            const meals = {
                breakfast: form.breakfast ? form.breakfast.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                lunch: form.lunch ? form.lunch.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                dinner: form.dinner ? form.dinner.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            }
            await api('/api/menu', { method: 'POST', body: JSON.stringify({ date: editDate, meals, dayType: form.dayType }) })
            setEditDate(null); load()
        } catch (e: any) { setError(e.message) }
        finally { setSaving(false) }
    }

    const today = new Date().toISOString().split('T')[0]

    return (
        <DashboardLayout title="Weekly Menu" allowedRoles={['OWNER']}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Weekly Menu</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {weekDates[0].toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – {weekDates[6].toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w - 1)}><ChevronLeft size={16} /></button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(0)}>This Week</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w + 1)}><ChevronRight size={16} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                {weekDates.map(date => {
                    const key = date.toISOString().split('T')[0]
                    const menu = menus[key]
                    const isToday = key === today
                    return (
                        <div key={key} className="card" style={{ borderColor: isToday ? 'rgba(56,139,253,0.4)' : 'var(--border)', position: 'relative' }}>
                            {isToday && <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}><span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Today</span></div>}
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{DAYS[date.getDay()]}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                            </div>
                            {menu ? (
                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    {menu.meals.breakfast && <div><span style={{ fontWeight: 600, color: 'var(--accent-orange)' }}>☀ </span>{menu.meals.breakfast.join(', ')}</div>}
                                    {menu.meals.lunch && <div><span style={{ fontWeight: 600, color: 'var(--accent)' }}>🌞 </span>{menu.meals.lunch.join(', ')}</div>}
                                    {menu.meals.dinner && <div><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>🌙 </span>{menu.meals.dinner.join(', ')}</div>}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>No menu set</p>
                            )}
                            <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openEdit(date)}>
                                <Plus size={13} /> {menu ? 'Edit' : 'Add Menu'}
                            </button>
                        </div>
                    )
                })}
            </div>

            {editDate && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditDate(null)}>
                    <div className="modal-box" style={{ maxWidth: 520 }}>
                        <div className="modal-header">
                            <h3 style={{ fontWeight: 600 }}>Menu for {new Date(editDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long' })}</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setEditDate(null)}><X size={18} /></button>
                        </div>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">☀ Breakfast items <span style={{ fontWeight: 400, textTransform: 'none' }}>(comma-separated)</span></label>
                                <input className="form-input" value={form.breakfast} onChange={e => setForm(f => ({ ...f, breakfast: e.target.value }))} placeholder="Idli, Sambar, Tea" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">🌞 Lunch items</label>
                                <input className="form-input" value={form.lunch} onChange={e => setForm(f => ({ ...f, lunch: e.target.value }))} placeholder="Rice, Dal, Sabzi, Roti" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">🌙 Dinner items</label>
                                <input className="form-input" value={form.dinner} onChange={e => setForm(f => ({ ...f, dinner: e.target.value }))} placeholder="Chapati, Paneer, Curd" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Day Type</label>
                                <select className="form-input" value={form.dayType} onChange={e => setForm(f => ({ ...f, dayType: e.target.value }))}>
                                    <option value="weekday">Weekday</option>
                                    <option value="weekend">Weekend</option>
                                    <option value="holiday">Holiday</option>
                                </select>
                            </div>
                            {error && <div className="alert alert-error"><AlertCircle size={16} />{error}</div>}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary btn-sm" onClick={() => setEditDate(null)}>Cancel</button>
                            <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Menu'}</button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
