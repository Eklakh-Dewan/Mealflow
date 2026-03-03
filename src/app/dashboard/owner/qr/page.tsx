'use client'

import { useEffect, useState, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { RefreshCw, QrCode, Copy, CheckCheck, Clock } from 'lucide-react'

export default function QRPage() {
    const api = useApiClient()
    const [qrData, setQrData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState('')

    const generate = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const data = await api('/api/qr/generate', { method: 'POST' })
            setQrData(data)
        } catch (e: any) { setError(e.message) }
        finally { setLoading(false) }
    }, [api])

    useEffect(() => { generate() }, [generate])

    const copyToken = () => {
        if (qrData?.token) { navigator.clipboard.writeText(qrData.token); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    }

    const expiresAt = qrData?.expiresAt ? new Date(qrData.expiresAt) : null
    const now = new Date()
    const hoursLeft = expiresAt ? Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 3600000)) : 0
    const minutesLeft = expiresAt ? Math.max(0, Math.floor(((expiresAt.getTime() - now.getTime()) % 3600000) / 60000)) : 0

    return (
        <DashboardLayout title="Daily QR Code" allowedRoles={['OWNER']}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Daily QR Code</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Students scan this QR to mark attendance. Regenerates daily at midnight.</p>
                </div>

                {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
                    {loading ? (
                        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div className="spinner" style={{ width: 40, height: 40 }} />
                            <p style={{ color: 'var(--text-secondary)' }}>Generating QR code...</p>
                        </div>
                    ) : qrData ? (
                        <>
                            {/* QR Display - shows token as QR via img or text */}
                            <div style={{ display: 'inline-block', background: '#fff', padding: '1.5rem', borderRadius: 12, marginBottom: '1.5rem' }}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData.token)}&bgcolor=ffffff&color=0d1117`}
                                    alt="QR Code"
                                    width={220}
                                    height={220}
                                    style={{ display: 'block' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                                    <Clock size={16} style={{ color: 'var(--text-secondary)' }} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        Expires in <strong style={{ color: 'var(--text-primary)' }}>{hoursLeft}h {minutesLeft}m</strong>
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Date: {new Date(qrData.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                                {qrData.alreadyGenerated && (
                                    <span className="badge badge-blue" style={{ marginTop: '0.5rem' }}>Already generated today</span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <button className="btn btn-secondary" onClick={copyToken}>
                                    {copied ? <><CheckCheck size={15} style={{ color: 'var(--accent)' }} /> Copied!</> : <><Copy size={15} /> Copy Token</>}
                                </button>
                                <button className="btn btn-secondary" onClick={generate} disabled={loading}>
                                    <RefreshCw size={15} /> Regenerate
                                </button>
                            </div>

                            <div className="alert alert-info" style={{ marginTop: '1.5rem', textAlign: 'left' }}>
                                <QrCode size={16} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: '0.8rem' }}>Display or print this QR code at your mess entrance. Students scan it from the <strong>Student Portal → Mark Attendance</strong>.</span>
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <QrCode size={48} />
                            <h3>No QR code generated</h3>
                            <p>Click the button below to generate today&apos;s QR code</p>
                            <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={generate}><QrCode size={16} /> Generate QR</button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
