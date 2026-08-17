import { useState, useRef } from 'react'
import { CHILDREN, CHILD_ORDER, DEFAULT_SHOP_ITEMS, DAYS_OF_WEEK, DAY_LABELS } from '../data'
import Avatar from '../components/Avatar'
import { useLocalStorage } from '../hooks'
import { ALL_QUEST_IMAGES, resolveQuestImage } from '../assets/quests/index'

export default function ParentDashboard({ childState, quests, onUpdateQuests, onUpdate, onBack, onResetState }) {
  const [ticketValue, setTicketValue] = useLocalStorage('quest-daily-ticket-value', 0.50)
  const allQuests = Object.values(quests).flat()

  function handleSuggestion(childId, suggestionId, action) {
    onUpdate(childId, s => {
      const suggestion = s.suggestions.find(sg => sg.id === suggestionId)
      const newSuggestions = s.suggestions.map(sg =>
        sg.id === suggestionId ? { ...sg, status: action } : sg
      )
      let newShopItems = s.shopItems
      if (action === 'approved' && suggestion) {
        const newItem = {
          id: `suggest-${suggestionId}`,
          icon: '🌟',
          title: suggestion.title,
          ticketPrice: 30,
        }
        newShopItems = [...s.shopItems, newItem]
      }
      return { ...s, suggestions: newSuggestions, shopItems: newShopItems }
    })
  }

  // Collect all pending suggestions across all kids
  const allSuggestions = CHILD_ORDER.flatMap(id =>
    (childState[id]?.suggestions || [])
      .filter(s => s.status === 'pending')
      .map(s => ({ ...s, childId: id }))
  )

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fdf5f1',
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#3a3340',
      padding: '40px 32px 60px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
        <button
          onClick={onBack}
          style={{
            background: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '10px 18px',
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            color: '#3a3340',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(58,51,64,.08)',
          }}
        >← Home</button>
        <div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#a8689a',
            marginBottom: 2,
          }}>⚙️ Quest Daily</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(28px, 5vw, 40px)',
            color: '#3a3340',
          }}>Parent dashboard</h1>
        </div>
      </div>

      {/* Child photos */}
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 20 }}>Child photos</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 40,
      }}>
        {CHILD_ORDER.map(id => <PhotoCard key={id} child={CHILDREN[id]} />)}
      </div>

      {/* Kids overview */}
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 20 }}>Kids overview</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 40,
      }}>
        {CHILD_ORDER.map(id => {
          const child = CHILDREN[id]
          const state = childState[id]
          const totalDone = Object.values(state.completed).flat().length

          return (
            <div key={id} style={{
              background: '#fff',
              borderRadius: 22,
              padding: '24px 26px',
              boxShadow: '0 3px 14px rgba(58,51,64,.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                <Avatar child={child} size={56} />
                <div>
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 24,
                    color: '#3a3340',
                  }}>{child.name}</div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    color: child.theme.textMuted,
                    marginTop: 2,
                  }}>🔥 {state.streak}-day streak</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Stat label="Tickets" value={state.tickets} icon="🎟️" bg={child.theme.bg} color={child.theme.accent} />
                <Stat label="Quests done" value={`${totalDone}/${allQuests.length}`} icon="✓" bg="#e7f0e4" color="#5b8a5c" />
                <Stat label="Streak" value={`${state.streak} days`} icon="🔥" bg="#fce9d6" color="#c2702a" />
                <Stat label="Week" value={`${state.weekDays.filter(Boolean).length}/7`} icon="📅" bg="#faf0ec" color="#8a7f86" />
              </div>

              {/* Quest completion breakdown */}
              <div style={{ marginTop: 18 }}>
                {['morning', 'afternoon', 'evening'].map(part => {
                  const disabled = state.disabledQuests || []
                  const partQuests = (quests[part] || []).filter(q => !disabled.includes(q.id))
                  const done = state.completed[part].filter(id => partQuests.some(q => q.id === id)).length
                  return (
                    <div key={part} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#6f6675', textTransform: 'capitalize' }}>
                          {part === 'morning' ? '☀️' : part === 'afternoon' ? '🌤️' : '🌙'} {part}
                        </span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#9a8fa6' }}>
                          {done}/{partQuests.length}
                        </span>
                      </div>
                      <div style={{ height: 6, background: '#f0e8e0', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          width: `${partQuests.length ? (done / partQuests.length) * 100 : 0}%`,
                          height: '100%',
                          background: child.theme.accent,
                          borderRadius: 999,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Routines */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Routines</div>
                {[
                  { id: 'out-the-door', label: '🏫 Out the door', target: '8:15am' },
                  { id: 'ready-for-bed', label: '🛁 Ready for bed', target: '7:30pm' },
                ].map(r => {
                  const log = state.routines[r.id]
                  return (
                    <div key={r.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '7px 0',
                      borderBottom: '1px solid #f0e8e0',
                      fontSize: 14,
                    }}>
                      <span style={{ color: '#6f6675' }}>{r.label}</span>
                      <span style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 12,
                        color: log ? (log.onTime ? '#4e7a4f' : '#b5546a') : '#b3a99e',
                      }}>
                        {log ? `${log.time} · ${log.onTime ? 'On time' : 'Late'}` : `— · target ${r.target}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Reward suggestions */}
      {allSuggestions.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>
            🌟 Reward wishes
          </h2>
          <p style={{ color: '#6f6675', fontSize: 14, marginBottom: 20 }}>
            Your kids have suggested these rewards. Approve to add to their shop (default price: 30 tickets), or decline.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {allSuggestions.map(s => {
              const child = CHILDREN[s.childId]
              return (
                <div key={s.id} style={{
                  background: '#fff',
                  borderRadius: 18,
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  boxShadow: '0 3px 12px rgba(58,51,64,.06)',
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: 38, height: 38,
                    borderRadius: '50%',
                    background: child.theme.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 18, color: child.theme.accent,
                    flexShrink: 0,
                  }}>{child.avatar}</div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.title}</div>
                    {s.note && <div style={{ fontSize: 13, color: '#6f6675', marginTop: 2 }}>{s.note}</div>}
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9a8fa6', marginTop: 3 }}>
                      {child.name} · {s.date}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleSuggestion(s.childId, s.id, 'approved')}
                      style={{
                        background: '#e7f0e4', color: '#4e7a4f',
                        border: 'none', borderRadius: 999,
                        padding: '9px 18px', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                      }}
                    >✓ Add to shop</button>
                    <button
                      onClick={() => handleSuggestion(s.childId, s.id, 'declined')}
                      style={{
                        background: '#fbeef0', color: '#b5546a',
                        border: 'none', borderRadius: 999,
                        padding: '9px 14px', fontSize: 13,
                        cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                      }}
                    >✕</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Manage shops */}
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 6 }}>Manage shops</h2>
      <p style={{ color: '#6f6675', fontSize: 14, marginBottom: 20 }}>
        Photo a product in a shop or screenshot it online — AI reads the name and price automatically.
      </p>
      <ManageShopsPanel
        childState={childState}
        onUpdate={onUpdate}
        ticketValue={ticketValue}
        onSetTicketValue={setTicketValue}
      />

      {/* Manage quests */}
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, marginBottom: 20 }}>Manage quests</h2>
      <ManageQuestsPanel
        quests={quests}
        onUpdateQuests={onUpdateQuests}
        childState={childState}
        onUpdate={onUpdate}
      />

      {/* Coming soon notice */}
      <div style={{
        background: '#fff',
        borderRadius: 22,
        padding: '32px 36px',
        boxShadow: '0 3px 14px rgba(58,51,64,.06)',
        marginBottom: 24,
        marginTop: 40,
      }}>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, marginBottom: 10 }}>
          🚧 Coming next
        </h3>
        <p style={{ color: '#6f6675', lineHeight: 1.6, marginBottom: 16 }}>
          More parent tools on the way — write noticeboard notes, manage each child's shopfront, run Payday, and review history &amp; mood logs.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Noticeboard', 'Shop catalogue', 'Payday', 'Mood log', 'History'].map(item => (
            <span key={item} style={{
              background: '#efe2f5',
              color: '#8a5a8a',
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 999,
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* Reset button */}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
          onClick={() => {
            if (window.confirm('Reset all progress? This will clear all tickets, quests, and streaks.')) {
              onResetState()
            }
          }}
          style={{
            background: 'none',
            border: '1.5px solid #e0d0da',
            color: '#9a8fa6',
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            padding: '10px 22px',
            borderRadius: 999,
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}
        >Reset all progress</button>
      </div>
    </div>
  )
}

function compressProductImage(dataUrl, maxPx = 400) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.80))
    }
    img.src = dataUrl
  })
}

function compressImage(dataUrl, maxPx = 480) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.src = dataUrl
  })
}

function PhotoCard({ child }) {
  const [photo, setPhoto] = useLocalStorage(`photo_${child.id}`, null)
  const [error, setError] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = async ev => {
      const compressed = await compressImage(ev.target.result)
      try {
        setPhoto(compressed)
      } catch {
        setError('Photo too large to save — try a smaller image.')
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 18,
      padding: '22px 18px',
      boxShadow: '0 3px 14px rgba(58,51,64,.06)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72,
        borderRadius: 16,
        overflow: 'hidden',
        margin: '0 auto',
        background: child.theme.bg,
        boxShadow: `0 4px 12px ${child.theme.shadow}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {photo ? (
          <img src={photo} alt={child.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: child.theme.accent }}>
            {child.avatar}
          </span>
        )}
      </div>

      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: '#3a3340', margin: '12px 0 14px' }}>
        {child.name}
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <label style={{
          background: child.theme.bg, color: child.theme.accent,
          fontSize: 13, fontWeight: 600,
          padding: '8px 16px', borderRadius: 999,
          cursor: 'pointer',
          fontFamily: "'Hanken Grotesk', sans-serif",
          display: 'inline-block',
        }}>
          {photo ? '📷 Change' : '📷 Add photo'}
          <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </label>
        {photo && (
          <button onClick={() => setPhoto(null)} style={{
            background: '#fbeef0', color: '#b5546a',
            border: 'none', borderRadius: 999,
            padding: '8px 12px', fontSize: 13,
            cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
          }}>Remove</button>
        )}
      </div>
      {error && (
        <div style={{
          marginTop: 10, fontSize: 12,
          color: '#b5546a', fontFamily: "'Hanken Grotesk', sans-serif",
          lineHeight: 1.4,
        }}>{error}</div>
      )}
    </div>
  )
}

const SECTION_KEYS = ['morning', 'afternoon', 'evening']

function recurrenceBadge(q) {
  const rec = q.recurrence || 'daily'
  if (rec === 'daily') return null
  if (rec === 'weekly') {
    const days = (q.days || []).map(d => DAY_LABELS[d]?.[0]).join(' ')
    return days || null
  }
  if (rec === 'monthly') return `${q.dayOfMonth}th`
  if (rec === 'once') return q.date ? q.date.slice(5).replace('-', '/') : 'one-time'
  return null
}

function questMatchesDay(q, dayKey) {
  const rec = q.recurrence || 'daily'
  if (rec === 'daily') return true
  if (rec === 'weekly') return (q.days || []).includes(dayKey)
  return true
}

function ManageQuestsPanel({ quests, onUpdateQuests, childState, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [addingSection, setAddingSection] = useState(null)
  const [filterDay, setFilterDay] = useState('all')

  const SECTIONS = [
    { key: 'morning',   label: 'Morning',   emoji: '☀️' },
    { key: 'afternoon', label: 'Afternoon', emoji: '🌤️' },
    { key: 'evening',   label: 'Evening',   emoji: '🌙' },
  ]

  function saveQuest(questId, updates) {
    onUpdateQuests(prev => {
      const next = {}
      SECTION_KEYS.forEach(section => {
        next[section] = (prev[section] || []).map(q => q.id === questId ? { ...q, ...updates } : q)
      })
      return next
    })
    setEditingId(null)
  }

  function deleteQuest(questId) {
    if (!window.confirm('Remove this quest for everyone?')) return
    onUpdateQuests(prev => {
      const next = {}
      SECTION_KEYS.forEach(section => {
        next[section] = (prev[section] || []).filter(q => q.id !== questId)
      })
      return next
    })
  }

  function addQuest(defaultSection, { sections, icon, title, tickets, imageKey, selectedKids, recurrence, days, dayOfMonth, date }) {
    const newId = `q-${Date.now()}`
    const questData = { id: newId, icon, title, tickets, imageKey, recurrence, days, dayOfMonth, date }
    const targetSections = (sections && sections.length > 0) ? sections : [defaultSection]
    onUpdateQuests(prev => {
      const next = { ...prev }
      targetSections.forEach(section => {
        next[section] = [...(next[section] || []), questData]
      })
      return next
    })
    CHILD_ORDER.forEach(id => {
      if (!(selectedKids ?? CHILD_ORDER).includes(id)) {
        onUpdate(id, s => ({
          ...s,
          disabledQuests: [...(s.disabledQuests || []), newId],
        }))
      }
    })
    setAddingSection(null)
  }

  function clearAllQuests() {
    if (!window.confirm('Remove all quests? This cannot be undone.')) return
    onUpdateQuests({ morning: [], afternoon: [], evening: [] })
  }

  function toggleChild(childId, questId, currentlyEnabled) {
    onUpdate(childId, s => {
      const disabled = s.disabledQuests || []
      return {
        ...s,
        disabledQuests: currentlyEnabled
          ? [...disabled, questId]
          : disabled.filter(id => id !== questId),
      }
    })
  }

  return (
    <div style={{ background: '#fff', borderRadius: 22, padding: '28px 32px', boxShadow: '0 3px 14px rgba(58,51,64,.06)', marginBottom: 0 }}>

      {/* Day filter + clear */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#9a8fa6', letterSpacing: '0.12em', textTransform: 'uppercase', marginRight: 4 }}>Filter:</span>
        {['all', ...DAYS_OF_WEEK].map(day => (
          <button
            key={day}
            onClick={() => setFilterDay(day)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filterDay === day ? '#a8689a' : '#f6f0f9',
              color: filterDay === day ? '#fff' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              fontWeight: filterDay === day ? 700 : 400, letterSpacing: '0.06em',
              transition: 'all 0.15s',
            }}
          >{day === 'all' ? 'All' : DAY_LABELS[day]}</button>
        ))}
        <button
          onClick={clearAllQuests}
          style={{
            marginLeft: 'auto', padding: '5px 13px', borderRadius: 999,
            border: '1.5px solid #e0d4e8', background: 'none',
            color: '#c9a0a0', cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.06em',
          }}
        >Clear all</button>
      </div>

      {SECTIONS.map(({ key, label, emoji }, si) => {
        const sectionQuests = (quests[key] || []).filter(q =>
          filterDay === 'all' || questMatchesDay(q, filterDay)
        )
        return (
          <div key={key} style={{ marginBottom: si < 2 ? 32 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8fa6' }}>{emoji} {label}</div>
              <button
                onClick={() => { setAddingSection(key); setEditingId(null) }}
                style={{
                  background: 'none', border: '1.5px solid #e0d4e8', color: '#a8689a',
                  fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '0.08em',
                  padding: '5px 13px', borderRadius: 999, cursor: 'pointer',
                }}>+ Add quest</button>
            </div>

            {sectionQuests.length === 0 && (
              <div style={{ color: '#c4b8ce', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 13, padding: '8px 0' }}>
                No quests{filterDay !== 'all' ? ` on ${DAY_LABELS[filterDay]}` : ''} — add one above.
              </div>
            )}

            {sectionQuests.map(quest => {
              const badge = recurrenceBadge(quest)
              return (
                <div key={quest.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 0', borderBottom: '1px solid #f4eef7' }}>
                    {resolveQuestImage(quest.id, quest.imageKey)
                      ? <img src={resolveQuestImage(quest.id, quest.imageKey)} alt="" style={{ width: 32, height: 32, objectFit: 'contain', flexShrink: 0 }} />
                      : <span style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>{quest.icon}</span>
                    }
                    <span style={{ flex: 1, fontSize: 14, color: '#3a3340' }}>{quest.title}</span>
                    {badge && (
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 10,
                        color: '#a8689a', background: '#efe2f5',
                        padding: '2px 8px', borderRadius: 999, flexShrink: 0,
                      }}>{badge}</span>
                    )}
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 11,
                      color: '#9a8fa6', background: '#f6f0f9',
                      padding: '3px 9px', borderRadius: 999, flexShrink: 0,
                    }}>{quest.tickets}🎟️</span>

                    {CHILD_ORDER.map(childId => {
                      const disabled = childState[childId]?.disabledQuests || []
                      const enabled = !disabled.includes(quest.id)
                      return (
                        <button
                          key={childId}
                          onClick={() => toggleChild(childId, quest.id, enabled)}
                          title={`${enabled ? 'Disable' : 'Enable'} for ${CHILDREN[childId].name}`}
                          style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: enabled ? CHILDREN[childId].theme.accent : '#ece6f0',
                            color: enabled ? '#fff' : '#b3a9be',
                            border: 'none', cursor: 'pointer',
                            fontFamily: "'DM Serif Display', serif", fontSize: 13,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'background 0.2s',
                          }}
                        >{CHILDREN[childId].name[0]}</button>
                      )
                    })}

                    <button
                      onClick={() => { setEditingId(editingId === quest.id ? null : quest.id); setAddingSection(null) }}
                      style={{ background: editingId === quest.id ? '#efe2f5' : 'none', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>✏️</button>
                    <button
                      onClick={() => deleteQuest(quest.id)}
                      style={{ background: 'none', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 13, color: '#c9a0a0', flexShrink: 0 }}>✕</button>
                  </div>

                  {editingId === quest.id && (
                    <QuestForm
                      initial={quest}
                      onSave={updates => saveQuest(quest.id, updates)}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              )
            })}

            {addingSection === key && (
              <QuestForm
                initial={{ icon: '⭐', title: '', tickets: 2 }}
                isNew
                defaultSection={key}
                onSave={q => addQuest(key, q)}
                onCancel={() => setAddingSection(null)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

const RECURRENCE_OPTIONS = [
  { key: 'daily',   label: 'Every day' },
  { key: 'weekly',  label: 'Specific days' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'once',    label: 'One-time' },
]

const DAY_PARTS_FORM = ['morning', 'afternoon', 'evening']
const DAY_PART_LABELS_FORM = { morning: '☀️ Morning', afternoon: '🌤️ Afternoon', evening: '🌙 Evening' }

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function QuestForm({ initial, onSave, onCancel, isNew, defaultSection }) {
  const [icon, setIcon] = useState(initial.icon ?? '⭐')
  const [title, setTitle] = useState(initial.title ?? '')
  const [tickets, setTickets] = useState(initial.tickets ?? 2)
  const [imageKey, setImageKey] = useState(initial.imageKey ?? null)
  const [showPicker, setShowPicker] = useState(false)
  const [selectedKids, setSelectedKids] = useState([...CHILD_ORDER])
  const [recurrence, setRecurrence] = useState(initial.recurrence ?? 'daily')
  const [selectedDays, setSelectedDays] = useState(initial.days ?? [...DAYS_OF_WEEK])
  const [dayOfMonth, setDayOfMonth] = useState(initial.dayOfMonth ?? new Date().getDate())
  const [date, setDate] = useState(initial.date ?? todayISO())
  const [sections, setSections] = useState(initial._sections ?? (defaultSection ? [defaultSection] : ['morning']))

  function toggleKid(id) {
    setSelectedKids(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id])
  }
  function toggleDay(day) {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }
  function toggleSection(part) {
    setSections(prev => prev.includes(part) ? prev.filter(s => s !== part) : [...prev, part])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      icon: icon.trim() || '⭐',
      title: title.trim(),
      tickets: Math.max(1, Math.min(10, tickets)),
      imageKey: imageKey ?? undefined,
      selectedKids,
      recurrence,
      days: recurrence === 'weekly' ? selectedDays : undefined,
      dayOfMonth: recurrence === 'monthly' ? dayOfMonth : undefined,
      date: recurrence === 'once' ? date : undefined,
      sections,
    })
  }

  const currentSrc = imageKey
    ? ALL_QUEST_IMAGES.find(i => i.key === imageKey)?.src
    : resolveQuestImage(initial.id, null)

  const inputStyle = {
    border: '1.5px solid #e0d4e8',
    borderRadius: 10,
    padding: '9px 12px',
    fontSize: 14,
    fontFamily: "'Hanken Grotesk', sans-serif",
    background: '#fff',
    color: '#3a3340',
    outline: 'none',
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#faf6fc',
        borderRadius: 14,
        padding: '16px 18px',
        margin: '8px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <input
          value={icon}
          onChange={e => setIcon(e.target.value)}
          placeholder="⭐"
          maxLength={2}
          style={{ ...inputStyle, width: 52, textAlign: 'center', fontSize: 22, padding: '7px 6px' }}
        />
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Quest name"
          autoFocus
          style={{ ...inputStyle, flex: 1, minWidth: 160 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <input
            type="number"
            value={tickets}
            onChange={e => setTickets(Number(e.target.value))}
            min={1} max={10}
            style={{ ...inputStyle, width: 54, textAlign: 'center' }}
          />
          <span style={{ fontSize: 13, color: '#9a8fa6', whiteSpace: 'nowrap' }}>tickets</span>
        </div>
      </div>

      {/* Image picker */}
      <div>
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#9a8fa6', marginBottom: 8,
        }}>Quest image</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: '#fff', border: '1.5px solid #e0d4e8',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {currentSrc
              ? <img src={currentSrc} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
              : <span style={{ fontSize: 24 }}>{icon || '⭐'}</span>
            }
          </div>
          <button
            type="button"
            onClick={() => setShowPicker(v => !v)}
            style={{
              background: showPicker ? '#efe2f5' : '#fff',
              border: '1.5px solid #d3bce6', borderRadius: 999,
              padding: '7px 16px', fontSize: 13, fontWeight: 600,
              color: '#a8689a', cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}
          >{showPicker ? 'Close' : '🖼️ Change image'}</button>
          {imageKey && (
            <button
              type="button"
              onClick={() => setImageKey(null)}
              style={{
                background: 'none', border: 'none', fontSize: 12,
                color: '#b3a9be', cursor: 'pointer', padding: '4px 8px',
              }}
            >Reset to default</button>
          )}
        </div>

        {showPicker && (
          <div style={{
            marginTop: 10,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
            gap: 8,
            maxHeight: 260,
            overflowY: 'auto',
            padding: '4px 2px',
          }}>
            {ALL_QUEST_IMAGES.map(img => (
              <button
                key={img.key}
                type="button"
                onClick={() => { setImageKey(img.key); setShowPicker(false) }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '8px 4px',
                  background: imageKey === img.key ? '#efe2f5' : '#fff',
                  border: `1.5px solid ${imageKey === img.key ? '#a8689a' : '#e0d4e8'}`,
                  borderRadius: 12, cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                <img src={img.src} alt={img.label} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 8,
                  color: imageKey === img.key ? '#a8689a' : '#9a8fa6',
                  textAlign: 'center', lineHeight: 1.2,
                }}>{img.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recurrence */}
      <div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a8fa6', marginBottom: 8 }}>How often?</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {RECURRENCE_OPTIONS.map(opt => (
            <button key={opt.key} type="button" onClick={() => setRecurrence(opt.key)}
              style={{
                padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
                border: `1.5px solid ${recurrence === opt.key ? '#a8689a' : '#e0d4e8'}`,
                background: recurrence === opt.key ? '#efe2f5' : '#fff',
                color: recurrence === opt.key ? '#a8689a' : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                fontWeight: recurrence === opt.key ? 700 : 400, whiteSpace: 'nowrap',
              }}
            >{opt.label}</button>
          ))}
        </div>
        {recurrence === 'weekly' && (
          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
            {DAYS_OF_WEEK.map(day => {
              const sel = selectedDays.includes(day)
              return (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  style={{
                    flex: 1, padding: '7px 2px', borderRadius: 8, cursor: 'pointer',
                    border: `1.5px solid ${sel ? '#a8689a' : '#e0d4e8'}`,
                    background: sel ? '#efe2f5' : '#fff',
                    color: sel ? '#a8689a' : '#9a8fa6',
                    fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: sel ? 700 : 400,
                  }}
                >{DAY_LABELS[day][0]}</button>
              )
            })}
          </div>
        )}
        {recurrence === 'monthly' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#9a8fa6', fontFamily: "'Hanken Grotesk', sans-serif" }}>Day of month:</span>
            <input type="number" value={dayOfMonth}
              onChange={e => setDayOfMonth(Math.max(1, Math.min(31, Number(e.target.value))))}
              min={1} max={31} style={{ ...inputStyle, width: 60, textAlign: 'center', padding: '6px 8px' }} />
          </div>
        )}
        {recurrence === 'once' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#9a8fa6', fontFamily: "'Hanken Grotesk', sans-serif" }}>Date:</span>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ ...inputStyle, padding: '6px 10px' }} />
          </div>
        )}
      </div>

      {/* Section picker (new quests only) */}
      {isNew && (
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a8fa6', marginBottom: 8 }}>Also show in</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {DAY_PARTS_FORM.map(part => {
              const sel = sections.includes(part)
              return (
                <button key={part} type="button" onClick={() => toggleSection(part)}
                  style={{
                    flex: 1, padding: '7px 4px', borderRadius: 10, cursor: 'pointer',
                    border: `1.5px solid ${sel ? '#a8689a' : '#e0d4e8'}`,
                    background: sel ? '#efe2f5' : '#fff',
                    color: sel ? '#a8689a' : '#9a8fa6',
                    fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: sel ? 700 : 400,
                  }}
                >{DAY_PART_LABELS_FORM[part]}</button>
              )
            })}
          </div>
        </div>
      )}

      {/* Child assignment (new quests only) */}
      {isNew && (
        <div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a8fa6', marginBottom: 8 }}>Assign to</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {CHILD_ORDER.map(id => {
              const child = CHILDREN[id]
              const sel = selectedKids.includes(id)
              return (
                <button key={id} type="button" onClick={() => toggleKid(id)}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: 12,
                    border: `1.5px solid ${sel ? child.theme.accent : '#e0d4e8'}`,
                    background: sel ? child.theme.bg : '#fff',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, color: sel ? child.theme.accent : '#b3a9be' }}>{child.name[0]}</span>
                  <span style={{ fontSize: 11, color: sel ? child.theme.accent : '#9a8fa6' }}>{child.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="submit"
          style={{
            background: '#a8689a', color: '#fff',
            border: 'none', borderRadius: 999,
            padding: '9px 20px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
          }}
        >{isNew ? 'Add quest' : 'Save'}</button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: '#ece6f0', color: '#6f6675',
            border: 'none', borderRadius: 999,
            padding: '9px 16px', fontSize: 13,
            cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
          }}
        >Cancel</button>
      </div>
    </form>
  )
}

function Stat({ label, value, icon, bg, color }) {
  return (
    <div style={{
      background: bg,
      borderRadius: 14,
      padding: '12px 14px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700,
        fontSize: 16,
        color,
      }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9a8fa6', marginTop: 2 }}>{label}</div>
    </div>
  )
}

// ── Manage shops panel ─────────────────────────────────────────────────────

const DEFAULT_CATEGORIES = ['Gaming', 'Toys', 'Clothes', 'Food', 'Activities', 'Money']

function ManageShopsPanel({ childState, onUpdate, ticketValue, onSetTicketValue }) {
  const [showModal, setShowModal] = useState(false)
  const [savedCategories, setSavedCategories] = useLocalStorage(
    'quest-daily-categories',
    DEFAULT_CATEGORIES
  )

  // Merge saved + any categories already used on items (in case of old data)
  const allItemCategories = CHILD_ORDER.flatMap(id =>
    (childState[id]?.shopItems || []).map(i => i.category).filter(Boolean)
  )
  const categories = [...new Set([...savedCategories, ...allItemCategories])]

  function handleAdd({ name, emoji, photo, ticketPrice, children, category }) {
    // Persist new category for future use
    if (category && !savedCategories.map(c => c.toLowerCase()).includes(category.toLowerCase())) {
      const display = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
      setSavedCategories(prev => [...prev, display])
    }
    children.forEach(childId => {
      onUpdate(childId, s => ({
        ...s,
        shopItems: [...(s.shopItems || []), {
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          icon: emoji,
          title: name,
          ticketPrice,
          ...(photo ? { photo } : {}),
          ...(category ? { category } : {}),
        }],
      }))
    })
    setShowModal(false)
  }

  function deleteCategory(cat) {
    setSavedCategories(prev => prev.filter(c => c !== cat))
  }

  function removeItem(childId, itemId) {
    onUpdate(childId, s => ({
      ...s,
      shopItems: (s.shopItems || []).filter(item => item.id !== itemId),
    }))
  }

  return (
    <>
      <div style={{
        background: '#fff', borderRadius: 22,
        padding: '28px 32px',
        boxShadow: '0 3px 14px rgba(58,51,64,.06)',
        marginBottom: 40,
      }}>
        {/* Ticket value setting */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          background: '#faf6fc', borderRadius: 14,
          marginBottom: 24,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#3a3340', marginBottom: 2 }}>
              Ticket value
            </div>
            <div style={{ fontSize: 13, color: '#9a8fa6' }}>
              Used to auto-calculate ticket prices from real prices
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, color: '#6f6675', fontWeight: 600 }}>$</span>
            <input
              type="number"
              value={ticketValue}
              onChange={e => onSetTicketValue(Math.max(0.10, Number(e.target.value)))}
              step={0.25} min={0.10}
              style={{
                width: 64, textAlign: 'center',
                border: '1.5px solid #e0d4e8', borderRadius: 10,
                padding: '8px', fontSize: 15, fontWeight: 700,
                fontFamily: "'Space Mono', monospace", color: '#3a3340',
                outline: 'none', background: '#fff',
              }}
            />
            <span style={{ fontSize: 13, color: '#9a8fa6', whiteSpace: 'nowrap' }}>per ticket</span>
          </div>
        </div>

        {/* Category manager */}
        <CategoryManager
          categories={categories}
          onDelete={deleteCategory}
          onAdd={name => {
            const display = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
            if (!categories.map(c => c.toLowerCase()).includes(name.toLowerCase())) {
              setSavedCategories(prev => [...prev, display])
            }
          }}
        />

        {/* Big "Add from photo" CTA */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #a8689a, #8a5a8a)',
            color: '#fff',
            border: 'none', borderRadius: 18,
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 16,
            cursor: 'pointer', marginBottom: 28,
            boxShadow: '0 6px 20px rgba(168,104,154,.28)',
            textAlign: 'left',
          }}
        >
          <div style={{ fontSize: 38 }}>📸</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 21, marginBottom: 3 }}>
              Add to shop from photo
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.4 }}>
              Photo a toy in a shop or screenshot it online —<br />AI reads the name &amp; price automatically
            </div>
          </div>
          <div style={{ fontSize: 22, opacity: 0.7 }}>→</div>
        </button>

        {/* Per-child shop item lists */}
        {CHILD_ORDER.map((id, ci) => {
          const child = CHILDREN[id]
          const items = childState[id]?.shopItems || []
          return (
            <div key={id} style={{ marginBottom: ci < CHILD_ORDER.length - 1 ? 24 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar child={child} size={30} />
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: child.theme.textMuted, flex: 1,
                }}>{child.name}'s shop</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11, color: '#9a8fa6',
                }}>{items.length} item{items.length !== 1 ? 's' : ''}</div>
              </div>
              {items.length === 0 ? (
                <div style={{ fontSize: 13, color: '#b3a9be', padding: '8px 0', fontStyle: 'italic' }}>
                  No items yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map(item => (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', background: '#faf6fc', borderRadius: 12,
                    }}>
                      {item.photo ? (
                        <img src={item.photo} alt={item.title} style={{
                          width: 38, height: 38, objectFit: 'contain',
                          borderRadius: 8, background: '#fff', flexShrink: 0,
                        }} />
                      ) : (
                        <span style={{ fontSize: 22, width: 38, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                      )}
                      <span style={{ flex: 1, fontSize: 14, color: '#3a3340' }}>{item.title}</span>
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 11,
                        color: '#9a8fa6', background: '#fff',
                        padding: '3px 9px', borderRadius: 999, flexShrink: 0,
                      }}>{item.ticketPrice} 🎟️</span>
                      <button
                        onClick={() => removeItem(id, item.id)}
                        style={{
                          background: 'none', border: 'none', fontSize: 13,
                          color: '#c9a0a0', cursor: 'pointer', padding: '4px 6px', flexShrink: 0,
                        }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showModal && (
        <AddFromPhotoModal
          ticketValue={ticketValue}
          categories={categories}
          onAdd={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

// ── Category manager ──────────────────────────────────────────────────────

function CategoryManager({ categories, onDelete, onAdd }) {
  const [newCat, setNewCat] = useState('')
  const inputRef = useRef(null)

  function submit() {
    const val = newCat.trim()
    if (!val) return
    onAdd(val)
    setNewCat('')
    inputRef.current?.focus()
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: 11,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: '#9a8fa6', marginBottom: 10,
      }}>Shop categories</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
        {categories.map(cat => (
          <div key={cat} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#f0e8f8', borderRadius: 999,
            padding: '5px 10px 5px 14px',
            fontSize: 12, fontWeight: 600, color: '#7a5a8a',
            fontFamily: "'Hanken Grotesk', sans-serif",
          }}>
            {cat}
            <button
              onClick={() => onDelete(cat)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#b090c8', fontSize: 11, padding: '0 2px', lineHeight: 1,
              }}
            >✕</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          ref={inputRef}
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a category…"
          style={{
            flex: 1,
            border: '1.5px solid #e0d4e8', borderRadius: 10,
            padding: '8px 12px', fontSize: 13, outline: 'none',
            fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
            background: '#faf6fc',
          }}
        />
        <button
          onClick={submit}
          disabled={!newCat.trim()}
          style={{
            background: newCat.trim() ? '#a8689a' : '#e0d4e8',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            cursor: newCat.trim() ? 'pointer' : 'default',
            fontFamily: "'Hanken Grotesk', sans-serif",
            transition: 'background 0.15s',
          }}
        >Add</button>
      </div>
    </div>
  )
}

// ── Add-from-photo modal ───────────────────────────────────────────────────

function AddFromPhotoModal({ ticketValue, categories, onAdd, onClose }) {
  const [step, setStep] = useState('pick') // 'pick' | 'analyzing' | 'form'
  const [preview, setPreview] = useState(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎁')
  const [category, setCategory] = useState('')
  const [detectedPrice, setDetectedPrice] = useState(null)
  const [ticketPrice, setTicketPrice] = useState(20)
  const [selectedKids, setSelectedKids] = useState([...CHILD_ORDER])
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    const reader = new FileReader()
    reader.onload = async ev => {
      const compressed = await compressProductImage(ev.target.result)
      setPreview(compressed)
      setStep('analyzing')

      const [header, base64Data] = compressed.split(',')
      const mimeType = header.match(/:(.*?);/)[1]

      try {
        const res = await fetch('/api/analyze-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Data, mimeType }),
        })
        if (!res.ok) throw new Error('API error')
        const result = await res.json()
        if (result.error) throw new Error(result.error)

        setName(result.name || '')
        setEmoji(result.emoji || '🎁')
        if (result.price && ticketValue > 0) {
          setDetectedPrice(result.price)
          setTicketPrice(Math.max(1, Math.round(result.price / ticketValue)))
        }
        setStep('form')
      } catch {
        setError('Could not auto-detect — please fill in the details below.')
        setStep('form')
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function toggleKid(id) {
    setSelectedKids(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id])
  }

  function handleAdd() {
    if (!name.trim() || selectedKids.length === 0) return
    onAdd({ name: name.trim(), emoji, photo: preview, ticketPrice: Math.max(1, ticketPrice), children: selectedKids, category: category.trim() || undefined })
  }

  const canSubmit = name.trim().length > 0 && selectedKids.length > 0

  const inputStyle = {
    border: '1.5px solid #e0d4e8', borderRadius: 12,
    padding: '11px 14px', fontSize: 15,
    fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
    background: '#fff', outline: 'none', width: '100%',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(58,51,64,.55)',
      display: 'flex', alignItems: 'flex-end',
      backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <style>{`@keyframes qdSpin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>

      <div style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        padding: '28px 28px 48px',
        width: '100%', maxWidth: 540,
        margin: '0 auto',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#3a3340' }}>
            Add to shop
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f0e8e0', border: 'none', borderRadius: '50%',
              width: 36, height: 36, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f6675',
            }}
          >×</button>
        </div>

        {/* STEP: pick */}
        {step === 'pick' && (
          <label style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 14, padding: '48px 24px',
            border: '2.5px dashed #d3bce6', borderRadius: 20,
            cursor: 'pointer', background: '#faf6fc',
          }}>
            <div style={{ fontSize: 56 }}>📸</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#3a3340', textAlign: 'center' }}>
              Take or upload a photo
            </div>
            <div style={{ color: '#9a8fa6', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>
              Photo a toy in a shop, or screenshot it online —<br />AI will read the name and price for you
            </div>
            <div style={{
              background: '#a8689a', color: '#fff',
              borderRadius: 999, padding: '11px 28px',
              fontSize: 14, fontWeight: 600,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}>Choose photo</div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </label>
        )}

        {/* STEP: analyzing */}
        {step === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            {preview && (
              <img src={preview} alt="Product" style={{
                width: 160, height: 160, objectFit: 'contain', borderRadius: 18,
                background: '#faf6fc', display: 'block', margin: '0 auto 24px',
                boxShadow: '0 4px 16px rgba(58,51,64,.1)',
              }} />
            )}
            <div style={{ fontSize: 36, marginBottom: 12, display: 'inline-block', animation: 'qdSpin 1.2s linear infinite' }}>✨</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#3a3340', marginBottom: 6 }}>
              Analysing with AI...
            </div>
            <div style={{ color: '#9a8fa6', fontSize: 14 }}>Finding the product name and price</div>
          </div>
        )}

        {/* STEP: form */}
        {step === 'form' && (
          <>
            {/* Photo preview */}
            {preview && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
                <img src={preview} alt="Product" style={{
                  width: 130, height: 130, objectFit: 'contain', borderRadius: 18,
                  background: '#faf6fc', boxShadow: '0 4px 16px rgba(58,51,64,.1)',
                }} />
              </div>
            )}

            {error && (
              <div style={{
                background: '#fff8e1', color: '#8a6800',
                borderRadius: 12, padding: '10px 14px',
                fontSize: 13, marginBottom: 16, lineHeight: 1.4,
              }}>{error}</div>
            )}

            {/* Name + emoji */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                maxLength={2}
                style={{
                  width: 56, textAlign: 'center', fontSize: 26,
                  border: '1.5px solid #e0d4e8', borderRadius: 12,
                  padding: '10px 6px', flexShrink: 0, background: '#faf6fc', outline: 'none',
                }}
              />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Product name"
                autoFocus
                style={{ ...inputStyle, flex: 1 }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#9a8fa6', marginBottom: 8,
              }}>Category (optional)</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {(categories || []).map(c => (
                  <button
                    key={c}
                    onClick={() => setCategory(category === c.toLowerCase() ? '' : c.toLowerCase())}
                    style={{
                      background: category === c.toLowerCase() ? '#efe2f5' : '#f5f0f9',
                      color: category === c.toLowerCase() ? '#a8689a' : '#9a8fa6',
                      border: `1.5px solid ${category === c.toLowerCase() ? '#d3bce6' : 'transparent'}`,
                      borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                    }}
                  >{c}</button>
                ))}
              </div>
              <input
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="or type a new category…"
                style={{ ...inputStyle, fontSize: 13 }}
              />
            </div>

            {/* Ticket price */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#9a8fa6', marginBottom: 8,
              }}>Ticket price</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="number"
                  value={ticketPrice}
                  onChange={e => setTicketPrice(Math.max(1, Number(e.target.value)))}
                  min={1}
                  style={{
                    width: 84, textAlign: 'center',
                    border: '1.5px solid #e0d4e8', borderRadius: 12,
                    padding: '10px', fontSize: 20, fontWeight: 700,
                    fontFamily: "'Space Mono', monospace", color: '#3a3340',
                    background: '#fff', outline: 'none',
                  }}
                />
                <div>
                  <div style={{ fontSize: 15, color: '#3a3340', fontWeight: 600 }}>tickets</div>
                  {ticketValue > 0 && (
                    <div style={{ fontSize: 12, color: '#9a8fa6', marginTop: 2 }}>
                      = ${(ticketPrice * ticketValue).toFixed(2)} value
                      {detectedPrice ? ` · detected $${detectedPrice.toFixed(2)}` : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Child selector */}
            <div style={{ marginBottom: 26 }}>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#9a8fa6', marginBottom: 10,
              }}>Add to whose shop?</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {CHILD_ORDER.map(id => {
                  const child = CHILDREN[id]
                  const sel = selectedKids.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleKid(id)}
                      style={{
                        flex: 1, padding: '14px 8px',
                        borderRadius: 16,
                        border: `2px solid ${sel ? child.theme.accent : '#e0d4e8'}`,
                        background: sel ? child.theme.bg : '#fff',
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{
                        fontFamily: "'DM Serif Display', serif", fontSize: 22, lineHeight: 1,
                        color: sel ? child.theme.accent : '#b3a9be',
                      }}>{child.avatar}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: sel ? child.theme.accent : '#9a8fa6' }}>
                        {child.name}
                      </span>
                      {sel && <span style={{ fontSize: 11, color: child.theme.accent }}>✓</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleAdd}
              disabled={!canSubmit}
              style={{
                width: '100%',
                background: canSubmit ? '#a8689a' : '#e0d4e8',
                color: canSubmit ? '#fff' : '#9a8fa6',
                border: 'none', borderRadius: 999,
                padding: '16px 0', fontSize: 16, fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'default',
                fontFamily: "'Hanken Grotesk', sans-serif",
                transition: 'background 0.2s',
              }}
            >
              {canSubmit
                ? `Add to ${selectedKids.length === 1 ? `${CHILDREN[selectedKids[0]].name}'s shop` : `${selectedKids.length} shops`}`
                : 'Select a name and child'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
