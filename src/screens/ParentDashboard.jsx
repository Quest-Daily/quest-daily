import { useState } from 'react'
import { CHILDREN, CHILD_ORDER, DEFAULT_SHOP_ITEMS } from '../data'
import Avatar from '../components/Avatar'
import { useLocalStorage } from '../hooks'

export default function ParentDashboard({ childState, quests, onUpdateQuests, onUpdate, onBack, onResetState }) {
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

function ManageQuestsPanel({ quests, onUpdateQuests, childState, onUpdate }) {
  const [editingId, setEditingId] = useState(null)
  const [addingSection, setAddingSection] = useState(null)

  const SECTIONS = [
    { key: 'morning',   label: 'Morning',   emoji: '☀️' },
    { key: 'afternoon', label: 'Afternoon', emoji: '🌤️' },
    { key: 'evening',   label: 'Evening',   emoji: '🌙' },
  ]

  function saveQuest(section, questId, updates) {
    onUpdateQuests(prev => ({
      ...prev,
      [section]: prev[section].map(q => q.id === questId ? { ...q, ...updates } : q),
    }))
    setEditingId(null)
  }

  function deleteQuest(section, questId) {
    if (!window.confirm('Remove this quest for everyone?')) return
    onUpdateQuests(prev => ({
      ...prev,
      [section]: prev[section].filter(q => q.id !== questId),
    }))
  }

  function addQuest(section, { icon, title, tickets }) {
    onUpdateQuests(prev => ({
      ...prev,
      [section]: [...prev[section], { id: `q-${Date.now()}`, icon, title, tickets }],
    }))
    setAddingSection(null)
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
    <div style={{
      background: '#fff',
      borderRadius: 22,
      padding: '28px 32px',
      boxShadow: '0 3px 14px rgba(58,51,64,.06)',
      marginBottom: 0,
    }}>
      {SECTIONS.map(({ key, label, emoji }, si) => (
        <div key={key} style={{ marginBottom: si < 2 ? 32 : 0 }}>
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#9a8fa6',
            }}>{emoji} {label}</div>
            <button
              onClick={() => { setAddingSection(key); setEditingId(null) }}
              style={{
                background: 'none',
                border: '1.5px solid #e0d4e8',
                color: '#a8689a',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11,
                letterSpacing: '0.08em',
                padding: '5px 13px',
                borderRadius: 999,
                cursor: 'pointer',
              }}>+ Add quest</button>
          </div>

          {/* Quest rows */}
          {(quests[key] || []).map(quest => (
            <div key={quest.id}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 0',
                borderBottom: '1px solid #f4eef7',
              }}>
                <span style={{ fontSize: 20, width: 26, textAlign: 'center', flexShrink: 0 }}>{quest.icon}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#3a3340' }}>{quest.title}</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: '#9a8fa6',
                  background: '#f6f0f9',
                  padding: '3px 9px',
                  borderRadius: 999,
                  flexShrink: 0,
                }}>{quest.tickets}🎟️</span>

                {/* Per-child toggles */}
                {CHILD_ORDER.map(childId => {
                  const disabled = childState[childId]?.disabledQuests || []
                  const enabled = !disabled.includes(quest.id)
                  return (
                    <button
                      key={childId}
                      onClick={() => toggleChild(childId, quest.id, enabled)}
                      title={`${enabled ? 'Disable' : 'Enable'} for ${CHILDREN[childId].name}`}
                      style={{
                        width: 28, height: 28,
                        borderRadius: '50%',
                        background: enabled ? CHILDREN[childId].theme.accent : '#ece6f0',
                        color: enabled ? '#fff' : '#b3a9be',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: 13,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                      }}
                    >{CHILDREN[childId].name[0]}</button>
                  )
                })}

                <button
                  onClick={() => { setEditingId(editingId === quest.id ? null : quest.id); setAddingSection(null) }}
                  style={{
                    background: editingId === quest.id ? '#efe2f5' : 'none',
                    border: 'none', borderRadius: 8,
                    padding: '4px 8px', cursor: 'pointer', fontSize: 14, flexShrink: 0,
                  }}>✏️</button>
                <button
                  onClick={() => deleteQuest(key, quest.id)}
                  style={{
                    background: 'none', border: 'none', borderRadius: 8,
                    padding: '4px 8px', cursor: 'pointer', fontSize: 13,
                    color: '#c9a0a0', flexShrink: 0,
                  }}>✕</button>
              </div>

              {editingId === quest.id && (
                <QuestForm
                  initial={quest}
                  onSave={updates => saveQuest(key, quest.id, updates)}
                  onCancel={() => setEditingId(null)}
                />
              )}
            </div>
          ))}

          {addingSection === key && (
            <QuestForm
              initial={{ icon: '⭐', title: '', tickets: 2 }}
              isNew
              onSave={q => addQuest(key, q)}
              onCancel={() => setAddingSection(null)}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function QuestForm({ initial, onSave, onCancel, isNew }) {
  const [icon, setIcon] = useState(initial.icon)
  const [title, setTitle] = useState(initial.title)
  const [tickets, setTickets] = useState(initial.tickets)

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({ icon: icon.trim() || '⭐', title: title.trim(), tickets: Math.max(1, Math.min(10, tickets)) })
  }

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
        flexWrap: 'wrap',
        gap: 10,
        alignItems: 'center',
      }}
    >
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
