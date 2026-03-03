'use client'

import { useAuth } from '@/lib/auth-context'
import { Bell, Search } from 'lucide-react'

export default function Topbar({ title }: { title?: string }) {
    const { user, tenant } = useAuth()
    return (
        <header style={{
            height: '56px',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.5rem',
            gap: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
        }}>
            <div style={{ flex: 1 }}>
                {title && <h1 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h1>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</span>
                    <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{user?.role?.replace('_', ' ')}</span>
                </div>
            </div>
        </header>
    )
}
