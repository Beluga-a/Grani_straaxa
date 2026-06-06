import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = getDb()
  db.prepare('DELETE FROM gallery WHERE id = ?').run(Number(id))
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json() as { cat?: string; label?: string; h?: number }
  const db = getDb()
  const sets: string[] = []
  const vals: unknown[] = []
  if (body.cat   !== undefined) { sets.push('cat = ?');   vals.push(body.cat) }
  if (body.label !== undefined) { sets.push('label = ?'); vals.push(body.label) }
  if (body.h     !== undefined) { sets.push('h = ?');     vals.push(body.h) }
  if (sets.length === 0) return NextResponse.json({ ok: true })
  vals.push(Number(id))
  db.prepare(`UPDATE gallery SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  return NextResponse.json({ ok: true })
}
