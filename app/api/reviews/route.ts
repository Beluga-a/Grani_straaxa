import { NextResponse } from 'next/server'
import { readReviews, insertReview } from '@/lib/questsServer'

export async function GET() {
  return NextResponse.json(readReviews())
}

export async function POST(req: Request) {
  const body = await req.json()
  insertReview(body)
  return NextResponse.json({ ok: true })
}
