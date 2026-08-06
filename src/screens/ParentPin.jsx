import { useState } from 'react'

const CORRECT_PIN = '1234'

export default function ParentPin({ onSuccess, onBack }) {
  const [digits, setDigits] = useState([])
  const [error, setError] = useState(false)

  function press(d) {
    if (digits.length >= 4) return
    const next = [...digits, d]
    setDigits(next)
    setError(false)

    if (next.length === 4) {
      setTimeout(() => {
        if (next.join('') === CORRECT_PIN) {
          onSuccess()
        } else {
          setError(true)
          setDigits([])
        }
      }, 200)
    }
  }

  function backspace() {
    setDigits(d => d.slice(0, -1))
    setError(false)
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fdf5f1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: "'Hanken Grotesque', sans-serif",
      color: '#3a3340',
    }}>
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 28,
          left: 28,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Space Mono', monospace",
          fontSize: 13,
          color: '#9a8fa6',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        ← Back
      </button>

      <div style={{
        width: 70,
        height: 70,
        borderRadius: '50%',
        background: '#efe2f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
      }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#a8689a" strokeWidth="1.8">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>

      <h1 style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 38,
        color: '#3a3340',
        marginBottom: 10,
      }}>Parent access</h1>
      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 13,
        color: error ? '#b5546a' : '#9a8fa6',
        letterSpacing: '0.04em',
        marginBottom: 30,
        transition: 'color 0.2s',
      }}>
        {error ? 'Incorrect PIN — try again' : 'Enter your 4-digit PIN'}
      </p>

      {/* PIN dots */}
      <div style={{ display: 'flex', gap: 18, marginBottom: 36 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: digits.length > i
              ? (error ? '#b5546a' : '#a8689a')
              : 'transparent',
            border: digits.length > i ? 'none' : '2px solid #d8c8e2',
            transition: 'background 0.15s, border 0.15s',
          }} />
        ))}
      </div>

      {/* Keypad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 14,
        maxWidth: 300,
        width: '100%',
      }}>
        {keys.map((k, i) => {
          if (k === '') return <div key={i} />
          return (
            <button
              key={i}
              onClick={() => k === '⌫' ? backspace() : press(k)}
              className="press-btn"
              style={{
                background: k === '⌫' ? 'transparent' : '#fff',
                borderRadius: 18,
                padding: '18px 0',
                fontFamily: "'Space Mono', monospace",
                fontSize: k === '⌫' ? 22 : 26,
                color: k === '⌫' ? '#9a8fa6' : '#3a3340',
                boxShadow: k === '⌫' ? 'none' : '0 3px 8px rgba(58,51,64,.05)',
                border: 'none',
                cursor: 'pointer',
              }}
            >{k}</button>
          )
        })}
      </div>

      <p style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 11,
        color: '#c8bfc8',
        marginTop: 32,
        letterSpacing: '0.06em',
      }}>Demo PIN: 1234</p>
    </div>
  )
}
