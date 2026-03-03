'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout({
    children,
    title,
    allowedRoles,
}: {
    children: React.ReactNode
    title?: string
    allowedRoles?: string[]
}) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
        if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
            // Redirect to correct dashboard
            if (user.role === 'OWNER') router.push('/dashboard/owner')
            else if (user.role === 'STUDENT') router.push('/dashboard/student')
            else router.push('/dashboard/admin')
        }
    }, [user, isLoading, allowedRoles, router])

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #2ea043, #388bfd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 auto 1rem' }}>M</div>
                    <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }} />
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Topbar title={title} />
                <main style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', background: 'var(--bg-primary)' }}>
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
