import { NextResponse } from 'next/server'
import { readBookings, insertBooking, updateBookingStatus } from '@/lib/questsServer'

export async function GET() {
  return NextResponse.json(readBookings())
}

export async function POST(req: Request) {
  const body = await req.json()
  insertBooking(body)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const { id, status } = await req.json() as { id: string; status: string }
  updateBookingStatus(id, status)
  return NextResponse.json({ ok: true })
}
