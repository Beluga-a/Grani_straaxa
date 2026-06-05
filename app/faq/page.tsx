
'use client'
import { useState } from 'react'
import { FAQ_DATA } from '@/data'
import Footer from '@/components/layout/Footer'
import styles from './page.module.css'
const CATS=[['all','Все'],['general','Общие'],['booking','Бронирование'],['safety','Безопасность'],['groups','Группы']]
export default function FAQPage() {
  const [cat,setCat]=useState('all');const [open,setOpen]=useState<number|null>(null)
  const items=cat==='all'?FAQ_DATA:FAQ_DATA.filter(f=>f.cat===cat)
  return (
    <>
      <div className="section-hero"><div className="eyebrow">FAQ</div><h1 className="h1">Частые вопросы</h1></div>
      <section className="section">
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:40}}>
          {CATS.map(([k,l])=><button key={k} className={`btn ${cat===k?"btn-primary":"btn-outline"}`} style={{padding:"9px 20px",fontSize:13}} onClick={()=>{setCat(k);setOpen(null)}}>{l}</button>)}
        </div>
        <div style={{maxWidth:740}}>
          {items.map((f,i)=>(
            <div key={i} className={`${styles.item} ${open===i?styles.itemOpen:''}`}>
              <button className={styles.q} onClick={()=>setOpen(open===i?null:i)}>
                <span>{f.q}</span>
                <span className={styles.plus} style={{transform:open===i?"rotate(45deg)":"none"}}>+</span>
              </button>
              <div className={styles.body}>
                <div className={styles.answer}>{f.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer/>
    </>
  )
}
