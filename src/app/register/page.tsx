'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'OWNER' | 'STUDENT'>('STUDENT')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register, user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === 'OWNER') router.replace('/dashboard/owner')
            else router.replace('/dashboard/student')
        }
    }, [user, isLoading, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (password.length < 8) return setError('Password must be at least 8 characters')
        setLoading(true)
        const result = await register(name, email, password, role)
        if (result.error) { setError(result.error); setLoading(false) }
    }

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', overflow: 'hidden',
        }}>
            <div style={{ position: 'absolute', width: 500, height: 500, background: 'radial-gradient(circle, rgba(56,139,253,0.08) 0%, transparent 70%)', top: -150, right: -150, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(188,140,255,0.05) 0%, transparent 70%)', bottom: 0, left: 0, pointerEvents: 'none' }} />

            <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }} className="animate-fade-in">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #2ea043, #388bfd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 auto 1rem', boxShadow: '0 8px 24px rgba(46,160,67,0.3)' }}>M</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create your account</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Join MealFlow today</p>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    {/* Role Toggle */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 8 }}>
                        {(['STUDENT', 'OWNER'] as const).map(r => (
                            <button key={r} type="button" onClick={() => setRole(r)} style={{
                                flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', cursor: 'pointer',
                                fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.15s',
                                background: role === r ? 'var(--bg-card)' : 'transparent',
                                color: role === r ? 'var(--text-primary)' : 'var(--text-secondary)',
                                boxShadow: role === r ? 'var(--shadow)' : 'none',
                            }}>
                                {r === 'STUDENT' ? '🎓 Student' : '🏠 Mess Owner'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input type="text" className="form-input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required autoFocus />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input type="email" className="form-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input" placeholder="Min. 8 characters"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    required style={{ paddingRight: '2.5rem' }}
                                />
                                <button type="button" onClick={() => setShowPassword(s => !s)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {role === 'OWNER' && (
                            <div className="alert alert-info" style={{ fontSize: '0.8rem' }}>
                                💡 As a Mess Owner, a mess profile will be auto-created. You&apos;ll get an invite code to share with students.
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                            {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account...</> : 'Create Account'}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
                </p>
            </div>
        </div>
    )
}
