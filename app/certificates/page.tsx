
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import { QUESTS } from '@/data'

export default function CertificatesPage() {
  return (
    <>
      <div className="section-hero">
        <div className="eyebrow">Сертификаты</div>
        <h1 className="h1">Подари страх</h1>
      </div>

      <section className="section">
        <p style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--text-soft)',maxWidth:580,marginBottom:56,lineHeight:1.8}}>
          Подарочный сертификат на конкретный квест — идеальный подарок для тех, кто любит острые ощущения. Действует 12 месяцев с момента покупки.
        </p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'var(--border)'}}>
          {QUESTS.map((q, i) => (
            <div key={q.id} style={{
              background:'var(--bg-card)',overflow:'hidden',
              animation:`fadeInUp .5s cubic-bezier(.16,1,.3,1) ${i*0.07}s both`
            }}>
              {/* Certificate visual */}
              <div style={{
                height:200,background:q.bg,borderBottom:'1px solid var(--border)',
                display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden'
              }}>
                <div style={{
                  border:'1px solid rgba(200,0,10,.4)',padding:'20px 36px',textAlign:'center',
                  position:'relative',zIndex:1,backdropFilter:'blur(2px)'
                }}>
                  <div style={{fontFamily:'var(--mono)',fontSize:8,letterSpacing:'.22em',color:'var(--red)',marginBottom:6}}>ГРАНИ СТРАХА</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:11,color:'rgba(255,255,255,.5)',marginBottom:8,letterSpacing:'.1em'}}>Подарочный сертификат</div>
                  <div style={{fontFamily:'var(--serif)',fontSize:11,color:'rgba(255,255,255,.35)',letterSpacing:'.05em'}}>{q.icon} {q.badge}</div>
                </div>
                {/* Decorative corner lines */}
                <div style={{position:'absolute',top:12,left:12,width:20,height:20,borderTop:'1px solid rgba(200,0,10,.4)',borderLeft:'1px solid rgba(200,0,10,.4)'}}/>
                <div style={{position:'absolute',top:12,right:12,width:20,height:20,borderTop:'1px solid rgba(200,0,10,.4)',borderRight:'1px solid rgba(200,0,10,.4)'}}/>
                <div style={{position:'absolute',bottom:12,left:12,width:20,height:20,borderBottom:'1px solid rgba(200,0,10,.4)',borderLeft:'1px solid rgba(200,0,10,.4)'}}/>
                <div style={{position:'absolute',bottom:12,right:12,width:20,height:20,borderBottom:'1px solid rgba(200,0,10,.4)',borderRight:'1px solid rgba(200,0,10,.4)'}}/>
              </div>

              <div style={{padding:24}}>
                <div style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.16em',color:'var(--red)',marginBottom:6}}>{q.badge}</div>
                <div style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:300,marginBottom:8}}>{q.name}</div>
                <div style={{fontSize:12,color:'var(--text-soft)',lineHeight:1.6,fontWeight:300,marginBottom:12}}>
                  {q.players} игроков · {q.time} · {q.age}
                </div>
                <div style={{fontFamily:'var(--serif)',fontSize:22,marginBottom:16}}>{q.price}</div>
                <Link href="/booking" className="btn btn-primary" style={{width:'100%',display:'flex',justifyContent:'center',fontSize:12}}>
                  Купить сертификат
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop:48,padding:'32px 40px',background:'var(--off-black)',
          border:'1px solid var(--border)',display:'flex',flexDirection:'column',gap:12
        }}>
          <div style={{fontFamily:'var(--mono)',fontSize:11,letterSpacing:'.2em',color:'var(--red)',marginBottom:4}}>КАК ЭТО РАБОТАЕТ</div>
          {[
            'Выберите квест и оплатите сертификат онлайн или в кассе',
            'Получите именной сертификат с уникальным кодом в электронном или печатном виде',
            'Получатель выбирает удобную дату и бронирует сеанс по коду — без доплат',
            'Сертификат действует 12 месяцев с момента покупки',
          ].map((t, i) => (
            <div key={i} style={{display:'flex',gap:16,alignItems:'flex-start'}}>
              <div style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--red)',minWidth:20,paddingTop:1}}>0{i+1}</div>
              <div style={{fontSize:13,color:'var(--text-soft)',lineHeight:1.7,fontWeight:300}}>{t}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer/>
    </>
  )
}
