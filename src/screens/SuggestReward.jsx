import { useState } from 'react'
import { CHILDREN } from '../data'

export default function SuggestReward({ childId, state, onUpdate, onBack }) {
  const child = CHILDREN[childId]
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const suggestion = {
      id: Date.now(),
      title: title.trim(),
      note: note.trim(),
      status: 'pending',
      date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
    }
    onUpdate(s => ({
      ...s,
      suggestions: [suggestion, ...(s.suggestions || [])],
    }))
    setSubmitted(true)
  }

  const pending = (state.suggestions || []).filter(s => s.status === 'pending')
  const approved = (state.suggestions || []).filter(s => s.status === 'approved')
  const declined = (state.suggestions || []).filter(s => s.status === 'declined')

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fdf5f1',
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#3a3340',
      padding: '44px 44px 60px',
      maxWidth: 680,
      margin: '0 auto',
    }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fff',
          border: 'none', borderRadius: 999,
          padding: '9px 16px',
          fontFamily: "'Space Mono', monospace",
          fontSize: 12, color: '#3a3340',
          cursor: 'pointer', marginBottom: 32,
          boxShadow: '0 2px 10px rgba(58,51,64,.08)',
        }}
      >← Back to shop</button>

      {submitted ? (
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🌟</div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 38, color: '#3a3340', marginBottom: 12,
          }}>Wish sent!</h1>
          <p style={{ fontSize: 17, color: '#6f6675', lineHeight: 1.6, marginBottom: 32 }}>
            Mum or Dad will have a look and add it to your shop if they approve it. Keep earning those tickets!
          </p>
          <button
            onClick={() => { setSubmitted(false); setTitle(''); setNote('') }}
            style={{
              background: child.theme.bg, color: child.theme.textMuted,
              border: 'none', borderRadius: 999,
              padding: '12px 28px', fontSize: 15, fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}
          >Suggest another</button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 8, fontSize: 13, fontFamily: "'Space Mono', monospace", color: child.theme.accent, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            🌟 Suggest a reward
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 38, color: '#3a3340', marginBottom: 6,
          }}>What do you wish for?</h1>
          <p style={{ fontSize: 15, color: '#6f6675', marginBottom: 32 }}>
            Tell Mum or Dad what you'd love in your shop.
          </p>

          <form onSubmit={submit}>
            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9a8fa6',
              marginBottom: 8,
            }}>What's the reward?</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. New LEGO set, extra screen time…"
              maxLength={80}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 16,
                border: `2px solid ${title ? child.theme.accent : '#e8dcd6'}`,
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: 16,
                color: '#3a3340',
                background: '#fff',
                outline: 'none',
                marginBottom: 20,
                transition: 'border 0.2s',
                boxSizing: 'border-box',
              }}
            />

            <label style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9a8fa6',
              marginBottom: 8,
            }}>Any extra details? <span style={{ color: '#c8bfc8' }}>(optional)</span></label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Tell them why you'd love it, or where to get it…"
              rows={3}
              maxLength={200}
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: 16,
                border: '2px solid #e8dcd6',
                fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: 15,
                color: '#3a3340',
                background: '#fff',
                outline: 'none',
                resize: 'none',
                marginBottom: 28,
                boxSizing: 'border-box',
              }}
            />

            <button
              type="submit"
              disabled={!title.trim()}
              style={{
                width: '100%',
                background: title.trim() ? '#3a3340' : '#e8e0da',
                color: title.trim() ? '#fff' : '#9a8fa6',
                border: 'none', borderRadius: 999,
                padding: '16px', fontSize: 16, fontWeight: 600,
                cursor: title.trim() ? 'pointer' : 'default',
                fontFamily: "'Hanken Grotesk', sans-serif",
                transition: 'background 0.2s',
              }}
            >Send my wish ✨</button>
          </form>
        </>
      )}

      {/* Previous suggestions */}
      {(state.suggestions?.length > 0) && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, marginBottom: 16 }}>
            Your previous wishes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {state.suggestions.map(s => (
              <div key={s.id} style={{
                background: '#fff',
                borderRadius: 16,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                boxShadow: '0 2px 8px rgba(58,51,64,.04)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
                  {s.note && <div style={{ fontSize: 13, color: '#6f6675', marginTop: 2 }}>{s.note}</div>}
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9a8fa6', marginTop: 3 }}>{s.date}</div>
                </div>
                <StatusChip status={s.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusChip({ status }) {
  const styles = {
    pending: { bg: '#fae7c4', color: '#9c7a36', label: 'Pending' },
    approved: { bg: '#e7f0e4', color: '#4e7a4f', label: '✓ Approved' },
    declined: { bg: '#fbeef0', color: '#b5546a', label: 'Not this time' },
  }
  const s = styles[status] || styles.pending
  return (
    <div style={{
      background: s.bg, color: s.color,
      fontFamily: "'Space Mono', monospace",
      fontSize: 11, fontWeight: 700,
      padding: '5px 12px', borderRadius: 999,
      flexShrink: 0,
    }}>{s.label}</div>
  )
}
