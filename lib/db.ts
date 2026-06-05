import 'server-only'
import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = path.join(process.cwd(), 'data', 'granistrakha.db')

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  initSchema(_db)
  addColumnIfMissing(_db, 'quests', 'icon', "TEXT DEFAULT '💀'")
  addColumnIfMissing(_db, 'users', 'oauth_provider', 'TEXT')
  addColumnIfMissing(_db, 'users', 'oauth_id', 'TEXT')
  migrateFromJson(_db)
  return _db
}

function addColumnIfMissing(db: Database.Database, table: string, column: string, definition: string) {
  const cols = db.pragma(`table_info(${table})`) as any[]
  if (!cols.find(c => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`)
  }
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      email          TEXT PRIMARY KEY,
      password       TEXT NOT NULL DEFAULT '',
      role           TEXT NOT NULL DEFAULT 'user',
      name           TEXT NOT NULL DEFAULT '',
      phone          TEXT NOT NULL DEFAULT '',
      oauth_provider TEXT,
      oauth_id       TEXT
    );

    CREATE TABLE IF NOT EXISTS oauth_tokens (
      token   TEXT PRIMARY KEY,
      email   TEXT NOT NULL,
      expires INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quests (
      id            INTEGER PRIMARY KEY,
      name          TEXT NOT NULL,
      icon          TEXT DEFAULT '💀',
      fear          INTEGER DEFAULT 3,
      diff          INTEGER DEFAULT 3,
      players       TEXT,
      players_min   INTEGER,
      players_max   INTEGER,
      time_label    TEXT,
      time_min      INTEGER,
      age           TEXT,
      rating        TEXT,
      reviews_count INTEGER DEFAULT 0,
      badge         TEXT,
      cat           TEXT,
      price         TEXT,
      price_num     INTEGER,
      base_price    INTEGER,
      base_up_to    INTEGER,
      extra_price   INTEGER,
      img           TEXT,
      bg            TEXT,
      desc          TEXT,
      full          TEXT,
      tags          TEXT DEFAULT '[]',
      atmosphere    TEXT DEFAULT '[]',
      included      TEXT DEFAULT '[]',
      schedule      TEXT DEFAULT '[]',
      schedule_text TEXT,
      active        INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id           TEXT PRIMARY KEY,
      user_name    TEXT,
      user_email   TEXT,
      phone        TEXT,
      quest        TEXT,
      date         TEXT,
      time         TEXT,
      players      INTEGER,
      status       TEXT NOT NULL DEFAULT 'pending',
      amount       TEXT,
      amount_num   INTEGER,
      created_at   INTEGER
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      name   TEXT,
      quest  TEXT,
      rating INTEGER,
      text   TEXT,
      date   TEXT
    );
  `)
}

// Запускается один раз — если таблицы пустые, переносит данные из JSON
function migrateFromJson(db: Database.Database) {
  const dataDir = path.join(process.cwd(), 'data')

  const userCount = (db.prepare('SELECT COUNT(*) as c FROM users').get() as any).c
  if (userCount === 0) {
    const file = path.join(dataDir, 'users.json')
    if (fs.existsSync(file)) {
      const users: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
      const ins = db.prepare(
        'INSERT OR IGNORE INTO users (email, password, role, name, phone) VALUES (?,?,?,?,?)'
      )
      for (const u of users) ins.run(u.email, u.password, u.role, u.name ?? '', u.phone ?? '')
    }
  }

  const questCount = (db.prepare('SELECT COUNT(*) as c FROM quests').get() as any).c
  if (questCount === 0) {
    const file = path.join(dataDir, 'quests.json')
    if (fs.existsSync(file)) {
      const quests: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
      const ins = db.prepare(`
        INSERT OR IGNORE INTO quests
          (id, name, fear, diff, players, players_min, players_max,
           time_label, time_min, age, rating, reviews_count, badge, cat,
           price, price_num, base_price, base_up_to, extra_price,
           img, bg, desc, full, tags, atmosphere, included, schedule, schedule_text, active)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `)
      for (const q of quests) {
        ins.run(
          q.id, q.name, q.fear, q.diff, q.players, q.playersMin, q.playersMax,
          q.time, q.timeMin, q.age, q.rating, q.reviews ?? 0, q.badge, q.cat,
          q.price, q.priceNum, q.basePrice, q.baseUpTo, q.extraPrice,
          q.img, q.bg, q.desc, q.full,
          JSON.stringify(q.tags ?? []),
          JSON.stringify(q.atmosphere ?? []),
          JSON.stringify(q.included ?? []),
          JSON.stringify(q.schedule ?? []),
          q.scheduleText, q.active ? 1 : 0,
        )
      }
    }
  }

  const bookingCount = (db.prepare('SELECT COUNT(*) as c FROM bookings').get() as any).c
  if (bookingCount === 0) {
    const file = path.join(dataDir, 'bookings.json')
    if (fs.existsSync(file)) {
      const bookings: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
      const ins = db.prepare(`
        INSERT OR IGNORE INTO bookings
          (id, user_name, user_email, phone, quest, date, time, players, status, amount, amount_num, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      `)
      for (const b of bookings) {
        ins.run(
          b.id, b.userName, b.userEmail, b.phone, b.quest,
          b.date, b.time, b.players, b.status, b.amount, b.amountNum ?? null, b.createdAt ?? null,
        )
      }
    }
  }

  const reviewCount = (db.prepare('SELECT COUNT(*) as c FROM reviews').get() as any).c
  if (reviewCount === 0) {
    const file = path.join(dataDir, 'reviews.json')
    if (fs.existsSync(file)) {
      const reviews: any[] = JSON.parse(fs.readFileSync(file, 'utf-8'))
      const ins = db.prepare(
        'INSERT INTO reviews (name, quest, rating, text, date) VALUES (?,?,?,?,?)'
      )
      for (const r of reviews) ins.run(r.name, r.quest, r.rating, r.text, r.date)
    }
  }
}
