
'use client'
import { useState } from 'react'
import { toast } from '@/lib/toast'
import Icon, { type IconName } from '@/components/ui/Icon'
import Footer from '@/components/layout/Footer'

function validateContact(value: string): string | null {
  const v = value.trim()
  // Проверка email
  if (v.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'Введите корректный email'
  }
  // Проверка телефона — только цифры, +, -, пробелы, скобки; минимум 10 цифр
  const digits = v.replace(/\D/g, '')
  if (digits.length < 10) return 'Введите корректный телефон (минимум 10 цифр)'
  if (digits.length > 12) return 'Слишком длинный номер телефона'
  return null
}

function validateName(value: string): string | null {
  const v = value.trim()
  if (v.length < 2) return 'Имя должно содержать минимум 2 символа'
  if (v.length > 60) return 'Имя слишком длинное'
  if (/\d/.test(v)) return 'Имя не должно содержать цифры'
  return null
}

export default function ContactsPage() {
  const [name,    setName]    = useState('')
  const [contact, setContact] = useState('')
  const [msg,     setMsg]     = useState('')
  const [sending, setSending] = useState(false)
  const [errors,  setErrors]  = useState<{name?:string; contact?:string; msg?:string}>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim())    e.name    = 'Введите имя'
    else { const err = validateName(name); if (err) e.name = err }
    if (!contact.trim()) e.contact = 'Введите телефон или email'
    else { const err = validateContact(contact); if (err) e.contact = err }
    if (!msg.trim())     e.msg     = 'Введите сообщение'
    else if (msg.trim().length < 5) e.msg = 'Сообщение слишком короткое'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSending(true)
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 12000)
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), contact: contact.trim(), message: msg.trim() }),
        signal: controller.signal,
      })
      clearTimeout(timer)
      if (!r.ok) throw new Error()
      setName(''); setContact(''); setMsg('')
      toast('Сообщение отправлено!')
    } catch {
      toast('Ошибка отправки. Попробуйте позже.')
    } finally {
      setSending(false)
    }
  }

  const errStyle: React.CSSProperties = {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--red)',
    marginTop: 4,
    letterSpacing: '.04em',
  }

  const inputStyle = (hasErr: boolean): React.CSSProperties => hasErr
    ? { border: '1px solid var(--red)' }
    : {}

  return (
    <>
      <div className="section-hero"><div className="eyebrow">Контакты</div><h1 className="h1">Найди нас</h1></div>
      <section className="section">
        <div className="grid-contact" style={{maxWidth:1060,margin:"0 auto"}}>
          <div>
            {[
              {icon:"pin"   as IconName, label:"Адрес",   val:"ул. Бабушкина, 66, 2-й этаж\nВход с торца, красная дверь"},
              {icon:"phone" as IconName, label:"Телефон", val:"8 999 420 31 41\nПн–Вс 09:00–22:00"},
              {icon:"mail"  as IconName, label:"Email",   val:"granistraha526@gmail.com"},
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

            <div className="form-group">
              <label className="form-label">Имя</label>
              <input
                className="form-input"
                style={inputStyle(!!errors.name)}
                value={name}
                onChange={e=>{ setName(e.target.value); if(errors.name) setErrors(p=>({...p,name:undefined})) }}
                placeholder="Ваше имя"
              />
              {errors.name && <div style={errStyle}>⚠ {errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Телефон / Email</label>
              <input
                className="form-input"
                style={inputStyle(!!errors.contact)}
                value={contact}
                onChange={e=>{ setContact(e.target.value); if(errors.contact) setErrors(p=>({...p,contact:undefined})) }}
                placeholder="+7 или email"
              />
              {errors.contact && <div style={errStyle}>⚠ {errors.contact}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Сообщение</label>
              <textarea
                className="form-textarea"
                style={inputStyle(!!errors.msg)}
                value={msg}
                onChange={e=>{ setMsg(e.target.value); if(errors.msg) setErrors(p=>({...p,msg:undefined})) }}
                placeholder="Ваш вопрос…"
              />
              {errors.msg && <div style={errStyle}>⚠ {errors.msg}</div>}
            </div>

            <button
              className="form-submit"
              onClick={submit}
              disabled={sending}
              style={{opacity:sending?0.7:1}}
            >
              {sending ? 'Отправка…' : 'Отправить'}
            </button>
          </div>
        </div>
      </section>
      <Footer/>
    </>
  )
}
