'use client'
import { useState } from 'react'
import { GALLERY } from '@/data'
import Footer from '@/components/layout/Footer'
import styles from './page.module.css'

const CATS = [['all','Все'],['rooms','Комнаты'],['actors','Актёры'],['players','Игроки']]

export default function GalleryPage() {
  const [cat, setCat] = useState('all')
  const [lb,  setLb]  = useState<number | null>(null)
  const items = cat === 'all' ? GALLERY : GALLERY.filter(g => g.cat === cat)

  return (
    <>
      <div className="section-hero">
        <div className="eyebrow">Галерея</div>
        <h1 className="h1">Загляни внутрь</h1>
      </div>
      <section className="section">
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:32 }}>
          {CATS.map(([k,l]) => (
            <button key={k} className={`btn ${cat===k?'btn-primary':'btn-outline'}`}
              style={{ padding:'9px 20px', fontSize:13 }} onClick={() => setCat(k)}>{l}</button>
          ))}
        </div>
        <div className={styles.masonry}>
          {items.map((g, i) => (
            <div key={i} className={styles.item} onClick={() => setLb(i)}>
              {g.img ? (
                <img src={g.img} alt={g.label} className={styles.photo} style={{ height: g.h }} />
              ) : (
                <div className={styles.fallback} style={{ height: g.h, background: g.bg }} />
              )}
              <div className={styles.overlay}>
                <span className={styles.label}>{g.label}</span>
                <span className={styles.zoom}>+</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lb !== null && (
        <div className={styles.lb} onClick={() => setLb(null)}>
          <button className={styles.lbClose} onClick={() => setLb(null)}>✕</button>
          <button className={styles.lbPrev} onClick={e => { e.stopPropagation(); setLb((lb - 1 + items.length) % items.length) }}>‹</button>
          <div className={styles.lbContent} onClick={e => e.stopPropagation()}>
            {items[lb].img ? (
              <img src={items[lb].img} alt={items[lb].label} className={styles.lbImg} />
            ) : (
              <div className={styles.lbImg} style={{ background: items[lb].bg }} />
            )}
          </div>
          <button className={styles.lbNext} onClick={e => { e.stopPropagation(); setLb((lb + 1) % items.length) }}>›</button>
          <div className={styles.lbCap}>{items[lb].label}</div>
        </div>
      )}
      <Footer />
    </>
  )
}
