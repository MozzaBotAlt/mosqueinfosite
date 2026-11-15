import { NextResponse } from 'next/server'
import { DEFAULT_SITE_CONFIG, isSiteConfig } from '@/lib/site-config'

export const runtime = 'nodejs'

function backendHeaders() {
  const headers = new Headers({ 'Content-Type': 'application/json' })
  const token = process.env.MOSQUE_BACKEND_TOKEN
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return headers
}

function isAuthorized(request: Request) {
  const expectedToken = process.env.MOSQUE_ADMIN_TOKEN
  const suppliedToken = request.headers.get('x-admin-token')
  return Boolean(expectedToken && suppliedToken && suppliedToken === expectedToken)
}

export async function GET() {
  const backendUrl = process.env.MOSQUE_BACKEND_URL
  if (!backendUrl) {
    return NextResponse.json({ config: DEFAULT_SITE_CONFIG, backendConfigured: false })
  }

  try {
    const response = await fetch(backendUrl, {
      headers: backendHeaders(),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error(`Backend returned ${response.status}`)
    const result: unknown = await response.json()
    const config = result && typeof result === 'object' && 'config' in result
      ? (result as { config: unknown }).config
      : result
    if (!isSiteConfig(config)) throw new Error('Backend returned invalid settings')
    return NextResponse.json({ config, backendConfigured: true })
  } catch {
    return NextResponse.json({ error: 'Unable to load mosque settings from the backend' }, { status: 502 })
  }
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Admin authorization required' }, { status: 401 })
  }

  const backendUrl = process.env.MOSQUE_BACKEND_URL
  if (!backendUrl) {
    return NextResponse.json({ error: 'MOSQUE_BACKEND_URL is not configured' }, { status: 503 })
  }

  try {
    const config: unknown = await request.json()
    if (!isSiteConfig(config)) {
      return NextResponse.json({ error: 'Invalid site settings' }, { status: 400 })
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers: backendHeaders(),
      body: JSON.stringify(config),
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) throw new Error(`Backend returned ${response.status}`)
    return NextResponse.json({ saved: true })
  } catch {
    return NextResponse.json({ error: 'Unable to save mosque settings to the backend' }, { status: 502 })
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Invalid admin key' }, { status: 401 })
  }
  return NextResponse.json({ authorized: true })
}