'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace('/login')
    } else if (user.role === 'OWNER') {
      router.replace('/dashboard/owner')
    } else if (user.role === 'STUDENT') {
      router.replace('/dashboard/student')
    } else {
      router.replace('/dashboard/admin')
    }
  }, [user, isLoading, router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #2ea043, #388bfd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 auto 1rem' }}>M</div>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    </div>
  )
}
