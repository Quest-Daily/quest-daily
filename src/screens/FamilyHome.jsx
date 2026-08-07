import { useState, useEffect } from 'react'
import { CHILDREN, CHILD_ORDER, QUESTS } from '../data'
import { useClock } from '../hooks'
import Avatar from '../components/Avatar'
import TicketShape from '../components/TicketShape'
import { connect, disconnect, autoConnect, isConnected, isSupported } from '../utils/printer'

export default function FamilyHome({ childState, onSelectChild, onParentView, onSignOut }) {
  const clock = useClock()
  const [printerConnected, setPrinterConnected] = useState(isConnected())

  useEffect(() => {
    if (!isConnected()) {
      autoConnect().then(ok => { if (ok) setPrinterConnected(true) })
    }
  }, [])

  async function handlePrinter() {
    if (printerConnected) {
      await disconnect()
      setPrinterConnected(false)
    } else {
      const result = await connect()
      if (result.ok) {
        setPrinterConnected(true)
      } else if (result.error) {
        alert(`Printer error: ${result.error}`)
      }
    }
  }

  function questsStatus(state) {
    const all = Object.values(QUESTS).flat()
    const done = Object.values(state.completed).flat().length
    if (done === all.length) return { label: 'All done! 🎉', done: true }
    const left = all.length - done
    return { label: `${left} left`, done: false }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fdf5f1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#3a3340',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 980,
        background: '#fdf5f1',
        borderRadius: 30,
        boxShadow: '0 2px 20px rgba(58,51,64,.08)',
        padding: 'clamp(28px, 5vw, 48px)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>⚔️</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 'clamp(36px, 6vw, 50px)',
            letterSpacing: '-0.01em',
            color: '#3a3340',
            margin: 0,
          }}>Daily Quests</h1>
          <div style={{ height: 1, background: '#ece0d8', maxWidth: 560, margin: '22px auto 20px' }} />
          <div style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 'clamp(14px, 2.5vw, 19px)',
            letterSpacing: '0.06em',
            color: '#6f6675',
          }}>{clock.date}</div>
          <div style={{
            fontFamily: "'Roboto Mono', monospace",
            fontWeight: 700,
            fontSize: 'clamp(40px, 8vw, 52px)',
            letterSpacing: '0.02em',
            color: '#3a3340',
            marginTop: 4,
          }}>{clock.time}</div>
        </div>

        {/* Kid cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginTop: 36,
        }}>
          {CHILD_ORDER.map(id => {
            const child = CHILDREN[id]
            const state = childState[id]
            const status = questsStatus(state)

            return (
              <button
                key={id}
                onClick={() => onSelectChild(id)}
                className="press-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  filter: `drop-shadow(0 9px 11px ${child.theme.shadow})`,
                  transition: 'filter 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = `drop-shadow(0 14px 18px ${child.theme.shadowDeep})`}
                onMouseLeave={e => e.currentTarget.style.filter = `drop-shadow(0 9px 11px ${child.theme.shadow})`}
              >
                <TicketShape bg={child.theme.bg} stubHeight={58}>
                  <div style={{ padding: '26px 22px 20px', textAlign: 'center' }}>
                    <div style={{
                      width: 92,
                      height: 92,
                      margin: '0 auto 16px',
                      borderRadius: 18,
                      background: '#fff',
                      boxShadow: `0 4px 14px ${child.theme.shadow}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 38,
                      lineHeight: 1,
                      paddingTop: '0.05em',
                      color: child.theme.accent,
                    }}>{child.avatar}</div>
                    <div style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: 28,
                      lineHeight: 1.15,
                      color: '#3a3340',
                    }}>{child.name}</div>
                    <div style={{
                      display: 'inline-block',
                      marginTop: 10,
                      background: '#fff',
                      color: status.done ? child.theme.accent : '#9a8fa6',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 13,
                      padding: '6px 14px',
                      borderRadius: 999,
                    }}>{status.label}</div>
                  </div>
                  <div style={{
                    height: 58,
                    borderTop: `2px dashed ${child.theme.dashed}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 14,
                    letterSpacing: '0.04em',
                    color: child.theme.textMuted,
                  }}>🎟️ {state.tickets} {state.tickets === 1 ? 'ticket' : 'tickets'}</div>
                </TicketShape>
              </button>
            )
          })}
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
          <button
            onClick={onSignOut}
            className="press-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: '#fff', color: '#3a3340',
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 600, fontSize: 16,
              padding: '14px 24px', borderRadius: 999,
              boxShadow: '0 3px 10px rgba(58,51,64,.08)',
              border: 'none', cursor: 'pointer',
            }}
          >🚪 Sign out</button>
          {isSupported() && (
            <button
              onClick={handlePrinter}
              className="press-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: 9,
                background: printerConnected ? '#e7f0e4' : '#fff',
                color: printerConnected ? '#4e7a4f' : '#3a3340',
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontWeight: 600, fontSize: 16,
                padding: '14px 24px', borderRadius: 999,
                boxShadow: '0 3px 10px rgba(58,51,64,.08)',
                border: printerConnected ? '1.5px solid #b8d9b9' : 'none',
                cursor: 'pointer',
              }}
            >{printerConnected ? '🖨️ Printer connected' : '🖨️ Connect printer'}</button>
          )}
          <button
            onClick={onParentView}
            className="press-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              background: '#3a3340', color: '#fdf5f1',
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: 600, fontSize: 16,
              padding: '14px 24px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
            }}
          >⚙️ Parent view</button>
        </div>
      </div>
    </div>
  )
}
