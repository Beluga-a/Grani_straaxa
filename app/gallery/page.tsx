'use client'
import { useState, useEffect } from 'react'
import Footer from '@/components/layout/Footer'
import styles from './page.module.css'

const CATS = [['all','Все'],['rooms','Комнаты'],['actors','Актёры'],['players','Игроки']]

type GalleryItem = { id: number; cat: string; label: string; img: string; h: number }

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [cat, setCat] = useState('all')
  const [lb, setLb] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/gallery').then(r => r.json()).then(setItems).catch(() => {})
  }, [])

  const filtered = cat === 'all' ? items : items.filter(g => g.cat === cat)

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
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:12 }}>
            Загрузка…
          </div>
        ) : (
          <div className={styles.masonry}>
            {filtered.map((g, i) => (
              <div key={g.id} className={styles.item} onClick={() => setLb(i)}>
                <img src={g.img} alt={g.label} className={styles.photo} style={{ height: g.h }} />
                <div className={styles.overlay}>
                  <span className={styles.label}>{g.label}</span>
                  <span className={styles.zoom}>+</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {lb !== null && (
        <div className={styles.lb} onClick={() => setLb(null)}>
          <button className={styles.lbClose} onClick={() => setLb(null)}>✕</button>
          <button className={styles.lbPrev} onClick={e => { e.stopPropagation(); setLb((lb - 1 + filtered.length) % filtered.length) }}>‹</button>
          <div className={styles.lbContent} onClick={e => e.stopPropagation()}>
            <img src={filtered[lb].img} alt={filtered[lb].label} className={styles.lbImg} />
          </div>
          <button className={styles.lbNext} onClick={e => { e.stopPropagation(); setLb((lb + 1) % filtered.length) }}>›</button>
          <div className={styles.lbCap}>{filtered[lb].label}</div>
        </div>
      )}
      <Footer />
    </>
  )
}
