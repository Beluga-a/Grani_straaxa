'use client'
import Footer from '@/components/layout/Footer'
import Icon, { type IconName } from '@/components/ui/Icon'
const ITEMS=[{icon:"stop" as IconName,title:"Кнопка экстренного выхода",desc:"В каждой комнате, на расстоянии вытянутой руки. Один нажим — игра немедленно остановится."},{icon:"eye" as IconName,title:"Постоянный мониторинг",desc:"Два администратора следят за каждой комнатой в режиме реального времени."},{icon:"medical" as IconName,title:"Медицинская готовность",desc:"Аптечка, дефибриллятор и инструктированный персонал всегда на месте."},{icon:"door" as IconName,title:"Аварийные выходы",desc:"Независимо от сценария — реальные выходы всегда открыты."},{icon:"clipboard" as IconName,title:"Инструктаж перед входом",desc:"Каждый игрок получает полный инструктаж по безопасности перед началом."},{icon:"lock" as IconName,title:"Актёры не трогают",desc:"Физический контакт строго запрещён без предварительного согласия."}]
export default function SafetyPage() {
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Безопасность</div><h1 className="h1">Мы следим за тобой</h1><p style={{color:"var(--text-soft)",marginTop:14,maxWidth:500,fontSize:14}}>Страх под контролем. Всегда.</p></div>
      <section className="section">
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"var(--border)",marginBottom:56}}>
          {ITEMS.map((it,i)=>(
            <div key={it.title} style={{
              background:"var(--bg-card)",padding:"36px 28px",
              transition:"background .25s, box-shadow .3s",
              position:"relative",overflow:"hidden",
              animation:`fadeInUp .5s cubic-bezier(.16,1,.3,1) ${i*0.08}s both`
            }}
              onMouseEnter={e=>{e.currentTarget.style.background="var(--off-black)";e.currentTarget.style.boxShadow="inset 0 0 0 1px rgba(200,0,10,.2)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="var(--black)";e.currentTarget.style.boxShadow="none"}}>
              <div style={{marginBottom:16,color:"var(--red)",transition:"transform .3s"}}><Icon name={it.icon} size={28}/></div>
              <div style={{fontFamily:"var(--serif)",fontSize:18,fontWeight:300,marginBottom:10}}>{it.title}</div>
              <div style={{fontSize:12.5,color:"var(--text-soft)",lineHeight:1.7,fontWeight:300}}>{it.desc}</div>
            </div>
          ))}
        </div>
        <div style={{background:"var(--panel)",border:"1px solid var(--border)",borderLeft:"2px solid var(--red)",padding:"36px",maxWidth:740,marginBottom:48}}>
          <div className="eyebrow">Главное правило</div>
          <h3 style={{fontFamily:"var(--serif)",fontSize:26,fontWeight:300,marginBottom:12}}>Кнопка остановки</h3>
          <p style={{fontSize:13,color:"var(--text-soft)",lineHeight:1.8,fontWeight:300}}>В каждой комнате есть красная кнопка экстренного выхода. Нажми — и игра немедленно остановится. Без вопросов, без штрафов, без осуждения. Ты в безопасности.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:1,background:"var(--border)"}}>
          {[{n:"0",l:"несчастных случаев"},{n:"100%",l:"контроль в реальном времени"},{n:"24/7",l:"готовность персонала"}].map(s=><div key={s.l} className="stat-cell"><div className="stat-num" style={{color:"var(--red)"}}>{s.n}</div><div className="stat-label">{s.l}</div></div>)}
        </div>
      </section>
      <Footer/>
    </>
  )
}
