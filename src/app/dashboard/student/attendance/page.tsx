'use client'

import { useState, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useApiClient } from '@/lib/auth-context'
import { QrCode, Camera, CheckCircle, AlertCircle, Keyboard } from 'lucide-react'

export default function StudentAttendancePage() {
    const api = useApiClient()
    const [token, setToken] = useState('')
    const [scanning, setScanning] = useState(false)
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
    const [loading, setLoading] = useState(false)

    const markAttendance = async (qrToken: string) => {
        setLoading(true); setResult(null)
        try {
            await api('/api/qr/scan', { method: 'POST', body: JSON.stringify({ token: qrToken }) })
            setResult({ success: true, message: '✅ Attendance marked successfully! Have a great meal.' })
            setToken('')
        } catch (e: any) {
            setResult({ success: false, message: e.message })
        }
        finally { setLoading(false) }
    }

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (token.trim()) markAttendance(token.trim())
    }

    return (
        <DashboardLayout title="Mark Attendance" allowedRoles={['STUDENT']}>
            <div style={{ maxWidth: 520, margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Mark Attendance</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Scan the QR code displayed at your mess entrance</p>
                </div>

                {result && (
                    <div className={`alert ${result.success ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1.25rem' }}>
                        {result.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {result.message}
                    </div>
                )}

                {/* Manual token entry */}
                <div className="card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <Keyboard size={18} style={{ color: 'var(--accent-blue)' }} />
                        <h3 style={{ fontWeight: 600 }}>Enter QR Token Manually</h3>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>If you can&apos;t scan the QR code, ask your mess owner for the token string and paste it here.</p>
                    <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <textarea
                            className="form-input"
                            style={{ flex: 1, minWidth: '200px', height: 60, resize: 'none', fontSize: '0.75rem', fontFamily: 'monospace' }}
                            placeholder="Paste the QR token here..."
                            value={token}
                            onChange={e => setToken(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" disabled={loading || !token.trim()}>
                            {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : <QrCode size={16} />}
                            {loading ? 'Marking...' : 'Mark'}
                        </button>
                    </form>
                </div>

                <div className="alert alert-info">
                    <QrCode size={16} style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: '0.8rem' }}>
                        <strong>How it works:</strong> Ask your mess owner to show you the QR code (from their Owner Dashboard → QR Code page). Scan it with your phone camera or paste the token here to mark your attendance.
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
