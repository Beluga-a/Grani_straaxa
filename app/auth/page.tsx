'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth, Role } from '@/lib/auth'
import { toast } from '@/lib/toast'
import Icon from '@/components/ui/Icon'
import styles from './page.module.css'

function AuthForm() {
  const router = useRouter()
  const params = useSearchParams()
  const returnUrl = params.get('returnUrl') ?? '/profile'
  const preQuest  = params.get('quest') ?? ''

  const { user, login, register, quickLogin, oauthLogin } = useAuth()
  const [tab, setTab]  = useState<'in' | 'up'>(params.get('tab') === 'up' ? 'up' : 'in')
  const [err, setErr]  = useState('')
  const [step, setStep] = useState<1 | 2>(1) // registration steps
  const [oauthLoading, setOauthLoading] = useState(false)

  // login
  const [email, setEmail] = useState('')
  const [pwd,   setPwd]   = useState('')
  const [showPwd, setShowPwd] = useState(false)

  // register step 1
  const [rName,  setRName]  = useState('')
  const [rLast,  setRLast]  = useState('')
  const [rPhone, setRPhone] = useState('')
  // register step 2
  const [rEmail, setREmail] = useState('')
  const [rPwd,   setRPwd]   = useState('')
  const [rPwd2,  setRPwd2]  = useState('')
  const [showRPwd, setShowRPwd] = useState(false)
  const [agree,  setAgree]  = useState(false)

  useEffect(() => { if (user) router.replace(returnUrl) }, [user])

  // Обрабатываем возврат после OAuth
  useEffect(() => {
    const oauthToken = params.get('oauth_token')
    const oauthError = params.get('oauth_error')
    if (oauthError) { setErr('Ошибка входа через соцсеть. Попробуйте ещё раз.'); return }
    if (!oauthToken) return
    setOauthLoading(true)
    oauthLogin(oauthToken).then(e => {
      setOauthLoading(false)
      if (e) { setErr(e); return }
      afterAuth()
    })
  }, [])

  const afterAuth = () => {
    toast('Добро пожаловать!')
    router.replace(returnUrl)
  }

  const doLogin = async () => {
    setErr('')
    if (!email || !pwd) return setErr('Введите email и пароль')
    const e = await login(email, pwd)
    if (e) return setErr(e)
    afterAuth()
  }

  const doRegStep1 = () => {
    setErr('')
    if (!rName || !rLast) return setErr('Введите имя и фамилию')
    setStep(2)
  }

  const doRegister = async () => {
    setErr('')
    if (!rEmail) return setErr('Введите email')
    if (rPwd.length < 6) return setErr('Пароль — минимум 6 символов')
    if (rPwd !== rPwd2)  return setErr('Пароли не совпадают')
    if (!agree)          return setErr('Примите условия использования')
    const e = await register({ name: rName, lastName: rLast, email: rEmail, phone: rPhone, password: rPwd, role: 'user', accessKey: '' })
    if (e) return setErr(e)
    afterAuth()
  }

  const quick = async (r: Role) => { await quickLogin(r); afterAuth() }

  const switchTab = (t: 'in' | 'up') => { setTab(t); setErr(''); setStep(1) }

  return (
    <div className={styles.wrap}>
      {preQuest && (
        <div className={styles.questHint}>
          <Icon name="calendar" size={13} />
          <span>Для бронирования <strong>«{preQuest}»</strong> нужен аккаунт</span>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.head}>
          <Link href="/" className={styles.logo}><span className={styles.dot} />ГРАНИ СТРАХА</Link>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${tab === 'in' ? styles.tabActive : ''}`} onClick={() => switchTab('in')}>Войти</button>
            <button className={`${styles.tab} ${tab === 'up' ? styles.tabActive : ''}`} onClick={() => switchTab('up')}>Регистрация</button>
          </div>
        </div>

        <div className={styles.body}>

          {oauthLoading && (
            <div style={{ textAlign: 'center', padding: '12px 0', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)' }}>
              Выполняется вход...
            </div>
          )}
          {/* OAuth провайдеры */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="/api/auth/google" className={styles.googleBtn}>
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                <path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#FFC107"/>
                <path d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.5 6.5 29.5 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" fill="#FF3D00"/>
                <path d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.3C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z" fill="#4CAF50"/>
                <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.2 5.3C37.2 39 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2"/>
              </svg>
              Войти через Google
            </a>
          </div>

          <div className={styles.divider}>или</div>

          {err && <div className={styles.err}>{err}</div>}

          {/* ── LOGIN ── */}
          {tab === 'in' && (
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" onKeyDown={e => e.key === 'Enter' && doLogin()} />
              </div>
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Пароль</label>
                <input className="form-input" type={showPwd ? 'text' : 'password'} value={pwd}
                  onChange={e => setPwd(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPwd(p => !p)}>
                  <Icon name={showPwd ? 'eye-off' : 'eye'} size={14} />
                </button>
              </div>
              <button className="form-submit" onClick={doLogin}>Войти</button>

              <div className={styles.divider} style={{ marginTop: 24 }}>Тест-аккаунты</div>
              <div className={styles.quickBtns}>
                <button className={styles.qbtn} onClick={() => quick('user')}><Icon name="user" size={12} /> User</button>
                <button className={`${styles.qbtn} ${styles.qbtnAdmin}`} onClick={() => quick('admin')}><Icon name="settings" size={12} /> Admin</button>
                <button className={`${styles.qbtn} ${styles.qbtnDirector}`} onClick={() => quick('director')}><Icon name="crown" size={12} /> Директор</button>
              </div>
            </>
          )}

          {/* ── REGISTER ── */}
          {tab === 'up' && (
            <>
              {/* progress */}
              <div className={styles.steps}>
                <div className={`${styles.stepDot} ${step >= 1 ? styles.stepActive : ''}`}>1</div>
                <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineDone : ''}`} />
                <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>2</div>
              </div>
              <div className={styles.stepLabel}>{step === 1 ? 'Личные данные' : 'Доступ и безопасность'}</div>

              {step === 1 && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Имя *</label>
                      <input className="form-input" value={rName} onChange={e => setRName(e.target.value.replace(/\d/g, ''))} placeholder="Алексей" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Фамилия *</label>
                      <input className="form-input" value={rLast} onChange={e => setRLast(e.target.value.replace(/\d/g, ''))} placeholder="Морозов" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Телефон <span className={styles.optional}>(необязательно)</span></label>
                    <input className="form-input" value={rPhone} onChange={e => setRPhone(e.target.value.replace(/[^\d\s+()\-\.]/g, ''))} placeholder="+7 (___) ___-__-__" />
                  </div>
                  <button className="form-submit" onClick={doRegStep1}>Далее →</button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" value={rEmail} onChange={e => setREmail(e.target.value)} placeholder="your@email.com" />
                  </div>
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">Пароль * <span className={styles.optional}>(мин. 6 символов)</span></label>
                    <input className="form-input" type={showRPwd ? 'text' : 'password'} value={rPwd} onChange={e => setRPwd(e.target.value)} placeholder="••••••••" />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowRPwd(p => !p)}>
                      <Icon name={showRPwd ? 'eye-off' : 'eye'} size={14} />
                    </button>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Повторите пароль *</label>
                    <input className="form-input" type="password" value={rPwd2} onChange={e => setRPwd2(e.target.value)} placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && doRegister()} />
                  </div>
                  {rPwd && rPwd2 && rPwd !== rPwd2 && (
                    <div className={styles.pwdMismatch}>Пароли не совпадают</div>
                  )}
                  <label className={styles.agreeRow}>
                    <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ accentColor: 'var(--red)' }} />
                    <span>Согласен с <Link href="/rules" style={{ color: 'var(--red)' }}>правилами</Link> и обработкой данных</span>
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setStep(1); setErr('') }}>← Назад</button>
                    <button className="form-submit" style={{ flex: 2, margin: 0 }} onClick={doRegister}>Создать аккаунт</button>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className={styles.foot}>
          {tab === 'in'
            ? <>Нет аккаунта? <button className={styles.footLink} onClick={() => switchTab('up')}>Зарегистрироваться</button></>
            : <>Уже есть аккаунт? <button className={styles.footLink} onClick={() => switchTab('in')}>Войти</button></>
          }
          {' · '}<Link href="/" style={{ color: 'var(--red)' }}>На главную</Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div style={{ width: '100%' }}>
      <Suspense>
        <AuthForm />
      </Suspense>
    </div>
  )
}
