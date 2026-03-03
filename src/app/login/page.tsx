'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff, UtensilsCrossed, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login, user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === 'OWNER') router.replace('/dashboard/owner')
            else if (user.role === 'STUDENT') router.replace('/dashboard/student')
            else router.replace('/dashboard/admin')
        }
    }, [user, isLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        const result = await login(email, password)
        if (result.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'absolute', width: 600, height: 600,
                background: 'radial-gradient(circle, rgba(46,160,67,0.08) 0%, transparent 70%)',
                top: -200, left: -200, pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(56,139,253,0.06) 0%, transparent 70%)',
                bottom: -100, right: -100, pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 1 }} className="animate-fade-in">
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: 'linear-gradient(135deg, #2ea043, #388bfd)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, fontWeight: 800, color: '#fff',
                        margin: '0 auto 1rem',
                        boxShadow: '0 8px 24px rgba(46,160,67,0.3)',
                    }}>M</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Welcome back</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Sign in to your MealFlow account</p>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    style={{ paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ justifyContent: 'center' }}>
                            {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in...</> : 'Sign In'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Don&#39;t have an account?{' '}
                    <Link href="/register" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>
                        Create one
                    </Link>
                </p>

                {/* Demo credentials */}
                <div className="card" style={{ marginTop: '1.5rem', padding: '1rem', borderColor: 'rgba(56,139,253,0.3)', background: 'rgba(56,139,253,0.05)' }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>🧪 Demo Credentials</p>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span><strong style={{ color: 'var(--text-primary)' }}>Owner:</strong> owner@demo.com / Owner@123</span>
                        <span><strong style={{ color: 'var(--text-primary)' }}>Student:</strong> student1@demo.com / Student@123</span>
                        <span><strong style={{ color: 'var(--text-primary)' }}>Admin:</strong> admin@mealflow.com / SuperAdmin@123</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
