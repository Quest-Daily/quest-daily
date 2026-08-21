import { useState } from 'react'
import { ALL_QUEST_IMAGES } from '../assets/quests/index'

export default function RoutineEditModal({ routine, accentColor, bgColor, onSave, onClose }) {
  const [title, setTitle] = useState(routine.title)
  const [target, setTarget] = useState(routine.target)
  const [ampm, setAmpm] = useState(routine.ampm)
  const [imageKey, setImageKey] = useState(routine.imageKey ?? null)
  const [showPicker, setShowPicker] = useState(false)

  const currentSrc = imageKey ? ALL_QUEST_IMAGES.find(i => i.key === imageKey)?.src : null

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

  function validateTime(val) {
    return /^\d{1,2}:\d{2}$/.test(val)
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
      <div style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        padding: '28px 28px 48px',
        width: '100%', maxWidth: 560,
        margin: '0 auto',
        maxHeight: '92vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#3a3340' }}>
            Edit routine
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

        {/* Title */}
        <div style={{ marginBottom: 22 }}>
          <span style={labelStyle}>Routine name</span>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Routine name"
            autoFocus
            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
          />
        </div>

        {/* Target time */}
        <div style={{ marginBottom: 22 }}>
          <span style={labelStyle}>Target time</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              value={target}
              onChange={e => setTarget(e.target.value)}
              placeholder="8:15"
              style={{ ...inputStyle, width: 90, textAlign: 'center' }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              {['am', 'pm'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmpm(v)}
                  style={{
                    padding: '10px 20px', borderRadius: 12,
                    border: `2px solid ${ampm === v ? accentColor : '#e0d4e8'}`,
                    background: ampm === v ? bgColor : '#fff',
                    color: ampm === v ? accentColor : '#9a8fa6',
                    fontFamily: "'Space Mono', monospace", fontSize: 12,
                    fontWeight: ampm === v ? 700 : 400,
                    cursor: 'pointer', textTransform: 'uppercase',
                    transition: 'all 0.15s',
                  }}
                >{v}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Image picker */}
        <div style={{ marginBottom: 28 }}>
          <span style={labelStyle}>Icon / image</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: '#faf6fc', border: '1.5px solid #e0d4e8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {currentSrc
                ? <img src={currentSrc} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                : <span style={{ fontSize: 28 }}>{routine.icon}</span>
              }
            </div>
            <button
              type="button"
              onClick={() => setShowPicker(v => !v)}
              style={{
                background: showPicker ? bgColor : '#fff',
                border: `1.5px solid ${showPicker ? accentColor : '#d3bce6'}`,
                borderRadius: 999, padding: '8px 16px',
                fontSize: 13, fontWeight: 600, color: accentColor,
                cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >{showPicker ? 'Close' : 'Choose image'}</button>
            {imageKey && (
              <button type="button" onClick={() => setImageKey(null)}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#b3a9be', cursor: 'pointer', padding: '4px 8px' }}>Reset</button>
            )}
          </div>
          {showPicker && (
            <div style={{
              marginTop: 10,
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
              gap: 8, maxHeight: 260, overflowY: 'auto', padding: '4px 2px',
            }}>
              {ALL_QUEST_IMAGES.map(img => (
                <button key={img.key} type="button"
                  onClick={() => { setImageKey(img.key); setShowPicker(false) }}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '8px 4px',
                    background: imageKey === img.key ? bgColor : '#fff',
                    border: `1.5px solid ${imageKey === img.key ? accentColor : '#e0d4e8'}`,
                    borderRadius: 12, cursor: 'pointer',
                    transition: 'border-color 0.12s, background 0.12s',
                  }}
                >
                  <img src={img.src} alt={img.label} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 8,
                    color: imageKey === img.key ? accentColor : '#9a8fa6',
                    textAlign: 'center', lineHeight: 1.2,
                  }}>{img.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={() => {
            if (!title.trim() || !validateTime(target)) return
            onSave({ title: title.trim(), target, ampm, imageKey: imageKey ?? undefined })
          }}
          disabled={!title.trim() || !validateTime(target)}
          style={{
            width: '100%',
            background: (title.trim() && validateTime(target)) ? accentColor : '#e0d4e8',
            color: (title.trim() && validateTime(target)) ? '#fff' : '#9a8fa6',
            border: 'none', borderRadius: 999,
            padding: '16px 0', fontSize: 16, fontWeight: 700,
            cursor: (title.trim() && validateTime(target)) ? 'pointer' : 'default',
            fontFamily: "'Hanken Grotesk', sans-serif",
            transition: 'background 0.2s',
          }}
        >Save changes</button>
      </div>
    </div>
  )
}
