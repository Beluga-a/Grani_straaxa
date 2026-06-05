'use client'
import Image from 'next/image'
import { Quest } from '@/lib/quests'
import Icon from '@/components/ui/Icon'
import styles from './QuestCard.module.css'

interface Props { quest: Quest; onClick?: (q: Quest) => void }

export default function QuestCard({ quest: q, onClick }: Props) {
  return (
    <div className={styles.card} onClick={() => onClick?.(q)} data-hover>
      {/* Фото квеста */}
      <div className={styles.imgWrap}>
        {q.img ? (
          <Image src={q.img} alt={q.name} fill className={styles.photo} sizes="(max-width:900px) 100vw, 33vw" />
        ) : (
          <div className={styles.imgFallback} style={{ background: q.bg }}>
            <Icon name="skull" size={52} style={{ opacity: .1 }} />
          </div>
        )}
        <div className={styles.imgOverlay} />
        <span className={styles.badge}>{q.badge}</span>
        <span className={styles.rating}><Icon name="star" size={11}/> {q.rating}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.age}>{q.age}</span>
          <span className={styles.time}><Icon name="clock" size={12}/> {q.time}</span>
        </div>
        <div className={styles.name}>{q.name}</div>
        <div className={styles.fear}>
          {[...Array(5)].map((_,i) => (
            <span key={i} className={`${styles.dot}${i >= q.fear ? ' ' + styles.dotOff : ''}`} />
          ))}
        </div>
        <div className={styles.meta}>
          <span><Icon name="users" size={12}/> {q.players}</span>
          <span><Icon name="target" size={12}/> Сложн. {q.diff}/5</span>
        </div>
        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>
              {q.basePrice ? `от ${q.basePrice.toLocaleString('ru-RU')} ₽` : q.price}
            </span>
            {q.basePrice && q.baseUpTo && (
              <span className={styles.priceSub}>
                {q.playersMin}–{q.baseUpTo} чел. · +{q.extraPrice?.toLocaleString('ru-RU')} ₽/чел.
              </span>
            )}
          </div>
          <span className={styles.more}>Подробнее →</span>
        </div>
      </div>
    </div>
  )
}
