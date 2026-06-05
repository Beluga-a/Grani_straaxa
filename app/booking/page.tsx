'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { QUESTS } from '@/data'
import { toast } from '@/lib/toast'
import { useAuth } from '@/lib/auth'
import { addBooking, getBookings } from '@/lib/bookings'
import Footer from '@/components/layout/Footer'
import Icon, { type IconName } from '@/components/ui/Icon'
import styles from './page.module.css'

const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
const TIMES  = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00']

function BookingForm() {
  const { user } = useAuth()
  const router    = useRouter()
  const params    = useSearchParams()
  const preQuest  = params.get('quest') ?? ''

  const now   = new Date()
  const [y, setY] = useState(now.getFullYear())
  const [m, setM] = useState(now.getMonth())
  const [selDate, setSelDate] = useState<Date | null>(null)
  const [selTime, setSelTime] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [code, setCode]       = useState('')
  const [liveN, setLiveN]     = useState(23)
  const [takenTimes, setTakenTimes] = useState<string[]>([])

  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    quest:   preQuest,
    players: '',
    comment: '',
  })

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        name:  f.name  || user.name,
        phone: f.phone || user.phone || '',
      }))
    }
  }, [user])

  // Pre-select quest from URL
  useEffect(() => {
    if (preQuest) setForm(f => ({ ...f, quest: preQuest }))
  }, [preQuest])

  // Загружаем занятые слоты при смене квеста или даты
  useEffect(() => {
    if (!form.quest || !selDate) { setTakenTimes([]); return }
    const dateStr = selDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    getBookings().then(all => {
      const taken = all
        .filter(b => b.quest === form.quest && b.date === dateStr && b.status !== 'cancelled')
        .map(b => b.time)
      setTakenTimes(taken)
      // если выбранное время стало занятым — сбрасываем
      if (selTime && taken.includes(selTime)) setSelTime(null)
    })
  }, [form.quest, selDate])

  useEffect(() => {
    const t = setInterval(() => setLiveN(Math.floor(Math.random() * 15 + 15)), 4000)
    return () => clearInterval(t)
  }, [])

  const chMonth = (d: number) => {
    let nm = m + d, ny = y
    if (nm > 11) { nm = 0; ny++ }
    if (nm < 0)  { nm = 11; ny-- }
    setM(nm); setY(ny); setSelDate(null); setSelTime(null)
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const first = new Date(y, m, 1)
  let startDay = first.getDay() - 1; if (startDay < 0) startDay = 6
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  const selectedQuest = QUESTS.find(q => q.name === form.quest)
  const playersMin = selectedQuest?.playersMin ?? 2
  const playersMax = selectedQuest?.playersMax ?? 8

  const doBook = async () => {
    if (!form.name || !form.phone || !form.quest || !form.players || !selDate || !selTime)
      return toast('⚠ Заполните все обязательные поля')
    const c = 'GS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const questData = QUESTS.find(q => q.name === form.quest)
    const dateStr = selDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const numPlayers = parseInt(form.players)
    const base   = questData?.basePrice  ?? questData?.priceNum ?? 0
    const upTo   = questData?.baseUpTo   ?? questData?.playersMin ?? numPlayers
    const extra  = questData?.extraPrice ?? 0
    const amountNum = base + Math.max(0, numPlayers - upTo) * extra
    const amountStr = amountNum ? amountNum.toLocaleString('ru-RU') + ' ₽' : (questData?.price ?? '—')
    await addBooking({
      id: c,
      userName:  form.name,
      userEmail: user?.email ?? '',
      phone:     form.phone,
      quest:     form.quest,
      date:      dateStr,
      time:      selTime,
      players:   numPlayers,
      status:    'pending',
      amount:    amountStr,
      amountNum,
      createdAt: Date.now(),
      comment:   form.comment.trim() || undefined,
    })
    setCode(c); setSuccess(true)
    toast('✓ Бронь принята! Код: ' + c)
  }

  // ── Auth gate ──
  if (!user) {
    const currentPath = `/booking${preQuest ? `?quest=${encodeURIComponent(preQuest)}` : ''}`
    return (
      <>
        <div className="section-hero">
          <div className="eyebrow">Бронирование</div>
          <h1 className="h1">Забронировать</h1>
        </div>
        <section className="section" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 20, color: 'var(--red)' }}><Icon name="user" size={48} /></div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 300, marginBottom: 12 }}>
            Нужен аккаунт
          </h2>
          <p style={{ color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 32, fontSize: 14 }}>
            {preQuest
              ? <>Чтобы забронировать <strong style={{ color: 'var(--white)' }}>«{preQuest}»</strong>, войдите или зарегистрируйтесь — это займёт меньше минуты.</>
              : 'Войдите или создайте аккаунт, чтобы забронировать квест. Все ваши брони будут сохранены в личном кабинете.'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href={`/auth?returnUrl=${encodeURIComponent(currentPath)}${preQuest ? `&quest=${encodeURIComponent(preQuest)}` : ''}`}
              className="btn btn-primary"
            >
              Войти
            </Link>
            <Link
              href={`/auth?tab=up&returnUrl=${encodeURIComponent(currentPath)}${preQuest ? `&quest=${encodeURIComponent(preQuest)}` : ''}`}
              className="btn btn-outline"
            >
              Зарегистрироваться
            </Link>
          </div>
          <div style={{ marginTop: 24, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
            После входа вы вернётесь сюда автоматически
          </div>
        </section>
        <Footer />
      </>
    )
  }

  // ── Success screen ──
  if (success) return (
    <>
      <div className="section-hero"><div className="eyebrow">Бронирование</div><h1 className="h1">Забронировать</h1></div>
      <section className="section" style={{ textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ marginBottom: 20, color: 'var(--red)' }}><Icon name="check" size={48} /></div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 300, marginBottom: 12 }}>Место забронировано</h2>
        <p style={{ color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 16 }}>
          Мы позвоним в течение часа для подтверждения. Приходите за 15 минут до начала.
        </p>
        {form.comment && (
          <p style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', marginBottom: 20, padding: '8px 16px', border: '1px solid var(--border)' }}>
            Ваш комментарий передан администратору
          </p>
        )}
        <div style={{ display: 'inline-block', padding: '10px 28px', border: '1px solid var(--red)', color: 'var(--red)', fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 28 }}>
          Код брони: {code}
        </div>
        <br />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/profile" className="btn btn-outline">Мой профиль</Link>
          <button className="btn btn-primary" onClick={() => {
            setSuccess(false)
            setForm({ name: user.name, phone: user.phone || '', quest: '', players: '', comment: '' })
            setSelDate(null); setSelTime(null)
          }}>Новое бронирование</button>
        </div>
      </section>
      <Footer />
    </>
  )

  // ── Main form ──
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Бронирование</div><h1 className="h1">Забронировать</h1></div>
      <section className="section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div className="live-dot" />
          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '.1em' }}>{liveN} человек смотрят прямо сейчас</span>
        </div>

        <div className={styles.layout}>
          <div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: 40 }}>

              {/* Logged-in user bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '12px 16px', background: 'rgba(200,0,10,.05)', border: '1px solid rgba(200,0,10,.15)', borderLeft: '2px solid var(--red)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: 14, flexShrink: 0 }}>{user.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 300 }}>{user.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>{user.email}</div>
                </div>
                <Link href="/profile" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '.1em' }}>Профиль →</Link>
              </div>

              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 300, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>Данные для записи</h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Имя *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value.replace(/\d/g, '') })} placeholder="Алексей" />
                </div>
                <div className="form-group">
                  <label className="form-label">Телефон *</label>
                  <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value.replace(/[^\d\s+()\-\.]/g, '') })} placeholder="+7 (___) ___-__-__" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Квест *</label>
                <select className="form-select" value={form.quest} onChange={e => setForm({ ...form, quest: e.target.value, players: '' })}>
                  <option value="">— Выберите квест —</option>
                  {QUESTS.map(q => <option key={q.id}>{q.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Игроков *{selectedQuest ? ` (${playersMin}–${playersMax})` : ''}</label>
                <select className="form-select" value={form.players} onChange={e => setForm({ ...form, players: e.target.value })}>
                  <option value="">—</option>
                  {Array.from({ length: playersMax - playersMin + 1 }, (_, i) => playersMin + i).map(n => <option key={n}>{n}</option>)}
                </select>
              </div>

              {/* Calendar */}
              <div className="form-group">
                <label className="form-label">Дата *</label>
                <div className={styles.cal}>
                  <div className={styles.calHeader}>
                    <button className={styles.calNav} onClick={() => chMonth(-1)}>‹</button>
                    <span style={{ fontFamily: 'var(--serif)', fontSize: 16 }}>{MONTHS[m]} {y}</span>
                    <button className={styles.calNav} onClick={() => chMonth(1)}>›</button>
                  </div>
                  <div className={styles.calDayNames}>{['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].map(d => <span key={d}>{d}</span>)}</div>
                  <div className={styles.calDays}>
                    {[...Array(startDay)].map((_, i) => <div key={'e' + i} />)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const d = i + 1
                      const dt = new Date(y, m, d); const past = dt < today
                      const isSel = selDate?.toDateString() === dt.toDateString()
                      const isToday = dt.toDateString() === today.toDateString()
                      return <div key={d}
                        className={`${styles.calDay} ${past ? styles.calDisabled : ''} ${isSel ? styles.calSelected : ''} ${isToday ? styles.calToday : ''}`}
                        onClick={() => !past && (setSelDate(dt), setSelTime(null))}>{d}</div>
                    })}
                  </div>
                </div>
              </div>

              {selDate && (
                <div className="form-group">
                  <label className="form-label">Время *</label>
                  <div className={styles.timeGrid}>
                    {TIMES.map(t => {
                      const isTaken = takenTimes.includes(t)
                      return (
                        <div key={t}
                          className={`${styles.timeSlot} ${isTaken ? styles.taken : ''} ${selTime === t ? styles.selTime : ''}`}
                          onClick={() => !isTaken && setSelTime(t)}
                          title={isTaken ? 'Это время уже занято' : t}>
                          {t}
                          {isTaken && <span style={{display:'block',fontSize:9,opacity:.7,letterSpacing:0}}>занято</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Comment for admin */}
              <div className="form-group" style={{ marginTop: 8 }}>
                <label className="form-label">
                  Комментарий администратору
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', marginLeft: 8 }}>(необязательно)</span>
                </label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
                  value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  placeholder="Пожелания, вопросы, особые условия…"
                />
              </div>

              <button className="form-submit" onClick={doBook}>Забронировать место</button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: 28, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.18em', color: 'var(--muted)', marginBottom: 18, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Наши квесты</div>
              {QUESTS.map(q => (
                <div key={q.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => setForm({ ...form, quest: q.name, players: '' })}>
                  <div style={{ width: 52, height: 52, flexShrink: 0, background: q.bg }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 300, marginBottom: 3 }}>{q.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>{q.players} · {q.time} · {q.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: 28 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.18em', color: 'var(--muted)', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Важная информация</div>
              {[
                { icon: 'pin',    text: 'ул. Бабушкина, 66, 2-й этаж' },
                { icon: 'clock',  text: 'Пн–Вс 10:00–23:00' },
                { icon: 'warn',   text: 'Квесты 18+. Иметь при себе документ.' },
                { icon: 'rotate', text: 'Бесплатная отмена за 24 ч.' },
              ].map(t => (
                <p key={t.text} style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7, marginBottom: 10, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                  <Icon name={t.icon as IconName} size={12} style={{ marginTop: 2, flexShrink: 0 }} />{t.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default function BookingPage() {
  return (
    <Suspense>
      <BookingForm />
    </Suspense>
  )
}
