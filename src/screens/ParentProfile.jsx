import { useState, useRef } from 'react'
import { useLocalStorage } from '../hooks'

const PARENT_THEME = {
  bg: '#fef3e8',
  accent: '#c27a3a',
  dashed: '#f5d5aa',
  shadow: 'rgba(194,122,58,.16)',
  shadowDeep: 'rgba(194,122,58,.24)',
  textMuted: '#9c6330',
}

export const PARENT_PROFILE = {
  id: 'jessie',
  name: 'Jessie',
  avatar: 'J',
  theme: PARENT_THEME,
}

const TODO_PRIORITIES = [
  { key: 'today',   label: 'Today',     bg: '#fde8ef', color: '#b5546a' },
  { key: 'week',    label: 'This week', bg: '#fae7c4', color: '#9c7a36' },
  { key: 'month',   label: 'This month',bg: '#e7f0e4', color: '#4e7a4f' },
  { key: 'someday', label: 'Someday',   bg: '#efe2f5', color: '#8a5a8a' },
]

const REMINDER_TIMEFRAMES = [
  { key: 'today',   label: 'Today' },
  { key: 'week',    label: 'This week' },
  { key: 'month',   label: 'This month' },
  { key: 'all',     label: 'All' },
]

const GROCERY_CATS = ['Fruit & Veg', 'Meat', 'Dairy', 'Bakery', 'Pantry', 'Drinks', 'Cleaning', 'Other']

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isThisWeek(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1); start.setHours(0,0,0,0)
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999)
  return d >= start && d <= end
}

function isThisMonth(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export default function ParentProfile({ onBack, parentName = 'Jessie' }) {
  const [photo] = useLocalStorage('photo_jessie', null)
  const [tab, setTab] = useState('todos')

  const TABS = [
    { key: 'todos',     label: '✓ To-do'    },
    { key: 'reminders', label: '🔔 Reminders' },
    { key: 'shopping',  label: '🛒 Shopping'  },
    { key: 'notes',     label: '📝 Notes'     },
  ]

  return (
    <div style={{
      minHeight: '100dvh',
      background: PARENT_THEME.bg,
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#3a3340',
    }}>
      {/* Header */}
      <div style={{
        background: PARENT_THEME.accent,
        padding: '48px 28px 28px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 20,
      }}>
        <button
          onClick={onBack}
          style={{
            position: 'absolute', top: 16, left: 16,
            background: 'rgba(255,255,255,.2)', border: 'none',
            borderRadius: 999, padding: '8px 16px',
            fontFamily: "'Space Mono', monospace", fontSize: 11,
            color: '#fff', cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >← Home</button>

        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          overflow: 'hidden', flexShrink: 0,
          background: 'rgba(255,255,255,.25)',
          border: '2px solid rgba(255,255,255,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {photo
            ? <img src={photo} alt={parentName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#fff' }}>
                {parentName[0]}
              </span>
          }
        </div>

        <div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,.7)', marginBottom: 4,
          }}>My space</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(30px, 6vw, 42px)',
            color: '#fff', lineHeight: 1,
          }}>{parentName}</h1>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        background: '#fff',
        display: 'flex',
        borderBottom: '1px solid #f0e8e0',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '14px 8px',
              border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              letterSpacing: '0.06em', color: tab === t.key ? PARENT_THEME.accent : '#9a8fa6',
              borderBottom: `2.5px solid ${tab === t.key ? PARENT_THEME.accent : 'transparent'}`,
              transition: 'color 0.15s, border-color 0.15s',
              fontWeight: tab === t.key ? 700 : 400,
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '28px 20px 80px' }}>
        {tab === 'todos'     && <TodosTab accentColor={PARENT_THEME.accent} />}
        {tab === 'reminders' && <RemindersTab accentColor={PARENT_THEME.accent} />}
        {tab === 'shopping'  && <ShoppingTab accentColor={PARENT_THEME.accent} />}
        {tab === 'notes'     && <NotesTab accentColor={PARENT_THEME.accent} />}
      </div>
    </div>
  )
}

function TodosTab({ accentColor }) {
  const [todos, setTodos] = useLocalStorage('quest-daily-jessie-todos', [])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('today')
  const [filter, setFilter] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  function addTodo() {
    const t = text.trim()
    if (!t) return
    setTodos(prev => [{
      id: `todo-${Date.now()}`,
      text: t, priority, done: false,
      createdAt: new Date().toISOString(),
    }, ...prev])
    setText('')
    inputRef.current?.focus()
  }

  function toggleDone(id) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setSpeechError(null)
    const rec = new SR()
    rec.lang = 'en-AU'
    rec.interimResults = false
    rec.onresult = e => {
      const heard = e.results[0][0].transcript
      setText(prev => prev ? prev + ' ' + heard : heard)
      setIsListening(false)
    }
    rec.onerror = e => {
      setSpeechError(e.error === 'not-allowed' ? 'Mic access denied' : 'Could not hear — try again')
      setIsListening(false)
    }
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  const doneCount = todos.filter(t => t.done).length

  const visible = todos.filter(t => {
    if (!showDone && t.done) return false
    if (filter === 'all') return true
    return t.priority === filter
  })

  return (
    <div>
      <style>{`@keyframes qjPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(194,122,58,.4) } 50% { box-shadow: 0 0 0 8px rgba(194,122,58,0) } }`}</style>

      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '20px', marginBottom: 16,
        boxShadow: '0 3px 14px rgba(58,51,64,.06)',
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {TODO_PRIORITIES.map(p => (
            <button
              key={p.key}
              onClick={() => setPriority(p.key)}
              style={{
                padding: '5px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: priority === p.key ? p.bg : '#f5f0f0',
                color: priority === p.key ? p.color : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                fontWeight: priority === p.key ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Add a task…"
            style={{
              flex: 1, border: '1.5px solid #e8ddd4', borderRadius: 12,
              padding: '11px 14px', fontSize: 15, outline: 'none',
              fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
              background: '#fdf8f4',
            }}
          />
          {voiceSupported && (
            <button
              onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false) } : startVoice}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: isListening ? accentColor : '#fef3e8',
                color: isListening ? '#fff' : accentColor,
                fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isListening ? 'qjPulse 1s ease-in-out infinite' : 'none',
                transition: 'background 0.2s',
              }}
            >🎤</button>
          )}
          <button
            onClick={addTodo}
            disabled={!text.trim()}
            style={{
              height: 44, padding: '0 20px', borderRadius: 999, border: 'none',
              background: text.trim() ? accentColor : '#e8ddd4',
              color: text.trim() ? '#fff' : '#9a8fa6',
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >Add</button>
        </div>
        {(isListening || speechError) && (
          <div style={{ fontSize: 12, color: accentColor, marginTop: 8 }}>
            {isListening ? 'Listening… speak now' : speechError}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {[{ key: 'all', label: 'All' }, ...TODO_PRIORITIES].map(p => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filter === p.key ? accentColor : '#fff',
              color: filter === p.key ? '#fff' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              fontWeight: filter === p.key ? 700 : 400,
              boxShadow: filter === p.key ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
              transition: 'all 0.15s',
            }}
          >{p.label}</button>
        ))}
        {doneCount > 0 && (
          <button
            onClick={() => setShowDone(v => !v)}
            style={{
              marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, border: 'none',
              background: showDone ? '#e7f0e4' : '#fff', color: showDone ? '#4e7a4f' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(58,51,64,.07)',
            }}
          >{showDone ? `Hide done (${doneCount})` : `Done (${doneCount})`}</button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="✅" title={todos.length === 0 ? 'No tasks yet' : 'All clear!'} sub={todos.length === 0 ? 'Add your first task above' : 'Nothing to show here'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map(todo => {
            const p = TODO_PRIORITIES.find(o => o.key === todo.priority) || TODO_PRIORITIES[0]
            return (
              <div key={todo.id} style={{
                background: '#fff', borderRadius: 16,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 2px 8px rgba(58,51,64,.05)',
                opacity: todo.done ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}>
                <button
                  onClick={() => toggleDone(todo.id)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${todo.done ? '#5b8a5c' : '#e8ddd4'}`,
                    background: todo.done ? '#e7f0e4' : '#fff',
                    cursor: 'pointer', fontSize: 12, padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#5b8a5c', transition: 'all 0.15s',
                  }}
                >{todo.done ? '✓' : ''}</button>
                <span style={{
                  flex: 1, fontSize: 15, color: '#3a3340',
                  textDecoration: todo.done ? 'line-through' : 'none',
                }}>{todo.text}</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 9,
                  background: p.bg, color: p.color,
                  padding: '3px 9px', borderRadius: 999, flexShrink: 0,
                }}>{p.label}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ background: 'none', border: 'none', fontSize: 14, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}
                >✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RemindersTab({ accentColor }) {
  const [reminders, setReminders] = useLocalStorage('quest-daily-jessie-reminders', [])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('today')

  const [text, setText] = useState('')
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('')
  const [repeat, setRepeat] = useState('none')

  const REPEATS = [
    { key: 'none',    label: 'Once' },
    { key: 'daily',   label: 'Daily' },
    { key: 'weekly',  label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ]

  function addReminder() {
    const t = text.trim()
    if (!t || !date) return
    setReminders(prev => [...prev, {
      id: `rem-${Date.now()}`,
      text: t, date, time, repeat, done: false,
    }])
    setText(''); setDate(todayStr()); setTime(''); setRepeat('none')
    setShowForm(false)
  }

  function dismissReminder(id) {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: true } : r))
  }

  function deleteReminder(id) {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const today = todayStr()
  const visible = reminders.filter(r => {
    if (r.done) return false
    if (filter === 'today')  return r.date === today
    if (filter === 'week')   return isThisWeek(r.date)
    if (filter === 'month')  return isThisMonth(r.date)
    return true
  }).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))

  const inputStyle = {
    border: '1.5px solid #e8ddd4', borderRadius: 12,
    padding: '10px 13px', fontSize: 14, outline: 'none',
    fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
    background: '#fdf8f4',
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {REMINDER_TIMEFRAMES.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filter === f.key ? accentColor : '#fff',
              color: filter === f.key ? '#fff' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              fontWeight: filter === f.key ? 700 : 400,
              boxShadow: filter === f.key ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
              transition: 'all 0.15s',
            }}
          >{f.label}</button>
        ))}
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            marginLeft: 'auto', padding: '6px 16px', borderRadius: 999,
            border: `1.5px solid ${accentColor}`, background: showForm ? accentColor : '#fff',
            color: showForm ? '#fff' : accentColor,
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            cursor: 'pointer', fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >+ Add</button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px',
          marginBottom: 16, boxShadow: '0 3px 14px rgba(58,51,64,.06)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What do you need to remember?"
            autoFocus
            style={{ ...inputStyle, width: '100%' }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Date</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Time (optional)</div>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Repeat</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {REPEATS.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRepeat(r.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: repeat === r.key ? '#fef3e8' : '#f5f0f0',
                    color: repeat === r.key ? accentColor : '#9a8fa6',
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                    fontWeight: repeat === r.key ? 700 : 400,
                  }}
                >{r.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={addReminder}
              disabled={!text.trim() || !date}
              style={{
                background: text.trim() && date ? accentColor : '#e8ddd4',
                color: text.trim() && date ? '#fff' : '#9a8fa6',
                border: 'none', borderRadius: 999,
                padding: '10px 22px', fontSize: 13, fontWeight: 600,
                cursor: text.trim() && date ? 'pointer' : 'default',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >Save reminder</button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: '#f5f0f0', color: '#6f6675', border: 'none', borderRadius: 999,
                padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >Cancel</button>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState icon="🔔" title="No reminders" sub={filter === 'today' ? 'Nothing due today' : filter === 'week' ? 'Nothing this week' : 'Add a reminder above'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(r => {
            const isOverdue = r.date < today
            const repeatLabel = r.repeat !== 'none' ? r.repeat : null
            return (
              <div key={r.id} style={{
                background: '#fff', borderRadius: 16,
                padding: '16px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                boxShadow: '0 2px 8px rgba(58,51,64,.05)',
                borderLeft: `3px solid ${isOverdue ? '#b5546a' : accentColor}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: '#3a3340', marginBottom: 5 }}>{r.text}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 10,
                      color: isOverdue ? '#b5546a' : '#9a8fa6',
                      fontWeight: isOverdue ? 700 : 400,
                    }}>
                      {isOverdue ? '⚠ ' : ''}{r.date}{r.time ? ` · ${r.time}` : ''}
                    </span>
                    {repeatLabel && (
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 9,
                        background: '#fef3e8', color: accentColor,
                        padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize',
                      }}>↻ {repeatLabel}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => dismissReminder(r.id)}
                    title="Mark done"
                    style={{
                      background: '#e7f0e4', color: '#4e7a4f', border: 'none',
                      borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                    }}
                  >✓ Done</button>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    style={{ background: 'none', border: 'none', fontSize: 14, color: '#c9a0a0', cursor: 'pointer', padding: '4px' }}
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ShoppingTab({ accentColor }) {
  const [items, setItems] = useLocalStorage('quest-daily-shopping', [])
  const [text, setText] = useState('')
  const [qty, setQty] = useState('')
  const [category, setCategory] = useState('Other')
  const [filterCat, setFilterCat] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [addedBy, setAddedBy] = useState('Jessie')
  const inputRef = useRef(null)

  function addItem() {
    const t = text.trim()
    if (!t) return
    setItems(prev => [...prev, {
      id: `shop-${Date.now()}`,
      text: t,
      qty: qty.trim() || null,
      category,
      done: false,
      addedBy,
      addedAt: new Date().toISOString(),
    }])
    setText(''); setQty('')
    inputRef.current?.focus()
  }

  function toggleItem(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function clearDone() {
    setItems(prev => prev.filter(i => !i.done))
  }

  const pendingCount = items.filter(i => !i.done).length
  const doneCount = items.filter(i => i.done).length

  const usedCats = [...new Set(items.map(i => i.category).filter(Boolean))]
  const allCats = [...new Set([...GROCERY_CATS, ...usedCats])]

  const visible = items.filter(i => {
    if (!showDone && i.done) return false
    if (filterCat === 'all') return true
    return i.category === filterCat
  })

  const grouped = {}
  visible.forEach(item => {
    const cat = item.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })

  const inputStyle = {
    border: '1.5px solid #e8ddd4', borderRadius: 12,
    padding: '10px 13px', fontSize: 14, outline: 'none',
    fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
    background: '#fdf8f4',
  }

  return (
    <div>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '18px 20px',
        marginBottom: 14, boxShadow: '0 3px 14px rgba(58,51,64,.06)',
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Adding as:</span>
          {['Jessie', 'Chris'].map(name => (
            <button
              key={name}
              onClick={() => setAddedBy(name)}
              style={{
                padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: addedBy === name ? '#fef3e8' : '#f5f0f0',
                color: addedBy === name ? accentColor : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                fontWeight: addedBy === name ? 700 : 400,
              }}
            >{name}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add item…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="Qty"
            style={{ ...inputStyle, width: 60, textAlign: 'center' }}
          />
          <button
            onClick={addItem}
            disabled={!text.trim()}
            style={{
              height: 44, padding: '0 18px', borderRadius: 999, border: 'none',
              background: text.trim() ? accentColor : '#e8ddd4',
              color: text.trim() ? '#fff' : '#9a8fa6',
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >Add</button>
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {allCats.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: category === c ? '#fef3e8' : '#f5f0f0',
                color: category === c ? accentColor : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 9,
                fontWeight: category === c ? 700 : 400,
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setFilterCat('all')}
          style={{
            padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: filterCat === 'all' ? accentColor : '#fff',
            color: filterCat === 'all' ? '#fff' : '#9a8fa6',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            fontWeight: filterCat === 'all' ? 700 : 400,
            boxShadow: filterCat === 'all' ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
          }}
        >All ({pendingCount})</button>
        {usedCats.map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filterCat === c ? accentColor : '#fff',
              color: filterCat === c ? '#fff' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              fontWeight: filterCat === c ? 700 : 400,
              boxShadow: filterCat === c ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
            }}
          >{c}</button>
        ))}
        {doneCount > 0 && (
          <>
            <button
              onClick={() => setShowDone(v => !v)}
              style={{
                marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, border: 'none',
                background: showDone ? '#e7f0e4' : '#fff', color: showDone ? '#4e7a4f' : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(58,51,64,.07)',
              }}
            >{showDone ? `Hide got (${doneCount})` : `Got (${doneCount})`}</button>
            {showDone && (
              <button
                onClick={clearDone}
                style={{
                  padding: '5px 12px', borderRadius: 999, border: 'none',
                  background: 'none', color: '#c9a0a0',
                  fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer',
                }}
              >Clear got</button>
            )}
          </>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="🛒" title="List is empty" sub="Add your first item above" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#9a8fa6', marginBottom: 8,
              }}>{cat}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {catItems.map(item => (
                  <div key={item.id} style={{
                    background: '#fff', borderRadius: 14,
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 2px 8px rgba(58,51,64,.05)',
                    opacity: item.done ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}>
                    <button
                      onClick={() => toggleItem(item.id)}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${item.done ? '#5b8a5c' : '#e8ddd4'}`,
                        background: item.done ? '#e7f0e4' : '#fff',
                        cursor: 'pointer', fontSize: 12, padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#5b8a5c', transition: 'all 0.15s',
                      }}
                    >{item.done ? '✓' : ''}</button>
                    <span style={{
                      flex: 1, fontSize: 15, color: '#3a3340',
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}>{item.text}</span>
                    {item.qty && (
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 11,
                        color: accentColor, background: '#fef3e8',
                        padding: '2px 9px', borderRadius: 999, flexShrink: 0,
                      }}>{item.qty}</span>
                    )}
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: '#c9a0a0', flexShrink: 0,
                    }}>{item.addedBy}</span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'none', border: 'none', fontSize: 14, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const NOTE_COLORS = [
  { key: 'amber',  bg: '#fef3e8', border: '#f5d5aa', color: '#9c6330' },
  { key: 'pink',   bg: '#fde8ef', border: '#f5c2d0', color: '#a0475e' },
  { key: 'green',  bg: '#e7f0e4', border: '#c2dabe', color: '#4e7a4f' },
  { key: 'blue',   bg: '#deeaf7', border: '#b3cfee', color: '#3d6a99' },
  { key: 'purple', bg: '#efe2f5', border: '#d3bce6', color: '#7a4a8a' },
]

function NotesTab({ accentColor }) {
  const [notes, setNotes] = useLocalStorage('quest-daily-family-notes', [])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const [text, setText] = useState('')
  const [author, setAuthor] = useState('Jessie')
  const [colorKey, setColorKey] = useState('amber')
  const [pinned, setPinned] = useState(false)

  function openNew() {
    setText(''); setAuthor('Jessie'); setColorKey('amber'); setPinned(false); setEditId(null)
    setShowForm(true)
  }

  function openEdit(note) {
    setText(note.text); setAuthor(note.author); setColorKey(note.colorKey || 'amber'); setPinned(note.pinned || false)
    setEditId(note.id); setShowForm(true)
  }

  function saveNote() {
    const t = text.trim()
    if (!t) return
    if (editId) {
      setNotes(prev => prev.map(n => n.id === editId ? { ...n, text: t, author, colorKey, pinned } : n))
    } else {
      setNotes(prev => [{
        id: `note-${Date.now()}`,
        text: t, author, colorKey, pinned,
        createdAt: new Date().toISOString(),
      }, ...prev])
    }
    setShowForm(false); setEditId(null)
  }

  function deleteNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  function togglePin(id) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#9a8fa6', margin: 0 }}>
          Leave notes for each other — pin the important ones to the top.
        </p>
        <button
          onClick={openNew}
          style={{
            padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${accentColor}`,
            background: '#fff', color: accentColor,
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            cursor: 'pointer', fontWeight: 600, flexShrink: 0, marginLeft: 12,
          }}
        >+ Note</button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px',
          marginBottom: 16, boxShadow: '0 3px 14px rgba(58,51,64,.06)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>From:</span>
            {['Jessie', 'Chris'].map(name => (
              <button
                key={name}
                onClick={() => setAuthor(name)}
                style={{
                  padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: author === name ? '#fef3e8' : '#f5f0f0',
                  color: author === name ? accentColor : '#9a8fa6',
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  fontWeight: author === name ? 700 : 400,
                }}
              >{name}</button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write your note here…"
            autoFocus
            rows={4}
            style={{
              border: '1.5px solid #e8ddd4', borderRadius: 12,
              padding: '12px 14px', fontSize: 15, outline: 'none',
              fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
              background: '#fdf8f4', resize: 'vertical', lineHeight: 1.5,
            }}
          />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Colour:</span>
            {NOTE_COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => setColorKey(c.key)}
                style={{
                  width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: c.bg,
                  outline: colorKey === c.key ? `2.5px solid ${c.color}` : '2px solid transparent',
                  outlineOffset: 2,
                  transition: 'outline 0.1s',
                }}
              />
            ))}
            <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#9a8fa6' }}>
              <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} style={{ accentColor }} />
              Pin to top
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={saveNote}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? accentColor : '#e8ddd4',
                color: text.trim() ? '#fff' : '#9a8fa6',
                border: 'none', borderRadius: 999,
                padding: '10px 22px', fontSize: 13, fontWeight: 600,
                cursor: text.trim() ? 'pointer' : 'default',
                fontFamily: "'Hanken Grotesk', sans-serif",
                transition: 'background 0.15s',
              }}
            >{editId ? 'Save' : 'Post note'}</button>
            <button
              onClick={() => { setShowForm(false); setEditId(null) }}
              style={{
                background: '#f5f0f0', color: '#6f6675', border: 'none', borderRadius: 999,
                padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon="📝" title="No notes yet" sub="Leave a note for Chris, or jot something down for yourself" />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14,
        }}>
          {sorted.map(note => {
            const c = NOTE_COLORS.find(x => x.key === note.colorKey) || NOTE_COLORS[0]
            const d = new Date(note.createdAt)
            const dateStr = `${d.getDate()}/${d.getMonth() + 1} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
            return (
              <div key={note.id} style={{
                background: c.bg,
                border: `1.5px solid ${c.border}`,
                borderRadius: 18, padding: '18px 18px 14px',
                display: 'flex', flexDirection: 'column', gap: 10,
                position: 'relative',
                boxShadow: note.pinned ? `0 4px 16px rgba(58,51,64,.1)` : '0 2px 8px rgba(58,51,64,.05)',
              }}>
                {note.pinned && (
                  <div style={{
                    position: 'absolute', top: -8, right: 14,
                    fontSize: 18,
                  }}>📌</div>
                )}
                <div style={{ fontSize: 15, color: '#3a3340', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{note.text}</div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: 'auto',
                }}>
                  <div>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 10,
                      color: c.color, fontWeight: 700,
                    }}>{note.author}</span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 10,
                      color: '#b3a9be', marginLeft: 8,
                    }}>{dateStr}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => togglePin(note.id)}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                      style={{
                        background: 'none', border: 'none', fontSize: 13,
                        color: note.pinned ? c.color : '#c9a0a0',
                        cursor: 'pointer', padding: '2px 4px',
                      }}
                    >📌</button>
                    <button
                      onClick={() => openEdit(note)}
                      style={{ background: 'none', border: 'none', fontSize: 13, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px' }}
                    >✏️</button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      style={{ background: 'none', border: 'none', fontSize: 13, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px' }}
                    >✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      padding: '36px 24px', textAlign: 'center',
      boxShadow: '0 3px 14px rgba(58,51,64,.05)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#3a3340', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9a8fa6' }}>{sub}</div>
    </div>
  )
}
