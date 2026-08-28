import { useState, useRef, useEffect } from 'react'
import { useLocalStorage } from '../hooks'
import { STICKERS, STICKER_CATEGORIES } from '../data'
import { CUSTOM_STICKER_IMAGES } from '../assets/stickers/index'

// ── Theme presets ──────────────────────────────────────────────────────────────

const THEME_PRESETS = [
  { key: 'pink',   bg: '#fde8ef', accent: '#b5546a', dashed: '#f5c2d0', shadow: 'rgba(181,84,106,.16)', shadowDeep: 'rgba(181,84,106,.24)', textMuted: '#9a4560' },
  { key: 'yellow', bg: '#faf3d4', accent: '#9a8428', dashed: '#e0cc7a', shadow: 'rgba(154,132,40,.16)', shadowDeep: 'rgba(154,132,40,.24)', textMuted: '#7a6820' },
  { key: 'purple', bg: '#efe2f5', accent: '#a8689a', dashed: '#d3bce6', shadow: 'rgba(168,104,154,.16)', shadowDeep: 'rgba(168,104,154,.22)', textMuted: '#8a5a8a' },
  { key: 'blue',   bg: '#d8e6f5', accent: '#4f7099', dashed: '#b3cdea', shadow: 'rgba(90,108,132,.16)', shadowDeep: 'rgba(90,108,132,.22)', textMuted: '#4f7099' },
  { key: 'green',  bg: '#e7f0e4', accent: '#5b8a5c', dashed: '#c2dabe', shadow: 'rgba(91,138,92,.16)', shadowDeep: 'rgba(91,138,92,.22)', textMuted: '#4e7a4f' },
  { key: 'peach',  bg: '#fce8d4', accent: '#c27a3a', dashed: '#f5c8aa', shadow: 'rgba(194,122,58,.16)', shadowDeep: 'rgba(194,122,58,.24)', textMuted: '#9c6330' },
]

const DEFAULT_THEME_KEY = { jessie: 'pink', chris: 'yellow' }

const PROFILES_CONFIG = {
  jessie: { id: 'jessie', name: 'Jessie', avatar: 'J' },
  chris:  { id: 'chris',  name: 'Chris',  avatar: 'C' },
}

export const PARENT_PROFILE = { ...PROFILES_CONFIG.jessie, theme: THEME_PRESETS[0] }
export const CHRIS_PROFILE  = { ...PROFILES_CONFIG.chris,  theme: THEME_PRESETS[1] }

// ── Shared constants ───────────────────────────────────────────────────────────

const TODO_PRIORITIES = [
  { key: 'today',   label: 'Today',      bg: '#fde8ef', color: '#b5546a' },
  { key: 'week',    label: 'This week',  bg: '#fae7c4', color: '#9c7a36' },
  { key: 'month',   label: 'This month', bg: '#e7f0e4', color: '#4e7a4f' },
  { key: 'someday', label: 'Someday',    bg: '#efe2f5', color: '#8a5a8a' },
]

const REMINDER_TIMEFRAMES = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'all',   label: 'All' },
]

const GROCERY_CATS = ['Fruit & Veg', 'Meat', 'Dairy', 'Bakery', 'Pantry', 'Drinks', 'Cleaning', 'Other']

const FAMILY_NOTE_COLORS = [
  { key: 'amber',  bg: '#fef3e8', border: '#f5d5aa', color: '#9c6330' },
  { key: 'pink',   bg: '#fde8ef', border: '#f5c2d0', color: '#a0475e' },
  { key: 'green',  bg: '#e7f0e4', border: '#c2dabe', color: '#4e7a4f' },
  { key: 'blue',   bg: '#deeaf7', border: '#b3cfee', color: '#3d6a99' },
  { key: 'purple', bg: '#efe2f5', border: '#d3bce6', color: '#7a4a8a' },
]

const BOARD_NOTE_COLORS = ['#fae7c4', '#fde8ef', '#d8e6f5', '#e7f0e4']

const WHITE_OUTLINE = [
  '-5px -5px 0 #fff', '5px -5px 0 #fff', '-5px 5px 0 #fff', '5px 5px 0 #fff',
  '-5px 0 0 #fff', '5px 0 0 #fff', '0 -5px 0 #fff', '0 5px 0 #fff',
].join(', ')

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function isThisWeek(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const start = new Date(now); start.setDate(now.getDate() - now.getDay() + 1); start.setHours(0,0,0,0)
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999)
  return d >= start && d <= end
}

function isThisMonth(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

// ── Noteboard handle components ────────────────────────────────────────────────

function RotateHandle({ onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute', top: -34, left: '50%', transform: 'translateX(-50%)',
        width: 24, height: 24, borderRadius: '50%',
        background: '#fff', border: '2.5px solid #3a3340',
        cursor: 'grab', zIndex: 30, touchAction: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a3340" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-9-9" /><polyline points="21 3 21 9 15 9" />
      </svg>
    </div>
  )
}

function ResizeHandle({ onPointerDown }) {
  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute', bottom: -11, right: -11,
        width: 22, height: 22, borderRadius: '50%',
        background: '#fff', border: '2.5px solid #3a3340',
        cursor: 'nwse-resize', zIndex: 30, touchAction: 'none',
      }}
    />
  )
}

function DeleteBtn({ onDelete }) {
  return (
    <button
      onPointerDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onDelete() }}
      style={{
        position: 'absolute', top: -13, right: -13,
        width: 26, height: 26, borderRadius: '50%',
        background: '#3a3340', color: '#fff',
        border: 'none', cursor: 'pointer', fontSize: 15,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
      }}
    >×</button>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ParentProfile({ onBack, person = 'jessie' }) {
  const profile = PROFILES_CONFIG[person] || PROFILES_CONFIG.jessie
  const [photo] = useLocalStorage(`photo_${person}`, null)
  const [tab, setTab] = useState('todos')
  const [themeKey, setThemeKey] = useLocalStorage(`quest-daily-${person}-theme-key`, DEFAULT_THEME_KEY[person] || 'pink')
  const [showThemePicker, setShowThemePicker] = useState(false)

  const theme = THEME_PRESETS.find(t => t.key === themeKey) || THEME_PRESETS[0]

  // Noteboard state
  const [boardStickers, setBoardStickers] = useLocalStorage(`quest-daily-${person}-board-stickers`, [])
  const [boardNotes, setBoardNotes] = useLocalStorage(`quest-daily-${person}-board-notes`, [])
  const [selected, setSelected] = useState(null)
  const [dragState, setDragState] = useState(null)
  const [showStickerPicker, setShowStickerPicker] = useState(false)
  const [stickerCategory, setStickerCategory] = useState('custom')
  const headerRef = useRef(null)
  const movedRef = useRef(false)

  const TABS = [
    { key: 'todos',     label: '✓ To-do'    },
    { key: 'reminders', label: '🔔 Reminders' },
    { key: 'shopping',  label: '🛒 Shopping'  },
    { key: 'notes',     label: '📝 Notes'     },
  ]

  function updateStickerAt(idx, changes) {
    setBoardStickers(prev => prev.map((st, i) => i === idx ? { ...st, ...changes } : st))
  }
  function updateNoteAt(idx, changes) {
    setBoardNotes(prev => prev.map((n, i) => i === idx ? { ...n, ...changes } : n))
  }

  function startDrag(e, type, idx, action) {
    e.preventDefault()
    movedRef.current = false
    const rect = headerRef.current?.getBoundingClientRect()
    if (!rect) return
    const item = (type === 'sticker' ? boardStickers : boardNotes)[idx]
    if (!item) return
    const centerX = rect.left + (item.x / 100) * rect.width
    const centerY = rect.top + (item.y / 100) * rect.height
    setSelected({ type, idx })
    setDragState({
      type, idx, action,
      startX: e.clientX, startY: e.clientY,
      origX: item.x, origY: item.y,
      origSize: item.size || 72,
      origScale: item.scale || 1,
      origRotate: item.rotate || 0,
      centerX, centerY, rect,
      startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX),
      startDist: Math.hypot(e.clientX - centerX, e.clientY - centerY) || 1,
    })
  }

  function onHeaderPointerMove(e) {
    if (!dragState) return
    e.preventDefault()
    const { type, idx, action, startX, startY, origX, origY, origSize, origScale, origRotate, centerX, centerY, rect, startAngle, startDist } = dragState
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > 4) movedRef.current = true
    const upd = type === 'sticker'
      ? ch => updateStickerAt(idx, ch)
      : ch => updateNoteAt(idx, ch)
    if (action === 'move') {
      upd({
        x: Math.max(2, Math.min(98, origX + ((e.clientX - startX) / rect.width) * 100)),
        y: Math.max(2, Math.min(98, origY + ((e.clientY - startY) / rect.height) * 100)),
      })
    } else if (action === 'resize') {
      const ratio = Math.hypot(e.clientX - centerX, e.clientY - centerY) / startDist
      if (type === 'sticker') upd({ size: Math.max(32, Math.min(180, origSize * ratio)) })
      else upd({ scale: Math.max(0.4, Math.min(3, origScale * ratio)) })
    } else if (action === 'rotate') {
      const delta = (Math.atan2(e.clientY - centerY, e.clientX - centerX) - startAngle) * (180 / Math.PI)
      upd({ rotate: origRotate + delta })
    }
  }

  function onHeaderPointerUp() {
    setDragState(null)
    setTimeout(() => { movedRef.current = false }, 80)
  }

  function addSticker(stickerId) {
    setBoardStickers(prev => [...prev, { id: stickerId, x: 50, y: 50, size: 72, rotate: 0 }])
    setSelected({ type: 'sticker', idx: boardStickers.length })
    setShowStickerPicker(false)
  }

  function addNote() {
    const color = BOARD_NOTE_COLORS[boardNotes.length % BOARD_NOTE_COLORS.length]
    setBoardNotes(prev => [...prev, { id: `note-${Date.now()}`, x: 50, y: 50, scale: 1, rotate: -1, text: 'Tap to edit...', color }])
    setSelected({ type: 'note', idx: boardNotes.length })
  }

  function deleteSelected() {
    if (!selected) return
    if (selected.type === 'sticker') {
      setBoardStickers(prev => prev.filter((_, i) => i !== selected.idx))
    } else {
      setBoardNotes(prev => prev.filter((_, i) => i !== selected.idx))
    }
    setSelected(null)
  }

  useEffect(() => {
    function onKey(e) {
      if (!selected) return
      if (e.key !== 'Backspace' && e.key !== 'Delete') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      e.preventDefault()
      deleteSelected()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const filteredStickers = STICKERS.filter(s => s.category === stickerCategory)

  return (
    <div style={{
      minHeight: '100dvh',
      background: theme.bg,
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#3a3340',
    }}>
      {/* Noteboard header */}
      <div
        ref={headerRef}
        style={{
          background: theme.bg,
          position: 'relative',
          minHeight: 300,
          overflow: selected ? 'visible' : 'hidden',
          touchAction: dragState ? 'none' : 'auto',
          userSelect: 'none',
        }}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onPointerDown={e => { if (e.target === e.currentTarget && !movedRef.current) setSelected(null) }}
      >
        {/* Back button */}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onBack() }}
          style={{
            position: 'absolute', top: 16, left: 16, zIndex: 20,
            background: 'rgba(255,255,255,.72)', border: 'none',
            borderRadius: 999, padding: '8px 16px',
            fontFamily: "'Space Mono', monospace", fontSize: 11,
            color: theme.textMuted, cursor: 'pointer',
            letterSpacing: '0.06em', backdropFilter: 'blur(6px)',
          }}
        >← Home</button>

        {/* Theme picker button */}
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); setShowThemePicker(v => !v); setShowStickerPicker(false) }}
          title="Change colour theme"
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 20,
            background: 'rgba(255,255,255,.72)', border: 'none',
            borderRadius: 999, padding: '7px 11px',
            fontSize: 16, cursor: 'pointer', backdropFilter: 'blur(6px)',
          }}
        >🎨</button>

        {/* Theme picker panel */}
        {showThemePicker && (
          <div
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 56, right: 16, zIndex: 50,
              background: '#fff', borderRadius: 18,
              padding: '14px 16px',
              boxShadow: '0 8px 28px rgba(58,51,64,.18)',
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9a8fa6' }}>Colour theme</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {THEME_PRESETS.map(t => (
                <button
                  key={t.key}
                  onClick={() => { setThemeKey(t.key); setShowThemePicker(false) }}
                  title={t.key.charAt(0).toUpperCase() + t.key.slice(1)}
                  style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: t.bg, border: 'none', cursor: 'pointer',
                    outline: themeKey === t.key ? `3px solid ${t.accent}` : `2px solid ${t.dashed}`,
                    outlineOffset: 2, transition: 'outline 0.15s',
                    boxShadow: `0 2px 6px ${t.shadow}`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Avatar + name */}
        <div style={{
          position: 'absolute', bottom: 20, left: 20, zIndex: 5,
          display: 'flex', alignItems: 'flex-end', gap: 14,
          pointerEvents: 'none',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            overflow: 'hidden', flexShrink: 0,
            background: 'rgba(255,255,255,.55)',
            border: `2px solid ${theme.dashed}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 16px ${theme.shadow}`,
          }}>
            {photo
              ? <img src={photo} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: theme.accent }}>{profile.avatar}</span>
            }
          </div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 9,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: theme.textMuted, marginBottom: 3, opacity: 0.8,
            }}>My space</div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 'clamp(28px, 6vw, 38px)',
              color: theme.accent, lineHeight: 1, margin: 0,
            }}>{profile.name}</h1>
          </div>
        </div>

        {/* Add controls */}
        <div style={{
          position: 'absolute', bottom: 20, right: 12, zIndex: 20,
          display: 'flex', gap: 6,
        }}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); addNote(); setShowStickerPicker(false); setShowThemePicker(false) }}
            style={{
              background: 'rgba(255,255,255,.72)', border: `1.5px dashed ${theme.dashed}`,
              borderRadius: 12, padding: '6px 11px', fontSize: 12, cursor: 'pointer',
              fontFamily: "'Space Mono', monospace", color: theme.textMuted,
              backdropFilter: 'blur(6px)',
            }}
          >+ note</button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); setShowStickerPicker(v => !v); setShowThemePicker(false) }}
            style={{
              background: showStickerPicker ? theme.accent : 'rgba(255,255,255,.72)',
              border: `1.5px dashed ${showStickerPicker ? theme.accent : theme.dashed}`,
              borderRadius: 12, padding: '6px 11px', fontSize: 12, cursor: 'pointer',
              fontFamily: "'Space Mono', monospace",
              color: showStickerPicker ? '#fff' : theme.textMuted,
              backdropFilter: 'blur(6px)', transition: 'all 0.15s',
            }}
          >+ sticker</button>
        </div>

        {/* Sticker picker panel */}
        {showStickerPicker && (
          <div
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 60, right: 12, zIndex: 50,
              background: '#fff', borderRadius: 18,
              padding: '14px',
              boxShadow: '0 8px 28px rgba(58,51,64,.18)',
              width: 276,
              display: 'flex', flexDirection: 'column', gap: 10,
            }}
          >
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {STICKER_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setStickerCategory(cat.id)}
                  style={{
                    padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: stickerCategory === cat.id ? theme.accent : '#f0ebf0',
                    color: stickerCategory === cat.id ? '#fff' : '#9a8fa6',
                    fontFamily: "'Space Mono', monospace", fontSize: 9,
                    fontWeight: stickerCategory === cat.id ? 700 : 400,
                  }}
                >{cat.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, overflowY: 'auto', maxHeight: 210 }}>
              {filteredStickers.map(s => (
                <button
                  key={s.id}
                  onClick={() => addSticker(s.id)}
                  title={s.label}
                  style={{
                    width: 44, height: 44, borderRadius: 10, border: 'none',
                    background: '#faf5f5', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, padding: 0,
                    transition: 'background 0.1s',
                  }}
                >
                  {s.image
                    ? <img src={CUSTOM_STICKER_IMAGES[s.id]} alt={s.label} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                    : s.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes on board */}
        {boardNotes.map((note, idx) => {
          const isSel = selected?.type === 'note' && selected?.idx === idx
          const scale = note.scale || 1
          const w = Math.round(190 * scale)
          return (
            <div
              key={note.id}
              style={{
                position: 'absolute',
                left: `${note.x}%`, top: `${note.y}%`,
                transform: `translate(-50%, -50%) rotate(${note.rotate || 0}deg)`,
                width: w,
                zIndex: isSel ? 10 : 2,
                cursor: dragState?.idx === idx && dragState?.type === 'note' ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onPointerDown={e => { setSelected({ type: 'note', idx }); startDrag(e, 'note', idx, 'move') }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{
                background: note.color || '#fae7c4',
                borderRadius: 3,
                padding: `${Math.round(28 * scale)}px ${Math.round(16 * scale)}px ${Math.round(18 * scale)}px`,
                boxShadow: isSel
                  ? '0 0 0 2.5px #3a3340, 0 8px 24px rgba(58,51,64,.22)'
                  : '0 6px 14px rgba(58,51,64,.12)',
                minHeight: Math.round(110 * scale),
                position: 'relative',
              }}>
                {/* Tape */}
                <div style={{
                  position: 'absolute', top: -10, left: '50%',
                  transform: 'translateX(-50%)',
                  width: Math.round(72 * scale), height: 22,
                  background: 'rgba(220,196,80,.38)',
                  borderLeft: '1px dashed rgba(190,160,40,.5)',
                  borderRight: '1px dashed rgba(190,160,40,.5)',
                }} />
                {isSel && (
                  <div
                    style={{ display: 'flex', gap: 5, marginBottom: 8, justifyContent: 'center' }}
                    onClick={e => e.stopPropagation()}
                    onPointerDown={e => e.stopPropagation()}
                  >
                    {BOARD_NOTE_COLORS.map(c => (
                      <button key={c} onClick={() => updateNoteAt(idx, { color: c })} style={{
                        width: 14, height: 14, borderRadius: '50%', background: c,
                        border: note.color === c ? '2px solid #3a3340' : '2px solid transparent',
                        cursor: 'pointer', padding: 0,
                      }} />
                    ))}
                  </div>
                )}
                <textarea
                  value={note.text}
                  onChange={e => updateNoteAt(idx, { text: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  onPointerDown={e => { if (isSel) e.stopPropagation() }}
                  readOnly={!isSel}
                  style={{
                    width: '100%', border: 'none', background: 'transparent',
                    fontFamily: "'Patrick Hand', cursive",
                    fontSize: Math.round(17 * scale),
                    lineHeight: 1.35, color: '#6b5a3c',
                    resize: 'none', outline: 'none',
                    minHeight: Math.round(80 * scale),
                    cursor: isSel ? 'text' : 'grab',
                    pointerEvents: isSel ? 'auto' : 'none',
                  }}
                />
              </div>
              {isSel && (
                <>
                  <DeleteBtn onDelete={deleteSelected} />
                  <ResizeHandle onPointerDown={e => { e.stopPropagation(); startDrag(e, 'note', idx, 'resize') }} />
                  <RotateHandle onPointerDown={e => { e.stopPropagation(); startDrag(e, 'note', idx, 'rotate') }} />
                </>
              )}
            </div>
          )
        })}

        {/* Stickers on board */}
        {boardStickers.map((stickerData, idx) => {
          const def = STICKERS.find(s => s.id === stickerData.id)
          if (!def) return null
          const isSel = selected?.type === 'sticker' && selected?.idx === idx
          const size = stickerData.size || 72
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${stickerData.x}%`, top: `${stickerData.y}%`,
                transform: `translate(-50%, -50%) rotate(${stickerData.rotate || 0}deg)`,
                width: size + 24, height: size + 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: isSel ? 10 : 3,
                cursor: dragState?.idx === idx && dragState?.type === 'sticker' ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onPointerDown={e => { setSelected({ type: 'sticker', idx }); startDrag(e, 'sticker', idx, 'move') }}
              onClick={e => e.stopPropagation()}
            >
              {isSel && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '2px dashed #3a3340', opacity: 0.5,
                }} />
              )}
              <div style={{ filter: 'drop-shadow(0 5px 10px rgba(58,51,64,0.22))' }}>
                {def.image
                  ? <img src={CUSTOM_STICKER_IMAGES[def.id]} alt={def.label} draggable={false}
                      style={{ width: size * 0.85, height: size * 0.85, objectFit: 'contain', display: 'block' }} />
                  : <span style={{ fontSize: size * 0.68, lineHeight: 1, display: 'block', textShadow: WHITE_OUTLINE }}>
                      {def.emoji}
                    </span>
                }
              </div>
              {isSel && (
                <>
                  <DeleteBtn onDelete={deleteSelected} />
                  <ResizeHandle onPointerDown={e => { e.stopPropagation(); startDrag(e, 'sticker', idx, 'resize') }} />
                  <RotateHandle onPointerDown={e => { e.stopPropagation(); startDrag(e, 'sticker', idx, 'rotate') }} />
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Tab bar */}
      <div style={{
        background: '#fff',
        display: 'flex',
        borderBottom: '1px solid #f0e8e0',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '14px 8px',
              border: 'none', background: 'none', cursor: 'pointer',
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              letterSpacing: '0.06em', color: tab === t.key ? theme.accent : '#9a8fa6',
              borderBottom: `2.5px solid ${tab === t.key ? theme.accent : 'transparent'}`,
              transition: 'color 0.15s, border-color 0.15s',
              fontWeight: tab === t.key ? 700 : 400,
            }}
          >{t.label}</button>
        ))}
      </div>

      <div style={{ padding: '28px 20px 80px' }}>
        {tab === 'todos'     && <TodosTab person={person} accentColor={theme.accent} bgColor={theme.bg} />}
        {tab === 'reminders' && <RemindersTab person={person} accentColor={theme.accent} />}
        {tab === 'shopping'  && <ShoppingTab accentColor={theme.accent} />}
        {tab === 'notes'     && <NotesTab accentColor={theme.accent} />}
      </div>
    </div>
  )
}

// ── To-do tab ─────────────────────────────────────────────────────────────────

function TodosTab({ person, accentColor, bgColor }) {
  const [todos, setTodos] = useLocalStorage(`quest-daily-${person}-todos`, [])
  const [text, setText] = useState('')
  const [priority, setPriority] = useState('today')
  const [filter, setFilter] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [speechError, setSpeechError] = useState(null)
  const inputRef = useRef(null)
  const recognitionRef = useRef(null)

  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  function addTodo() {
    const t = text.trim()
    if (!t) return
    setTodos(prev => [{
      id: `todo-${Date.now()}`,
      text: t, priority, done: false,
      createdAt: new Date().toISOString(),
    }, ...prev])
    setText('')
    inputRef.current?.focus()
  }

  function toggleDone(id) {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  function deleteTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setSpeechError(null)
    const rec = new SR()
    rec.lang = 'en-AU'
    rec.interimResults = false
    rec.onresult = e => {
      const heard = e.results[0][0].transcript
      setText(prev => prev ? prev + ' ' + heard : heard)
      setIsListening(false)
    }
    rec.onerror = e => {
      setSpeechError(e.error === 'not-allowed' ? 'Mic access denied' : 'Could not hear — try again')
      setIsListening(false)
    }
    rec.onend = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  const doneCount = todos.filter(t => t.done).length

  const visible = todos.filter(t => {
    if (!showDone && t.done) return false
    if (filter === 'all') return true
    return t.priority === filter
  })

  return (
    <div>
      <style>{`@keyframes ppPulse { 0%,100% { box-shadow: 0 0 0 0 ${accentColor}66 } 50% { box-shadow: 0 0 0 8px ${accentColor}00 } }`}</style>

      <div style={{
        background: '#fff', borderRadius: 20,
        padding: '20px', marginBottom: 16,
        boxShadow: '0 3px 14px rgba(58,51,64,.06)',
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {TODO_PRIORITIES.map(p => (
            <button
              key={p.key}
              onClick={() => setPriority(p.key)}
              style={{
                padding: '5px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: priority === p.key ? p.bg : '#f5f0f0',
                color: priority === p.key ? p.color : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                fontWeight: priority === p.key ? 700 : 400,
                transition: 'all 0.15s',
              }}
            >{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            placeholder="Add a task…"
            style={{
              flex: 1, border: '1.5px solid #e8ddd4', borderRadius: 12,
              padding: '11px 14px', fontSize: 15, outline: 'none',
              fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
              background: '#fdf8f4',
            }}
          />
          {voiceSupported && (
            <button
              onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false) } : startVoice}
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: isListening ? accentColor : bgColor,
                color: isListening ? '#fff' : accentColor,
                fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isListening ? 'ppPulse 1s ease-in-out infinite' : 'none',
                transition: 'background 0.2s',
              }}
            >🎤</button>
          )}
          <button
            onClick={addTodo}
            disabled={!text.trim()}
            style={{
              height: 44, padding: '0 20px', borderRadius: 999, border: 'none',
              background: text.trim() ? accentColor : '#e8ddd4',
              color: text.trim() ? '#fff' : '#9a8fa6',
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >Add</button>
        </div>
        {(isListening || speechError) && (
          <div style={{ fontSize: 12, color: accentColor, marginTop: 8 }}>
            {isListening ? 'Listening… speak now' : speechError}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {[{ key: 'all', label: 'All' }, ...TODO_PRIORITIES].map(p => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filter === p.key ? accentColor : '#fff',
              color: filter === p.key ? '#fff' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              fontWeight: filter === p.key ? 700 : 400,
              boxShadow: filter === p.key ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
              transition: 'all 0.15s',
            }}
          >{p.label}</button>
        ))}
        {doneCount > 0 && (
          <button
            onClick={() => setShowDone(v => !v)}
            style={{
              marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, border: 'none',
              background: showDone ? '#e7f0e4' : '#fff', color: showDone ? '#4e7a4f' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(58,51,64,.07)',
            }}
          >{showDone ? `Hide done (${doneCount})` : `Done (${doneCount})`}</button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="✅" title={todos.length === 0 ? 'No tasks yet' : 'All clear!'} sub={todos.length === 0 ? 'Add your first task above' : 'Nothing to show here'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map(todo => {
            const p = TODO_PRIORITIES.find(o => o.key === todo.priority) || TODO_PRIORITIES[0]
            return (
              <div key={todo.id} style={{
                background: '#fff', borderRadius: 16,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 2px 8px rgba(58,51,64,.05)',
                opacity: todo.done ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}>
                <button
                  onClick={() => toggleDone(todo.id)}
                  style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${todo.done ? '#5b8a5c' : '#e8ddd4'}`,
                    background: todo.done ? '#e7f0e4' : '#fff',
                    cursor: 'pointer', fontSize: 12, padding: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#5b8a5c', transition: 'all 0.15s',
                  }}
                >{todo.done ? '✓' : ''}</button>
                <span style={{
                  flex: 1, fontSize: 15, color: '#3a3340',
                  textDecoration: todo.done ? 'line-through' : 'none',
                }}>{todo.text}</span>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 9,
                  background: p.bg, color: p.color,
                  padding: '3px 9px', borderRadius: 999, flexShrink: 0,
                }}>{p.label}</span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={{ background: 'none', border: 'none', fontSize: 14, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}
                >✕</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Reminders tab ─────────────────────────────────────────────────────────────

function RemindersTab({ person, accentColor }) {
  const [reminders, setReminders] = useLocalStorage(`quest-daily-${person}-reminders`, [])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('today')

  const [text, setText] = useState('')
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('')
  const [repeat, setRepeat] = useState('none')

  const REPEATS = [
    { key: 'none',    label: 'Once' },
    { key: 'daily',   label: 'Daily' },
    { key: 'weekly',  label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ]

  function addReminder() {
    const t = text.trim()
    if (!t || !date) return
    setReminders(prev => [...prev, {
      id: `rem-${Date.now()}`,
      text: t, date, time, repeat, done: false,
    }])
    setText(''); setDate(todayStr()); setTime(''); setRepeat('none')
    setShowForm(false)
  }

  function dismissReminder(id) {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: true } : r))
  }

  function deleteReminder(id) {
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const today = todayStr()
  const visible = reminders.filter(r => {
    if (r.done) return false
    if (filter === 'today') return r.date === today
    if (filter === 'week')  return isThisWeek(r.date)
    if (filter === 'month') return isThisMonth(r.date)
    return true
  }).sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))

  const inputStyle = {
    border: '1.5px solid #e8ddd4', borderRadius: 12,
    padding: '10px 13px', fontSize: 14, outline: 'none',
    fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
    background: '#fdf8f4',
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {REMINDER_TIMEFRAMES.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filter === f.key ? accentColor : '#fff',
              color: filter === f.key ? '#fff' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              fontWeight: filter === f.key ? 700 : 400,
              boxShadow: filter === f.key ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
              transition: 'all 0.15s',
            }}
          >{f.label}</button>
        ))}
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            marginLeft: 'auto', padding: '6px 16px', borderRadius: 999,
            border: `1.5px solid ${accentColor}`, background: showForm ? accentColor : '#fff',
            color: showForm ? '#fff' : accentColor,
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            cursor: 'pointer', fontWeight: 600,
            transition: 'all 0.15s',
          }}
        >+ Add</button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px',
          marginBottom: 16, boxShadow: '0 3px 14px rgba(58,51,64,.06)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="What do you need to remember?"
            autoFocus
            style={{ ...inputStyle, width: '100%' }}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Date</div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
            </div>
            <div style={{ flex: 1, minWidth: 100 }}>
              <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5 }}>Time (optional)</div>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Repeat</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {REPEATS.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRepeat(r.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: repeat === r.key ? '#f5f0f5' : '#f5f0f0',
                    color: repeat === r.key ? accentColor : '#9a8fa6',
                    fontFamily: "'Space Mono', monospace", fontSize: 10,
                    fontWeight: repeat === r.key ? 700 : 400,
                  }}
                >{r.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={addReminder}
              disabled={!text.trim() || !date}
              style={{
                background: text.trim() && date ? accentColor : '#e8ddd4',
                color: text.trim() && date ? '#fff' : '#9a8fa6',
                border: 'none', borderRadius: 999,
                padding: '10px 22px', fontSize: 13, fontWeight: 600,
                cursor: text.trim() && date ? 'pointer' : 'default',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >Save reminder</button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: '#f5f0f0', color: '#6f6675', border: 'none', borderRadius: 999,
                padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >Cancel</button>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState icon="🔔" title="No reminders" sub={filter === 'today' ? 'Nothing due today' : filter === 'week' ? 'Nothing this week' : 'Add a reminder above'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map(r => {
            const isOverdue = r.date < today
            const repeatLabel = r.repeat !== 'none' ? r.repeat : null
            return (
              <div key={r.id} style={{
                background: '#fff', borderRadius: 16,
                padding: '16px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                boxShadow: '0 2px 8px rgba(58,51,64,.05)',
                borderLeft: `3px solid ${isOverdue ? '#b5546a' : accentColor}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: '#3a3340', marginBottom: 5 }}>{r.text}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 10,
                      color: isOverdue ? '#b5546a' : '#9a8fa6',
                      fontWeight: isOverdue ? 700 : 400,
                    }}>
                      {isOverdue ? '⚠ ' : ''}{r.date}{r.time ? ` · ${r.time}` : ''}
                    </span>
                    {repeatLabel && (
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 9,
                        background: '#f5f0f5', color: accentColor,
                        padding: '2px 8px', borderRadius: 999, textTransform: 'capitalize',
                      }}>↻ {repeatLabel}</span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => dismissReminder(r.id)}
                    style={{
                      background: '#e7f0e4', color: '#4e7a4f', border: 'none',
                      borderRadius: 999, padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                    }}
                  >✓ Done</button>
                  <button
                    onClick={() => deleteReminder(r.id)}
                    style={{ background: 'none', border: 'none', fontSize: 14, color: '#c9a0a0', cursor: 'pointer', padding: '4px' }}
                  >✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Shopping tab (shared) ──────────────────────────────────────────────────────

function ShoppingTab({ accentColor }) {
  const [items, setItems] = useLocalStorage('quest-daily-shopping', [])
  const [text, setText] = useState('')
  const [qty, setQty] = useState('')
  const [category, setCategory] = useState('Other')
  const [filterCat, setFilterCat] = useState('all')
  const [showDone, setShowDone] = useState(false)
  const [addedBy, setAddedBy] = useState('Jessie')
  const inputRef = useRef(null)

  function addItem() {
    const t = text.trim()
    if (!t) return
    setItems(prev => [...prev, {
      id: `shop-${Date.now()}`,
      text: t, qty: qty.trim() || null, category, done: false, addedBy,
      addedAt: new Date().toISOString(),
    }])
    setText(''); setQty('')
    inputRef.current?.focus()
  }

  function toggleItem(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function clearDone() {
    setItems(prev => prev.filter(i => !i.done))
  }

  const pendingCount = items.filter(i => !i.done).length
  const doneCount = items.filter(i => i.done).length
  const usedCats = [...new Set(items.map(i => i.category).filter(Boolean))]
  const allCats = [...new Set([...GROCERY_CATS, ...usedCats])]

  const visible = items.filter(i => {
    if (!showDone && i.done) return false
    if (filterCat === 'all') return true
    return i.category === filterCat
  })

  const grouped = {}
  visible.forEach(item => {
    const cat = item.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  })

  const inputStyle = {
    border: '1.5px solid #e8ddd4', borderRadius: 12,
    padding: '10px 13px', fontSize: 14, outline: 'none',
    fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
    background: '#fdf8f4',
  }

  return (
    <div>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '18px 20px',
        marginBottom: 14, boxShadow: '0 3px 14px rgba(58,51,64,.06)',
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Adding as:</span>
          {['Jessie', 'Chris'].map(name => (
            <button
              key={name}
              onClick={() => setAddedBy(name)}
              style={{
                padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: addedBy === name ? '#f5f0f5' : '#f5f0f0',
                color: addedBy === name ? accentColor : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                fontWeight: addedBy === name ? 700 : 400,
              }}
            >{name}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add item…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="Qty"
            style={{ ...inputStyle, width: 60, textAlign: 'center' }}
          />
          <button
            onClick={addItem}
            disabled={!text.trim()}
            style={{
              height: 44, padding: '0 18px', borderRadius: 999, border: 'none',
              background: text.trim() ? accentColor : '#e8ddd4',
              color: text.trim() ? '#fff' : '#9a8fa6',
              fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600,
              cursor: text.trim() ? 'pointer' : 'default', flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >Add</button>
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {allCats.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              style={{
                padding: '4px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                background: category === c ? '#f5f0f5' : '#f5f0f0',
                color: category === c ? accentColor : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 9,
                fontWeight: category === c ? 700 : 400,
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => setFilterCat('all')}
          style={{
            padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: filterCat === 'all' ? accentColor : '#fff',
            color: filterCat === 'all' ? '#fff' : '#9a8fa6',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            fontWeight: filterCat === 'all' ? 700 : 400,
            boxShadow: filterCat === 'all' ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
          }}
        >All ({pendingCount})</button>
        {usedCats.map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            style={{
              padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: filterCat === c ? accentColor : '#fff',
              color: filterCat === c ? '#fff' : '#9a8fa6',
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              fontWeight: filterCat === c ? 700 : 400,
              boxShadow: filterCat === c ? 'none' : '0 1px 4px rgba(58,51,64,.07)',
            }}
          >{c}</button>
        ))}
        {doneCount > 0 && (
          <>
            <button
              onClick={() => setShowDone(v => !v)}
              style={{
                marginLeft: 'auto', padding: '5px 12px', borderRadius: 999, border: 'none',
                background: showDone ? '#e7f0e4' : '#fff', color: showDone ? '#4e7a4f' : '#9a8fa6',
                fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(58,51,64,.07)',
              }}
            >{showDone ? `Hide got (${doneCount})` : `Got (${doneCount})`}</button>
            {showDone && (
              <button
                onClick={clearDone}
                style={{
                  padding: '5px 12px', borderRadius: 999, border: 'none',
                  background: 'none', color: '#c9a0a0',
                  fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer',
                }}
              >Clear got</button>
            )}
          </>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="🛒" title="List is empty" sub="Add your first item above" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(grouped).map(([cat, catItems]) => (
            <div key={cat}>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 10,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#9a8fa6', marginBottom: 8,
              }}>{cat}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {catItems.map(item => (
                  <div key={item.id} style={{
                    background: '#fff', borderRadius: 14,
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    boxShadow: '0 2px 8px rgba(58,51,64,.05)',
                    opacity: item.done ? 0.5 : 1, transition: 'opacity 0.2s',
                  }}>
                    <button
                      onClick={() => toggleItem(item.id)}
                      style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${item.done ? '#5b8a5c' : '#e8ddd4'}`,
                        background: item.done ? '#e7f0e4' : '#fff',
                        cursor: 'pointer', fontSize: 12, padding: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#5b8a5c', transition: 'all 0.15s',
                      }}
                    >{item.done ? '✓' : ''}</button>
                    <span style={{
                      flex: 1, fontSize: 15, color: '#3a3340',
                      textDecoration: item.done ? 'line-through' : 'none',
                    }}>{item.text}</span>
                    {item.qty && (
                      <span style={{
                        fontFamily: "'Space Mono', monospace", fontSize: 11,
                        color: accentColor, background: '#f5f0f5',
                        padding: '2px 9px', borderRadius: 999, flexShrink: 0,
                      }}>{item.qty}</span>
                    )}
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: '#c9a0a0', flexShrink: 0,
                    }}>{item.addedBy}</span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      style={{ background: 'none', border: 'none', fontSize: 14, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px', flexShrink: 0 }}
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Family Notes tab (shared) ──────────────────────────────────────────────────

function NotesTab({ accentColor }) {
  const [notes, setNotes] = useLocalStorage('quest-daily-family-notes', [])
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)

  const [text, setText] = useState('')
  const [author, setAuthor] = useState('Jessie')
  const [colorKey, setColorKey] = useState('pink')
  const [pinned, setPinned] = useState(false)

  function openNew() {
    setText(''); setAuthor('Jessie'); setColorKey('pink'); setPinned(false); setEditId(null)
    setShowForm(true)
  }

  function openEdit(note) {
    setText(note.text); setAuthor(note.author); setColorKey(note.colorKey || 'pink'); setPinned(note.pinned || false)
    setEditId(note.id); setShowForm(true)
  }

  function saveNote() {
    const t = text.trim()
    if (!t) return
    if (editId) {
      setNotes(prev => prev.map(n => n.id === editId ? { ...n, text: t, author, colorKey, pinned } : n))
    } else {
      setNotes(prev => [{
        id: `note-${Date.now()}`,
        text: t, author, colorKey, pinned,
        createdAt: new Date().toISOString(),
      }, ...prev])
    }
    setShowForm(false); setEditId(null)
  }

  function deleteNote(id) {
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  function togglePin(id) {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  const sorted = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: '#9a8fa6', margin: 0 }}>
          Leave notes for each other — pin the important ones to the top.
        </p>
        <button
          onClick={openNew}
          style={{
            padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${accentColor}`,
            background: '#fff', color: accentColor,
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            cursor: 'pointer', fontWeight: 600, flexShrink: 0, marginLeft: 12,
          }}
        >+ Note</button>
      </div>

      {showForm && (
        <div style={{
          background: '#fff', borderRadius: 20, padding: '20px',
          marginBottom: 16, boxShadow: '0 3px 14px rgba(58,51,64,.06)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>From:</span>
            {['Jessie', 'Chris'].map(name => (
              <button
                key={name}
                onClick={() => setAuthor(name)}
                style={{
                  padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                  background: author === name ? '#f5f0f5' : '#f5f0f0',
                  color: author === name ? accentColor : '#9a8fa6',
                  fontFamily: "'Space Mono', monospace", fontSize: 10,
                  fontWeight: author === name ? 700 : 400,
                }}
              >{name}</button>
            ))}
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write your note here…"
            autoFocus
            rows={4}
            style={{
              border: '1.5px solid #e8ddd4', borderRadius: 12,
              padding: '12px 14px', fontSize: 15, outline: 'none',
              fontFamily: "'Hanken Grotesk', sans-serif", color: '#3a3340',
              background: '#fdf8f4', resize: 'vertical', lineHeight: 1.5,
            }}
          />

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: '#9a8fa6', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Colour:</span>
            {FAMILY_NOTE_COLORS.map(c => (
              <button
                key={c.key}
                onClick={() => setColorKey(c.key)}
                style={{
                  width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: c.bg,
                  outline: colorKey === c.key ? `2.5px solid ${c.color}` : '2px solid transparent',
                  outlineOffset: 2, transition: 'outline 0.1s',
                }}
              />
            ))}
            <label style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#9a8fa6' }}>
              <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} style={{ accentColor }} />
              Pin to top
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={saveNote}
              disabled={!text.trim()}
              style={{
                background: text.trim() ? accentColor : '#e8ddd4',
                color: text.trim() ? '#fff' : '#9a8fa6',
                border: 'none', borderRadius: 999,
                padding: '10px 22px', fontSize: 13, fontWeight: 600,
                cursor: text.trim() ? 'pointer' : 'default',
                fontFamily: "'Hanken Grotesk', sans-serif",
                transition: 'background 0.15s',
              }}
            >{editId ? 'Save' : 'Post note'}</button>
            <button
              onClick={() => { setShowForm(false); setEditId(null) }}
              style={{
                background: '#f5f0f0', color: '#6f6675', border: 'none', borderRadius: 999,
                padding: '10px 16px', fontSize: 13, cursor: 'pointer',
                fontFamily: "'Hanken Grotesk', sans-serif",
              }}
            >Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon="📝" title="No notes yet" sub="Leave a note for the family, or pin something important" />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 14,
        }}>
          {sorted.map(note => {
            const c = FAMILY_NOTE_COLORS.find(x => x.key === note.colorKey) || FAMILY_NOTE_COLORS[1]
            const d = new Date(note.createdAt)
            const dateStr = `${d.getDate()}/${d.getMonth() + 1} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
            return (
              <div key={note.id} style={{
                background: c.bg,
                border: `1.5px solid ${c.border}`,
                borderRadius: 18, padding: '18px 18px 14px',
                display: 'flex', flexDirection: 'column', gap: 10,
                position: 'relative',
                boxShadow: note.pinned ? '0 4px 16px rgba(58,51,64,.1)' : '0 2px 8px rgba(58,51,64,.05)',
              }}>
                {note.pinned && (
                  <div style={{ position: 'absolute', top: -8, right: 14, fontSize: 18 }}>📌</div>
                )}
                <div style={{ fontSize: 15, color: '#3a3340', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{note.text}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: c.color, fontWeight: 700 }}>{note.author}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#b3a9be', marginLeft: 8 }}>{dateStr}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => togglePin(note.id)}
                      style={{ background: 'none', border: 'none', fontSize: 13, color: note.pinned ? c.color : '#c9a0a0', cursor: 'pointer', padding: '2px 4px' }}
                    >📌</button>
                    <button
                      onClick={() => openEdit(note)}
                      style={{ background: 'none', border: 'none', fontSize: 13, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px' }}
                    >✏️</button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      style={{ background: 'none', border: 'none', fontSize: 13, color: '#c9a0a0', cursor: 'pointer', padding: '2px 4px' }}
                    >✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function EmptyState({ icon, title, sub }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 18,
      padding: '36px 24px', textAlign: 'center',
      boxShadow: '0 3px 14px rgba(58,51,64,.05)',
    }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: '#3a3340', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#9a8fa6' }}>{sub}</div>
    </div>
  )
}
