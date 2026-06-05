import { NextResponse } from 'next/server'
import { getBase } from '../_helpers'

export async function GET() {
  const clientId = process.env.VK_APP_ID
  if (!clientId) return NextResponse.json({ error: 'VK OAuth не настроен' }, { status: 503 })

  const url = new URL('https://oauth.vk.com/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', `${getBase()}/api/auth/vk/callback`)
  url.searchParams.set('scope', 'email')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('v', '5.131')

  return NextResponse.redirect(url.toString())
}
