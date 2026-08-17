import { useState } from 'react'
import { CHILDREN, CHILD_ORDER, DAYS_OF_WEEK, DAY_LABELS } from '../data'
import { ALL_QUEST_IMAGES } from '../assets/quests/index'

const DAY_PARTS = ['morning', 'afternoon', 'evening']
const DAY_PART_LABELS = { morning: '☀️ Morning', afternoon: '🌤️ Afternoon', evening: '🌙 Evening' }

const RECURRENCE_OPTIONS = [
  { key: 'daily',   label: 'Every day' },
  { key: 'weekly',  label: 'Specific days' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'once',    label: 'Assign a specific date' },
]

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AddQuestModal({ defaultSections = ['morning'], onSave, onClose }) {
  const [sections, setSections] = useState(defaultSections)
  const [icon, setIcon] = useState('⭐')
  const [title, setTitle] = useState('')
  const [tickets, setTickets] = useState(2)
  const [imageKey, setImageKey] = useState(null)
  const [showPicker, setShowPicker] = useState(false)
  const [selectedKids, setSelectedKids] = useState([...CHILD_ORDER])
  const [recurrence, setRecurrence] = useState('daily')
  const [selectedDays, setSelectedDays] = useState([...DAYS_OF_WEEK])
  const [dayOfMonth, setDayOfMonth] = useState(new Date().getDate())
  const [date, setDate] = useState(todayISO)

  function toggleSection(part) {
    setSections(prev => prev.includes(part) ? prev.filter(s => s !== part) : [...prev, part])
  }
  function toggleKid(id) {
    setSelectedKids(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id])
  }
  function toggleDay(day) {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  function handleSave(e) {
    e.preventDefault()
    if (!title.trim() || selectedKids.length === 0 || sections.length === 0) return
    if (recurrence === 'weekly' && selectedDays.length === 0) return
    onSave({
      sections,
      icon: icon.trim() || '⭐',
      title: title.trim(),
      tickets: Math.max(1, Math.min(10, tickets)),
      imageKey: imageKey ?? undefined,
      selectedKids,
      recurrence,
      days: recurrence === 'weekly' ? selectedDays : undefined,
      dayOfMonth: recurrence === 'monthly' ? dayOfMonth : undefined,
      date: recurrence === 'once' ? date : undefined,
    })
  }

  const currentSrc = imageKey ? ALL_QUEST_IMAGES.find(i => i.key === imageKey)?.src : null
  const canSave = title.trim().length > 0 && selectedKids.length > 0 && sections.length > 0 &&
    (recurrence !== 'weekly' || selectedDays.length > 0)

  const inputStyle = {
    border: '1.5px solid #e0d4e8', borderRadius: 12,
    padding: '11px 14px', fontSize: 15,
    fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
    background: '#fff', outline: 'none',
  }

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
      <form
        onSubmit={handleSave}
        style={{
          background: '#fff',
          borderRadius: '28px 28px 0 0',
          padding: '28px 28px 48px',
          width: '100%', maxWidth: 560,
          margin: '0 auto',
          maxHeight: '92vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#3a3340' }}>
            Add a quest
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f0e8e0', border: 'none', borderRadius: '50%',
              width: 36, height: 36, fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6f6675',
            }}
          >×</button>
        </div>

        {/* Section multi-select */}
        <div style={{ marginBottom: 22 }}>
          <span style={labelStyle}>When? (select all that apply)</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {DAY_PARTS.map(part => {
              const sel = sections.includes(part)
              return (
                <button
                  key={part}
                  type="button"
                  onClick={() => toggleSection(part)}
                  style={{
                    flex: 1, padding: '10px 6px', borderRadius: 12,
                    border: `2px solid ${sel ? '#a8689a' : '#e0d4e8'}`,
                    background: sel ? '#efe2f5' : '#fff',
                    color: sel ? '#a8689a' : '#9a8fa6',
                    cursor: 'pointer',
                    fontFamily: "'Space Mono', monospace", fontSize: 11,
                    fontWeight: sel ? 700 : 400, letterSpacing: '0.04em',
                    transition: 'all 0.15s', textAlign: 'center',
                  }}
                >{DAY_PART_LABELS[part]}</button>
              )
            })}
          </div>
        </div>

        {/* Recurrence */}
        <div style={{ marginBottom: recurrence === 'daily' ? 22 : 12 }}>
          <span style={labelStyle}>How often?</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {RECURRENCE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setRecurrence(opt.key)}
                style={{
                  padding: '10px 8px', borderRadius: 12,
                  border: `2px solid ${recurrence === opt.key ? '#a8689a' : '#e0d4e8'}`,
                  background: recurrence === opt.key ? '#efe2f5' : '#fff',
                  color: recurrence === opt.key ? '#a8689a' : '#9a8fa6',
                  cursor: 'pointer',
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  fontWeight: recurrence === opt.key ? 700 : 400,
                  letterSpacing: '0.04em', transition: 'all 0.15s',
                  textAlign: 'center',
                }}
              >{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Specific days */}
        {recurrence === 'weekly' && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', gap: 5 }}>
              {DAYS_OF_WEEK.map(day => {
                const sel = selectedDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    style={{
                      flex: 1, padding: '9px 4px', borderRadius: 10,
                      border: `2px solid ${sel ? '#a8689a' : '#e0d4e8'}`,
                      background: sel ? '#efe2f5' : '#fff',
                      color: sel ? '#a8689a' : '#9a8fa6',
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

        {/* Day of month */}
        {recurrence === 'monthly' && (
          <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#9a8fa6', fontFamily: "'Hanken Grotesk', sans-serif" }}>Day of month:</span>
            <input
              type="number"
              value={dayOfMonth}
              onChange={e => setDayOfMonth(Math.max(1, Math.min(31, Number(e.target.value))))}
              min={1} max={31}
              style={{ ...inputStyle, width: 72, textAlign: 'center', padding: '9px 8px' }}
            />
          </div>
        )}

        {/* One-time date */}
        {recurrence === 'once' && (
          <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#9a8fa6', fontFamily: "'Hanken Grotesk', sans-serif" }}>Date:</span>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ ...inputStyle, padding: '9px 12px' }}
            />
          </div>
        )}

        {/* Title + icon + tickets */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'stretch' }}>
            {/* Quest name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={labelStyle}>Quest name</span>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Quest name"
                autoFocus
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            {/* Quest icon */}
            <div style={{ flexShrink: 0 }}>
              <span style={labelStyle}>Icon</span>
              <input
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="⭐"
                maxLength={2}
                style={{ ...inputStyle, width: 56, textAlign: 'center', fontSize: 24, padding: '10px 6px', display: 'block' }}
              />
            </div>
            {/* Tickets */}
            <div style={{ flexShrink: 0 }}>
              <span style={labelStyle}>Tickets</span>
              <input
                type="number"
                value={tickets}
                onChange={e => setTickets(Number(e.target.value))}
                min={1} max={10}
                style={{ ...inputStyle, width: 56, textAlign: 'center', padding: '11px 8px', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Image picker */}
        <div style={{ marginBottom: 22 }}>
          <span style={labelStyle}>Quest image</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: '#faf6fc', border: '1.5px solid #e0d4e8',
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
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                color: '#a8689a', cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >{showPicker ? 'Close' : 'Choose image'}</button>
            {imageKey && (
              <button
                type="button"
                onClick={() => setImageKey(null)}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#b3a9be', cursor: 'pointer', padding: '4px 8px' }}
              >Reset</button>
            )}
          </div>
          {showPicker && (
            <div style={{
              marginTop: 10,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
              gap: 8, maxHeight: 240, overflowY: 'auto', padding: '4px 2px',
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

        {/* Child selector */}
        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>Assign to</span>
          <div style={{ display: 'flex', gap: 10 }}>
            {CHILD_ORDER.map(id => {
              const child = CHILDREN[id]
              const sel = selectedKids.includes(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleKid(id)}
                  style={{
                    flex: 1, padding: '14px 8px', borderRadius: 16,
                    border: `2px solid ${sel ? child.theme.accent : '#e0d4e8'}`,
                    background: sel ? child.theme.bg : '#fff',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, lineHeight: 1, color: sel ? child.theme.accent : '#b3a9be' }}>{child.avatar}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: sel ? child.theme.accent : '#9a8fa6' }}>{child.name}</span>
                  {sel && <span style={{ fontSize: 11, color: child.theme.accent }}>✓</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={!canSave}
          style={{
            width: '100%',
            background: canSave ? '#a8689a' : '#e0d4e8',
            color: canSave ? '#fff' : '#9a8fa6',
            border: 'none', borderRadius: 999,
            padding: '16px 0', fontSize: 16, fontWeight: 700,
            cursor: canSave ? 'pointer' : 'default',
            fontFamily: "'Hanken Grotesk', sans-serif",
            transition: 'background 0.2s',
          }}
        >
          {canSave
            ? selectedKids.length === CHILD_ORDER.length
              ? 'Add quest for everyone'
              : selectedKids.length === 1
                ? `Add quest for ${CHILDREN[selectedKids[0]].name}`
                : `Add quest for ${selectedKids.map(id => CHILDREN[id].name).join(' & ')}`
            : 'Choose a name, time of day, and at least one child'}
        </button>
      </form>
    </div>
  )
}
