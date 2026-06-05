
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { QUESTS } from '@/data'
import Footer from '@/components/layout/Footer'
import Icon, { type IconName } from '@/components/ui/Icon'
import styles from './page.module.css'
const QS=[{q:"Ты один ночью дома. Слышишь шаги сверху — там никого не должно быть. Твои действия?",opts:["Иду проверять — я ничего не боюсь","Звоню другу, жду","Прячусь под одеяло и молюсь","Выбегаю из дома"],scores:[10,5,2,7]},{q:"В каком месте тебе было бы комфортнее провести ночь?",opts:["В заброшенном особняке — это же круто!","В лесу у костра","В хорошо запертой квартире","Только дома, в своей кровати"],scores:[10,7,4,1]},{q:"Актёр в образе маньяка подходит к тебе вплотную в темноте. Ты…",opts:["Смотрю в глаза и не двигаюсь","Отступаю, но держусь","Кричу и убегаю","Автоматически бью — рефлекс"],scores:[10,7,3,6]},{q:"Выбери звук, который кажется тебе самым жутким:",opts:["Детский смех в пустом здании","Царапанье в стену ночью","Чьё-то дыхание рядом в темноте","Голос, называющий твоё имя"],scores:[7,5,9,10]},{q:"Сколько людей ты хотел бы взять с собой на хоррор-квест?",opts:["Иду один. Максимальный адреналин.","Один друг — больше не надо","Компания 4–6 человек","Чем больше — тем лучше. Безопаснее."],scores:[10,8,6,3]}]
const LEVELS=[{min:0,max:25,title:"Осторожный странник",icon:"flame" as IconName,desc:"Страх — это не твоя стихия. Начни мягко.",rec:"Корабль мертвецов"},{min:26,max:50,title:"Искатель острых ощущений",icon:"blade" as IconName,desc:"Ты готов к испытанию. Самое время попробовать.",rec:"Лаборатория X-13"},{min:51,max:75,title:"Бесстрашный",icon:"skull" as IconName,desc:"Страх заряжает тебя. Ты создан для хоррор-квестов.",rec:"Особняк призраков"},{min:76,max:100,title:"Повелитель тьмы",icon:"eye" as IconName,desc:"Ты получаешь удовольствие от настоящего ужаса. Нам нужно поговорить.",rec:"Психиатрическая лечебница"}]
export default function FearTestPage() {
  const [q,setQ]=useState(0);const [total,setTotal]=useState(0);const [done,setDone]=useState(false)
  const maxScore=QS.reduce((a,x)=>a+Math.max(...x.scores),0)
  const answer=(i:number)=>{const t=total+QS[q].scores[i];if(q+1>=QS.length){setTotal(t);setDone(true)}else{setTotal(t);setQ(q+1)}}
  if(done){
    const pct=Math.round((total/maxScore)*100)
    const lv=LEVELS.find(l=>pct>=l.min&&pct<=l.max)||LEVELS[LEVELS.length-1]
    const rec=QUESTS.find(x=>x.name.includes(lv.rec.split(" ")[0]))||QUESTS[0]
    return (
      <>
        <div className="section-hero"><div className="eyebrow">Тест на страх</div><h1 className="h1">Результат</h1></div>
        <section className="section" style={{maxWidth:680,margin:"0 auto",textAlign:"center"}}>
          <div className={styles.ring}><div className={styles.ringNum}>{pct}</div></div>
          <div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".2em",color:"var(--red)",marginBottom:12}}>Индекс страха</div>
          <div style={{marginBottom:8,color:"var(--red)"}}><Icon name={lv.icon} size={40}/></div>
          <h2 style={{fontFamily:"var(--serif)",fontSize:38,fontWeight:300,marginBottom:12}}>{lv.title}</h2>
          <p style={{fontSize:13,color:"var(--text-soft)",lineHeight:1.8,maxWidth:460,margin:"0 auto 28px"}}>{lv.desc}</p>
          <div style={{background:"var(--panel)",border:"1px solid var(--border)",borderLeft:"2px solid var(--red)",padding:"20px 24px",textAlign:"left",marginBottom:28}}>
            <div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".2em",color:"var(--red)",marginBottom:8}}>Рекомендуемый квест</div>
            <div style={{fontFamily:"var(--serif)",fontSize:20,fontWeight:300}}>{rec.name}</div>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <Link href="/booking" className="btn btn-primary">Забронировать</Link>
            <button className="btn btn-outline" onClick={()=>{setQ(0);setTotal(0);setDone(false)}}>Пройти снова</button>
          </div>
        </section>
        <Footer/>
      </>
    )
  }
  const cur=QS[q];const pct=Math.round((q/QS.length)*100)
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Интерактив</div><h1 className="h1">Тест на страх</h1></div>
      <section className="section" style={{maxWidth:680,margin:"0 auto"}}>
        <div className={styles.progress}><div className={styles.progressFill} style={{width:pct+"%"}}/></div>
        <div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".2em",color:"var(--red)",marginBottom:12}}>Вопрос {q+1} / {QS.length}</div>
        <h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(20px,2.5vw,30px)",fontWeight:300,marginBottom:36,lineHeight:1.25}}>{cur.q}</h2>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {cur.opts.map((opt,i)=>(
            <button key={i} className={styles.opt} onClick={()=>answer(i)}>
              <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--red)",width:18,flexShrink:0}}>{["A","B","C","D"][i]}</span>
              {opt}
            </button>
          ))}
        </div>
      </section>
      <Footer/>
    </>
  )
}
