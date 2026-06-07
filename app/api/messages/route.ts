import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const messages = db.prepare('SELECT * FROM messages ORDER BY id DESC').all()
  return NextResponse.json(messages)
}
