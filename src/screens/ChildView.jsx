import { useState } from 'react'
import { CHILDREN, QUESTS, SIDE_QUESTS, NOTICES, ROUTINES, MOODS } from '../data'
import { useClock } from '../hooks'
import Avatar from '../components/Avatar'
import TicketShape from '../components/TicketShape'
import { printQuestComplete, printQuestSheet } from '../utils/printer'

const DAY_PARTS = ['morning', 'afternoon', 'evening']
const DAY_PART_LABELS = { morning: '☀️ Morning', afternoon: '🌤️ Afternoon', evening: '🌙 Evening' }

export default function ChildView({ childId, state, onUpdate, onBack, onOpenShop, onSuggestReward }) {
  const child = CHILDREN[childId]
  const clock = useClock()
  const [activeTab, setActiveTab] = useState('morning')
  const [ticketPop, setTicketPop] = useState(false)

  function popTickets() {
    setTicketPop(true)
    setTimeout(() => setTicketPop(false), 450)
  }

  function toggleQuest(dayPart, questId) {
    const quest = QUESTS[dayPart].find(q => q.id === questId)
    if (!quest) return
    const isDone = state.completed[dayPart].includes(questId)
    if (!isDone) {
      const newTickets = state.tickets + quest.tickets
      const newCompleted = [...state.completed[dayPart], questId]
      const sectionDone = newCompleted.length === QUESTS[dayPart].length
      printQuestComplete({
        childName: child.name,
        questTitle: quest.title,
        ticketsEarned: quest.tickets,
        totalTickets: newTickets,
        sectionDone,
        section: dayPart,
      })
    }
    onUpdate(s => ({
      ...s,
      tickets: isDone ? Math.max(0, s.tickets - quest.tickets) : s.tickets + quest.tickets,
      completed: {
        ...s.completed,
        [dayPart]: isDone
          ? s.completed[dayPart].filter(id => id !== questId)
          : [...s.completed[dayPart], questId],
      },
    }))
    if (!isDone) popTickets()
  }

  function clockIn(routineId) {
    const h = clock.raw.getHours().toString().padStart(2, '0')
    const m = clock.raw.getMinutes().toString().padStart(2, '0')
    const logged = `${h}:${m}`
    const routine = ROUTINES.find(r => r.id === routineId)
    const [targetH, targetM] = routine.target.split(':').map(Number)
    const targetMins = targetH * 60 + targetM + (routine.ampm === 'pm' ? 12 * 60 : 0)
    const loggedMins = parseInt(h) * 60 + parseInt(m)
    const onTime = loggedMins <= targetMins
    if (onTime) {
      printQuestComplete({
        childName: child.name,
        questTitle: `${routine.title} - On time!`,
        ticketsEarned: 1,
        totalTickets: state.tickets + 1,
      })
    }
    onUpdate(s => ({
      ...s,
      tickets: onTime ? s.tickets + 1 : s.tickets,
      routines: { ...s.routines, [routineId]: { time: logged, onTime } },
    }))
    if (onTime) popTickets()
  }

  function setMood(idx) {
    onUpdate(s => ({ ...s, mood: s.mood === idx ? null : idx }))
  }

  function toggleVoice() {
    onUpdate(s => ({ ...s, voiceRecording: !s.voiceRecording }))
  }

  function printSection(part) {
    printQuestSheet({
      childName: child.name,
      sections: [{ label: DAY_PART_LABELS[part], quests: QUESTS[part] }],
      allDay: false,
    })
  }

  function printAllDay() {
    printQuestSheet({
      childName: child.name,
      sections: DAY_PARTS.map(part => ({ label: DAY_PART_LABELS[part], quests: QUESTS[part] })),
      allDay: true,
    })
  }

  function claimSideQuest(questId) {
    const sq = SIDE_QUESTS.find(q => q.id === questId)
    if (!sq) return
    printQuestComplete({
      childName: child.name,
      questTitle: sq.title,
      ticketsEarned: sq.tickets,
      totalTickets: state.tickets + sq.tickets,
    })
    onUpdate(s => ({
      ...s,
      tickets: s.tickets + sq.tickets,
      claimedSideQuests: [...s.claimedSideQuests, questId],
    }))
    popTickets()
  }

  const currentQuests = QUESTS[activeTab]
  const doneCurrent = state.completed[activeTab].length
  const totalCurrent = currentQuests.length
  const progressPct = totalCurrent ? (doneCurrent / totalCurrent) * 100 : 0

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fdf5f1',
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#3a3340',
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 100,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          border: 'none',
          borderRadius: 999,
          padding: '10px 18px',
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          color: '#3a3340',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(58,51,64,.12)',
          letterSpacing: '0.04em',
        }}
      >← Home</button>

      {/* Print all button */}
      <button
        onClick={printAllDay}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 100,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          border: 'none',
          borderRadius: 999,
          padding: '10px 18px',
          fontFamily: "'Space Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: child.theme.accent,
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(58,51,64,.12)',
          lineHeight: 1.4,
          textAlign: 'center',
        }}
      >PRINT ALL<br/>DAILY QUESTS</button>

      {/* Identity header */}
      <div style={{
        background: child.theme.bg,
        padding: '60px 48px 40px',
        textAlign: 'center',
      }}>
        <Avatar child={child} size={104} square />
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 46,
          lineHeight: 1.1,
          color: '#3a3340',
          marginTop: 18,
        }}>{child.name}</h1>
        <div style={{
          fontFamily: "'Roboto Mono', monospace",
          fontSize: 18,
          letterSpacing: '0.06em',
          color: child.theme.targetColor,
          marginTop: 10,
        }}>{clock.date}</div>
        <div style={{
          fontFamily: "'Roboto Mono', monospace",
          fontWeight: 700,
          fontSize: 50,
          color: '#3a3340',
          marginTop: 2,
        }}>{clock.time}</div>
        <div
          className={ticketPop ? 'ticket-pop' : ''}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 9,
            marginTop: 20,
            background: '#fff',
            color: child.theme.textMuted,
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '0.04em',
            padding: '12px 24px',
            borderRadius: 999,
            boxShadow: `0 3px 12px ${child.theme.shadow}`,
          }}
        >🎟️ {state.tickets} {state.tickets === 1 ? 'TICKET' : 'TICKETS'}</div>
      </div>

      {/* Noticeboard */}
      <div style={{ padding: '40px 44px 12px' }}>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: child.theme.accent,
          marginBottom: 26,
        }}>Today · {clock.date}</div>
        <div style={{
          display: 'flex',
          gap: 28,
          justifyContent: 'center',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}>
          {NOTICES.map(note => (
            <div
              key={note.id}
              style={{
                position: 'relative',
                width: 'clamp(160px, 22vw, 216px)',
                minHeight: 200,
                background: '#fae7c4',
                borderRadius: 3,
                padding: '32px 20px 22px',
                boxShadow: '0 6px 14px rgba(58,51,64,.1)',
                transform: `rotate(${note.rotation}deg)`,
              }}
            >
              {/* Washi tape strip */}
              <div style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: `translateX(-50%) rotate(${-note.rotation * 1.5}deg)`,
                width: 84,
                height: 24,
                background: note.tape,
                borderLeft: `1px dashed ${note.tapeBorder}`,
                borderRight: `1px dashed ${note.tapeBorder}`,
              }} />
              <div style={{
                fontFamily: "'Patrick Hand', cursive",
                fontSize: 'clamp(17px, 2.5vw, 22px)',
                lineHeight: 1.35,
                color: '#6b5a3c',
              }}>{note.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quest section */}
      <div style={{ padding: '38px 44px 10px' }}>
        {/* Day-part tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
          {DAY_PARTS.map(part => (
            <button
              key={part}
              onClick={() => setActiveTab(part)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: activeTab === part ? child.theme.bg : '#f6efe7',
                color: activeTab === part ? child.theme.textMuted : '#b3a99e',
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                fontWeight: activeTab === part ? 700 : 400,
                letterSpacing: '0.04em',
                padding: '9px 16px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            >{DAY_PART_LABELS[part]}</button>
          ))}
        </div>

        {/* Quest heading + progress */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 32,
            color: '#3a3340',
          }}>{DAY_PART_LABELS[activeTab].split(' ')[1]} quests</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 13,
              letterSpacing: '0.08em',
              color: '#9a8fa6',
            }}>{doneCurrent} / {totalCurrent} DONE</span>
            <button
              onClick={() => printSection(activeTab)}
              style={{
                background: 'none',
                border: `1.5px solid ${child.theme.accent}`,
                color: child.theme.accent,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '5px 12px',
                borderRadius: 999,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >Print {DAY_PART_LABELS[activeTab].split(' ')[1]}</button>
          </div>
        </div>
        <div style={{ height: 10, background: '#efe6dd', borderRadius: 999, overflow: 'hidden', marginBottom: 22 }}>
          <div style={{
            width: `${progressPct}%`,
            height: '100%',
            background: child.theme.accent,
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Quest cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {currentQuests.map(quest => {
            const done = state.completed[activeTab].includes(quest.id)
            return (
              <button
                key={quest.id}
                onClick={() => toggleQuest(activeTab, quest.id)}
                className="press-btn"
                style={{
                  position: 'relative',
                  background: done ? '#f6efe7' : '#fff',
                  borderRadius: 18,
                  padding: '24px 18px 20px',
                  textAlign: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: done ? 'none' : '0 3px 10px rgba(58,51,64,.05)',
                  transition: 'background 0.25s, box-shadow 0.25s',
                }}
              >
                {/* Check circle */}
                <div style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: done ? '#5b8a5c' : 'transparent',
                  border: done ? 'none' : `2px solid ${child.theme.dashed}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 15,
                  transition: 'background 0.25s, border 0.25s',
                }}>{done ? '✓' : ''}</div>

                <div style={{ fontSize: 38, opacity: done ? 0.5 : 1, transition: 'opacity 0.25s' }}>
                  {quest.icon}
                </div>
                <div style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: done ? '#a99f95' : '#3a3340',
                  textDecoration: done ? 'line-through' : 'none',
                  margin: '12px 0',
                  lineHeight: 1.3,
                  transition: 'color 0.25s',
                }}>{quest.title}</div>
                <div style={{
                  display: 'inline-block',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                  background: done ? 'transparent' : child.theme.bg,
                  color: done ? '#b3a99e' : child.theme.textMuted,
                  padding: done ? '5px 0' : '5px 12px',
                  borderRadius: 999,
                  transition: 'background 0.25s',
                }}>🎟️ {quest.tickets}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Daily routines */}
      <div style={{ padding: '34px 44px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#3a3340' }}>Daily routines</h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: '#fce9d6',
            color: '#c2702a',
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            padding: '8px 15px',
            borderRadius: 999,
          }}>🔥 {state.streak}-day streak</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
          {ROUTINES.map(routine => {
            const log = state.routines[routine.id]
            return (
              <div key={routine.id} style={{
                background: routine.bg,
                borderRadius: 20,
                padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: '50%',
                    background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }}>{routine.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#3a3340' }}>{routine.title}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 12,
                      color: routine.targetColor,
                    }}>Target · {routine.target} {routine.ampm}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
                  {log ? (
                    <>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: 34,
                        color: '#3a3340',
                      }}>
                        {log.time}
                        <span style={{ fontSize: 15, fontWeight: 400, color: routine.targetColor }}> {routine.ampm}</span>
                      </div>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: '#fff',
                        color: log.onTime ? '#4e7a4f' : '#b5546a',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '8px 14px',
                        borderRadius: 999,
                      }}>
                        {log.onTime ? 'On time · +1 🎟️' : 'Late · try again'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontWeight: 700,
                        fontSize: 30,
                        color: '#aab8cb',
                        letterSpacing: '0.08em',
                      }}>--:--</div>
                      <button
                        onClick={() => clockIn(routine.id)}
                        className="press-btn"
                        style={{
                          background: '#3a3340',
                          color: '#fff',
                          fontSize: 14,
                          fontWeight: 600,
                          padding: '11px 24px',
                          borderRadius: 999,
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: "'Hanken Grotesk', sans-serif",
                        }}
                      >Clock in</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Weekly tracker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginTop: 18,
          background: '#faf0ec',
          borderRadius: 18,
          padding: '18px 24px',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#3a3340' }}>
              On time all week → <span style={{ color: child.theme.accent }}>10 bonus tickets 🎟️</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {['M','T','W','T','F','S','S'].map((day, i) => (
                <div key={i} style={{
                  width: 30, height: 30,
                  borderRadius: '50%',
                  background: state.weekDays[i] ? '#5b8a5c' : 'transparent',
                  border: state.weekDays[i] ? 'none' : '2px solid #e2d6cb',
                  color: state.weekDays[i] ? '#fff' : '#b3a99e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  fontWeight: state.weekDays[i] ? 700 : 400,
                }}>{day}</div>
              ))}
            </div>
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            color: '#9a8fa6',
          }}>{state.weekDays.filter(Boolean).length} / 7</div>
        </div>
      </div>

      {/* Shop + Suggest a reward */}
      <div style={{ padding: '30px 44px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
          <div style={{
            background: '#f7d6dd',
            borderRadius: 22,
            padding: '24px 26px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}>
            <div style={{
              width: 58, height: 58,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
            }}>🛍️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#3a3340' }}>Your shop</div>
              <div style={{ fontSize: 14, color: '#9a6b76', marginTop: 2 }}>Spend your tickets on your own picks</div>
            </div>
            <button className="press-btn" style={{
              background: '#3a3340', color: '#fff',
              fontSize: 14, fontWeight: 600,
              padding: '9px 18px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              flexShrink: 0,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }} onClick={onOpenShop}>Open →</button>
          </div>

          <div style={{
            background: child.theme.bg,
            borderRadius: 22,
            padding: '24px 26px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}>
            <div style={{
              width: 58, height: 58,
              borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, flexShrink: 0,
            }}>🌟</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#3a3340' }}>Suggest a reward</div>
              <div style={{ fontSize: 14, color: child.theme.textMuted, marginTop: 2 }}>Wish for something new in your shop</div>
            </div>
            <button className="press-btn" style={{
              background: '#3a3340', color: '#fff',
              fontSize: 14, fontWeight: 600,
              padding: '9px 18px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              flexShrink: 0,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }} onClick={onSuggestReward}>Ask →</button>
          </div>
        </div>
      </div>

      {/* Mood check-in */}
      <div style={{ padding: '34px 48px 8px' }}>
        <div style={{
          background: '#fff',
          borderRadius: 22,
          padding: '30px 28px',
          boxShadow: '0 4px 16px rgba(58,51,64,.05)',
        }}>
          <div style={{
            textAlign: 'center',
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: child.theme.accent,
            marginBottom: 22,
          }}>How are you feeling right now?</div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}>
            {MOODS.map((m, i) => (
              <button
                key={i}
                onClick={() => setMood(i)}
                className="mood-option press-btn"
                style={{
                  background: state.mood === i ? child.theme.bg : '#fdf5f1',
                  borderRadius: 16,
                  padding: '18px 8px',
                  textAlign: 'center',
                  border: state.mood === i ? `2px solid ${child.theme.accent}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border 0.2s',
                }}
              >
                <div style={{ fontSize: 32 }}>{m.emoji}</div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                  color: state.mood === i ? child.theme.accent : '#6f6675',
                  marginTop: 8,
                  lineHeight: 1.2,
                }}>{m.label}</div>
              </button>
            ))}
          </div>

          {/* Voice note option */}
          <button
            onClick={toggleVoice}
            className="press-btn"
            style={{
              width: '100%',
              marginTop: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              padding: '16px 22px',
              border: `1.5px dashed ${state.voiceRecording ? child.theme.accent : '#e3d3ec'}`,
              borderRadius: 18,
              background: state.voiceRecording ? child.theme.bg : '#faf6fc',
              cursor: 'pointer',
              transition: 'background 0.2s, border 0.2s',
            }}
          >
            <div style={{
              width: 46, height: 46,
              borderRadius: '50%',
              background: state.voiceRecording ? child.theme.accent : '#efe2f5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 21, flexShrink: 0,
              transition: 'background 0.2s',
            }}>
              {state.voiceRecording ? '⏹️' : '🎙️'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#3a3340' }}>
                {state.voiceRecording ? 'Recording… tap to stop' : 'Want to talk about it?'}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 12,
                color: '#9a8fa6',
                marginTop: 2,
              }}>
                {state.voiceRecording ? 'Your note will be saved for Mum & Dad' : 'Tap to add a voice note — totally optional'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Side quests */}
      <div style={{
        background: '#faf0ec',
        padding: '44px 48px 60px',
        textAlign: 'center',
        marginTop: 32,
      }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 34, color: '#3a3340' }}>Side quests</h2>
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: child.theme.accent,
          margin: '14px 0 26px',
        }}>Extra jobs · extra tickets</div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 22,
        }}>
          {SIDE_QUESTS.map(sq => {
            const claimed = state.claimedSideQuests.includes(sq.id)
            return (
              <div
                key={sq.id}
                style={{
                  filter: claimed
                    ? 'drop-shadow(0 3px 4px rgba(58,51,64,.08))'
                    : 'drop-shadow(0 9px 11px rgba(58,51,64,.16))',
                  opacity: claimed ? 0.6 : 1,
                  transition: 'opacity 0.3s, filter 0.3s',
                }}
              >
                <TicketShape bg={sq.bg} stubHeight={64}>
                  <div style={{ padding: '24px 18px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: 34 }}>{sq.icon}</div>
                    <div style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 22,
                      color: '#3a3340',
                      margin: '10px 0 14px',
                    }}>{sq.title}</div>
                    <div style={{
                      display: 'inline-block',
                      background: '#fff',
                      color: sq.textColor,
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 12,
                      padding: '6px 12px',
                      borderRadius: 999,
                    }}>{sq.tickets} TICKETS</div>
                  </div>
                  <div style={{
                    height: 64,
                    borderTop: `2px dashed ${sq.dashed}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {claimed ? (
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 13,
                        color: '#9a8fa6',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>✓ Claimed</div>
                    ) : (
                      <button
                        onClick={() => claimSideQuest(sq.id)}
                        className="press-btn"
                        style={{
                          background: '#3a3340',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 14,
                          padding: '9px 30px',
                          borderRadius: 999,
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: "'Hanken Grotesk', sans-serif",
                        }}
                      >Claim</button>
                    )}
                  </div>
                </TicketShape>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
