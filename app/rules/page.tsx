
import Footer from '@/components/layout/Footer'
const RULES=[
  {title:"Общие правила",content:["Приходите за 15 минут до начала","Не допускается нетрезвое состояние","Следуйте указаниям инструктора","Не уносите реквизит"]},
  {title:"Безопасность",content:["В каждой комнате есть кнопка экстренного выхода","Нажмите — игра немедленно остановится","Актёры не контактируют без согласия","При ухудшении самочувствия — нажмите кнопку"]},
  {title:"Противопоказания",content:["Болезни сердечно-сосудистой системы","Эпилепсия","Клаустрофобия (для некоторых квестов)","Беременность","До 14 лет не допускаются"]},
  {title:"Бронирование",content:["Бронь подтверждена после звонка менеджера","Бесплатная отмена за 24+ ч.","Опоздание 30+ мин — потеря брони","Перенос — однократно, за 12+ ч."]},
]
export default function RulesPage() {
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Правила</div><h1 className="h1">Правила участия</h1></div>
      <section className="section">
        <div style={{maxWidth:800,margin:"0 auto"}}>
          {RULES.map(s=>(
            <div key={s.title} style={{marginBottom:48,paddingBottom:48,borderBottom:"1px solid var(--border)"}}>
              <h2 style={{fontFamily:"var(--serif)",fontSize:28,fontWeight:300,marginBottom:20,paddingLeft:14,borderLeft:"2px solid var(--red)"}}>{s.title}</h2>
              <ul style={{listStyle:"none"}}>
                {s.content.map(c=><li key={c} style={{fontSize:17,color:"var(--text-soft)",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,.05)",fontWeight:300,display:"flex",gap:12}}><span style={{color:"var(--red)",flexShrink:0}}>—</span>{c}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <Footer/>
    </>
  )
}
