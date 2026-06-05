'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { QUESTS } from '@/data'
import { toast } from '@/lib/toast'
import Footer from '@/components/layout/Footer'
import styles from './page.module.css'

// ── Swipe carousel (mobile only) ──────────────────────────────────────────────
function ReviewsCarousel({ reviews }: { reviews: any[] }) {
  const [idx, setIdx] = useState(0)
  const touchX = useRef<number | null>(null)

  const goTo = useCallback((i: number) => {
    setIdx(Math.max(0, Math.min(i, reviews.length - 1)))
  }, [reviews.length])

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (diff > 40)  goTo(idx + 1)
    if (diff < -40) goTo(idx - 1)
    touchX.current = null
  }

  if (!reviews.length) return null

  return (
    <div className={styles.carouselWrap}>
      {/* Область просмотра — overflow:hidden */}
      <div className={styles.carouselViewport}>
        {/* Трек двигается через translateX */}
        <div
          className={styles.carouselTrack}
          style={{ transform: `translateX(-${idx * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {reviews.map((r, i) => (
            <div key={i} className={`${styles.rcard} ${styles.carouselCard}`}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} className={j >= r.rating ? 'rstar off' : 'rstar'} style={{ width: 16, height: 16 }} />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text)', lineHeight: 1.8, marginBottom: 20 }}>
                «{r.text}»
              </div>
              <div style={{ width: 28, height: 1, background: 'var(--red)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '.1em', color: 'var(--white)' }}>{r.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', marginTop: 4 }}>{r.quest}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки + точки */}
      <div className={styles.carouselNav}>
        <button className={styles.carouselArrow} onClick={() => goTo(idx - 1)} disabled={idx === 0}>‹</button>
        <div className={styles.carouselDots}>
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === idx ? styles.dotActive : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button className={styles.carouselArrow} onClick={() => goTo(idx + 1)} disabled={idx === reviews.length - 1}>›</button>
      </div>

      <div className={styles.carouselCounter}>{idx + 1} / {reviews.length}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const [rating, setRating] = useState(0)
  const [hover,  setHover]  = useState(0)
  const [name,   setName]   = useState('')
  const [quest,  setQuest]  = useState('')
  const [text,   setText]   = useState('')
  const [reviews, setReviews] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/reviews').then(r => r.json()).then(setReviews).catch(() => {})
  }, [])

  const submit = async () => {
    if (!name || !quest || !text || !rating) return toast('⚠ Заполните все поля и поставьте оценку')
    const newReview = { name, quest, rating, text, date: new Date().toLocaleDateString('ru') }
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) })
    setReviews(prev => [newReview, ...prev])
    setName(''); setQuest(''); setText(''); setRating(0)
    toast('✓ Отзыв опубликован!')
  }

  const totalRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
  const displayRating = totalRating.toFixed(1)
  const totalCount = reviews.length

  const starCounts = [5, 4, 3, 2, 1].map(s => ({
    s,
    count: reviews.filter(r => r.rating === s).length,
    p: totalCount ? Math.round((reviews.filter(r => r.rating === s).length / totalCount) * 100) : 0,
  }))

  return (
    <>
      <div className="section-hero">
        <div className="eyebrow">Отзывы</div>
        <h1 className="h1">Они пережили это</h1>
      </div>
      <section className="section">

        <div className={styles.summary}>
          <div className={styles.scoreBox}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 80, fontWeight: 300, lineHeight: 1 }}>{displayRating}</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, margin: '12px 0' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(totalRating) ? 'rstar' : 'rstar off'} style={{ width: 16, height: 16 }} />
              ))}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: '.1em', marginBottom: 24 }}>
              {totalCount} {totalCount === 1 ? 'отзыв' : totalCount < 5 ? 'отзыва' : 'отзывов'}
            </div>
            {starCounts.map((b, i) => (
              <div key={b.s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', width: 12, textAlign: 'right' }}>{b.s}</span>
                <div className={styles.bar}>
                  <div className={styles.barFill} style={{ '--bar-w': b.p + '%', '--bar-delay': (i * 0.12) + 's' } as React.CSSProperties} />
                </div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', width: 32 }}>{b.p}%</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', padding: 28 }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 300, marginBottom: 16 }}>Оставить отзыв</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Имя</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value.replace(/\d/g, ''))} placeholder="Ваше имя" style={{ padding: '9px 12px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Квест</label>
                <select className="form-select" value={quest} onChange={e => setQuest(e.target.value)} style={{ padding: '9px 12px' }}>
                  <option value="">—</option>
                  {QUESTS.map(q => <option key={q.id}>{q.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 12 }}>
              <label className="form-label">Оценка</label>
              <div style={{ display: 'flex', gap: 8, fontSize: 22, cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map(v => (
                  <span key={v}
                    style={{ color: v <= (hover || rating) ? 'var(--red)' : 'var(--muted2)', transition: 'color .15s' }}
                    onMouseEnter={() => setHover(v)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(v)}
                  >★</span>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Отзыв</label>
              <textarea className="form-textarea" value={text} onChange={e => setText(e.target.value)}
                placeholder="Расскажите об опыте…" style={{ height: 80, resize: 'none' }} />
            </div>
            <button className="form-submit" onClick={submit}>Опубликовать</button>
          </div>
        </div>

        {/* Десктоп: сетка 3 колонки */}
        <div className={styles.grid}>
          {reviews.map((r, i) => (
            <div key={i} className={styles.rcard}>
              <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <span key={j} className={j >= r.rating ? 'rstar off' : 'rstar'} style={{ width: 16, height: 16 }} />
                ))}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--text)', lineHeight: 1.8, marginBottom: 20 }}>«{r.text}»</div>
              <div style={{ width: 28, height: 1, background: 'var(--red)', marginBottom: 12 }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '.1em', color: 'var(--white)' }}>{r.name}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--red)', marginTop: 4 }}>{r.quest}</div>
            </div>
          ))}
        </div>

        {/* Мобиле: свайп-карусель */}
        <ReviewsCarousel reviews={reviews} />

      </section>
      <Footer />
    </>
  )
}
