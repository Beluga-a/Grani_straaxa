import 'server-only'
import { getDb } from './db'

// ── helpers ──────────────────────────────────────────────────────────────────

function parseJson(v: string | null | undefined): any[] {
  try { return JSON.parse(v ?? '[]') } catch { return [] }
}

function rowToQuest(r: any) {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon ?? '💀',
    fear: r.fear,
    diff: r.diff,
    players: r.players,
    playersMin: r.players_min,
    playersMax: r.players_max,
    time: r.time_label,
    timeMin: r.time_min,
    age: r.age,
    rating: r.rating,
    reviews: r.reviews_count,
    badge: r.badge,
    cat: r.cat,
    price: r.price,
    priceNum: r.price_num,
    basePrice: r.base_price,
    baseUpTo: r.base_up_to,
    extraPrice: r.extra_price,
    img: r.img,
    bg: r.bg,
    desc: r.desc,
    full: r.full,
    tags: parseJson(r.tags),
    atmosphere: parseJson(r.atmosphere),
    included: parseJson(r.included),
    schedule: parseJson(r.schedule),
    scheduleText: r.schedule_text,
    active: r.active === 1,
  }
}

function rowToBooking(r: any) {
  return {
    id: r.id,
    userName: r.user_name,
    userEmail: r.user_email,
    phone: r.phone,
    quest: r.quest,
    date: r.date,
    time: r.time,
    players: r.players,
    status: r.status,
    amount: r.amount,
    amountNum: r.amount_num,
    createdAt: r.created_at,
  }
}

// ── quests ───────────────────────────────────────────────────────────────────

export function readQuests(): any[] {
  return getDb().prepare('SELECT * FROM quests ORDER BY id').all().map(rowToQuest)
}

export function insertQuest(q: any): any {
  const db = getDb()
  const maxId = (db.prepare('SELECT COALESCE(MAX(id),0) as m FROM quests').get() as any).m
  const id = maxId + 1
  db.prepare(`
    INSERT INTO quests
      (id, name, icon, fear, diff, players, players_min, players_max,
       time_label, time_min, age, rating, reviews_count, badge, cat,
       price, price_num, base_price, base_up_to, extra_price,
       img, bg, desc, full, tags, atmosphere, included, schedule, schedule_text, active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, q.name, q.icon ?? '💀', q.fear ?? 3, q.diff ?? 3, q.players, q.playersMin, q.playersMax,
    q.time, q.timeMin, q.age, q.rating, q.reviews ?? 0, q.badge, q.cat,
    q.price, q.priceNum, q.basePrice, q.baseUpTo, q.extraPrice,
    q.img, q.bg, q.desc, q.full,
    JSON.stringify(q.tags ?? []),
    JSON.stringify(q.atmosphere ?? []),
    JSON.stringify(q.included ?? []),
    JSON.stringify(q.schedule ?? []),
    q.scheduleText, 1,
  )
  return rowToQuest(db.prepare('SELECT * FROM quests WHERE id = ?').get(id))
}

export function updateQuest(id: number, patch: Record<string, unknown>): any {
  const db = getDb()
  const colMap: Record<string, string> = {
    name: 'name', icon: 'icon', fear: 'fear', diff: 'diff', players: 'players',
    playersMin: 'players_min', playersMax: 'players_max',
    time: 'time_label', timeMin: 'time_min', age: 'age',
    rating: 'rating', reviews: 'reviews_count', badge: 'badge', cat: 'cat',
    price: 'price', priceNum: 'price_num', basePrice: 'base_price',
    baseUpTo: 'base_up_to', extraPrice: 'extra_price',
    img: 'img', bg: 'bg', desc: 'desc', full: 'full',
    tags: 'tags', atmosphere: 'atmosphere', included: 'included',
    schedule: 'schedule', scheduleText: 'schedule_text', active: 'active',
  }
  const arrayFields = new Set(['tags', 'atmosphere', 'included', 'schedule'])
  const sets: string[] = []
  const vals: unknown[] = []
  for (const [key, val] of Object.entries(patch)) {
    const col = colMap[key]
    if (!col) continue
    sets.push(`${col} = ?`)
    if (arrayFields.has(key)) vals.push(JSON.stringify(val))
    else if (key === 'active') vals.push(val ? 1 : 0)
    else vals.push(val)
  }
  if (sets.length === 0) return null
  vals.push(id)
  db.prepare(`UPDATE quests SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
  return rowToQuest(db.prepare('SELECT * FROM quests WHERE id = ?').get(id))
}

export function deleteQuest(id: number): void {
  getDb().prepare('DELETE FROM quests WHERE id = ?').run(id)
}

// ── users ────────────────────────────────────────────────────────────────────

export function readUsers(): any[] {
  return getDb().prepare('SELECT * FROM users').all()
}

export function findUserByEmail(email: string): any | undefined {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) ?? undefined
}

export function insertUser(u: { email: string; password: string; name: string; phone: string; role: string }): void {
  getDb().prepare(
    'INSERT INTO users (email, password, role, name, phone) VALUES (?,?,?,?,?)'
  ).run(u.email.toLowerCase(), u.password, u.role, u.name, u.phone)
}

export function updateUser(email: string, patch: { name?: string; phone?: string; password?: string; role?: string }): any {
  const db = getDb()
  const sets: string[] = []
  const vals: unknown[] = []
  if (patch.name !== undefined)     { sets.push('name = ?');     vals.push(patch.name) }
  if (patch.phone !== undefined)    { sets.push('phone = ?');    vals.push(patch.phone) }
  if (patch.password !== undefined) { sets.push('password = ?'); vals.push(patch.password) }
  if (patch.role !== undefined)     { sets.push('role = ?');     vals.push(patch.role) }
  if (sets.length === 0) return findUserByEmail(email)
  vals.push(email.toLowerCase())
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE email = ?`).run(...vals)
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
}

export function deleteUser(email: string): void {
  const db = getDb()
  db.prepare('DELETE FROM users WHERE email = ?').run(email.toLowerCase())
}

// ── bookings ─────────────────────────────────────────────────────────────────

export function readBookings(): any[] {
  return getDb().prepare('SELECT * FROM bookings ORDER BY created_at DESC').all().map(rowToBooking)
}

export function insertBooking(b: any): void {
  getDb().prepare(`
    INSERT OR REPLACE INTO bookings
      (id, user_name, user_email, phone, quest, date, time, players, status, amount, amount_num, created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    b.id, b.userName, b.userEmail, b.phone, b.quest,
    b.date, b.time, b.players, b.status ?? 'pending',
    b.amount, b.amountNum ?? null, b.createdAt ?? Date.now(),
  )
}

export function updateBookingStatus(id: string, status: string): void {
  getDb().prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, id)
}

// ── reviews ──────────────────────────────────────────────────────────────────

export function readReviews(): any[] {
  return getDb().prepare('SELECT * FROM reviews ORDER BY id DESC').all().map(r => ({
    id: (r as any).id,
    name: (r as any).name,
    quest: (r as any).quest,
    rating: (r as any).rating,
    text: (r as any).text,
    date: (r as any).date,
  }))
}

export function insertReview(r: { name: string; quest: string; rating: number; text: string; date: string }): void {
  getDb().prepare(
    'INSERT INTO reviews (name, quest, rating, text, date) VALUES (?,?,?,?,?)'
  ).run(r.name, r.quest, r.rating, r.text, r.date)
}
