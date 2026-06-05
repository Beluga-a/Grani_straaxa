import { NextRequest, NextResponse } from 'next/server'
import { getBase, upsertOAuthUser, createOAuthToken } from '../../_helpers'

export async function GET(req: NextRequest) {
  const base = getBase()
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(`${base}/auth?oauth_error=no_code`)

  try {
    // Обмениваем code на токен
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri:  `${base}/api/auth/google/callback`,
        grant_type:    'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('no access_token')

    // Получаем профиль
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = await profileRes.json()
    if (!profile.email) throw new Error('no email')

    upsertOAuthUser(profile.email, profile.name || profile.email, 'google', profile.id)
    const token = createOAuthToken(profile.email)

    return NextResponse.redirect(`${base}/auth?oauth_token=${token}`)
  } catch (e) {
    console.error('Google OAuth error:', e)
    return NextResponse.redirect(`${base}/auth?oauth_error=google_failed`)
  }
}
