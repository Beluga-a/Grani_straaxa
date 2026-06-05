import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'no token' }, { status: 400 })

  const db = getDb()
  const row = db.prepare('SELECT email, expires FROM oauth_tokens WHERE token = ?').get(token) as any
  if (!row) return NextResponse.json({ error: 'invalid token' }, { status: 401 })

  // Удаляем токен (одноразовый)
  db.prepare('DELETE FROM oauth_tokens WHERE token = ?').run(token)

  if (row.expires < Date.now()) return NextResponse.json({ error: 'token expired' }, { status: 401 })

  const user = db.prepare('SELECT email, name, role, phone FROM users WHERE email = ?').get(row.email) as any
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 })

  return NextResponse.json({ email: user.email, name: user.name, role: user.role, phone: user.phone || '' })
}
