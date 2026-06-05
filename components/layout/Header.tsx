'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'
import Icon from '@/components/ui/Icon'
import styles from './Header.module.css'

const NAV = [
  { label:'Квесты', href:'/quests', children:[{label:'Все квесты',href:'/quests'},{label:'Забронировать',href:'/booking'},{label:'Сертификаты',href:'/certificates'}]},
  { label:'О нас', href:'/about', children:[{label:'О компании',href:'/about'},{label:'Блог',href:'/blog'}]},
  { label:'Галерея', href:'/gallery'},
  { label:'Отзывы', href:'/reviews'},
  { label:'Интерактив', href:'/feartest', children:[{label:'Тест на страх',href:'/feartest'},{label:'Мини-квест',href:'/simulator'},{label:'Live-статус',href:'/livemap'}]},
  { label:'Инфо', href:'/contacts', children:[{label:'Контакты',href:'/contacts'},{label:'FAQ',href:'/faq'},{label:'Правила',href:'/rules'},{label:'Безопасность',href:'/safety'},{label:'История',href:'/lore'}]},
]
const ROLE_LABELS:Record<string,string>={user:'User',admin:'Admin',director:'Директор'}
const ROLE_CLS:Record<string,string>={user:styles.rbUser,admin:styles.rbAdmin,director:styles.rbDirector}

export default function Header() {
  const pathname  = usePathname()
  const router    = useRouter()
  const {user,logout} = useAuth()
  const {toggle,isDark} = useTheme()
  const [scrolled,  setScrolled]  = useState(false)
  const [open,      setOpen]      = useState(false)
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => {
    setMounted(true)
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Закрываем меню при переходе
  useEffect(() => { setOpen(false) }, [pathname])

  const logoSrc = !mounted || isDark ? '/logo-light.png' : '/logo-dark.png'

  const handleUser = () => {
    setOpen(false)
    if (!user) router.push('/auth')
    else router.push(user.role === 'user' ? '/profile' : '/admin')
  }

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 56px',height:scrolled?'52px':'64px'}} onClick={(e) => { if ((e.target as HTMLElement).closest('button[aria-label="Меню"]')) return; setOpen(false) }}>
        {/* Лого */}
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <Image src={logoSrc} alt="ГРАНИ СТРАХА" width={40} height={34} className="logo-img" priority />
          <span className={styles.logoText}>ГРАНИ СТРАХА</span>
        </Link>

        {/* Десктопная навигация */}
        <ul className={styles.center} style={{gap:'32px',listStyle:'none',alignItems:'center'}}>
          {NAV.map(item => (
            <li key={item.href} className={item.children ? styles.hasDrop : ''}>
              <Link href={item.href} className={`${styles.navLink} ${pathname.startsWith(item.href) && item.href !== '/' ? styles.active : ''}`}>
                {item.label}
              </Link>
              {item.children && (
                <div className={styles.drop}>
                  {item.children.map(c => <Link key={c.href} href={c.href} className={styles.dropLink}>{c.label}</Link>)}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Десктоп: правая панель */}
        <div className={styles.right} style={{alignItems:'center',gap:'14px'}}>
          <span className={styles.phone}>8 999 420 31 41</span>
          <button className="theme-toggle" onClick={toggle} title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
            {isDark ? <Icon name="sun" size={16}/> : <Icon name="moon" size={16}/>}
          </button>
          <button className={styles.userBtn} onClick={handleUser}>
            {mounted && user
              ? <>{user.name.split(' ')[0]}<span className={`${styles.roleBadge} ${ROLE_CLS[user.role]}`}>{ROLE_LABELS[user.role]}</span></>
              : 'Войти'}
          </button>
          <Link href="/booking" className={styles.bookBtn}>Забронировать</Link>
        </div>

        {/* Бургер (только мобиле) */}
        <button
          type="button"
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen(v => !v)}
          aria-label="Меню"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Мобильное меню — всегда в DOM, показывается через CSS */}
      <div className={`${styles.mobileMenu} ${open ? styles.mobileMenuOpen : ''}`} style={{top: scrolled ? '52px' : '64px'}}>
          {/* Навигация */}
          {NAV.map(item => (
            <div key={item.href} className={styles.mobileGroup}>
              <Link href={item.href} className={styles.mobileLink} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
              {item.children && (
                <div className={styles.mobileSub}>
                  {item.children.map(c => (
                    <Link key={c.href} href={c.href} className={styles.mobileSubLink} onClick={() => setOpen(false)}>
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Разделитель */}
          <div className={styles.mobileDivider} />

          {/* Смена темы */}
          <button type="button" className={styles.mobileTheme} onClick={toggle}>
            {isDark ? <Icon name="sun" size={16}/> : <Icon name="moon" size={16}/>}
            {isDark ? 'Светлая тема' : 'Тёмная тема'}
          </button>

          {/* Войти / профиль */}
          <button type="button" className={styles.mobileUser} onClick={handleUser}>
            <Icon name="users" size={16}/>
            {mounted && user
              ? <>{user.name.split(' ')[0]}<span className={`${styles.roleBadge} ${ROLE_CLS[user.role]}`}>{ROLE_LABELS[user.role]}</span></>
              : 'Войти'}
          </button>

          {/* Забронировать */}
          <Link href="/booking" className={`btn btn-primary ${styles.mobileBook}`} onClick={() => setOpen(false)}>
            Забронировать
          </Link>
        </div>
    </>
  )
}
