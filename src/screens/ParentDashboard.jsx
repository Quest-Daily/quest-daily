import { CHILDREN, CHILD_ORDER, QUESTS, DEFAULT_SHOP_ITEMS } from '../data'
import Avatar from '../components/Avatar'

export default function ParentDashboard({ childState, onUpdate, onBack, onResetState }) {
  const allQuests = Object.values(QUESTS).flat()

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
                  const quests = QUESTS[part]
                  const done = state.completed[part].length
                  return (
                    <div key={part} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: '#6f6675', textTransform: 'capitalize' }}>
                          {part === 'morning' ? '☀️' : part === 'afternoon' ? '🌤️' : '🌙'} {part}
                        </span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#9a8fa6' }}>
                          {done}/{quests.length}
                        </span>
                      </div>
                      <div style={{ height: 6, background: '#f0e8e0', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{
                          width: `${quests.length ? (done / quests.length) * 100 : 0}%`,
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

      {/* Coming soon notice */}
      <div style={{
        background: '#fff',
        borderRadius: 22,
        padding: '32px 36px',
        boxShadow: '0 3px 14px rgba(58,51,64,.06)',
        marginBottom: 24,
      }}>
        <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, marginBottom: 10 }}>
          🚧 Coming next
        </h3>
        <p style={{ color: '#6f6675', lineHeight: 1.6, marginBottom: 16 }}>
          The parent dashboard is designed at spec level — the full build will include:
          manage quests &amp; ticket values, write noticeboard notes, approve reward suggestions,
          manage each child's shopfront, run Payday, and review history &amp; mood logs.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Manage quests', 'Noticeboard', 'Shop catalogue', 'Payday', 'Mood log', 'History'].map(item => (
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
