'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Quest } from '@/lib/quests'
import Icon from '@/components/ui/Icon'

type Tab = 'description' | 'features' | 'contacts' | 'reviews'

interface Props {
  quest: Quest | null
  onClose: () => void
}

const FEAR_LABELS: Record<number, string> = {
  1: 'минимальный', 2: 'лёгкий', 3: 'средний', 4: 'высокий', 5: 'максимум',
}

function categoryLabel(cat: string) {
  if (cat === 'extreme') return 'Экстрим'
  if (cat === 'mystery') return 'Мистика'
  return 'Классика'
}

export default function QuestModal({ quest, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('description')

  useEffect(() => {
    if (!quest) return
    setActiveTab('description')
    document.body.classList.add('modal-open')
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [quest, onClose])

  if (!quest) return null

  const fearPercent = ((quest.fear - 1) / 4) * 100
  const displayPrice = quest.basePrice ?? quest.priceNum

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">✕</button>

        {/* ── HERO ── */}
        <div className="modal-hero">
          {quest.img ? (
            <img src={quest.img} alt={quest.name} className="modal-hero-photo" />
          ) : (
            <div className="modal-hero-bg" style={{ background: quest.bg }} />
          )}
          <div className="modal-hero-overlay" />
          <div className="modal-hero-content">
            <div className="modal-cat-badge">
              {categoryLabel(quest.cat)} · {quest.badge}
            </div>
            <h2 className="modal-title">{quest.name}</h2>
            <div className="modal-brand">
              Бренд: <span>ГРАНИ СТРАХА</span>
            </div>
          </div>
        </div>

        {/* ── META BAR ── */}
        <div className="modal-meta">
          <div className="modal-meta-item">
            <div className="modal-meta-label">Игроков</div>
            <div className="modal-meta-val">{quest.players}</div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Время</div>
            <div className="modal-meta-val">{quest.time}</div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Цена</div>
            <div className="modal-meta-val">
              {displayPrice.toLocaleString('ru-RU')}<em> ₽</em>
            </div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Сложность</div>
            <div className="modal-meta-val">{quest.diff}<em>/5</em></div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Страх</div>
            <div className="modal-meta-val">{quest.fear}<em>/5</em></div>
          </div>
          <div className="modal-meta-item">
            <div className="modal-meta-label">Возраст</div>
            <div className="modal-meta-val">{quest.age}</div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="modal-tabs">
          {([['description','Описание'],['features','Особенности'],['contacts','Контакты'],['reviews','Отзывы']] as [Tab,string][]).map(([id,label])=>(
            <button key={id} className={`modal-tab${activeTab===id?' active':''}`} onClick={()=>setActiveTab(id)}>{label}</button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <div className="modal-body">
          <div className="modal-main">

            {activeTab === 'description' && <>
              <div className="modal-section">
                <h3>Описание</h3>
                <div className="modal-text"><p>{quest.full ?? quest.desc}</p></div>
              </div>
              {quest.atmosphere && quest.atmosphere.length > 0 && (
                <div className="modal-section">
                  <h3>Атмосфера</h3>
                  <ul className="modal-ulist">{quest.atmosphere.map((a,i)=><li key={i}>{a}</li>)}</ul>
                </div>
              )}
              {quest.included && quest.included.length > 0 && (
                <div className="modal-section">
                  <h3>В стоимость входит</h3>
                  <ul className="modal-ulist">{quest.included.map((item,i)=><li key={i}>{item}</li>)}</ul>
                </div>
              )}
            </>}

            {activeTab === 'features' && (
              <div className="modal-section">
                <h3>Особенности</h3>
                <div className="modal-tags">
                  {quest.tags.map((t,i)=><span key={i} className="modal-tag">{t}</span>)}
                </div>
              </div>
            )}

            {activeTab === 'contacts' && (
              <div className="modal-section">
                <h3>Как нас найти</h3>
                <div className="modal-text" style={{lineHeight:2}}>
                  <p><Icon name="pin" size={13}/> ул. Бабушкина, 66, 2-й этаж</p>
                  <p><Icon name="phone" size={13}/> <a href="tel:+79994203141" style={{color:'var(--red)'}}>8 999 420 31 41</a></p>
                  <p><Icon name="mail" size={13}/> <a href="mailto:granistraha526@gmail.com" style={{color:'var(--red)'}}>granistraha526@gmail.com</a></p>
                  <p><Icon name="clock" size={13}/> Пн–Вс 10:00–23:00</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="modal-section">
                <h3>Оценки и отзывы</h3>
                <div style={{textAlign:'center',padding:'24px 0'}}>
                  <div style={{fontFamily:'var(--serif)',fontSize:64,fontWeight:300,lineHeight:1}}>{quest.rating}</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',marginTop:8,letterSpacing:'.1em'}}>
                    {quest.reviews ? `${quest.reviews} отзывов от игроков` : 'Нет отзывов'}
                  </div>
                </div>
                <p style={{color:'var(--text-soft)',fontSize:13,textAlign:'center'}}>
                  Подробные отзывы на{' '}
                  <Link href="/reviews" style={{color:'var(--red)'}} onClick={onClose}>странице отзывов</Link>
                </p>
              </div>
            )}

          </div>

          {/* ── SIDEBAR ── */}
          <aside className="modal-aside">
            <div className="aside-block">
              <div className="aside-block-label">Средняя оценка</div>
              <div className="aside-rating">
                <span className="aside-rating-num">{quest.rating}</span>
                <span className="aside-rating-max">/ 5</span>
              </div>
              {quest.reviews && (
                <div className="aside-rating-sub">
                  <strong>{quest.reviews}</strong> отзывов от игроков
                </div>
              )}
            </div>

            <div className="aside-block">
              <div className="aside-block-label">Уровень страха</div>
              <div className="aside-fear-scale">
                <div className="aside-fear-marker" style={{ left: `${fearPercent}%` }} />
              </div>
              <div className="aside-fear-label">
                <em>{quest.fear}/5</em> — {FEAR_LABELS[quest.fear] ?? ''}
              </div>
            </div>

            {quest.scheduleText && (
              <div className="aside-block">
                <div className="aside-block-label">Расписание</div>
                <div className="aside-schedule">{quest.scheduleText}</div>
              </div>
            )}

            <div className="aside-block">
              <div className="aside-block-label">Контакты</div>
              <div className="aside-schedule">
                <Icon name="pin" size={12}/> ул. Бабушкина, 66<br />
                <Icon name="phone" size={12}/> 8 999 420 31 41<br />
                <Icon name="mail" size={12}/> granistraha526@gmail.com<br />
                <Icon name="clock" size={12}/> Пн–Вс 10:00–23:00
              </div>
            </div>
          </aside>
        </div>

        {/* ── CTA ── */}
        <div className="modal-cta">
          <div className="modal-price">
            <span className="modal-price-val">
              {displayPrice.toLocaleString('ru-RU')} ₽
              {quest.baseUpTo && <em> · до {quest.baseUpTo} чел</em>}
            </span>
            {quest.extraPrice && (
              <span className="modal-price-label">
                + {quest.extraPrice.toLocaleString('ru-RU')} ₽ за каждого следующего
              </span>
            )}
          </div>
          <div className="modal-cta-btns">
            <a
              className="btn btn-outline"
              href={`mailto:granistraha526@gmail.com?subject=Бронь: ${encodeURIComponent(quest.name)}`}
            >
              Написать
            </a>
            <Link className="btn btn-primary" href={`/booking?quest=${encodeURIComponent(quest.name)}`}>
              Забронировать
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
