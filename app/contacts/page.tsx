
'use client'
import { useState } from 'react'
import { toast } from '@/lib/toast'
import Icon, { type IconName } from '@/components/ui/Icon'
import Footer from '@/components/layout/Footer'
export default function ContactsPage() {
  const [name,setName]=useState('');const [contact,setContact]=useState('');const [msg,setMsg]=useState('')
  const [sending,setSending]=useState(false)
  const submit=async()=>{
    if(!name||!contact||!msg)return toast('Заполните все поля')
    setSending(true)
    try{
      const controller=new AbortController()
      const timer=setTimeout(()=>controller.abort(),12000)
      const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,contact,message:msg}),signal:controller.signal})
      clearTimeout(timer)
      if(!r.ok)throw new Error()
      setName('');setContact('');setMsg('');toast('Сообщение отправлено!')
    }catch{
      toast('Ошибка отправки. Попробуйте позже.')
    }finally{setSending(false)}
  }
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Контакты</div><h1 className="h1">Найди нас</h1></div>
      <section className="section">
        <div className="grid-contact" style={{maxWidth:1060,margin:"0 auto"}}>
          <div>
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
          <div style={{background:"var(--panel)",border:"1px solid var(--border)",padding:36,alignSelf:"start"}}>
            <div style={{fontFamily:"var(--serif)",fontSize:22,fontWeight:300,marginBottom:24}}>Написать нам</div>
            <div className="form-group"><label className="form-label">Имя</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="Ваше имя"/></div>
            <div className="form-group"><label className="form-label">Телефон / Email</label><input className="form-input" value={contact} onChange={e=>setContact(e.target.value)} placeholder="+7 или email"/></div>
            <div className="form-group"><label className="form-label">Сообщение</label><textarea className="form-textarea" value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ваш вопрос…"/></div>
            <button className="form-submit" onClick={submit} disabled={sending} style={{opacity:sending?0.7:1}}>{sending?'Отправка…':'Отправить'}</button>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  )
}
