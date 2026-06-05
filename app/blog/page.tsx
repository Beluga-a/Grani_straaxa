
'use client'
import { useState } from 'react'
import { BLOG_DATA } from '@/data'
import Footer from '@/components/layout/Footer'
import Icon, { type IconName } from '@/components/ui/Icon'
import styles from './page.module.css'
export default function BlogPage() {
  const [post,setPost]=useState<typeof BLOG_DATA[0]|null>(null)
  if(post) return (
    <>
      <section className="section" style={{maxWidth:800,margin:"80px auto 0"}}>
        <div style={{textAlign:"center",marginBottom:28,color:"var(--red)"}}><Icon name={post.icon as IconName} size={64}/></div>
        <div className="eyebrow" style={{justifyContent:"center"}}>{post.cat} · {post.date}</div>
        <h1 style={{fontFamily:"var(--serif)",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,margin:"16px 0 20px",lineHeight:1.1}}>{post.title}</h1>
        <div className="rule"/>
        <p style={{fontSize:14,color:"var(--text-soft)",lineHeight:1.8,maxWidth:680,marginBottom:32}}>{post.excerpt}</p>
        <button className="btn btn-outline" onClick={()=>setPost(null)}>← Назад к блогу</button>
      </section>
      <Footer/>
    </>
  )
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Блог</div><h1 className="h1">Новости и статьи</h1></div>
      <section className="section">
        <div className={styles.grid}>
          {BLOG_DATA.map(b=>(
            <div key={b.id} className={`${styles.card}${b.featured?" "+styles.featured:""}`} onClick={()=>setPost(b)}>
              <div className={styles.img}><Icon name={b.icon as IconName} size={48}/><span className={styles.cat}>{b.cat}</span></div>
              <div style={{padding:24}}>
                <div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".12em",color:"var(--muted)",marginBottom:8}}>{b.date}</div>
                <div style={{fontFamily:"var(--serif)",fontSize:b.featured?26:20,fontWeight:300,marginBottom:10,lineHeight:1.2}}>{b.title}</div>
                <div style={{fontSize:12.5,color:"var(--text-soft)",lineHeight:1.7,fontWeight:300,marginBottom:14}}>{b.excerpt}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".14em",color:"var(--red)"}}>Читать далее →</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer/>
    </>
  )
}
