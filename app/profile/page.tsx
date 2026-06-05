'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { getBookings, Booking } from '@/lib/bookings'
import Footer from '@/components/layout/Footer'
import Icon from '@/components/ui/Icon'

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
    const dt = new Date(`${y}-${mo}-${d}T${b.time}`)
    return dt.getTime() < now
  }).length

  return (
    <>
      <div className="section-hero"><div className="eyebrow">Личный кабинет</div><h1 className="h1">Мой профиль</h1></div>
      <section className="section">
        <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:32,maxWidth:1060,margin:"0 auto"}}>
          <div>
            <div style={{background:"var(--panel)",border:"1px solid var(--border)",padding:28,textAlign:"center",marginBottom:12}}>
              <div style={{width:68,height:68,borderRadius:"50%",background:"var(--red)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--serif)",fontSize:26,margin:"0 auto 14px"}}>{user.name[0]}</div>
              <div style={{fontFamily:"var(--serif)",fontSize:20,fontWeight:300,marginBottom:4}}>{user.name}</div>
              <div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".16em",color:"var(--red)"}}>Уровень: Выживший</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr",gap:1,background:"var(--border)",marginTop:16}}>
                {[{v:String(doneCount),k:"Квестов"}].map(s=>(
                  <div key={s.k} style={{background:"var(--bg-card)",padding:12,textAlign:"center"}}>
                    <div style={{fontFamily:"var(--serif)",fontSize:22,fontWeight:300}}>{s.v}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".14em",color:"var(--muted)"}}>{s.k}</div>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn btn-outline" style={{width:"100%",justifyContent:"center",marginBottom:8}} onClick={()=>{logout();router.push('/')}}><Icon name="door" size={14}/> Выйти</button>

            {!confirmDelete ? (
              <button
                style={{width:"100%",padding:"9px 0",background:"transparent",border:"1px solid rgba(200,0,10,.25)",color:"rgba(200,0,10,.55)",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".14em",cursor:"pointer",transition:"all .2s"}}
                onMouseEnter={e=>{(e.target as HTMLElement).style.borderColor="var(--red)";(e.target as HTMLElement).style.color="var(--red)"}}
                onMouseLeave={e=>{(e.target as HTMLElement).style.borderColor="rgba(200,0,10,.25)";(e.target as HTMLElement).style.color="rgba(200,0,10,.55)"}}
                onClick={()=>setConfirmDelete(true)}
              >
                Удалить аккаунт
              </button>
            ) : (
              <div style={{border:"1px solid var(--red)",padding:16,marginTop:4}}>
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--muted)",marginBottom:12,lineHeight:1.6}}>
                  Аккаунт будет удалён безвозвратно. Все данные исчезнут.
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button
                    style={{flex:1,padding:"8px 0",background:"transparent",border:"1px solid var(--border)",color:"var(--muted)",fontFamily:"var(--mono)",fontSize:11,cursor:"pointer"}}
                    onClick={()=>setConfirmDelete(false)}
                  >Отмена</button>
                  <button
                    style={{flex:1,padding:"8px 0",background:"var(--red)",border:"none",color:"#fff",fontFamily:"var(--mono)",fontSize:11,letterSpacing:".1em",cursor:"pointer",opacity:deleting?0.6:1}}
                    disabled={deleting}
                    onClick={handleDeleteAccount}
                  >{deleting ? "..." : "Удалить"}</button>
                </div>
              </div>
            )}
          </div>
          <div>
            <h3 style={{fontFamily:"var(--serif)",fontSize:26,fontWeight:300,marginBottom:8,paddingBottom:16,borderBottom:"1px solid var(--border)"}}>История бронирований</h3>
            {hist.length === 0 ? (
              <div style={{fontFamily:"var(--mono)",fontSize:13,color:"var(--muted)",padding:32,textAlign:"center",border:"1px solid var(--border)"}}>
                У вас ещё нет бронирований
              </div>
            ) : hist.map(b => {
              const [d, mo, y] = b.date.split('.')
              const isPast = new Date(`${y}-${mo}-${d}T${b.time}`).getTime() < now
              const statusKey = b.status === 'cancelled' ? 'cancelled' : isPast ? 'done' : 'upcoming'
              return (
                <div key={b.id} style={{display:"flex",alignItems:"center",gap:16,background:"var(--panel)",border:"1px solid var(--border)",padding:18,marginBottom:4}}>
                  <span className={`pill ${statusKey==="done"?"pill-green":statusKey==="upcoming"?"pill-amber":"pill-grey"}`}>
                    {statusKey==="done"?"ПРОЙДЕН":statusKey==="upcoming"?"ПРЕДСТОИТ":"ОТМЕНЁН"}
                  </span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5,fontWeight:300,marginBottom:3}}>{b.quest}</div>
                    <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)"}}>{b.date} · {b.time}</div>
                  </div>
                  <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)"}}>{b.id}</div>
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

