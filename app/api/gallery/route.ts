import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const items = db.prepare('SELECT id, cat, label, img, h FROM gallery ORDER BY id ASC').all()
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const body = await req.json() as { cat: string; label: string; img: string; h?: number }
  if (!body.img || !body.label) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const db = getDb()
  const result = db.prepare('INSERT INTO gallery (cat, label, img, h) VALUES (?,?,?,?)').run(
    body.cat || 'rooms', body.label, body.img, body.h || 240
  )
  return NextResponse.json({ ok: true, id: result.lastInsertRowid })
}
