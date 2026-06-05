import { getDb } from '@/lib/db'

export function getBase(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
}

export function createOAuthToken(email: string): string {
  const db = getDb()
  const token = crypto.randomUUID()
  const expires = Date.now() + 5 * 60 * 1000 // 5 минут
  db.prepare('INSERT INTO oauth_tokens (token, email, expires) VALUES (?, ?, ?)').run(token, email, expires)
  return token
}

export function upsertOAuthUser(
  email: string,
  name: string,
  provider: string,
  oauthId: string
): void {
  const db = getDb()
  const existing = db.prepare('SELECT email FROM users WHERE email = ?').get(email) as any
  if (existing) {
    db.prepare('UPDATE users SET oauth_provider = ?, oauth_id = ? WHERE email = ?')
      .run(provider, oauthId, email)
  } else {
    db.prepare(
      'INSERT INTO users (email, password, role, name, phone, oauth_provider, oauth_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(email, '', 'user', name, '', provider, oauthId)
  }
}
