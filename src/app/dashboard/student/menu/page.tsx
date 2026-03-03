'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { UtensilsCrossed, ChevronLeft, ChevronRight } from 'lucide-react'

interface Menu {
    id?: string
    date: string
    meals: { breakfast?: string[]; lunch?: string[]; dinner?: string[] }
    dayType?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDates(offset = 0) {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const day = today.getDay()
    const monday = new Date(today); monday.setDate(today.getDate() - day + 1 + offset * 7)
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d })
}

export default function StudentMenuPage() {
    const api = useApiClient()
    const [weekOffset, setWeekOffset] = useState(0)
    const [menus, setMenus] = useState<Record<string, Menu>>({})
    const [loading, setLoading] = useState(true)
    const weekDates = getWeekDates(weekOffset)

    useEffect(() => {
        setLoading(true)
        api('/api/menu/week').then((data: Menu[]) => {
            const map: Record<string, Menu> = {}
            data.forEach(m => { map[m.date.split('T')[0]] = m })
            setMenus(map)
        }).catch(() => { }).finally(() => setLoading(false))
    }, [api, weekOffset])

    const today = new Date().toISOString().split('T')[0]

    return (
        <DashboardLayout title="Weekly Menu" allowedRoles={['STUDENT']}>
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
                    const isPast = key < today
                    return (
                        <div key={key} className="card" style={{ borderColor: isToday ? 'rgba(56,139,253,0.4)' : 'var(--border)', opacity: isPast ? 0.65 : 1, position: 'relative' }}>
                            {isToday && <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}><span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>Today</span></div>}
                            <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ fontWeight: 700 }}>{DAYS[date.getDay()]}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                            </div>
                            {loading ? (
                                <div className="skeleton" style={{ height: 60 }} />
                            ) : menu ? (
                                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {menu.meals.breakfast && <div><span style={{ fontWeight: 600, color: 'var(--accent-orange)' }}>☀ </span>{menu.meals.breakfast.join(', ')}</div>}
                                    {menu.meals.lunch && <div><span style={{ fontWeight: 600, color: 'var(--accent)' }}>🌞 </span>{menu.meals.lunch.join(', ')}</div>}
                                    {menu.meals.dinner && <div><span style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>🌙 </span>{menu.meals.dinner.join(', ')}</div>}
                                    {!menu.meals.breakfast && !menu.meals.lunch && !menu.meals.dinner && (
                                        <span style={{ color: 'var(--text-muted)' }}>No items listed</span>
                                    )}
                                </div>
                            ) : (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No menu set</p>
                            )}
                        </div>
                    )
                })}
            </div>
        </DashboardLayout>
    )
}
