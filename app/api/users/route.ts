import { NextResponse } from 'next/server'
import { readUsers, findUserByEmail, insertUser, updateUser, deleteUser } from '@/lib/questsServer'

export async function GET() {
  return NextResponse.json(readUsers().map(({ password: _, ...u }) => u))
}

export async function POST(req: Request) {
  const body = await req.json() as { email: string; password: string; name: string; phone: string; role: string }
  if (findUserByEmail(body.email))
    return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 409 })
  insertUser(body)
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request) {
  const body = await req.json() as { email: string; name?: string; phone?: string; password?: string }
  if (!findUserByEmail(body.email))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const user = updateUser(body.email, { name: body.name, phone: body.phone, password: body.password })
  return NextResponse.json({ ok: true, user: { email: user.email, name: user.name, role: user.role, phone: user.phone } })
}

export async function DELETE(req: Request) {
  const { email } = await req.json() as { email: string }
  if (!findUserByEmail(email))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  deleteUser(email)
  return NextResponse.json({ ok: true })
}

// PUT — логин
export async function PUT(req: Request) {
  const { email, password } = await req.json() as { email: string; password: string }
  const user = findUserByEmail(email)
  if (!user || user.password !== password)
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
  return NextResponse.json({ email: user.email, name: user.name, role: user.role, phone: user.phone })
}
