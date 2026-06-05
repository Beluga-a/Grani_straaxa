import { NextRequest, NextResponse } from 'next/server'
import { createHmac, createHash } from 'crypto'
import { getBase, upsertOAuthUser, createOAuthToken } from '../_helpers'

export async function GET(req: NextRequest) {
  const base = getBase()
  const botToken = process.env.TG_BOT_TOKEN
  if (!botToken) return NextResponse.redirect(`${base}/auth?oauth_error=tg_not_configured`)

  const params = req.nextUrl.searchParams
  const hash = params.get('hash')
  const id   = params.get('id')
  if (!hash || !id) return NextResponse.redirect(`${base}/auth?oauth_error=tg_no_data`)

  // Проверяем подпись Telegram
  const checkFields = ['auth_date', 'first_name', 'id', 'last_name', 'photo_url', 'username']
  const dataString = checkFields
    .filter(f => params.has(f))
    .map(f => `${f}=${params.get(f)}`)
    .join('\n')

  const secretKey = createHash('sha256').update(botToken).digest()
  const computedHash = createHmac('sha256', secretKey).update(dataString).digest('hex')

  if (computedHash !== hash) return NextResponse.redirect(`${base}/auth?oauth_error=tg_invalid_hash`)

  // Токен не старше 24 часов
  const authDate = parseInt(params.get('auth_date') || '0')
  if (Date.now() / 1000 - authDate > 86400) return NextResponse.redirect(`${base}/auth?oauth_error=tg_expired`)

  const firstName = params.get('first_name') || ''
  const lastName  = params.get('last_name')  || ''
  const username  = params.get('username')   || ''
  const name = `${firstName} ${lastName}`.trim() || username || `tg_${id}`
  const email = `tg_${id}@telegram.local`

  upsertOAuthUser(email, name, 'telegram', id)
  const token = createOAuthToken(email)

  return NextResponse.redirect(`${base}/auth?oauth_token=${token}`)
}
