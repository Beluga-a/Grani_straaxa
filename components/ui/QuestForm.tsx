'use client'
import { useState, useEffect } from 'react'
import { Quest, useQuests } from '@/lib/quests'
import { toast } from '@/lib/toast'
import Icon from '@/components/ui/Icon'
import styles from './QuestForm.module.css'

interface Props {
  quest?: Quest | null   // null = create mode
  onClose: () => void
}

const BIGS = [
  'linear-gradient(135deg,#100505,#060202)',
  'linear-gradient(135deg,#011001,#020602)',
  'linear-gradient(135deg,#010110,#020206)',
  'linear-gradient(135deg,#0f0a00,#070400)',
  'linear-gradient(135deg,#0f000f,#060006)',
  'linear-gradient(135deg,#000f0f,#000606)',
  'linear-gradient(135deg,#0a0000,#080000)',
  'linear-gradient(135deg,#000a00,#000600)',
]

const empty = {
  name: '', desc: '', fear: 3, diff: 3,
  playersMin: 2, playersMax: 6,
  timeMin: 60, age: '18+',
  priceNum: 1900, badge: '', cat: 'extreme' as Quest['cat'],
  tags: [] as string[], bg: BIGS[0],
  rating: '4.5',
}

export default function QuestForm({ quest, onClose }: Props) {
  const { addQuest, updateQuest } = useQuests()
  const isEdit = !!quest
  const [f, setF] = useState({ ...empty })
  const [tagInput, setTagInput] = useState('')
  const [err, setErr] = useState('')
  const [img, setImg] = useState(quest?.img ?? '')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (quest) {
      setF({
        name: quest.name, desc: quest.desc, fear: quest.fear, diff: quest.diff,
        playersMin: quest.playersMin, playersMax: quest.playersMax,
        timeMin: quest.timeMin, age: quest.age,
        priceNum: quest.priceNum, badge: quest.badge, cat: quest.cat,
        tags: [...quest.tags], bg: quest.bg, rating: quest.rating,
      })
      setImg(quest.img ?? '')
    }
  }, [quest])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setImg(data.url)
      else setErr('Ошибка загрузки изображения')
    } catch {
      setErr('Ошибка загрузки изображения')
    } finally {
      setUploading(false)
    }
  }

  const set = (k: string, v: unknown) => setF(prev => ({ ...prev, [k]: v }))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !f.tags.includes(t)) { set('tags', [...f.tags, t]); setTagInput('') }
  }
  const removeTag = (t: string) => set('tags', f.tags.filter(x => x !== t))

  const submit = () => {
    setErr('')
    if (!f.name.trim()) return setErr('Введите название квеста')
    if (!f.desc.trim()) return setErr('Введите описание')
    if (f.priceNum <= 0) return setErr('Укажите цену')
    if (f.playersMin >= f.playersMax) return setErr('Мин. игроков должно быть меньше макс.')

    const payload = {
      ...f,
      players: `${f.playersMin}–${f.playersMax}`,
      time: `${f.timeMin} мин`,
      price: `${f.priceNum.toLocaleString('ru')} ₽/чел`,
      img: img || undefined,
    }

    if (isEdit && quest) {
      updateQuest(quest.id, payload)
      toast('✓ Квест обновлён')
    } else {
      addQuest(payload)
      toast('✓ Квест добавлен')
    }
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Редактировать квест' : 'Добавить квест'}</h2>
          <button className={styles.close} onClick={onClose}><Icon name="close-x" size={16}/></button>
        </div>

        <div className={styles.body}>
          {err && <div className={styles.err}>{err}</div>}

          {/* Фото квеста */}
          <div className="form-group">
            <label className="form-label">Фотография квеста</label>
            <div className={styles.imgUploadArea} style={{ backgroundImage: img ? `url(${img})` : undefined, background: img ? undefined : f.bg }}>
              {!img && <Icon name="skull" size={48} style={{ opacity: .08 }} />}
              {uploading && <div className={styles.imgUploading}>Загрузка…</div>}
            </div>
            <div className={styles.imgControls}>
              <label className={styles.imgBtn}>
                {img ? 'Заменить фото' : 'Выбрать фото'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
              </label>
              {img && (
                <button className={styles.imgClear} onClick={() => setImg('')}>✕ Удалить</button>
              )}
              <span className={styles.imgHint}>JPG, PNG, AVIF, WebP — до 10 МБ</span>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Название *</label>
              <input className="form-input" value={f.name} onChange={e => set('name', e.target.value)} placeholder="Психиатрическая лечебница" />
            </div>
            <div className="form-group">
              <label className="form-label">Бейдж (Хит, Новинка…)</label>
              <input className="form-input" value={f.badge} onChange={e => set('badge', e.target.value)} placeholder="Хит" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Описание *</label>
            <textarea className="form-textarea" value={f.desc} onChange={e => set('desc', e.target.value)} placeholder="Краткое описание квеста…" />
          </div>

          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Уровень страха (1–5)</label>
              <input className="form-input" type="number" min={1} max={5} value={f.fear} onChange={e => set('fear', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Сложность (1–5)</label>
              <input className="form-input" type="number" min={1} max={5} value={f.diff} onChange={e => set('diff', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Время (мин)</label>
              <input className="form-input" type="number" min={30} max={180} value={f.timeMin} onChange={e => set('timeMin', +e.target.value)} />
            </div>
          </div>

          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Игроков мин.</label>
              <input className="form-input" type="number" min={1} max={20} value={f.playersMin} onChange={e => set('playersMin', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Игроков макс.</label>
              <input className="form-input" type="number" min={1} max={30} value={f.playersMax} onChange={e => set('playersMax', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Возраст</label>
              <select className="form-select" value={f.age} onChange={e => set('age', e.target.value)}>
                <option>14+</option><option>16+</option><option>18+</option>
              </select>
            </div>
          </div>

          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Цена (₽/чел)</label>
              <input className="form-input" type="number" min={100} value={f.priceNum} onChange={e => set('priceNum', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Категория</label>
              <select className="form-select" value={f.cat} onChange={e => set('cat', e.target.value as Quest['cat'])}>
                <option value="extreme">Экстрим</option>
                <option value="mystery">Загадки</option>
                <option value="classic">Классика</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Рейтинг</label>
              <input className="form-input" value={f.rating} onChange={e => set('rating', e.target.value)} placeholder="4.9" />
            </div>
          </div>

          {/* Цвет фона */}
          <div className="form-group">
            <label className="form-label">Цвет фона карточки</label>
            <div className={styles.bgGrid}>
              {BIGS.map(bg => (
                <div key={bg} className={`${styles.bgSwatch} ${f.bg === bg ? styles.bgSelected : ''}`}
                  style={{ background: bg }} onClick={() => set('bg', bg)} />
              ))}
            </div>
          </div>

          {/* Теги */}
          <div className="form-group">
            <label className="form-label">Теги</label>
            <div className={styles.tagRow}>
              <input className="form-input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Введите тег и нажмите Enter" style={{ flex: 1 }} />
              <button className={styles.tagAdd} onClick={addTag}>+</button>
            </div>
            {f.tags.length > 0 && (
              <div className={styles.tags}>
                {f.tags.map(t => (
                  <span key={t} className={styles.tag}>
                    {t} <button onClick={() => removeTag(t)}>✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className="btn btn-outline" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={submit}>
            {isEdit ? 'Сохранить изменения' : 'Добавить квест'}
          </button>
        </div>
      </div>
    </div>
  )
}
