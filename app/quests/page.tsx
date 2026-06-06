'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useQuests, Quest } from '@/lib/quests'
import QuestCard from '@/components/ui/QuestCard'
import QuestModal from '@/components/ui/QuestModal'
import Footer from '@/components/layout/Footer'

const CATS = [['all','Все'],['extreme','Экстрим'],['mystery','Загадки'],['classic','Классика']]

// ── Мобильная карусель ────────────────────────────────────────────────────────
function QuestsCarousel({ quests, onSelect }: { quests: Quest[]; onSelect: (q: Quest) => void }) {
  const [idx, setIdx] = useState(0)
  const touchX = useRef<number | null>(null)

  useEffect(() => { setIdx(0) }, [quests])

  const goTo = useCallback((i: number) => {
    setIdx(Math.max(0, Math.min(i, quests.length - 1)))
  }, [quests.length])

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (diff > 40)  goTo(idx + 1)
    if (diff < -40) goTo(idx - 1)
    touchX.current = null
  }

  if (!quests.length) return (
    <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:12 }}>
      Квестов не найдено
    </div>
  )

  return (
    <div>
      {/* Счётчик */}
      <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)', letterSpacing:'.1em', textAlign:'right', marginBottom:10 }}>
        {idx + 1} / {quests.length}
      </div>

      {/* Viewport */}
      <div style={{ overflow:'hidden', width:'100%' }}>
        <div
          style={{
            display: 'flex',
            transform: `translateX(-${idx * 100}%)`,
            transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
            touchAction: 'pan-y',
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {quests.map(q => (
            <div key={q.id} style={{ flex: '0 0 100%', minWidth: 0 }}>
              <QuestCard quest={q} onClick={onSelect} />
            </div>
          ))}
        </div>
      </div>

      {/* Навигация */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginTop:20 }}>
        <button
          onClick={() => goTo(idx - 1)}
          disabled={idx === 0}
          style={{
            width:44, height:44, background:'var(--panel)', border:'1px solid var(--border)',
            color:'var(--white)', fontSize:24, cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center', opacity: idx === 0 ? .3 : 1,
            transition:'border-color .2s',
          }}
        >‹</button>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', maxWidth:180 }}>
          {quests.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === idx ? 20 : 7,
                height: 7,
                borderRadius: i === idx ? 4 : '50%',
                background: i === idx ? 'var(--red)' : 'var(--muted2)',
                border: 'none', padding: 0, cursor: 'pointer',
                transition: 'all .25s',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(idx + 1)}
          disabled={idx === quests.length - 1}
          style={{
            width:44, height:44, background:'var(--panel)', border:'1px solid var(--border)',
            color:'var(--white)', fontSize:24, cursor:'pointer', display:'flex',
            alignItems:'center', justifyContent:'center',
            opacity: idx === quests.length - 1 ? .3 : 1,
            transition:'border-color .2s',
          }}
        >›</button>
      </div>
    </div>
  )
}

// ── Страница ──────────────────────────────────────────────────────────────────
export default function QuestsPage() {
  const { quests: allQuests, loading } = useQuests()
  const quests = allQuests.filter(q => q.active)
  const [cat, setCat]           = useState('all')
  const [selected, setSelected] = useState<Quest | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const filtered = cat === 'all' ? quests : quests.filter(q => q.cat === cat)

  return (
    <>
      <QuestModal quest={selected} onClose={() => setSelected(null)} />

      <div className="section-hero">
        <div className="eyebrow">Каталог</div>
        <h1 className="h1">Квесты</h1>
        <p style={{ color:'var(--text-soft)', marginTop:12, fontSize:14 }}>{loading ? '...' : `${quests.length} квестов`}</p>
      </div>

      <section className="section">
        {/* Фильтры */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:40 }}>
          {CATS.map(([k,l]) => (
            <button key={k} className={`btn ${cat===k?'btn-primary':'btn-outline'}`}
              style={{ padding:'9px 20px', fontSize:13 }} onClick={() => setCat(k)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:12, letterSpacing:'.12em' }}>
            Загрузка...
          </div>
        ) : isMobile ? (
          <QuestsCarousel quests={filtered} onSelect={setSelected} />
        ) : (
          filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:12, letterSpacing:'.12em' }}>
              Квестов не найдено
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border)' }}>
              {filtered.map(q => <QuestCard key={q.id} quest={q} onClick={setSelected} />)}
            </div>
          )
        )}
      </section>

      <div className="cta-band">
        <h2 className="cta-band-title">Готов <em style={{ fontStyle:'italic', color:'rgba(255,255,255,.4)' }}>пойти?</em></h2>
        <p className="cta-band-sub">Бронируй сейчас</p>
        <Link href="/booking" className="btn btn-primary">Забронировать</Link>
      </div>
      <Footer />
    </>
  )
}
