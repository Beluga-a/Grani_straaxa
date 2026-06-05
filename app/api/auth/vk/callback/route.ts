import { NextRequest, NextResponse } from 'next/server'
import { getBase, upsertOAuthUser, createOAuthToken } from '../../_helpers'

export async function GET(req: NextRequest) {
  const base = getBase()
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.redirect(`${base}/auth?oauth_error=no_code`)

  try {
    // Обмениваем code на токен (VK возвращает email прямо здесь)
    const tokenUrl = new URL('https://oauth.vk.com/access_token')
    tokenUrl.searchParams.set('client_id',     process.env.VK_APP_ID!)
    tokenUrl.searchParams.set('client_secret', process.env.VK_APP_SECRET!)
    tokenUrl.searchParams.set('redirect_uri',  `${base}/api/auth/vk/callback`)
    tokenUrl.searchParams.set('code', code)

    const tokenRes  = await fetch(tokenUrl.toString())
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) throw new Error('no access_token')

    const userId = String(tokenData.user_id)
    const email  = tokenData.email || `vk_${userId}@vk.local`

    // Получаем имя
    const profileRes = await fetch(
      `https://api.vk.com/method/users.get?user_ids=${userId}&access_token=${tokenData.access_token}&v=5.131`
    )
    const profileData = await profileRes.json()
    const vkUser = profileData.response?.[0]
    const name = vkUser ? `${vkUser.first_name} ${vkUser.last_name}` : `VK User ${userId}`

    upsertOAuthUser(email, name, 'vk', userId)
    const token = createOAuthToken(email)

    return NextResponse.redirect(`${base}/auth?oauth_token=${token}`)
  } catch (e) {
    console.error('VK OAuth error:', e)
    return NextResponse.redirect(`${base}/auth?oauth_error=vk_failed`)
  }
}
