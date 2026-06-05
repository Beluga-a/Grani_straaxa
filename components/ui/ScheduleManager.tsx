'use client'
import { useState } from 'react'
import { Quest, useQuests } from '@/lib/quests'
import { toast } from '@/lib/toast'
import styles from './ScheduleManager.module.css'

interface Props { quest: Quest; onClose: () => void }

const TIMES = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00']

function formatDate(d: string) {
  const [y,m,day] = d.split('-')
  return `${day}.${m}.${y}`
}

export default function ScheduleManager({ quest, onClose }: Props) {
  const { addSlot, removeSlot, freeSlot } = useQuests()
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('18:00')
  const [filter,  setFilter]  = useState('') // filter by date

  // group slots by date
  const byDate: Record<string, Quest['schedule']> = {}
  for (const s of quest.schedule) {
    if (!byDate[s.date]) byDate[s.date] = []
    byDate[s.date].push(s)
  }
  const sortedDates = Object.keys(byDate).sort()
  const filtered = filter ? sortedDates.filter(d => d === filter) : sortedDates

  const handleAdd = () => {
    if (!newDate) return toast('⚠ Выберите дату')
    // check duplicate
    const exists = quest.schedule.find(s => s.date === newDate && s.time === newTime)
    if (exists) return toast('⚠ Этот слот уже существует')
    addSlot(quest.id, { date: newDate, time: newTime })
    toast(`✓ Слот ${formatDate(newDate)} ${newTime} добавлен`)
  }

  const handleBulk = () => {
    // Add all times for selected date
    if (!newDate) return toast('⚠ Выберите дату')
    let added = 0
    for (const t of TIMES) {
      const exists = quest.schedule.find(s => s.date === newDate && s.time === t)
      if (!exists) { addSlot(quest.id, { date: newDate, time: t }); added++ }
    }
    toast(`✓ Добавлено ${added} слотов на ${formatDate(newDate)}`)
  }

  const stats = {
    total: quest.schedule.length,
    taken: quest.schedule.filter(s => s.taken).length,
    free:  quest.schedule.filter(s => !s.taken).length,
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Расписание: {quest.name}</h2>
            <div className={styles.stats}>
              <span className={styles.statItem}><span className={styles.statDot} />Всего: {stats.total}</span>
              <span className={styles.statItem} style={{color:'var(--red)'}}>Занято: {stats.taken}</span>
              <span className={styles.statItem} style={{color:'#00cc66'}}>Свободно: {stats.free}</span>
            </div>
          </div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* Add slot panel */}
          <div className={styles.addPanel}>
            <div className={styles.addPanelTitle}>Добавить слоты</div>
            <div className={styles.addRow}>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Дата</label>
                <input className="form-input" type="date" value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group" style={{flex:1}}>
                <label className="form-label">Время</label>
                <select className="form-select" value={newTime} onChange={e => setNewTime(e.target.value)}>
                  {TIMES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.addBtns}>
                <button className="btn btn-primary" style={{padding:'13px 18px',fontSize:13}} onClick={handleAdd}>
                  + Добавить
                </button>
                <button className="btn btn-outline" style={{padding:'13px 18px',fontSize:13}} onClick={handleBulk}>
                  + Весь день
                </button>
              </div>
            </div>
          </div>

          {/* Filter */}
          {sortedDates.length > 1 && (
            <div className={styles.filterRow}>
              <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--muted)',letterSpacing:'.12em'}}>Фильтр по дате:</span>
              <select className="form-select" style={{width:180}} value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="">Все даты</option>
                {sortedDates.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
              </select>
            </div>
          )}

          {/* Slots list */}
          {filtered.length === 0 ? (
            <div className={styles.empty}>Нет слотов. Добавьте расписание выше.</div>
          ) : (
            filtered.map(date => (
              <div key={date} className={styles.dateGroup}>
                <div className={styles.dateHeader}>
                  <span className={styles.dateLabel}>{formatDate(date)}</span>
                  <span className={styles.dateMeta}>
                    {byDate[date].filter(s=>s.taken).length} / {byDate[date].length} занято
                  </span>
                  <button className={styles.clearDate}
                    onClick={() => {
                      byDate[date].filter(s=>!s.taken).forEach(s => removeSlot(quest.id, s.id))
                      toast(`✓ Свободные слоты на ${formatDate(date)} удалены`)
                    }}>
                    Удалить свободные
                  </button>
                </div>
                <div className={styles.slotsGrid}>
                  {byDate[date].sort((a,b)=>a.time.localeCompare(b.time)).map(slot => (
                    <div key={slot.id} className={`${styles.slot} ${slot.taken ? styles.slotTaken : styles.slotFree}`}>
                      <span className={styles.slotTime}>{slot.time}</span>
                      {slot.taken && slot.bookedBy && (
                        <span className={styles.slotUser}>{slot.bookedBy.split('@')[0]}</span>
                      )}
                      <div className={styles.slotActions}>
                        {slot.taken && (
                          <button className={styles.slotBtn} title="Освободить"
                            onClick={() => { freeSlot(quest.id, slot.id); toast('✓ Слот освобождён') }}>
                            ↺
                          </button>
                        )}
                        {!slot.taken && (
                          <button className={`${styles.slotBtn} ${styles.slotBtnDel}`} title="Удалить"
                            onClick={() => { removeSlot(quest.id, slot.id); toast('✓ Слот удалён') }}>
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <button className="btn btn-outline" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  )
}
