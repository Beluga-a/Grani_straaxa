'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import Icon from '@/components/ui/Icon'
import styles from './page.module.css'

type Status = 'busy' | 'soon' | 'free'

interface Quest { id: number; name: string; players: string; time: string; timeMin: number; fear: number; icon?: string }
interface Booking { id: string; quest: string; date: string; time: string; players: number; userName: string; status: string }

interface RoomState {
  quest: Quest
  status: Status
  remainSec: number        // busy: секунд до конца сессии
  untilSec: number         // soon: секунд до начала
  sessionEnd: string | null   // free: во сколько закончилась последняя сессия сегодня ("HH:MM")
  nextBooking: { date: string; time: string; players: number } | null
}

function parseDateTime(date: string, time: string): Date {
  const [d, m, y] = date.split('.')
  const [h, min] = time.split(':')
  return new Date(+y, +m - 1, +d, +h, +min)
}

function todayStr(): string {
  const now = new Date()
  return `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`
}

function computeRooms(quests: Quest[], bookings: Booking[], now: Date): RoomState[] {
  const today = todayStr()

  return quests.map(q => {
    const qBookings = bookings
      .filter(b => b.quest === q.name && (b.status === 'confirmed' || b.status === 'pending'))
      .map(b => ({ ...b, start: parseDateTime(b.date, b.time) }))
      .sort((a, b) => a.start.getTime() - b.start.getTime())

    const nowMs = now.getTime()
    const durationMs = (q.timeMin || 60) * 60 * 1000
    const SOON_WINDOW = 60 * 60 * 1000   // «скоро» — до 60 минут до начала

    // Идёт ли сессия прямо сейчас?
    const active = qBookings.find(b =>
      b.date === today &&
      nowMs >= b.start.getTime() &&
      nowMs < b.start.getTime() + durationMs
    )
    if (active) {
      const endMs = active.start.getTime() + durationMs
      return {
        quest: q, status: 'busy' as Status,
        remainSec: Math.max(0, Math.floor((endMs - nowMs) / 1000)),
        untilSec: 0, sessionEnd: null, nextBooking: null,
      }
    }

    // Есть ли сессия в ближайший час?
    const upcoming = qBookings.find(b =>
      nowMs < b.start.getTime() &&
      b.start.getTime() - nowMs <= SOON_WINDOW
    )
    if (upcoming) {
      return {
        quest: q, status: 'soon' as Status,
        remainSec: 0,
        untilSec: Math.max(0, Math.floor((upcoming.start.getTime() - nowMs) / 1000)),
        sessionEnd: null,
        nextBooking: { date: upcoming.date, time: upcoming.time, players: upcoming.players },
      }
    }

    // Свободно: последняя завершённая сессия сегодня
    const lastToday = [...qBookings]
      .reverse()
      .find(b => b.date === today && nowMs >= b.start.getTime() + durationMs)
    const sessionEnd = lastToday
      ? (() => {
          const d = new Date(lastToday.start.getTime() + durationMs)
          return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
        })()
      : null

    // Следующая бронь после текущего момента
    const next = qBookings.find(b => nowMs < b.start.getTime())
    return {
      quest: q, status: 'free' as Status,
      remainSec: 0, untilSec: 0, sessionEnd,
      nextBooking: next ? { date: next.date, time: next.time, players: next.players } : null,
    }
  })
}

function fmtSec(s: number): string {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${m}:${String(sec).padStart(2,'0')}`
}

export default function LiveMapPage() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<RoomState[]>([])
  const [now, setNow] = useState(new Date())
  const [lastRefresh, setLastRefresh] = useState('')

  const fetchData = useCallback(async () => {
    const [qRes, bRes] = await Promise.all([
      fetch('/api/quests').then(r => r.json()),
      fetch('/api/bookings').then(r => r.json()),
    ])
    setQuests(qRes)
    setBookings(bRes)
    const t = new Date()
    setLastRefresh(`${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}`)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Обновляем данные каждые 60 сек
  useEffect(() => {
    const t = setInterval(fetchData, 60_000)
    return () => clearInterval(t)
  }, [fetchData])

  // Тикаем каждую секунду
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Пересчитываем статусы при каждом тике
  useEffect(() => {
    if (quests.length) setRooms(computeRooms(quests, bookings, now))
  }, [quests, bookings, now])

  const labels: Record<Status, string> = { busy: 'В игре', free: 'Свободно', soon: 'Скоро' }

  const busy = rooms.filter(r => r.status === 'busy').length
  const free = rooms.filter(r => r.status === 'free').length

  return (
    <>
      <div className="section-hero">
        <div className="eyebrow">Live-статус</div>
        <h1 className="h1">Залы прямо сейчас</h1>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '.1em', marginTop: 8 }}>
          {busy > 0 && <span style={{ color: 'var(--red)', marginRight: 16 }}>● {busy} зал{busy > 1 ? 'а' : ''} в игре</span>}
          {free > 0 && <span style={{ color: '#00cc66', marginRight: 16 }}>● {free} свободно</span>}
          {lastRefresh && <span>обновлено в {lastRefresh}</span>}
        </p>
      </div>

      <section className="section">
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 13, padding: '60px 0' }}>
            Загрузка...
          </div>
        ) : (
          <div className={styles.grid}>
            {rooms.map(r => (
              <div key={r.quest.id} className={styles.room}>
                <div className={`${styles.bar} ${styles[r.status]}`} />

                <div className={styles.name}>{r.quest.icon ?? '💀'} {r.quest.name}</div>

                <div className={`${styles.pill} ${styles['pill_' + r.status]}`}>
                  <div className={`${styles.pulse} ${styles['pulse_' + r.status]}`} />
                  {labels[r.status]}
                </div>

                <div className={styles.info}>
                  {r.quest.players} · {r.quest.time} · Ужас {r.quest.fear}/5
                </div>

                {r.status === 'busy' && (
                  <div className={styles.timer}>
                    <Icon name="clock" size={12} /> Осталось: <strong>{fmtSec(r.remainSec)}</strong>
                  </div>
                )}

                {r.status === 'soon' && r.nextBooking && (
                  <div className={styles.timer}>
                    <Icon name="clock" size={12} /> До начала: <strong>{fmtSec(r.untilSec)}</strong>
                    <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
                      {r.nextBooking.date} в {r.nextBooking.time} · {r.nextBooking.players} чел.
                    </div>
                  </div>
                )}

                {r.status === 'free' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {r.sessionEnd && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
                        Сессия завершена в {r.sessionEnd}
                      </div>
                    )}
                    {r.nextBooking ? (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                        <span style={{ color: '#f0a500' }}>▶ Следующий:</span>{' '}
                        {r.nextBooking.date} в <strong>{r.nextBooking.time}</strong> · {r.nextBooking.players} чел.
                      </div>
                    ) : (
                      <Link href="/booking" className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 12 }}>
                        Забронировать
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '.1em', marginTop: 28 }}>
          {[
            { c: 'var(--red)', l: 'В игре — сессия идёт' },
            { c: '#f0a500', l: 'Скоро — менее 60 минут' },
            { c: '#00cc66', l: 'Свободно' },
          ].map(x => (
            <span key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: x.c, flexShrink: 0 }} />
              {x.l}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 16, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', opacity: .6 }}>
          Данные обновляются автоматически каждую минуту. Таймеры — в реальном времени.
        </div>
      </section>
      <Footer />
    </>
  )
}
