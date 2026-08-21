import { useState } from 'react'
import { ALL_QUEST_IMAGES } from '../assets/quests/index'

const CATEGORIES = [
  { id: 'all',     label: 'All' },
  { id: 'chore',   label: 'Chores' },
  { id: 'reward',  label: 'Rewards' },
]

// Split images into chore vs reward by position in the array
const CHORE_KEYS = new Set(ALL_QUEST_IMAGES.slice(0, ALL_QUEST_IMAGES.findIndex(i => i.key === 'soccer-training')).map(i => i.key))

export default function QuestIconPickerModal({ quest, accentColor, bgColor, onSave, onClose }) {
  const [cat, setCat] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ALL_QUEST_IMAGES.filter(img => {
    if (cat === 'chore' && !CHORE_KEYS.has(img.key)) return false
    if (cat === 'reward' && CHORE_KEYS.has(img.key)) return false
    if (search) return img.label.toLowerCase().includes(search.toLowerCase())
    return true
  })

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
      <div style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        padding: '28px 24px 48px',
        width: '100%', maxWidth: 560,
        margin: '0 auto',
        maxHeight: '80vh',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#3a3340' }}>
            Change icon
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

        {/* Search */}
        <input
          type="text"
          placeholder="Search images…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            border: '1.5px solid #e0d4e8', borderRadius: 12,
            padding: '10px 14px', fontSize: 14,
            fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
            marginBottom: 12, outline: 'none',
          }}
        />

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              style={{
                padding: '6px 16px', borderRadius: 999,
                border: `1.5px solid ${cat === c.id ? accentColor : '#e0d4e8'}`,
                background: cat === c.id ? bgColor : '#fff',
                color: cat === c.id ? accentColor : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                fontWeight: cat === c.id ? 700 : 400,
                letterSpacing: '0.06em', cursor: 'pointer',
              }}
            >{c.label}</button>
          ))}
          {quest.imageKey && (
            <button
              onClick={() => onSave(null)}
              style={{
                marginLeft: 'auto',
                padding: '6px 14px', borderRadius: 999,
                border: '1.5px solid #e0d4e8', background: 'none',
                color: '#b3a9be', fontFamily: "'Hanken Grotesk', sans-serif",
                fontSize: 12, cursor: 'pointer',
              }}
            >Reset</button>
          )}
        </div>

        {/* Image grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
          gap: 8, overflowY: 'auto', padding: '2px 2px 4px',
        }}>
          {filtered.map(img => (
            <button
              key={img.key}
              onClick={() => onSave(img.key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px',
                background: quest.imageKey === img.key ? bgColor : '#fff',
                border: `1.5px solid ${quest.imageKey === img.key ? accentColor : '#e0d4e8'}`,
                borderRadius: 12, cursor: 'pointer',
                transition: 'border-color 0.12s, background 0.12s',
              }}
            >
              <img src={img.src} alt={img.label} style={{ width: 44, height: 44, objectFit: 'contain' }} />
              <span style={{
                fontFamily: "'Space Mono', monospace", fontSize: 8,
                color: quest.imageKey === img.key ? accentColor : '#9a8fa6',
                textAlign: 'center', lineHeight: 1.2,
              }}>{img.label}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#b3a9be', padding: '32px 0', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14 }}>
              No images found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
