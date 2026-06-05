
import Footer from '@/components/layout/Footer'
import { QUESTS } from '@/data'
import Icon from '@/components/ui/Icon'
const LORE=[{q:0,title:"История места",story:"1987 год. Государственная психиатрическая лечебница №14. Главный врач доктор Соколов провёл серию запрещённых экспериментов. В ноябре 1987-го лечебницу экстренно закрыли. Официальная причина — вспышка инфекции. Неофициально: несколько санитаров пропали без следа.",detail:"Когда ты войдёшь, тебя встретят тени прошлого. Соколов всё ещё здесь."},{q:1,title:"Тайна леса",story:"Лес на окраине города. Местные не ходят туда после захода солнца. В 1952 году группа туристов разбила лагерь у старого дуба. Утром нашли только одного — он до конца жизни рисовал деревья с красными листьями.",detail:"Ты войдёшь в лес ночью. То, что живёт там, уже знает, что ты идёшь."},{q:2,title:"Проект X-13",story:"Секретная лаборатория Министерства обороны, 1969–1991. Цель: создание вируса, подавляющего страх. Результат: нечто обратное. В 1991-м лабораторию законсервировали в спешке. Ни один из 12 учёных не покинул здание живым.",detail:"Антидот существует. Найди его раньше, чем система запустит протокол ликвидации."}]
export default function LorePage() {
  return (
    <>
      <div className="section-hero"><div className="eyebrow">История</div><h1 className="h1">Легенда места</h1></div>
      <section className="section">
        {LORE.map((l,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:"var(--border)",marginBottom:1,...(i%2!==0?{direction:"rtl"}:{})}}>
            <div style={{background:"var(--bg-card)",padding:"56px 48px",...(i%2!==0?{direction:"ltr"}:{})}}>
              <div className="eyebrow" style={{marginBottom:12}}>{QUESTS[l.q].name}</div>
              <h2 style={{fontFamily:"var(--serif)",fontSize:"clamp(24px,3vw,38px)",fontWeight:300,marginBottom:20,lineHeight:1.1}}>{l.title}</h2>
              <div className="rule"/>
              <p style={{fontSize:13,color:"var(--text-soft)",lineHeight:1.9,marginBottom:20,fontWeight:300}}>{l.story}</p>
              <p style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--red)",letterSpacing:".12em",lineHeight:1.7,borderLeft:"2px solid var(--red)",paddingLeft:14}}>{l.detail}</p>
            </div>
            <div style={{background:"var(--panel)",minHeight:340,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",...(i%2!==0?{direction:"ltr"}:{})}}>
              <div style={{position:"absolute",inset:0,background:QUESTS[l.q].bg,opacity:.6}}/>
              <div style={{position:"relative",textAlign:"center",zIndex:2}}>
                <div style={{opacity:.15,marginBottom:12}}><Icon name="skull" size={72}/></div>
                <div style={{fontFamily:"var(--serif)",fontSize:18,color:"rgba(255,255,255,.5)",fontStyle:"italic"}}>{QUESTS[l.q].name}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--red)",marginTop:8}}>★ {QUESTS[l.q].rating}</div>
              </div>
            </div>
          </div>
        ))}
      </section>
      <Footer/>
    </>
  )
}
