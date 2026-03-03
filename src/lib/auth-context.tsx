'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    name: string
    email: string
    role: 'SUPER_ADMIN' | 'OWNER' | 'STUDENT'
    tenantId: string | null
}

interface Tenant {
    id: string
    name: string
    inviteCode?: string
    subscriptionTier?: string
    billingStatus?: string
}

interface AuthContextType {
    user: User | null
    tenant: Tenant | null
    token: string | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<{ error?: string }>
    register: (name: string, email: string, password: string, role: string) => Promise<{ error?: string }>
    logout: () => void
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [tenant, setTenant] = useState<Tenant | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
        const t = typeof window !== 'undefined' ? localStorage.getItem('mf_token') : null
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(t ? { Authorization: `Bearer ${t}` } : {}),
                ...options?.headers,
            },
        })
    }, [])

    const refreshUser = useCallback(async () => {
        try {
            const res = await apiFetch('/api/auth/me')
            if (res.ok) {
                const data = await res.json()
                setUser(data.data?.user ?? null)
                setTenant(data.data?.tenant ?? null)
            } else {
                setUser(null)
                setTenant(null)
                localStorage.removeItem('mf_token')
                setToken(null)
            }
        } catch {
            setUser(null)
            setTenant(null)
        }
    }, [apiFetch])

    useEffect(() => {
        const t = localStorage.getItem('mf_token')
        if (t) {
            setToken(t)
            refreshUser().finally(() => setIsLoading(false))
        } else {
            setIsLoading(false)
        }
    }, [refreshUser])

    const login = async (email: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()
            if (!res.ok) return { error: data.error || 'Login failed' }

            const { token: t, user: u, tenant: ten } = data.data
            localStorage.setItem('mf_token', t)
            setToken(t)
            setUser(u)
            setTenant(ten)
            return {}
        } catch {
            return { error: 'Network error. Please try again.' }
        }
    }

    const register = async (name: string, email: string, password: string, role: string) => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            })
            const data = await res.json()
            if (!res.ok) return { error: data.error || 'Registration failed' }

            const { token: t, user: u } = data.data
            localStorage.setItem('mf_token', t)
            setToken(t)
            setUser(u)
            return {}
        } catch {
            return { error: 'Network error. Please try again.' }
        }
    }

    const logout = () => {
        localStorage.removeItem('mf_token')
        setToken(null)
        setUser(null)
        setTenant(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, tenant, token, isLoading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}

export function useApiClient() {
    const { token } = useAuth()
    return useCallback(async (url: string, options?: RequestInit) => {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options?.headers,
            },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Request failed')
        return data.data
    }, [token])
}
