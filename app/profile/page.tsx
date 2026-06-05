'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getBookings, Booking } from '@/lib/bookings'
import Footer from '@/components/layout/Footer'
import Icon from '@/components/ui/Icon'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [hist, setHist] = useState<Booking[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { if (!user) router.push('/auth') }, [user])

  useEffect(() => {
    if (!user) return
    getBookings().then(all =>
      setHist(all.filter(b =>
        b.userEmail === user.email ||
        b.userEmail === user.email.toLowerCase()
      ))
    )
  }, [user])

  const handleDeleteAccount = async () => {
    setDeleting(true)
    await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user!.email }) })
    logout()
    router.push('/')
  }

  if (!user) return null

  const now = Date.now()
  const doneCount = hist.filter(b => {
    const [d, mo, y] = b.date.split('.')
    return new Date(`${y}-${mo}-${d}T${b.time}`).getTime() < now
  }).length
  const upcoming = hist.filter(b => {
    const [d, mo, y] = b.date.split('.')
    return new Date(`${y}-${mo}-${d}T${b.time}`).getTime() > now && b.status !== 'cancelled'
  })

  return (
    <>
      <div className="section-hero">
        <div className="eyebrow">Личный кабинет</div>
        <h1 className="h1">Мой профиль</h1>
      </div>

      <section className="section" style={{paddingTop:40}}>
        <div className="grid-sidebar" style={{maxWidth:1060,margin:"0 auto"}}>

          {/* ── Левая колонка ── */}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>

            {/* Карточка пользователя */}
            <div style={{background:"var(--panel)",border:"1px solid var(--border)",padding:32,textAlign:"center"}}>
              <div style={{width:80,height:80,borderRadius:"50%",background:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--serif)",fontSize:32,fontWeight:300,margin:"0 auto 16px",color:"#fff"}}>
                {user.name[0].toUpperCase()}
              </div>
              <div style={{fontFamily:"var(--serif)",fontSize:22,fontWeight:300,marginBottom:6}}>{user.name}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",letterSpacing:".12em"}}>{user.email}</div>

              {user.phone && (
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",marginTop:4}}>
                  <Icon name="phone" size={11}/> {user.phone}
                </div>
              )}

              {/* Статистика */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:1,background:"var(--border)",marginTop:20}}>
                {[
                  {v:String(doneCount), k:"Пройдено"},
                  {v:String(upcoming.length), k:"Предстоит"},
                ].map(s=>(
                  <div key={s.k} style={{background:"var(--bg-card)",padding:14,textAlign:"center"}}>
                    <div style={{fontFamily:"var(--serif)",fontSize:24,fontWeight:300,color: s.k==="Пройдено" ? "var(--red)" : "var(--white)"}}>{s.v}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:11,letterSpacing:".12em",color:"var(--muted)",marginTop:2}}>{s.k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Быстрые действия */}
            <Link href="/booking" className="btn btn-primary" style={{width:"100%",justifyContent:"center",textDecoration:"none",display:"flex",alignItems:"center",gap:8,padding:"11px 0"}}>
              <Icon name="calendar" size={14}/> Забронировать квест
            </Link>
            <button className="btn btn-outline" style={{width:"100%",justifyContent:"center"}} onClick={()=>{logout();router.push('/')}}>
              <Icon name="door" size={14}/> Выйти
            </button>

            {!confirmDelete ? (
              <button
                style={{width:"100%",padding:"9px 0",background:"transparent",border:"1px solid rgba(200,0,10,.25)",color:"rgba(200,0,10,.5)",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".14em",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{(e.currentTarget).style.borderColor="var(--red)";(e.currentTarget).style.color="var(--red)"}}
                onMouseLeave={e=>{(e.currentTarget).style.borderColor="rgba(200,0,10,.25)";(e.currentTarget).style.color="rgba(200,0,10,.5)"}}
                onClick={()=>setConfirmDelete(true)}
              >Удалить аккаунт</button>
            ) : (
              <div style={{border:"1px solid var(--red)",padding:16}}>
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>
                  Аккаунт будет удалён безвозвратно.
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button style={{flex:1,padding:"8px 0",background:"transparent",border:"1px solid var(--border)",color:"var(--muted)",fontFamily:"var(--mono)",fontSize:11,cursor:"pointer"}} onClick={()=>setConfirmDelete(false)}>Отмена</button>
                  <button style={{flex:1,padding:"8px 0",background:"var(--red)",border:"none",color:"#fff",fontFamily:"var(--mono)",fontSize:11,cursor:"pointer",opacity:deleting?0.6:1}} disabled={deleting} onClick={handleDeleteAccount}>{deleting?"...":"Удалить"}</button>
                </div>
              </div>
            )}
          </div>

          {/* ── Правая колонка ── */}
          <div>
            {/* Ближайшее бронирование */}
            {upcoming.length > 0 && (
              <div style={{background:"rgba(200,0,10,.06)",border:"1px solid rgba(200,0,10,.2)",borderLeft:"3px solid var(--red)",padding:"18px 24px",marginBottom:24}}>
                <div style={{fontFamily:"var(--mono)",fontSize:11,letterSpacing:".14em",color:"var(--red)",marginBottom:8}}>БЛИЖАЙШИЙ КВЕСТ</div>
                <div style={{fontSize:18,fontFamily:"var(--serif)",fontWeight:300,marginBottom:4}}>{upcoming[0].quest}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)"}}><Icon name="calendar" size={12}/> {upcoming[0].date} в {upcoming[0].time} · {upcoming[0].players} чел.</div>
              </div>
            )}

            {/* История */}
            <h3 style={{fontFamily:"var(--serif)",fontSize:24,fontWeight:300,marginBottom:16,paddingBottom:16,borderBottom:"1px solid var(--border)"}}>
              История бронирований
            </h3>

            {hist.length === 0 ? (
              <div style={{border:"1px solid var(--border)",padding:48,textAlign:"center"}}>
                <div style={{fontFamily:"var(--serif)",fontSize:32,fontWeight:300,color:"var(--muted)",marginBottom:12}}>Квестов пока нет</div>
                <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)",marginBottom:24}}>Забронируй свой первый квест и испытай страх</div>
                <Link href="/quests" style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--red)",letterSpacing:".14em",textDecoration:"none"}}>
                  СМОТРЕТЬ КВЕСТЫ →
                </Link>
              </div>
            ) : hist.map(b => {
              const [d, mo, y] = b.date.split('.')
              const isPast = new Date(`${y}-${mo}-${d}T${b.time}`).getTime() < now
              const statusKey = b.status === 'cancelled' ? 'cancelled' : isPast ? 'done' : 'upcoming'
              return (
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:16,background:"var(--panel)",border:"1px solid var(--border)",padding:"16px 20px",marginBottom:4,transition:"border-color .2s"}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor="rgba(200,0,10,.25)")}
                  onMouseLeave={e=>(e.currentTarget.style.borderColor="var(--border)")}>
                  <span className={`pill ${statusKey==="done"?"pill-green":statusKey==="upcoming"?"pill-amber":"pill-grey"}`}>
                    {statusKey==="done"?"ПРОЙДЕН":statusKey==="upcoming"?"ПРЕДСТОИТ":"ОТМЕНЁН"}
                  </span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:300,marginBottom:3}}>{b.quest}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)"}}>{b.date} · {b.time} · {b.players} чел.</div>
                  </div>
                  <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",letterSpacing:".08em"}}>{b.id}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <Footer/>
    </>
  )
}
