import { useState } from 'react'
import { DAYS_OF_WEEK, DAY_LABELS } from '../data'

const RECURRENCE_OPTIONS = [
  { key: 'daily',  label: 'Every day' },
  { key: 'weekly', label: 'Specific days' },
  { key: 'once',   label: 'One-time date' },
]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function NoteScheduleModal({ note, accentColor, bgColor, onSave, onClose }) {
  const [recurrence, setRecurrence] = useState(note.recurrence || 'daily')
  const [selectedDays, setSelectedDays] = useState(note.days || [...DAYS_OF_WEEK])
  const [date, setDate] = useState(note.date || todayISO())

  function toggleDay(day) {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  function handleSave() {
    onSave({
      recurrence,
      days: recurrence === 'weekly' ? selectedDays : undefined,
      date: recurrence === 'once' ? date : undefined,
    })
  }

  const canSave = recurrence !== 'weekly' || selectedDays.length > 0

  const labelStyle = {
    fontFamily: "'Space Mono', monospace", fontSize: 11,
    letterSpacing: '0.16em', textTransform: 'uppercase',
    color: '#9a8fa6', marginBottom: 10, display: 'block',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(58,51,64,.55)',
        display: 'flex', alignItems: 'flex-end',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '28px 28px 48px',
          width: '100%', maxWidth: 560,
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#3a3340' }}>
            When to show this note?
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

        {/* Recurrence options */}
        <div style={{ marginBottom: recurrence === 'daily' ? 28 : 16 }}>
          <span style={labelStyle}>How often?</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {RECURRENCE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setRecurrence(opt.key)}
                style={{
                  flex: 1, padding: '10px 8px', borderRadius: 12,
                  border: `2px solid ${recurrence === opt.key ? accentColor : '#e0d4e8'}`,
                  background: recurrence === opt.key ? bgColor : '#fff',
                  color: recurrence === opt.key ? accentColor : '#9a8fa6',
                  cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  fontWeight: recurrence === opt.key ? 700 : 400,
                  letterSpacing: '0.04em', transition: 'all 0.15s', textAlign: 'center',
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Day picker */}
        {recurrence === 'weekly' && (
          <div style={{ marginBottom: 28 }}>
            <span style={labelStyle}>Which days?</span>
            <div style={{ display: 'flex', gap: 5 }}>
              {DAYS_OF_WEEK.map(day => {
                const sel = selectedDays.includes(day)
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    style={{
                      flex: 1, padding: '9px 4px', borderRadius: 10,
                      border: `2px solid ${sel ? accentColor : '#e0d4e8'}`,
                      background: sel ? bgColor : '#fff',
                      color: sel ? accentColor : '#9a8fa6',
                      cursor: 'pointer',
                      fontFamily: "'Space Mono', monospace", fontSize: 10,
                      fontWeight: sel ? 700 : 400, transition: 'all 0.15s',
                    }}
                  >{DAY_LABELS[day][0]}</button>
                )
              })}
            </div>
          </div>
        )}

        {/* Date picker */}
        {recurrence === 'once' && (
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#9a8fa6', fontFamily: "'Hanken Grotesk', sans-serif" }}>Date:</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                border: '1.5px solid #e0d4e8', borderRadius: 12,
                padding: '11px 14px', fontSize: 15,
                fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
                background: '#fff', outline: 'none',
              }}
            />
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            width: '100%',
            background: canSave ? accentColor : '#e0d4e8',
            color: canSave ? '#fff' : '#9a8fa6',
            border: 'none', borderRadius: 999,
            padding: '16px 0', fontSize: 16, fontWeight: 700,
            cursor: canSave ? 'pointer' : 'default',
            fontFamily: "'Hanken Grotesk', sans-serif",
            transition: 'background 0.2s',
          }}
        >Save schedule</button>
      </div>
    </div>
  )
}
