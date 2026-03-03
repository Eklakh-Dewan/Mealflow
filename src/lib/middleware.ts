import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader, JWTPayload } from './auth'
import { Role } from '@prisma/client'

export type AuthenticatedRequest = NextRequest & {
    user: JWTPayload
}

export function withAuth(
    handler: (req: NextRequest, context: { params: Record<string, string> }, user: JWTPayload) => Promise<NextResponse>,
    allowedRoles?: Role[]
) {
    return async (req: NextRequest, context: { params: Record<string, string> }) => {
        try {
            const token = extractTokenFromHeader(req.headers.get('authorization'))
            if (!token) {
                return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
            }

            const user = verifyToken(token)

            if (allowedRoles && allowedRoles.length > 0) {
                if (!allowedRoles.includes(user.role)) {
                    return NextResponse.json(
                        { error: 'Insufficient permissions' },
                        { status: 403 }
                    )
                }
            }

            return handler(req, context, user)
        } catch {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }
    }
}

export function apiResponse<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
    return NextResponse.json({ success: false, error: message }, { status })
}
