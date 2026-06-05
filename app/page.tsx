'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { REVIEWS, ADVANTAGES, GALLERY } from '@/data'
import { usePublicQuests, Quest } from '@/lib/quests'
import QuestCard from '@/components/ui/QuestCard'
import QuestModal from '@/components/ui/QuestModal'
import Icon, { type IconName } from '@/components/ui/Icon'
import Footer from '@/components/layout/Footer'
import styles from './page.module.css'

// ── BLOOD DRIPS ──
function BloodDrips() {
  const containerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = containerRef.current; if (!el) return

    // w = stem width multiplier, secondary = spawn a thin secondary drip
    const configs = [
      { left:'5%',  maxH:105, dur:3800, delay:0,    w:2 },
      { left:'11%', maxH:148, dur:4600, delay:1700, w:3 },
      { left:'18%', maxH:72,  dur:3200, delay:3800, w:2 },
      { left:'25%', maxH:128, dur:4200, delay:800,  w:2 },
      { left:'32%', maxH:88,  dur:3600, delay:3000, w:3 },
      { left:'40%', maxH:115, dur:4800, delay:4500, w:2 },
      { left:'49%', maxH:62,  dur:3000, delay:550,  w:2 },
      { left:'57%', maxH:155, dur:5100, delay:2300, w:3 },
      { left:'65%', maxH:93,  dur:3900, delay:1200, w:2 },
      { left:'73%', maxH:78,  dur:3400, delay:3400, w:2 },
      { left:'81%', maxH:135, dur:4500, delay:150,  w:3 },
      { left:'89%', maxH:58,  dur:3100, delay:2600, w:2 },
    ]

    type Cfg = typeof configs[0] & {
      el: HTMLDivElement; stem: HTMLDivElement; drop: HTMLDivElement; start: number
    }

    const drips: Cfg[] = configs.map(cfg => {
      const d = document.createElement('div')
      d.style.cssText = `position:absolute;top:0;left:${cfg.left};width:${cfg.w * 3}px;opacity:0;display:flex;flex-direction:column;align-items:center;pointer-events:none;overflow:visible`

      const stem = document.createElement('div')
      stem.style.cssText = `width:${cfg.w}px;height:0;border-radius:0 0 ${cfg.w}px ${cfg.w}px;background:linear-gradient(to bottom,rgba(200,0,10,0) 0%,rgba(170,0,8,.65) 25%,rgba(200,0,10,.92) 100%)`

      const drop = document.createElement('div')
      const dw = cfg.w * 4.5
      const dh = cfg.w * 5.5
      drop.style.cssText = `position:absolute;left:50%;transform:translateX(-50%) scale(0);width:${dw}px;height:${dh}px;background:radial-gradient(ellipse at 40% 35%,rgba(255,60,60,.35) 0%,rgba(200,0,10,1) 55%,rgba(120,0,5,1) 100%);border-radius:50% 50% 58% 58%/38% 38% 62% 62%;box-shadow:0 0 5px rgba(200,0,10,.8),inset 0 -2px 3px rgba(0,0,0,.4);opacity:0`

      d.appendChild(stem); d.appendChild(drop); el.appendChild(d)
      return { ...cfg, el: d, stem, drop, start: performance.now() + cfg.delay }
    })

    let raf: number
    const easeInOutQuad = (x: number) => x < .5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2

    const tick = (now: number) => {
      drips.forEach(cfg => {
        const elapsed = now - cfg.start
        if (elapsed < 0) { cfg.el.style.opacity = '0'; return }
        const t = elapsed / cfg.dur

        if (t >= 1) {
          cfg.start = now + Math.random() * 900 + 400
          cfg.el.style.opacity = '0'
          cfg.stem.style.height = '0px'
          cfg.drop.style.opacity = '0'
          cfg.drop.style.transform = 'translateX(-50%) scale(0)'
          return
        }

        // Phase 1 (0 → 0.50): stem grows, drop bulges at tip
        if (t < 0.50) {
          const p = t / 0.50
          const h = cfg.maxH * easeInOutQuad(p)
          const dropGrow = Math.max(0, (p - 0.35) / 0.65)
          cfg.el.style.opacity = String(Math.min(1, p * 7))
          cfg.stem.style.height = h + 'px'
          cfg.drop.style.top = (h - 2) + 'px'
          cfg.drop.style.opacity = String(dropGrow)
          cfg.drop.style.transform = `translateX(-50%) scaleX(${0.4 + dropGrow * 0.6}) scaleY(${0.3 + dropGrow * 0.85})`
        }
        // Phase 2 (0.50 → 0.62): drop stretches downward under gravity, stem holds
        else if (t < 0.62) {
          const p = (t - 0.50) / 0.12
          const stretch = 1 + p * 0.55
          cfg.el.style.opacity = '1'
          cfg.stem.style.height = cfg.maxH + 'px'
          cfg.drop.style.top = (cfg.maxH - 2 + p * 5) + 'px'
          cfg.drop.style.opacity = '1'
          cfg.drop.style.transform = `translateX(-50%) scaleX(${1 - p * 0.18}) scaleY(${stretch})`
        }
        // Phase 3 (0.62 → 0.84): drop detaches, falls with cubic gravity
        else if (t < 0.84) {
          const p = (t - 0.62) / 0.22
          const fall = p * p * p * 140  // cubic acceleration — looks like real gravity
          cfg.el.style.opacity = '1'
          cfg.stem.style.height = cfg.maxH + 'px'
          cfg.drop.style.top = (cfg.maxH + fall) + 'px'
          // drop flattens slightly as it accelerates (air resistance shape)
          cfg.drop.style.transform = `translateX(-50%) scaleX(${1 + p * 0.25}) scaleY(${1 - p * 0.15})`
          cfg.drop.style.opacity = String(Math.max(0, 1 - Math.pow(p, 2.5) * 0.6))
        }
        // Phase 4 (0.84 → 1.0): stem snaps back up quickly, no fade — just instant retract
        else {
          const p = (t - 0.84) / 0.16
          const retract = Math.max(0, 1 - p * p * 3.5) // fast snap
          cfg.el.style.opacity = String(Math.max(0, retract))
          cfg.stem.style.height = (cfg.maxH * Math.max(0, 1 - p * 2.8)) + 'px'
          cfg.drop.style.opacity = '0'
        }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); el.innerHTML = '' }
  }, [])
  return <div ref={containerRef} className={styles.drips} />
}

// ── REVIEWS CAROUSEL ──
function ReviewsCarousel() {
  const [idx, setIdx]     = useState(0)
  const [typed, setTyped] = useState('')
  const [showAuth, setShowAuth] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let charIdx = 0
    const r = REVIEWS[idx]
    const full = `«${r.text}»`
    setTyped(''); setShowAuth(false)

    const type = () => {
      if (charIdx <= full.length) { setTyped(full.slice(0, charIdx)); charIdx++; timerRef.current = setTimeout(type, 18 + Math.random() * 8) }
      else { setShowAuth(true); timerRef.current = setTimeout(() => setIdx(i => (i + 1) % REVIEWS.length), 5000) }
    }
    timerRef.current = setTimeout(type, 120)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [idx])

  const goTo = (i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIdx((i + REVIEWS.length) % REVIEWS.length)
  }

  const r = REVIEWS[idx]
  return (
    <div className={styles.carousel}>
      <div className={styles.carouselLine} />
      <div className={styles.carouselStars}>
        {[...Array(5)].map((_,i) => <span key={i} className={`rstar${i >= r.rating ? ' off' : ''}`} />)}
      </div>
      <div className={styles.carouselText}>
        <span>{typed}</span><span className={styles.cursor}>|</span>
      </div>
      <div className={styles.carouselRule} />
      <div className={styles.carouselAuthor} style={{ opacity: showAuth ? 1 : 0 }}>{r.name}</div>
      <div className={styles.carouselQuest}  style={{ opacity: showAuth ? 1 : 0 }}>{r.quest}</div>
      <div className={styles.carouselDots}>
        <button className={styles.carouselArrow} onClick={() => goTo(idx - 1)}>‹</button>
        {REVIEWS.map((_,i) => (
          <button key={i} className={`${styles.dot} ${i === idx ? styles.dotActive : ''}`}
            onClick={() => goTo(i)} />
        ))}
        <button className={styles.carouselArrow} onClick={() => goTo(idx + 1)}>›</button>
      </div>
    </div>
  )
}

export default function Home() {
  const publicQuests = usePublicQuests()
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [liveCount, setLiveCount] = useState(23)
  const [isMobile, setIsMobile] = useState(false)
  const questTouchX = useRef<number | null>(null)
  const [questIdx, setQuestIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setLiveCount(Math.floor(Math.random() * 20 + 16)), 5000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const goQuest = (i: number) => setQuestIdx(Math.max(0, Math.min(i, publicQuests.length - 1)))

  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1)
  const reviewCount = REVIEWS.length

  return (
    <>
      <QuestModal quest={selectedQuest} onClose={() => setSelectedQuest(null)} />

      {/* ── HERO ── */}
      <section className={styles.hero} style={{display:'flex',alignItems:'flex-end',justifyContent:'flex-start',padding:'40px 56px 80px'}}>
        <div className={styles.heroBg} />
        <div className={styles.heroVignette} />
        <div className={styles.heroGrid} />
        <div className={styles.noise} />
        <BloodDrips />
        <div className={styles.heroNum}>01</div>
        <div className={styles.heroLine} />
        <div className={styles.heroContent}>
          <div className={`${styles.heroTag} flicker`}><Icon name="warn" size={12} /> Horror Quest World · Est. 2026 · 18+</div>
          <h1 className={styles.heroTitle}>
            <span className={styles.wordMain} data-text="Испытай">Испытай</span>
            <span className={styles.wordBlood}>настоящий</span>
            <span className={styles.wordImpact}>Страх</span>
          </h1>
          <div className={styles.heroCrack} />
          <div className={styles.heroRating}>
            <div className={styles.heroStars}>{[...Array(5)].map((_,i) => <span key={i} className="rstar" />)}</div>
            <span className={styles.heroRatingText}>{avgRating} / 5 · {reviewCount} отзывов</span>
          </div>
          <div className={styles.heroBadges}>
            <span className={`${styles.heroBadge} ${styles.heroBadgeHot}`}><Icon name="skull" size={12} /> Живые актёры</span>
            <span className={styles.heroBadge}><Icon name="clock" size={12} /> 60–90 мин</span>
            <span className={styles.heroBadge}><Icon name="users" size={12} /> 2–10 игроков</span>
            <span className={`${styles.heroBadge} ${styles.heroBadgeHot}`}><Icon name="trophy" size={12} /> Лучший квест 2026</span>
          </div>
          <p className={styles.heroDesc}>Премиальные хоррор-квесты с живыми актёрами, кинематографическими декорациями и авторскими сценариями. Только для смельчаков.</p>
          <div className={styles.heroBtns}>
            <Link href="/quests"  className="btn btn-primary">Выбрать квест</Link>
            <Link href="/booking" className="btn btn-outline">Забронировать</Link>
          </div>
          <div className={styles.heroLive}>
            <div className="live-dot" /><span>{liveCount} человек на сайте сейчас</span>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <div className={styles.heroScrollLine} />
          <div className={styles.heroScrollLabel}>Скролл</div>
        </div>
        <div className={styles.heroVertLine} />
      </section>

      {/* ── TICKER ── */}
      <div className={styles.tickerBar}>
        <div className={styles.tickerInner}>
          {[...Array(2)].flatMap(() => [
            { num: '50 000+', label: 'игроков' }, { num: '7 лет', label: 'на рынке' },
            { num: '12', label: 'квестов' }, { num: '4.9 / 5', label: 'рейтинг' },
            { num: '18+', label: 'только смельчаки' }, { num: '100%', label: 'адреналин' },
          ]).map((item, i) => (
            <span key={i} className={styles.tickerItem}>
              <span className={styles.tickerNum}>{item.num}</span>
              <span className={styles.tickerSep}>·</span>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── QUESTS ── */}
      <section className="section" style={{paddingTop:72}}>
        <div style={{display:'flex',alignItems:'center',gap:24,marginBottom:48}}>
          <div style={{flex:1,height:1,background:'var(--border)'}}/>
          <div className="eyebrow" style={{marginBottom:0}}>Популярные квесты</div>
          <div style={{flex:1,height:1,background:'var(--border)'}}/>
        </div>
        <h2 className="h2" style={{ marginBottom: 48, textAlign:'center' }}>Выбери свой кошмар</h2>

        {isMobile ? (
          /* Карусель на мобиле */
          <div>
            <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.1em',textAlign:'right',marginBottom:10}}>
              {questIdx + 1} / {publicQuests.length}
            </div>
            <div style={{overflow:'hidden',width:'100%'}}>
              <div
                style={{display:'flex',transform:`translateX(-${questIdx*100}%)`,transition:'transform .35s cubic-bezier(.4,0,.2,1)',touchAction:'pan-y'}}
                onTouchStart={e=>{questTouchX.current=e.touches[0].clientX}}
                onTouchEnd={e=>{
                  if(questTouchX.current===null)return
                  const d=questTouchX.current-e.changedTouches[0].clientX
                  if(d>40)goQuest(questIdx+1)
                  if(d<-40)goQuest(questIdx-1)
                  questTouchX.current=null
                }}
              >
                {publicQuests.map(q=>(
                  <div key={q.id} style={{flex:'0 0 100%',minWidth:0}}>
                    <QuestCard quest={q} onClick={setSelectedQuest}/>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:16,marginTop:20}}>
              <button onClick={()=>goQuest(questIdx-1)} disabled={questIdx===0}
                style={{width:44,height:44,background:'var(--panel)',border:'1px solid var(--border)',color:'var(--white)',fontSize:24,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:questIdx===0?.3:1}}>‹</button>
              <div style={{display:'flex',gap:8}}>
                {publicQuests.map((_,i)=>(
                  <button key={i} onClick={()=>goQuest(i)}
                    style={{width:i===questIdx?20:7,height:7,borderRadius:i===questIdx?4:'50%',background:i===questIdx?'var(--red)':'var(--muted2)',border:'none',padding:0,cursor:'pointer',transition:'all .25s'}}/>
                ))}
              </div>
              <button onClick={()=>goQuest(questIdx+1)} disabled={questIdx===publicQuests.length-1}
                style={{width:44,height:44,background:'var(--panel)',border:'1px solid var(--border)',color:'var(--white)',fontSize:24,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',opacity:questIdx===publicQuests.length-1?.3:1}}>›</button>
            </div>
          </div>
        ) : (
          /* Сетка на десктопе */
          <div className={styles.questsGrid}>
            {publicQuests.map(q => <QuestCard key={q.id} quest={q} onClick={setSelectedQuest} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/quests" className="btn btn-outline">Смотреть все квесты →</Link>
        </div>
      </section>

      {/* ── ADVANTAGES ── */}
      <div style={{ background: 'var(--off-black)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', position:'relative', overflow:'hidden' }}>
        <div style={{position:'absolute',right:-40,top:'50%',transform:'translateY(-50%)',fontFamily:'var(--serif)',fontSize:'clamp(180px,22vw,320px)',fontWeight:600,color:'rgba(200,0,10,.03)',lineHeight:1,userSelect:'none',letterSpacing:'-.04em',pointerEvents:'none'}}>WHY</div>
        <section className="section" style={{position:'relative',zIndex:1}}>
          <div className="eyebrow">Преимущества</div>
          <h2 className="h2" style={{ marginBottom: 48 }}>Почему мы</h2>
          <div className={styles.advGrid}>
            {ADVANTAGES.map(a => (
              <div key={a.title} className={styles.advItem} data-hover>
                <span className={styles.advIcon}><Icon name={a.icon as IconName} size={28} /></span>
                <div className={styles.advTitle}>{a.title}</div>
                <div className={styles.advText}>{a.text}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── REVIEWS ── */}

      <section className="section">
        <div className="eyebrow">Отзывы</div>
        <h2 className="h2" style={{ marginBottom: 48 }}>Они пережили это</h2>
        <ReviewsCarousel />
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/reviews" className="btn btn-outline">Все отзывы →</Link>
        </div>
      </section>

      {/* ── FEAR INDEX BAND ── */}
      <div style={{
        background:'var(--off-black)',
        borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',
        padding:'clamp(40px,6vw,80px) clamp(24px,5vw,56px)',
        display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'clamp(32px,5vw,64px)',alignItems:'center',
        position:'relative',overflow:'hidden',
      }}>
        <div style={{position:'absolute',inset:0,
          background:'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(200,0,10,.05) 0%, transparent 70%)',
          pointerEvents:'none'}}/>
        <div style={{position:'relative'}}>
          <div className="eyebrow">Индекс страха</div>
          <div style={{fontFamily:'var(--serif)',fontSize:'clamp(72px,9vw,128px)',fontWeight:300,lineHeight:1,color:'var(--red)',letterSpacing:'-.03em',marginBottom:12}}>
            9.1
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.2em',color:'var(--muted)',marginBottom:24}}>
            ПО ШКАЛЕ МИРОВЫХ ХОРРОР-РЕЙТИНГОВ
          </div>
          <div style={{height:3,background:'var(--border)',position:'relative',maxWidth:320,marginBottom:24,overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,height:'100%',width:'91%',
              background:'linear-gradient(90deg, var(--red), rgba(200,0,10,.4))',
              animation:'barReveal .9s cubic-bezier(.16,1,.3,1) .2s both'}}/>
          </div>
          <Link href="/feartest" className="btn btn-outline" style={{fontSize:12}}>Пройти тест на страх →</Link>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,background:'var(--border)'}}>
          {[
            {n:'94%',l:'почувствовали настоящий страх'},
            {n:'3×',l:'выше адреналин, чем в кино'},
            {n:'82%',l:'возвращаются снова'},
            {n:'18+',l:'только для смельчаков'},
          ].map(s=>(
            <div key={s.l} style={{background:'var(--black)',padding:'28px 24px',textAlign:'center'}}>
              <div style={{fontFamily:'var(--serif)',fontSize:'clamp(28px,3.5vw,44px)',fontWeight:300,color:'var(--red)',lineHeight:1,marginBottom:8}}>{s.n}</div>
              <div style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.12em',color:'var(--muted)',lineHeight:1.5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="stats-row">
        {[{n:'7+',l:'лет работы'},{n:'12',l:'квестов'},{n:'50К+',l:'игроков'},{n:'4.9',l:'средний рейтинг'}].map(s => (
          <div key={s.l} className="stat-cell">
            <div className="stat-num">{s.n}</div>
            <div className="stat-label">{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── CTA ── */}
      <div className="cta-band">
        <h2 className="cta-band-title">Осмелишься<em style={{ fontStyle:'italic', color:'rgba(255,255,255,.4)' }}>?</em></h2>
        <p className="cta-band-sub">Забронируй место прямо сейчас</p>
        <div className="cta-band-btns">
          <Link href="/booking" className="btn btn-primary">Забронировать квест</Link>
          <Link href="/quests"  className="btn btn-outline">Посмотреть квесты</Link>
        </div>
      </div>

      <Footer />
    </>
  )
}
