import { NextResponse } from 'next/server'
import { readQuests, insertQuest, updateQuest, deleteQuest } from '@/lib/questsServer'

const ADMIN_SECRET = process.env.ADMIN_SECRET

function checkSecret(req: Request): boolean {
  if (!ADMIN_SECRET) return false
  return req.headers.get('X-Admin-Secret') === ADMIN_SECRET
}

export async function GET() {
  return NextResponse.json(readQuests())
}

export async function POST(req: Request) {
  const body = await req.json()
  const quest = insertQuest(body)
  return NextResponse.json(quest)
}

export async function PATCH(req: Request) {
  const body = await req.json() as { id: number; field?: string; value?: unknown; [k: string]: unknown }
  const { id, field, value, ...rest } = body

  // Формат от Telegram-бота: { id, field, value } + заголовок X-Admin-Secret
  if (field !== undefined) {
    if (!checkSecret(req))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const quest = updateQuest(id, { [field]: value })
    if (!quest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(quest)
  }

  // Формат от веб-админки: { id, ...patch }
  const quest = updateQuest(id, rest)
  if (!quest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quest)
}

export async function DELETE(req: Request) {
  const { id } = await req.json() as { id: number }
  deleteQuest(id)
  return NextResponse.json({ ok: true })
}
