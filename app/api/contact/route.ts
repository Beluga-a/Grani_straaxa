import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  const { name, contact, message } = await req.json() as { name: string; contact: string; message: string }

  if (!name || !contact || !message)
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })

  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass)
    return NextResponse.json({ error: 'Email не настроен' }, { status: 503 })

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: `"Грани Страха — Сайт" <${user}>`,
    to: user,
    subject: `Новое сообщение от ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px">
        <h2 style="color:#c8000a">Новое сообщение с сайта</h2>
        <p><b>Имя:</b> ${name}</p>
        <p><b>Контакт:</b> ${contact}</p>
        <p><b>Сообщение:</b></p>
        <p style="background:#f5f5f5;padding:12px;border-left:3px solid #c8000a">${message.replace(/\n/g, '<br>')}</p>
      </div>
    `,
  })

  return NextResponse.json({ ok: true })
}
