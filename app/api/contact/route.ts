import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(req: Request) {
  const { name, contact, message } = await req.json() as { name: string; contact: string; message: string }

  if (!name || !contact || !message)
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })

  const db = getDb()
  let sentByEmail = 0

  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.GMAIL_USER

  if (apiKey && toEmail) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Грани Страха <onboarding@resend.dev>',
          to: [toEmail],
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
        }),
        signal: controller.signal,
      })

      clearTimeout(timer)
      if (res.ok) sentByEmail = 1
      else console.error('[contact] resend error:', await res.text())
    } catch (err) {
      console.error('[contact] email failed:', (err as Error).message)
    }
  }

  db.prepare(
    'INSERT INTO messages (name, contact, message, sent_by_email) VALUES (?, ?, ?, ?)'
  ).run(name, contact, message, sentByEmail)

  return NextResponse.json({ ok: true })
}
