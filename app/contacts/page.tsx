
import Icon, { type IconName } from '@/components/ui/Icon'
import Footer from '@/components/layout/Footer'
export default function ContactsPage() {
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Контакты</div><h1 className="h1">Найди нас</h1></div>
      <section className="section">
        <div style={{maxWidth:700,margin:"0 auto"}}>
          {[
            {icon:"pin" as IconName, label:"Адрес",   val:"ул. Бабушкина, 66, 2-й этаж\nВход с торца, красная дверь"},
            {icon:"phone" as IconName, label:"Телефон", val:"8 999 420 31 41\nПн–Вс 09:00–22:00"},
            {icon:"mail" as IconName, label:"Email",   val:"granistraha526@gmail.com"},
          ].map(c=>(
            <div key={c.label} style={{display:"flex",gap:20,marginBottom:36,alignItems:"flex-start"}}>
              <span style={{marginTop:4,color:"var(--red)",flexShrink:0}}><Icon name={c.icon} size={22}/></span>
              <div>
                <div style={{fontSize:20,color:"var(--white)",fontWeight:300,marginBottom:6}}>{c.label}</div>
                <div style={{fontSize:18,color:"var(--muted)",fontWeight:300,lineHeight:1.8,whiteSpace:"pre-line"}}>{c.val}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer/>
    </>
  )
}
