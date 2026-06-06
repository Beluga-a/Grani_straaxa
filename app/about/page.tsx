
import { TEAM, ADVANTAGES, QUESTS } from '@/data'
import Footer from '@/components/layout/Footer'
import Icon, { type IconName } from '@/components/ui/Icon'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <>
      <div className="section-hero">
        <div className="eyebrow">О компании</div>
        <h1 className="h1">ГРАНИ СТРАХА</h1>
      </div>

      {/* ── STATS ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:1,background:'var(--border)'}}>
        {[{n:'7+',l:'лет работы'},{n:'12',l:'квестов'},{n:'50К+',l:'игроков'},{n:'4.9',l:'рейтинг'}].map(s=>(
          <div key={s.l} className="stat-cell"><div className="stat-num">{s.n}</div><div className="stat-label">{s.l}</div></div>
        ))}
      </div>

      {/* ── HISTORY ── */}
      <section className="section">
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:48,alignItems:'center',marginBottom:64}}>
          <div style={{height:420,position:'relative',overflow:'hidden',border:'1px solid var(--border)'}}>
            <img
              src="/about.png"
              alt="История компании"
              style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
            />
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,var(--red),transparent)'}}/>
          </div>
          <div>
            <div className="eyebrow">Наша история</div>
            <h2 style={{fontFamily:'var(--serif)',fontSize:36,fontWeight:300,marginBottom:20,lineHeight:1.1}}>Как всё начиналось</h2>
            <div className="rule"/>
            <p style={{fontSize:14,color:'var(--text-soft)',lineHeight:1.9,marginBottom:16,fontWeight:300}}>
              Мы начали в 2017 году с одной комнаты и большой мечты — создать в России хоррор-квест мирового уровня. Основатель компании Виктор Страхов вложил весь свой опыт театрального режиссёра, чтобы каждый квест стал настоящей постановкой, а не просто набором загадок в тёмной комнате.
            </p>
            <p style={{fontSize:14,color:'var(--text-soft)',lineHeight:1.9,marginBottom:16,fontWeight:300}}>
              К 2019 году у нас было уже 4 квеста и первые профессиональные актёры. Мы отказались от типовых декораций и создали собственную сценографическую мастерскую — теперь каждый элемент интерьера разрабатывается эксклюзивно для нас.
            </p>
            <p style={{fontSize:14,color:'var(--text-soft)',lineHeight:1.9,marginBottom:32,fontWeight:300}}>
              Сегодня ГРАНИ СТРАХА — это 12 уникальных сценариев, команда из 40+ человек, более 50 000 прошедших игроков и звание лучшего хоррор-квеста по версии независимых рейтингов 2023–2024.
            </p>
            <Link href="/quests" className="btn btn-outline">Посмотреть квесты →</Link>
          </div>
        </div>

        {/* ── TIMELINE ── */}
        <div className="eyebrow">Хронология</div>
        <h2 className="h2" style={{marginBottom:48}}>Как мы росли</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:1,background:'var(--border)',marginBottom:96}}>
          {[
            {year:'2017',title:'Первый квест',text:'Открытие «Психиатрической лечебницы». 80 м², 1 актёр, первые 100 игроков.'},
            {year:'2019',title:'Расширение',text:'4 квеста, собственная мастерская декораций, 5 000 игроков в год.'},
            {year:'2021',title:'Лес и катакомбы',text:'Открытие «Проклятого леса» и «Подземного склепа» — самые экстремальные квесты.'},
            {year:'2024',title:'Лучший в России',text:'50 000+ игроков, 12 квестов, награда лучшего хоррор-квеста года.'},
          ].map((e,i)=>(
            <div key={e.year} style={{
              background:'var(--black)',padding:'36px 28px',
              borderTop:`2px solid ${i===3?'var(--red)':'transparent'}`
            }}>
              <div style={{fontFamily:'var(--serif)',fontSize:48,fontWeight:300,lineHeight:1,color:'rgba(200,0,10,.2)',marginBottom:12}}>{e.year}</div>
              <div style={{fontFamily:'var(--serif)',fontSize:17,fontWeight:300,marginBottom:10}}>{e.title}</div>
              <div style={{fontSize:12,color:'var(--text-soft)',lineHeight:1.7,fontWeight:300}}>{e.text}</div>
            </div>
          ))}
        </div>

        {/* ── MISSION & VALUES ── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:32,marginBottom:64}}>
          <div style={{background:'var(--off-black)',border:'1px solid var(--border)',padding:40}}>
            <div className="eyebrow" style={{marginBottom:16}}>Миссия</div>
            <h3 style={{fontFamily:'var(--serif)',fontSize:26,fontWeight:300,marginBottom:20,lineHeight:1.2}}>Мы создаём не квесты — мы создаём воспоминания</h3>
            <div className="rule"/>
            <p style={{fontSize:13,color:'var(--text-soft)',lineHeight:1.9,fontWeight:300}}>
              Наша цель — дать людям опыт настоящего страха в безопасной среде. Не просто пройти квест, а пережить историю. Мы работаем на стыке театра, кино и игры — каждый сеанс уникален, каждая деталь продумана до миллиметра.
            </p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr',gap:1,background:'var(--border)'}}>
            {[
              {icon:'theater',title:'Театральный подход',text:'Профессиональные актёры с образованием, репетиции, живая импровизация.'},
              {icon:'home',title:'Авторские декорации',text:'Собственная мастерская. Ни один реквизит не куплен в магазине.'},
              {icon:'shield',title:'Безопасность прежде всего',text:'Кнопка стоп в каждой комнате. Круглосуточный мониторинг.'},
            ].map(v=>(
              <div key={v.icon} style={{background:'var(--black)',padding:'20px 24px',display:'flex',gap:16,alignItems:'flex-start'}}>
                <div style={{color:'var(--red)',flexShrink:0,paddingTop:2}}><Icon name={v.icon as IconName} size={18}/></div>
                <div>
                  <div style={{fontFamily:'var(--serif)',fontSize:15,fontWeight:300,marginBottom:4}}>{v.title}</div>
                  <div style={{fontSize:12,color:'var(--text-soft)',lineHeight:1.6,fontWeight:300}}>{v.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TEAM ── */}
        <div className="eyebrow">Команда</div>
        <h2 className="h2" style={{marginBottom:40}}>Те, кто создают страх</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:1,background:'var(--border)',marginBottom:96}}>
          {TEAM.map(t=>(
            <div key={t.name} style={{background:'var(--bg-card)',padding:'36px 24px',textAlign:'center'}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:'var(--panel)',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--red)',margin:'0 auto 16px'}}>
                <Icon name={t.icon as IconName} size={28}/>
              </div>
              <div style={{fontFamily:'var(--serif)',fontSize:17,fontWeight:300,marginBottom:6}}>{t.name}</div>
              <div style={{fontFamily:'var(--mono)',fontSize:12,letterSpacing:'.14em',color:'var(--red)'}}>{t.role}</div>
            </div>
          ))}
        </div>

        {/* ── AWARDS & MEDIA ── */}
        <div className="eyebrow">Награды и признание</div>
        <h2 className="h2" style={{marginBottom:40}}>Нас замечают</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'var(--border)',marginBottom:80}}>
          {[
            {icon:'trophy',title:'Лучший хоррор-квест 2023',text:'По версии независимого рейтинга QuestRating.ru — 1-е место в категории «Экстрим»'},
            {icon:'trophy',title:'Лучший хоррор-квест 2024',text:'По версии портала Questolog — абсолютный победитель года в своём городе'},
            {icon:'star',title:'5.0 в топ-рейтингах',text:'Квест «Проклятый лес» — единственный в регионе с оценкой 5.0 по версии нескольких платформ'},
          ].map(a=>(
            <div key={a.title} style={{background:'var(--black)',padding:'32px 28px'}}>
              <div style={{color:'var(--red)',marginBottom:14}}><Icon name={a.icon as IconName} size={22}/></div>
              <div style={{fontFamily:'var(--serif)',fontSize:16,fontWeight:300,marginBottom:8}}>{a.title}</div>
              <div style={{fontSize:12,color:'var(--text-soft)',lineHeight:1.7,fontWeight:300}}>{a.text}</div>
            </div>
          ))}
        </div>

        {/* ── CONTACTS ── */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:1,background:'var(--border)'}}>
          <div style={{background:'var(--off-black)',padding:'40px 36px'}}>
            <div className="eyebrow" style={{marginBottom:20}}>Контакты</div>
            <div style={{display:'grid',gap:16}}>
              {[
                {icon:'pin',label:'Адрес',val:'ул. Бабушкина, 66, 2-й этаж'},
                {icon:'clock',label:'Режим работы',val:'Пн–Вс 10:00–23:00'},
                {icon:'phone',label:'Телефон',val:'8 999 420 31 41'},
                {icon:'mail',label:'E-mail',val:'granistraha526@gmail.com'},
              ].map(c=>(
                <div key={c.label} style={{display:'flex',gap:14,alignItems:'flex-start'}}>
                  <div style={{color:'var(--red)',paddingTop:2,flexShrink:0}}><Icon name={c.icon as IconName} size={15}/></div>
                  <div>
                    <div style={{fontFamily:'var(--mono)',fontSize:10,letterSpacing:'.16em',color:'var(--muted)',marginBottom:3}}>{c.label}</div>
                    <div style={{fontSize:14,color:'var(--white)',fontWeight:300}}>{c.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:'var(--panel)',padding:'40px 36px',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div>
              <div className="eyebrow" style={{marginBottom:20}}>Работа с нами</div>
              <p style={{fontSize:13,color:'var(--text-soft)',lineHeight:1.8,fontWeight:300,marginBottom:24}}>
                Ищем профессиональных актёров, художников-декораторов и сценаристов. Если ты хочешь пугать людей и получать за это деньги — пиши.
              </p>
            </div>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <Link href="/booking" className="btn btn-primary">Забронировать квест</Link>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </>
  )
}
