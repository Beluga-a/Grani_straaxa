
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'
import Icon, { type IconName } from '@/components/ui/Icon'
import styles from './page.module.css'
type Scene={text:string;hp?:number;choices:{text:string;next:string}[];end?:string}
const STORY:Record<string,Scene>={
  start:{text:"<b>23:47.</b> Ты входишь в заброшенную психиатрическую лечебницу.\nДверь за тобой закрывается с глухим щелчком.\n\nВпереди — длинный тёмный коридор.\n<i>// Миссия: найти дневник доктора Соколова и выбраться живым.</i>",choices:[{text:"Идти по коридору вперёд",next:"corridor"},{text:"Осмотреть регистратуру справа",next:"reception"},{text:"Подождать — глаза привыкнут к темноте",next:"wait"}]},
  wait:{text:"Темнота сгущается. Где-то в глубине коридора — силуэт.\nОн не двигается. Но смотрит на тебя.\n\nПотом резко исчезает.",choices:[{text:"Бежать к силуэту",next:"chase"},{text:"Осторожно идти вперёд",next:"corridor"},{text:"Войти в регистратуру",next:"reception"}]},
  reception:{text:"Разбитые стёкла, карточки пациентов на полу.\nСтарый телефон вдруг <b style='color:var(--red)'>ЗВОНИТ</b>.\n\nТы поднимаешь трубку.\nДетский голос: <b style='color:var(--red)'>«Он знает, что ты здесь»</b>",choices:[{text:"Взять папку с документами",next:"documents"},{text:"Выйти в коридор",next:"corridor"}]},
  documents:{text:"В папке — записи эксперимента X-13.\nПоследняя запись доктора Соколова датирована <b style='color:var(--red)'>ноябрём 1987 года.</b>\n\nТы нашёл дневник.\n<i>// Осталось найти выход.</i>",choices:[{text:"Идти к лестнице на выход",next:"stairs"},{text:"Исследовать другие помещения",next:"corridor"}]},
  corridor:{text:"Коридор. Каждый шаг — скрип паркета.\nСправа — палата 6. Дверь открыта.\nВпереди — лестница наверх.\nСлева — подвал.",choices:[{text:"Войти в палату 6",next:"ward6"},{text:"Подняться на второй этаж",next:"floor2"},{text:"Спуститься в подвал",next:"basement"}]},
  ward6:{text:"Кровати в ряд. На стене — надписи, сделанные ногтями:\n<b style='color:var(--red)'>«ОН ПРИХОДИТ В 3»</b>\n<b style='color:var(--red)'>«ТЫ СЛЕДУЮЩИЙ»</b>\n\nТы смотришь на часы. 02:58.",choices:[{text:"Срочно выйти",next:"corridor"},{text:"Подождать три часа",next:"three_am"},{text:"Найти что-нибудь в палате",next:"ward6_item"}]},
  ward6_item:{text:"Под матрасом — записка:\n<b style='color:var(--red)'>«Подвал. Третья клетка слева. Ключ.»</b>",choices:[{text:"Идти в подвал",next:"basement"},{text:"Найти другой путь",next:"stairs"}]},
  three_am:{text:"03:00. Свет моргает. Потом гаснет.\n\nТи-ши-на.\n\nПотом — дыхание прямо у уха.\n\n<b style='color:var(--red)'>КОНЕЦ.</b>",end:"dead",choices:[]},
  floor2:{text:"Второй этаж. Лунный свет через разбитые окна.\n\nКабинет доктора Соколова — дверь заперта.",choices:[{text:"Взломать дверь",next:"office"},{text:"Поискать ключ",next:"floor2_key"}]},
  floor2_key:{text:"В горшке с засохшим цветком — <b style='color:var(--red)'>ключ.</b>",choices:[{text:"Открыть кабинет",next:"office"}]},
  office:{text:"Кабинет Соколова.\nДневник на столе — ты нашёл его.\n\nПоследняя запись:\n<b style='color:var(--red)'>«Субъект 13 не спит уже 11 дней.\nМы не можем его остановить.»</b>\n\n<i>// Беги.</i>",choices:[{text:"Бежать на выход",next:"stairs"}]},
  basement:{text:"Подвал. Холоднее. Темнее.\n\nВ углу — фигура. Сидит спиной к тебе.",hp:-1,choices:[{text:"Окликнуть фигуру",next:"basement_call"},{text:"Тихо взять ключ из третьей клетки",next:"got_key"},{text:"Уйти наверх",next:"corridor"}]},
  basement_call:{text:"— <b style='color:var(--red)'>«Я ждал тебя»</b> — говорит фигура, оборачиваясь.\n\nДоктор Соколов протягивает ключ.\n— <b style='color:var(--red)'>«Уходи. Не возвращайся.»</b>",choices:[{text:"Взять ключ и бежать",next:"got_key"}]},
  got_key:{text:"Ключ в руках.\n\nСзади — шаги. Быстрые.",choices:[{text:"БЕЖАТЬ!",next:"stairs"}]},
  chase:{text:"Ты несёшься за силуэтом. За углом — зеркало.\n\nВ отражении — ты, но на <b style='color:var(--red)'>секунду позже.</b>\n\nИз зеркала — рука.",hp:-1,choices:[{text:"Разбить зеркало",next:"secret_exit"},{text:"Бежать в коридор",next:"corridor"}]},
  secret_exit:{text:"За зеркалом — потайной проход.\n\nВнутри — ключ с биркой: <b style='color:var(--red)'>«Выход»</b>\n\nТы выходишь на улицу. Свежий воздух.\n\n<b style='color:#00cc66'>ТЫ ВЫЖИЛ. СЕКРЕТНЫЙ ФИНАЛ.</b>",end:"win_secret",choices:[]},
  stairs:{text:"Главная лестница. Холл. Выход.\nДверь заперта.\n\nПальцы трясутся. Ключ… есть ли у тебя ключ?",choices:[{text:"Да, у меня есть ключ → открыть",next:"win"},{text:"Нет ключа → выбить дверь",next:"win_hard"},{text:"Поискать другой выход",next:"basement"}]},
  win:{text:"Ключ подходит.\nДверь открывается.\n\nОглядываешься — в окне третьего этажа стоит силуэт. Смотрит.\n\n<b style='color:#00cc66'>ТЫ ВЫЖИЛ.</b>",end:"win",choices:[]},
  win_hard:{text:"С третьей попытки дверь вылетает.\nТы падаешь на улицу.\n\n<b style='color:#f0a500'>ВЫЖИЛ — ЕДВА.</b>",end:"win_hard",choices:[]},
}
const ENDS:Record<string,{title:string;icon:IconName;desc:string;col:string}>={
  win:{title:"Ты выжил",icon:"check",desc:"Нашёл дневник и выбрался. В реальном квесте — было бы страшнее.",col:"#00cc66"},
  win_hard:{title:"Выжил — едва",icon:"lightning",desc:"Силой и решимостью. Синяки будут.",col:"#f0a500"},
  win_secret:{title:"Секретный финал",icon:"key",desc:"Путь который находят 1 из 20. Настоящий детектив.",col:"#9b6dff"},
  dead:{title:"Ты не вышел",icon:"skull",desc:"Соколов ждал именно тебя.",col:"var(--red)"},
}
export default function SimulatorPage() {
  const [scene,setScene]=useState("start");const [hp,setHp]=useState(3);const [steps,setSteps]=useState(0)
  const s=STORY[scene]
  const go=(next:string)=>{const ns=STORY[next];if(!ns)return;const newHp=hp+(ns.hp||0);setHp(Math.max(0,newHp));setSteps(steps+1);setScene(newHp<=0?"three_am":next)}
  const reset=()=>{setScene("start");setHp(3);setSteps(0)}
  const endKey=s.end||(hp<=0?"dead":null)
  const end=endKey?ENDS[endKey]:null
  return (
    <>
      <div className="section-hero"><div className="eyebrow">Мини-квест</div><h1 className="h1">Сможешь выбраться?</h1></div>
      <section className="section" style={{maxWidth:720,margin:"0 auto"}}>
        <div className={styles.terminal}>
          {!end&&<>
            <div className={styles.hp}><span style={{fontFamily:"var(--mono)",fontSize:12,letterSpacing:".16em",color:"var(--muted)",marginRight:4}}>HP</span>{[...Array(3)].map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<hp?"var(--red)":"var(--muted2)"}}/>)}</div>
            <div style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--muted)",letterSpacing:".12em",marginBottom:20}}>Шаг {steps+1}</div>
          </>}
          {end&&(
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{marginBottom:20}}><Icon name={end.icon} size={56} style={{color:end.col}}/></div>
              <div style={{fontFamily:"var(--serif)",fontSize:32,fontWeight:300,color:end.col,marginBottom:12}}>{end.title}</div>
              <div style={{fontSize:13,color:"var(--text-soft)",maxWidth:400,margin:"0 auto 28px",lineHeight:1.7}}>{end.desc}</div>
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                <button className="btn btn-primary" onClick={reset}>Сыграть снова</button>
                <Link href="/booking" className="btn btn-outline">Попробовать настоящий квест</Link>
              </div>
            </div>
          )}
          {!end&&<>
            <div className={styles.output} dangerouslySetInnerHTML={{__html:s.text.replace(/\n/g,"<br/>")}}/>
            <div className={styles.choices}>
              {s.choices.map((c,i)=>(
                <button key={i} className={styles.choice} onClick={()=>go(c.next)}>
                  <span style={{color:"var(--red)",marginRight:10}}>[{i+1}]</span>{c.text}
                </button>
              ))}
            </div>
          </>}
        </div>
      </section>
      <Footer/>
    </>
  )
}
