'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, User } from '@/lib/auth'
import { useQuests, Quest } from '@/lib/quests'
import { toast } from '@/lib/toast'
import { getBookings, updateBookingStatus, parseAmount, Booking } from '@/lib/bookings'
import QuestForm from '@/components/ui/QuestForm'
import ScheduleManager from '@/components/ui/ScheduleManager'
import Icon, { type IconName } from '@/components/ui/Icon'
import styles from './page.module.css'

export default function AdminPage() {
  const { user, logout, updateUser } = useAuth()
  const { quests, deleteQuest, toggleActive } = useQuests()
  const router = useRouter()

  const [panel,     setPanel]     = useState('dash')
  const [editQ,     setEditQ]     = useState<Quest | null | 'closed'>('closed')
  const [scheduleQ, setScheduleQ] = useState<Quest | null>(null)
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [confirmDel,setConfirmDel]= useState<Quest | null>(null)
  const [bookings,     setBookings]     = useState<Booking[]>([])
  const [users,        setUsers]        = useState<any[]>([])
  const [reviews,      setReviews]      = useState<any[]>([])
  const [bookingSearch,setBookingSearch]= useState('')
  const [profileName,  setProfileName]  = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profilePwd,   setProfilePwd]   = useState('')
  const [gallery,      setGallery]      = useState<any[]>([])
  const [glCat,        setGlCat]        = useState('rooms')
  const [glLabel,      setGlLabel]      = useState('')
  const [glUploading,  setGlUploading]  = useState(false)

  useEffect(() => { getBookings().then(setBookings) }, [])
  useEffect(() => { fetch('/api/users').then(r=>r.json()).then(setUsers).catch(()=>{}) }, [])
  useEffect(() => { fetch('/api/reviews').then(r=>r.json()).then(setReviews).catch(()=>{}) }, [])
  useEffect(() => { fetch('/api/gallery').then(r=>r.json()).then(setGallery).catch(()=>{}) }, [])
  useEffect(() => { if (user) { setProfileName(user.name); setProfilePhone(user.phone) } }, [user])

  const refreshBookings = () => getBookings().then(setBookings)

  const confirmBooking = async (id: string) => {
    await updateBookingStatus(id, 'confirmed')
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b))
    toast('✓ Бронь ' + id + ' подтверждена')
  }

  const cancelBooking = async (id: string) => {
    await updateBookingStatus(id, 'cancelled')
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    toast('✕ Бронь ' + id + ' отменена')
  }

  const saveProfile = async () => {
    const patch: { name?: string; phone?: string; password?: string } = {}
    if (profileName && profileName !== user?.name) patch.name = profileName
    if (profilePhone && profilePhone !== user?.phone) patch.phone = profilePhone
    if (profilePwd) patch.password = profilePwd
    if (!Object.keys(patch).length) return toast('Нет изменений')
    const err = await updateUser(patch)
    if (err) toast('✕ ' + err)
    else { toast('✓ Профиль сохранён'); setProfilePwd('') }
  }

  useEffect(() => { if (!user || user.role === 'user') router.push('/auth') }, [user])
  if (!user || user.role === 'user') return null

  const isDir = user.role === 'director'

  // ── Финансовые расчёты из реальных бронирований ──
  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const now2 = new Date()

  function bookingDate(b: Booking) {
    const [d, mo, y] = b.date.split('.')
    return new Date(`${y}-${mo}-${d}`)
  }

  const monthRevenue = confirmed
    .filter(b => { const dt = bookingDate(b); return dt.getMonth() === now2.getMonth() && dt.getFullYear() === now2.getFullYear() })
    .reduce((s, b) => s + parseAmount(b.amountNum ?? b.amount), 0)

  const yearRevenue = confirmed
    .filter(b => bookingDate(b).getFullYear() === now2.getFullYear())
    .reduce((s, b) => s + parseAmount(b.amountNum ?? b.amount), 0)

  const totalRevenue = confirmed.reduce((s, b) => s + parseAmount(b.amountNum ?? b.amount), 0)

  const avgCheck = confirmed.length
    ? Math.round(totalRevenue / confirmed.length)
    : 0

  const conversion = bookings.length
    ? Math.round(confirmed.length / bookings.length * 100)
    : 0

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  function fmtMoney(n: number) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + ' М'
    if (n >= 1_000)     return Math.round(n / 1_000) + ' К'
    return n.toLocaleString('ru-RU')
  }

  const NAV: Array<{sec?:string; id?:string; icon?:IconName; label?:string}> = [
    { sec:'Управление' },
    { id:'dash',      icon:'target',   label:'Дашборд' },
    { id:'quests',    icon:'skull',    label:'Квесты' },
    { id:'bookings',  icon:'calendar', label:'Бронирования' },
    { id:'users',     icon:'users',    label:'Пользователи' },
    { id:'gallery',   icon:'palette',  label:'Галерея' },
    { id:'reviews',   icon:'star',     label:'Отзывы' },
    ...(isDir ? [{ sec:'Аналитика' }, { id:'finance', icon:'star' as IconName, label:'Финансы' }, { sec:'Настройки' }, { id:'settings', icon:'settings' as IconName, label:'Настройки' }] : []),
    { sec:'Аккаунт' },
    { id:'myprofile', icon:'user',  label:'Мой профиль' },
    { id:'logout',    icon:'close', label:'Выйти' },
  ]

  const filteredQ = quests.filter(q =>
    (catFilter === 'all' || q.cat === catFilter) &&
    (!search || q.name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      {editQ !== 'closed' && <QuestForm quest={editQ} onClose={() => setEditQ('closed')} />}
      {scheduleQ && <ScheduleManager quest={scheduleQ} onClose={() => setScheduleQ(null)} />}

      {confirmDel && (
        <div style={{position:'fixed',inset:0,zIndex:4000,background:'rgba(0,0,0,.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{background:'var(--off-black)',border:'1px solid var(--border)',borderTop:'2px solid var(--red)',padding:36,maxWidth:420,textAlign:'center',width:'100%'}}>
            <div style={{marginBottom:16,color:'var(--red)'}}><Icon name="warn" size={32}/></div>
            <h3 style={{fontFamily:'var(--serif)',fontSize:22,fontWeight:300,marginBottom:12}}>Удалить квест?</h3>
            <p style={{fontSize:13,color:'var(--text-soft)',marginBottom:28,lineHeight:1.6}}>«{confirmDel.name}» будет удалён навсегда.</p>
            <div style={{display:'flex',gap:12,justifyContent:'center'}}>
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Отмена</button>
              <button className="btn btn-primary" onClick={() => { deleteQuest(confirmDel.id); setConfirmDel(null); toast(`✓ Квест «${confirmDel.name}» удалён`) }}>Удалить</button>
            </div>
          </div>
        </div>
      )}

      <div style={{height:64}} />
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <div className={styles.sideHead}>
            <div style={{fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.2em',color:'var(--red)',marginBottom:6}}>{isDir ? '// DIRECTOR' : '// ADMIN'}</div>
            <div style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:300}}>{user.name}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',marginTop:3}}>{user.email}</div>
          </div>
          <nav>
            {NAV.map((n, i) => n.sec ? (
              <div key={i} style={{fontFamily:'var(--mono)',fontSize:8.5,letterSpacing:'.22em',color:'var(--muted)',padding:'16px 20px 6px'}}>{n.sec}</div>
            ) : (
              <div key={n.id} className={`${styles.navItem} ${panel === n.id ? styles.navActive : ''}`}
                onClick={() => n.id === 'logout' ? (logout(), router.push('/')) : setPanel(n.id!)}>
                <span style={{width:18,flexShrink:0,display:'flex',alignItems:'center'}}><Icon name={n.icon!} size={14}/></span>{n.label}
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.content}>

          {panel === 'dash' && (
            <>
              <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300,marginBottom:6}}>{isDir ? 'Дашборд руководителя' : 'Дашборд'}</h1>
              <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.1em',marginBottom:28}}>{new Date().toLocaleString('ru')}</div>
              <div className={styles.statGrid}>
                {[
                  {icon:'skull' as IconName,    val:quests.filter(q=>q.active).length, label:'Активных квестов'},
                  {icon:'calendar' as IconName, val:bookings.length,                   label:'Броней всего'},
                  {icon:'target' as IconName,   val:isDir?fmtMoney(totalRevenue)+'₽':'—', label:isDir?'Выручка (подтв.)':'Нет доступа', delta:''},
                  {icon:'star' as IconName,     val:avgRating,                          label:`Рейтинг (${reviews.length} отз.)`, delta:''},
                ].map(s=>(
                  <div key={s.label} className={styles.statCard}>
                    <div style={{marginBottom:10,color:'var(--red)'}}><Icon name={s.icon} size={20}/></div>
                    <div style={{fontFamily:'var(--serif)',fontSize:34,fontWeight:300,lineHeight:1}}>{s.val}</div>
                    <div style={{fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.16em',color:'var(--muted)',marginTop:6}}>{s.label}</div>
                    {s.delta && <div style={{fontFamily:'var(--mono)',fontSize:12,color:'#00cc66',marginTop:4}}>{s.delta}</div>}
                  </div>
                ))}
              </div>
              <div style={{background:'var(--panel)',border:'1px solid var(--border)',padding:24,marginTop:24}}>
                <div style={{fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.16em',color:'var(--muted)',marginBottom:16}}>Быстрые действия</div>
                <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                  <button className="btn btn-primary" style={{fontSize:13}} onClick={()=>{setPanel('quests');setEditQ(null)}}>+ Добавить квест</button>
                  <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>setPanel('quests')}>Управление квестами</button>
                  <button className="btn btn-outline" style={{fontSize:13}} onClick={()=>setPanel('bookings')}>Бронирования</button>
                </div>
              </div>
            </>
          )}

          {panel === 'quests' && (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6,flexWrap:'wrap',gap:12}}>
                <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300}}>Квесты</h1>
                <button className="btn btn-primary" style={{fontSize:13}} onClick={()=>setEditQ(null)}>+ Добавить квест</button>
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.1em',marginBottom:20}}>
                {quests.length} всего · {quests.filter(q=>q.active).length} активных · {quests.filter(q=>!q.active).length} скрытых
              </div>
              <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap',alignItems:'center'}}>
                <input className="form-input" style={{maxWidth:260}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Поиск…" />
                <select className="form-select" style={{width:160}} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
                  <option value="all">Все категории</option>
                  <option value="extreme">Экстрим</option>
                  <option value="mystery">Загадки</option>
                  <option value="classic">Классика</option>
                </select>
              </div>
              {filteredQ.length === 0 ? (
                <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',padding:40,textAlign:'center',border:'1px solid var(--border)'}}>Квесты не найдены</div>
              ) : (
                <div className={styles.questTable}>
                  {filteredQ.map(q => (
                    <div key={q.id} className={`${styles.questRow} ${!q.active ? styles.questHidden : ''}`}>
                      <div className={styles.questPreview} style={{background:q.bg}}><Icon name="skull" size={20} style={{opacity:.12}}/></div>
                      <div className={styles.questInfo}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5,flexWrap:'wrap'}}>
                          <span style={{fontFamily:'var(--serif)',fontSize:16,fontWeight:300}}>{q.name}</span>
                          {!q.active && <span className="pill pill-grey" style={{fontSize:8}}>СКРЫТ</span>}
                          {q.badge && <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--red)',border:'1px solid rgba(200,0,10,.25)',padding:'2px 7px'}}>{q.badge}</span>}
                        </div>
                        <div style={{display:'flex',gap:16,flexWrap:'wrap',fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.08em'}}>
                          <span><Icon name="users" size={12}/> {q.players}</span><span><Icon name="clock" size={12}/> {q.time}</span>
                          <span><Icon name="skull" size={12}/> Страх {q.fear}/5</span><span><Icon name="target" size={12}/> Сложн. {q.diff}/5</span>
                          <span>{q.age}</span>
                          <span style={{color:'var(--white)'}}>{q.price}</span>
                          <span><Icon name="star" size={12}/> {q.rating}</span>
                          <span>{q.schedule.length} слотов · {q.schedule.filter(s=>s.taken).length} занято</span>
                        </div>
                      </div>
                      <div className={styles.questActions}>
                        <button className={styles.aBtn} title="Редактировать" onClick={()=>setEditQ(q)}><Icon name="edit" size={14}/></button>
                        <button className={styles.aBtn} title="Расписание" onClick={()=>setScheduleQ(q)}><Icon name="calendar" size={14}/></button>
                        <button className={`${styles.aBtn} ${q.active?styles.aBtnWarn:styles.aBtnOk}`} title={q.active?'Скрыть':'Показать'}
                          onClick={()=>{toggleActive(q.id);toast(q.active?`«${q.name}» скрыт`:`«${q.name}» активирован`)}}>
                          {q.active ? <Icon name="eye-off" size={14}/> : <Icon name="eye" size={14}/>}
                        </button>
                        <button className={`${styles.aBtn} ${styles.aBtnDel}`} title="Удалить" onClick={()=>setConfirmDel(q)}><Icon name="trash" size={14}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {panel === 'bookings' && (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:12}}>
                <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300}}>Бронирования</h1>
                <button className="btn btn-outline" style={{fontSize:12}} onClick={refreshBookings}>↻ Обновить</button>
              </div>
              <div style={{marginBottom:20}}>
                <input className="form-input" style={{maxWidth:320}} value={bookingSearch} onChange={e=>setBookingSearch(e.target.value)}
                  placeholder="Поиск по коду, клиенту, квесту…" />
              </div>
              {bookings.length === 0 ? (
                <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',padding:40,textAlign:'center',border:'1px solid var(--border)'}}>
                  Бронирований пока нет
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table style={{width:'100%',minWidth:900,borderCollapse:'collapse',fontSize:12.5}}>
                    <thead><tr>{['ID','Клиент','Телефон','Квест','Дата','Игроков','Сумма','Коммент.','Статус','Действия'].map(h=><th key={h} style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',textAlign:'left',fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.14em',color:'var(--muted)',fontWeight:300,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {bookings.filter(b => {
                        if (!bookingSearch.trim()) return true
                        const q = bookingSearch.toLowerCase()
                        return (b.id?.toLowerCase().includes(q)) ||
                               (b.userName?.toLowerCase().includes(q)) ||
                               (b.quest?.toLowerCase().includes(q)) ||
                               (b.phone?.toLowerCase().includes(q))
                      }).map(b=>(
                        <tr key={b.id}>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:12,whiteSpace:'nowrap'}}>{b.id}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',color:'var(--white)',fontWeight:300,whiteSpace:'nowrap'}}>{b.userName}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',whiteSpace:'nowrap'}}>{b.phone}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',color:'var(--text-soft)',fontSize:12,whiteSpace:'nowrap'}}>{b.quest}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:12,whiteSpace:'nowrap'}}>{b.date} · {b.time}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',textAlign:'center'}}>{b.players}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',color:'var(--red)',fontFamily:'var(--mono)',fontSize:13,whiteSpace:'nowrap'}}>{b.amount}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',maxWidth:180}}>
                            {b.comment
                              ? <span title={b.comment} style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--text-soft)',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:160,cursor:'help'}}>{b.comment}</span>
                              : <span style={{color:'var(--muted2)',fontFamily:'var(--mono)',fontSize:11}}>—</span>}
                          </td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>
                            <span className={`pill ${b.status==='confirmed'?'pill-green':b.status==='cancelled'?'pill-red':'pill-amber'}`}>
                              {b.status==='confirmed'?'ПОДТВ.':b.status==='cancelled'?'ОТМЕНЕНО':'ОЖИДАНИЕ'}
                            </span>
                          </td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>
                            {b.status === 'pending' && <>
                              <button style={{padding:'4px 10px',border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',cursor:'pointer',fontFamily:'var(--mono)',fontSize:12,marginRight:4}} onClick={()=>confirmBooking(b.id)}>Подтвердить</button>
                              <button style={{padding:'4px 10px',border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',cursor:'pointer',fontFamily:'var(--mono)',fontSize:12}} onClick={()=>cancelBooking(b.id)}>Отменить</button>
                            </>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {panel === 'users' && (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300}}>Пользователи</h1>
                <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.1em'}}>{users.length} зарегистрировано</div>
              </div>
              {users.length === 0 ? (
                <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',padding:40,textAlign:'center',border:'1px solid var(--border)'}}>
                  Нет зарегистрированных пользователей
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table style={{width:'100%',minWidth:600,borderCollapse:'collapse',fontSize:12.5}}>
                    <thead><tr>{['Имя','Email','Телефон','Роль','Действия'].map(h=><th key={h} style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',textAlign:'left',fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.14em',color:'var(--muted)',fontWeight:300,whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {users.map(u=>(
                        <tr key={u.email}>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',color:'var(--white)',fontWeight:300,whiteSpace:'nowrap'}}>{u.name || '—'}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:12,whiteSpace:'nowrap'}}>{u.email}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',whiteSpace:'nowrap'}}>{u.phone || '—'}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)'}}>
                            {isDir ? (
                              <select
                                value={u.role || 'user'}
                                className="form-select"
                                style={{fontSize:12,padding:'3px 8px',width:'auto'}}
                                onChange={async e => {
                                  const newRole = e.target.value
                                  await fetch('/api/users', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: u.email, role: newRole }) })
                                  setUsers(prev => prev.map(x => x.email === u.email ? { ...x, role: newRole } : x))
                                  toast(`✓ Роль ${u.name || u.email} изменена на ${newRole.toUpperCase()}`)
                                }}
                              >
                                <option value="user">USER</option>
                                <option value="admin">ADMIN</option>
                                <option value="director">DIRECTOR</option>
                              </select>
                            ) : (
                              <span className={`pill ${u.role==='director'?'pill-green':u.role==='admin'?'pill-amber':'pill-red'}`}>{(u.role||'user').toUpperCase()}</span>
                            )}
                          </td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>
                            <button style={{padding:'4px 10px',border:'1px solid var(--border)',background:'transparent',color:'var(--muted)',cursor:'pointer',fontFamily:'var(--mono)',fontSize:12}}
                              onClick={()=>{
                                const userBookings = bookings.filter(b=>b.userEmail===u.email)
                                toast(`${u.name||u.email}: ${userBookings.length} броней`)
                              }}>Брони</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {panel === 'gallery' && (
            <>
              <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300,marginBottom:24}}>Галерея</h1>

              {/* Загрузка фото */}
              <div style={{background:'var(--panel)',border:'1px solid var(--border)',padding:28,marginBottom:32}}>
                <div style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:300,marginBottom:20}}>Добавить фото</div>
                <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Подпись</label>
                    <input className="form-input" style={{width:200}} value={glLabel} onChange={e=>setGlLabel(e.target.value)} placeholder="Название фото"/>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Категория</label>
                    <select className="form-select" value={glCat} onChange={e=>setGlCat(e.target.value)}>
                      <option value="rooms">Комнаты</option>
                      <option value="actors">Актёры</option>
                      <option value="players">Игроки</option>
                    </select>
                  </div>
                  <div className="form-group" style={{margin:0}}>
                    <label className="form-label">Файл</label>
                    <input type="file" accept="image/*" className="form-input" style={{width:220,cursor:'pointer'}}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file || !glLabel.trim()) { toast('Введите подпись'); return }
                        setGlUploading(true)
                        const reader = new FileReader()
                        reader.onload = async ev => {
                          const img = ev.target?.result as string
                          const r = await fetch('/api/gallery', {
                            method:'POST',
                            headers:{'Content-Type':'application/json'},
                            body: JSON.stringify({ cat: glCat, label: glLabel.trim(), img, h: 240 })
                          })
                          const data = await r.json()
                          if (data.ok) {
                            setGallery(prev => [...prev, { id: data.id, cat: glCat, label: glLabel.trim(), img, h: 240 }])
                            setGlLabel('')
                            toast('✓ Фото добавлено')
                          }
                          setGlUploading(false)
                          e.target.value = ''
                        }
                        reader.readAsDataURL(file)
                      }}
                    />
                  </div>
                  {glUploading && <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)'}}>Загрузка…</div>}
                </div>
              </div>

              {/* Список фото */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:12}}>
                {gallery.map(g => (
                  <div key={g.id} style={{position:'relative',border:'1px solid var(--border)',overflow:'hidden'}}>
                    <img src={g.img} alt={g.label} style={{width:'100%',height:140,objectFit:'cover',display:'block'}}/>
                    <div style={{padding:'8px 10px',background:'var(--panel)'}}>
                      <div style={{fontSize:12,color:'var(--white)',fontWeight:300,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{g.label}</div>
                      <div style={{fontFamily:'var(--mono)',fontSize:10,color:'var(--muted)',marginBottom:8}}>{g.cat}</div>
                      <button
                        style={{width:'100%',padding:'4px 0',border:'1px solid rgba(200,0,10,.4)',background:'transparent',color:'var(--red)',cursor:'pointer',fontFamily:'var(--mono)',fontSize:11}}
                        onClick={async () => {
                          if (!confirm(`Удалить «${g.label}»?`)) return
                          await fetch(`/api/gallery/${g.id}`, { method:'DELETE' })
                          setGallery(prev => prev.filter(x => x.id !== g.id))
                          toast('✓ Удалено')
                        }}
                      >Удалить</button>
                    </div>
                  </div>
                ))}
              </div>
              {gallery.length === 0 && (
                <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',padding:40,textAlign:'center',border:'1px solid var(--border)'}}>
                  Галерея пуста — загрузите первое фото
                </div>
              )}
            </>
          )}

          {panel === 'reviews' && (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24,flexWrap:'wrap',gap:12}}>
                <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300}}>Отзывы</h1>
                <div style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.1em'}}>{reviews.length} отзывов</div>
              </div>
              {reviews.length === 0 ? (
                <div style={{fontFamily:'var(--mono)',fontSize:13,color:'var(--muted)',padding:40,textAlign:'center',border:'1px solid var(--border)'}}>
                  Отзывов пока нет
                </div>
              ) : (
                <div className={styles.tableWrap}>
                  <table style={{width:'100%',minWidth:600,borderCollapse:'collapse',fontSize:12.5}}>
                    <thead>
                      <tr>{['Имя','Квест','Оценка','Текст','Дата','Удалить'].map(h=>(
                        <th key={h} style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',textAlign:'left',fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.14em',color:'var(--muted)',fontWeight:300,whiteSpace:'nowrap'}}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {reviews.map((r: any) => (
                        <tr key={r.id}>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',color:'var(--white)',fontWeight:300,whiteSpace:'nowrap'}}>{r.name}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',fontSize:12,color:'var(--text-soft)',whiteSpace:'nowrap'}}>{r.quest}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',color:'var(--red)',fontFamily:'var(--mono)',fontSize:13,whiteSpace:'nowrap'}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',maxWidth:300,color:'var(--text-soft)',fontSize:12,lineHeight:1.5}}>{r.text}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',fontFamily:'var(--mono)',fontSize:11,color:'var(--muted)',whiteSpace:'nowrap'}}>{r.date}</td>
                          <td style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'}}>
                            <button
                              style={{padding:'4px 12px',border:'1px solid rgba(200,0,10,.4)',background:'transparent',color:'var(--red)',cursor:'pointer',fontFamily:'var(--mono)',fontSize:11}}
                              onClick={async () => {
                                if (!confirm(`Удалить отзыв от ${r.name}?`)) return
                                await fetch(`/api/reviews/${r.id}`, { method:'DELETE' })
                                setReviews((prev: any[]) => prev.filter((x: any) => x.id !== r.id))
                                toast('✓ Отзыв удалён')
                              }}
                            >Удалить</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {isDir && panel === 'finance' && (
            <>
              <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300,marginBottom:24}}>Финансы</h1>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'var(--border)'}}>
                {[
                  {l:'Выручка за месяц',  v: fmtMoney(monthRevenue)+' ₽',          s: confirmed.length ? `${confirmed.filter(b=>bookingDate(b).getMonth()===now2.getMonth()).length} подтв. броней` : 'нет броней'},
                  {l:'Выручка за год',    v: fmtMoney(yearRevenue)+' ₽',            s: `${confirmed.filter(b=>bookingDate(b).getFullYear()===now2.getFullYear()).length} подтв. броней`},
                  {l:'Всего выручки',     v: fmtMoney(totalRevenue)+' ₽',           s: `${confirmed.length} из ${bookings.length} броней`},
                  {l:'Средний чек',       v: avgCheck ? avgCheck.toLocaleString('ru-RU')+' ₽' : '—', s: 'по подтверждённым'},
                  {l:'Конверсия',         v: bookings.length ? conversion+'%' : '—', s: `${confirmed.length} подтв. / ${bookings.length} всего`},
                  {l:'Ожидают подтв.',    v: String(bookings.filter(b=>b.status==='pending').length),  s: 'броней в ожидании'},
                ].map(k=>(
                  <div key={k.l} style={{background:'var(--off-black)',padding:'28px 24px',borderLeft:'2px solid var(--red)'}}>
                    <div style={{fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.18em',color:'var(--muted)',marginBottom:8}}>{k.l}</div>
                    <div style={{fontFamily:'var(--serif)',fontSize:44,fontWeight:300,lineHeight:1}}>{k.v}</div>
                    <div style={{fontSize:13,color:'var(--muted)',marginTop:6,fontWeight:300}}>{k.s}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {isDir && panel === 'settings' && (
            <>
              <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300,marginBottom:24}}>Настройки</h1>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                {[{title:'Основные',fields:[{l:'Название',v:'ГРАНИ СТРАХА'},{l:'Телефон',v:'8 999 420 31 41'},{l:'Email',v:'granistraha526@gmail.com'},{l:'Адрес',v:'ул. Бабушкина, 66'}]},{title:'Бронирование',fields:[{l:'Мин. игроков',v:'2',t:'number'},{l:'Макс. игроков',v:'10',t:'number'},{l:'Отмена (часов)',v:'24',t:'number'},{l:'Предоплата %',v:'50',t:'number'}]}].map(block=>(
                  <div key={block.title} style={{background:'var(--panel)',border:'1px solid var(--border)',padding:28}}>
                    <div style={{fontFamily:'var(--serif)',fontSize:18,fontWeight:300,marginBottom:20}}>{block.title}</div>
                    {block.fields.map(f=><div key={f.l} className="form-group"><label className="form-label">{f.l}</label><input className="form-input" defaultValue={f.v} type={(f as {t?:string}).t||'text'}/></div>)}
                    <button className="form-submit" onClick={()=>toast('✓ Сохранено')}>Сохранить</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {panel === 'myprofile' && (
            <>
              <h1 style={{fontFamily:'var(--serif)',fontSize:30,fontWeight:300,marginBottom:24}}>Мой профиль</h1>
              <div style={{background:'var(--panel)',border:'1px solid var(--border)',padding:32,maxWidth:440}}>
                <div className="form-group"><label className="form-label">Имя</label><input className="form-input" value={profileName} onChange={e=>setProfileName(e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user.email} type="email" readOnly style={{opacity:.5}}/></div>
                <div className="form-group"><label className="form-label">Телефон</label><input className="form-input" value={profilePhone} onChange={e=>setProfilePhone(e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Роль</label><input className="form-input" value={user.role.toUpperCase()} readOnly style={{opacity:.4}}/></div>
                <div className="form-group"><label className="form-label">Новый пароль <span style={{color:'var(--muted)',fontSize:11}}>(оставьте пустым если не меняете)</span></label><input className="form-input" placeholder="••••••••" type="password" value={profilePwd} onChange={e=>setProfilePwd(e.target.value)}/></div>
                <button className="form-submit" onClick={saveProfile}>Сохранить изменения</button>
                <div style={{marginTop:16,textAlign:'center'}}>
                  <button onClick={()=>{logout();router.push('/')}} style={{background:'none',border:'none',color:'var(--muted)',cursor:'pointer',fontFamily:'var(--mono)',fontSize:12}}>← Выйти</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
