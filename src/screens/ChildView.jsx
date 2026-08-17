import { useState, useRef, useEffect } from 'react'
import { CHILDREN, CHILD_ORDER, SIDE_QUESTS, ROUTINES, MOODS, STICKERS, STICKER_CATEGORIES, DAYS_OF_WEEK, DAY_LABELS, DAY_FULL_LABELS } from '../data'
import { CUSTOM_STICKER_IMAGES } from '../assets/stickers/index'
import { resolveQuestImage } from '../assets/quests/index'
import { useClock } from '../hooks'
import Avatar from '../components/Avatar'
import TicketShape from '../components/TicketShape'
import { printQuestComplete, printQuestSheet } from '../utils/printer'
import AddQuestModal from '../components/AddQuestModal'

function spawnConfetti(centerX, centerY) {
  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f43', '#ff9f43', '#ffd93d']
  const shapes = ['circle', 'rect', 'rect']
  for (let i = 0; i < 48; i++) {
    const el = document.createElement('div')
    const color = colors[Math.floor(Math.random() * colors.length)]
    const angle = Math.random() * Math.PI * 2
    const dist = 90 + Math.random() * 140
    const size = 7 + Math.random() * 10
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    el.style.cssText = `position:fixed;left:${centerX}px;top:${centerY}px;width:${size}px;height:${shape === 'circle' ? size : size * 1.6}px;background:${color};border-radius:${shape === 'circle' ? '50%' : '3px'};pointer-events:none;z-index:9999;`
    document.body.appendChild(el)
    const anim = el.animate([
      { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${Math.cos(angle) * dist}px), calc(-50% + ${Math.sin(angle) * dist}px)) scale(0.15) rotate(${(Math.random() - 0.5) * 900}deg)`, opacity: 0 },
    ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(0,.9,.57,1)', fill: 'forwards' })
    anim.onfinish = () => el.remove()
  }
}

const DAY_PARTS = ['morning', 'afternoon', 'evening']
const DAY_PART_LABELS = { morning: '☀️ Morning', afternoon: '🌤️ Afternoon', evening: '🌙 Evening' }
const NOTE_COLORS = ['#fae7c4', '#fde8ef', '#d8e6f5', '#e7f0e4']
const WHITE_OUTLINE = [
  '-5px -5px 0 #fff', '5px -5px 0 #fff', '-5px 5px 0 #fff', '5px 5px 0 #fff',
  '-5px 0 0 #fff', '5px 0 0 #fff', '0 -5px 0 #fff', '0 5px 0 #fff',
  '-4px -3px 0 #fff', '4px -3px 0 #fff', '-3px -4px 0 #fff', '3px -4px 0 #fff',
  '-4px 3px 0 #fff', '4px 3px 0 #fff', '-3px 4px 0 #fff', '3px 4px 0 #fff',
].join(', ')

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

export default function ChildView({ childId, state, quests, onUpdate, onUpdateQuests, onUpdateChild, onBack, onOpenShop, onSuggestReward }) {
  const child = CHILDREN[childId]
  const clock = useClock()
  const [activeTab, setActiveTab] = useState('morning')
  const [ticketPop, setTicketPop] = useState(false)
  const [selected, setSelected] = useState(null)   // { type: 'sticker'|'note', idx }
  const [dragState, setDragState] = useState(null)
  const [showStickerPicker, setShowStickerPicker] = useState(false) // false | 'add' | 'change'
  const [showAddQuest, setShowAddQuest] = useState(false)
  const [viewingDay, setViewingDay] = useState(null) // null = today, or ISO date string 'YYYY-MM-DD'
  const [calMonth, setCalMonth] = useState(() => ({ year: new Date().getFullYear(), month: new Date().getMonth() }))
  const [questDragState, setQuestDragState] = useState(null) // { questId, section, displayOrder }
  const headerRef = useRef(null)
  const movedRef = useRef(false)
  const noteRefs = useRef({})
  const questCardRefs = useRef({})
  const questGhostRef = useRef(null)
  const questDragInfo = useRef(null)

  const headerStickers = state.headerStickers || []
  const headerNotes = state.notePositions || []

  function updateStickerAt(idx, changes) {
    onUpdate(s => ({ ...s, headerStickers: (s.headerStickers || []).map((st, i) => i === idx ? { ...st, ...changes } : st) }))
  }
  function updateNoteAt(idx, changes) {
    onUpdate(s => ({ ...s, notePositions: (s.notePositions || []).map((n, i) => i === idx ? { ...n, ...changes } : n) }))
  }

  function startDrag(e, type, idx, action) {
    e.preventDefault()
    movedRef.current = false
    const rect = headerRef.current?.getBoundingClientRect()
    if (!rect) return
    const item = (type === 'sticker' ? headerStickers : headerNotes)[idx]
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

  function handleBoardClick() { if (!movedRef.current) setSelected(null) }

  function addSticker(stickerId) {
    onUpdate(s => ({ ...s, headerStickers: [...(s.headerStickers || []), { id: stickerId, x: 50, y: 50, size: 72, rotate: 0 }] }))
    setSelected({ type: 'sticker', idx: headerStickers.length })
    setShowStickerPicker(false)
  }

  function addNote() {
    const color = NOTE_COLORS[headerNotes.length % NOTE_COLORS.length]
    onUpdate(s => ({
      ...s,
      notePositions: [...(s.notePositions || []), { id: `note-${Date.now()}`, x: 50, y: 50, scale: 1, rotate: -1, text: 'Tap to edit...', color }]
    }))
    setSelected({ type: 'note', idx: headerNotes.length })
  }

  function acknowledgeNote(idx, buttonEl) {
    const note = headerNotes[idx]
    if (!note || note.acknowledged) return

    // Confetti from the button
    const btnRect = buttonEl.getBoundingClientRect()
    spawnConfetti(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2)

    // Little happy bounce — note stays
    const noteEl = noteRefs.current[note.id]
    if (noteEl) {
      const base = noteEl.style.transform
      noteEl.animate([
        { transform: base },
        { transform: `${base} scale(1.1) rotate(3deg)`,  offset: 0.25 },
        { transform: `${base} scale(1.05) rotate(-2deg)`, offset: 0.55 },
        { transform: `${base} scale(1.02) rotate(1deg)`,  offset: 0.78 },
        { transform: base },
      ], { duration: 420, easing: 'ease-out' })
    }

    updateNoteAt(idx, { acknowledged: true })
  }

  function deleteSelected() {
    if (!selected) return
    if (selected.type === 'sticker') {
      onUpdate(s => ({ ...s, headerStickers: (s.headerStickers || []).filter((_, i) => i !== selected.idx) }))
    } else {
      onUpdate(s => ({ ...s, notePositions: (s.notePositions || []).filter((_, i) => i !== selected.idx) }))
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

  function popTickets() {
    setTicketPop(true)
    setTimeout(() => setTicketPop(false), 450)
  }

  const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const todayKey = DAY_KEYS[new Date().getDay()]
  const todayISO = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
  })()

  function questMatchesToday(q) {
    const rec = q.recurrence || 'daily'
    if (rec === 'once') {
      if (!q.date) return false
      const d = new Date(q.date + 'T00:00:00')
      const t = new Date()
      return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
    }
    if (rec === 'monthly') return new Date().getDate() === q.dayOfMonth
    if (rec === 'weekly') return (q.days || []).includes(todayKey)
    return true
  }

  function questMatchesDate(q, dateISO) {
    const d = new Date((dateISO || todayISO) + 'T00:00:00')
    const dk = DAY_KEYS[d.getDay()]
    const rec = q.recurrence || 'daily'
    if (rec === 'weekly') return (q.days || []).includes(dk)
    if (rec === 'monthly') return d.getDate() === q.dayOfMonth
    if (rec === 'once') return q.date === (dateISO || todayISO)
    return true
  }

  function enabledQuests(part) {
    const disabled = state.disabledQuests || []
    return (quests[part] || []).filter(q => !disabled.includes(q.id) && questMatchesDate(q, viewingDay))
  }

  function handleAddQuest({ sections, icon, title, tickets, imageKey, selectedKids, recurrence, days, dayOfMonth, date }) {
    const newId = `q-${Date.now()}`
    const questData = { id: newId, icon, title, tickets, imageKey, recurrence, days, dayOfMonth, date }
    onUpdateQuests(prev => {
      const next = { ...prev }
      sections.forEach(section => {
        next[section] = [...(next[section] || []), questData]
      })
      return next
    })
    CHILD_ORDER.forEach(id => {
      if (!selectedKids.includes(id)) {
        onUpdateChild(id, s => ({
          ...s,
          disabledQuests: [...(s.disabledQuests || []), newId],
        }))
      }
    })
    setShowAddQuest(false)
  }

  function currentQuestOrder(part) {
    if (questDragState?.section === part) {
      const full = quests[part] || []
      return questDragState.displayOrder
        .map(id => full.find(q => q.id === id))
        .filter(Boolean)
    }
    return enabledQuests(part)
  }

  function startQuestDrag(e, questId, part) {
    e.preventDefault()
    e.stopPropagation()
    const el = questCardRefs.current[questId]
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ghost = el.cloneNode(true)
    Object.assign(ghost.style, {
      position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
      width: rect.width + 'px', height: rect.height + 'px',
      margin: 0, pointerEvents: 'none', zIndex: 9000,
      opacity: '0.92', transform: 'scale(1.05) rotate(1deg)',
      boxShadow: '0 18px 44px rgba(58,51,64,.22)', borderRadius: '18px', transition: 'none',
    })
    document.body.appendChild(ghost)
    questGhostRef.current = ghost
    const order = enabledQuests(part).map(q => q.id)
    questDragInfo.current = { questId, part, order, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top }
    setQuestDragState({ questId, section: part, displayOrder: order })

    function onMove(ev) {
      ev.preventDefault()
      const info = questDragInfo.current
      if (!info) return
      const g = questGhostRef.current
      if (g) {
        g.style.left = (ev.clientX - info.offsetX) + 'px'
        g.style.top = (ev.clientY - info.offsetY) + 'px'
      }
      let closestId = null, closestDist = Infinity
      info.order.forEach(id => {
        if (id === info.questId) return
        const cardEl = questCardRefs.current[id]
        if (!cardEl) return
        const r = cardEl.getBoundingClientRect()
        const dist = Math.hypot(ev.clientX - (r.left + r.width / 2), ev.clientY - (r.top + r.height / 2))
        if (dist < closestDist) { closestDist = dist; closestId = id }
      })
      if (closestId && closestDist < 150) {
        const newOrder = [...info.order]
        const ai = newOrder.indexOf(info.questId)
        const bi = newOrder.indexOf(closestId)
        if (ai !== -1 && bi !== -1 && ai !== bi) {
          ;[newOrder[ai], newOrder[bi]] = [newOrder[bi], newOrder[ai]]
          info.order = newOrder
          setQuestDragState(d => ({ ...d, displayOrder: newOrder }))
        }
      }
    }

    function onUp() {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      questGhostRef.current?.remove()
      questGhostRef.current = null
      const info = questDragInfo.current
      if (!info) return
      const { part: section, order: finalOrder } = info
      onUpdateQuests(prev => {
        const disabled = state.disabledQuests || []
        const full = prev[section] || []
        const disabledQuests = full.filter(q => disabled.includes(q.id))
        const hiddenByRecurrence = full.filter(q => !disabled.includes(q.id) && !questMatchesToday(q))
        const reordered = finalOrder.map(id => full.find(q => q.id === id)).filter(Boolean)
        return { ...prev, [section]: [...reordered, ...hiddenByRecurrence, ...disabledQuests] }
      })
      questDragInfo.current = null
      setQuestDragState(null)
    }

    document.addEventListener('pointermove', onMove, { passive: false })
    document.addEventListener('pointerup', onUp)
  }

  function toggleQuest(dayPart, questId) {
    const quest = (quests[dayPart] || []).find(q => q.id === questId)
    if (!quest) return
    const isDone = state.completed[dayPart].includes(questId)
    if (!isDone) {
      const newTickets = state.tickets + quest.tickets
      const newCompleted = [...state.completed[dayPart], questId]
      const sectionDone = newCompleted.length === enabledQuests(dayPart).length
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
      sections: [{ label: DAY_PART_LABELS[part], quests: enabledQuests(part) }],
      allDay: false,
    })
  }

  function printAllDay() {
    printQuestSheet({
      childName: child.name,
      sections: DAY_PARTS.map(part => ({ label: DAY_PART_LABELS[part], quests: enabledQuests(part) })),
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

  const currentQuests = enabledQuests(activeTab)
  const doneCurrent = state.completed[activeTab].filter(id => currentQuests.some(q => q.id === id)).length
  const totalCurrent = currentQuests.length
  const progressPct = totalCurrent ? (doneCurrent / totalCurrent) * 100 : 0

  return (
    <>
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

      {/* Memoboard header — free-form canvas */}
      <div
        ref={headerRef}
        style={{
          background: child.theme.bg,
          position: 'relative',
          minHeight: 380,
          padding: '70px 0 50px',
          textAlign: 'center',
          overflow: selected ? 'visible' : 'hidden',
          touchAction: dragState ? 'none' : 'auto',
          userSelect: 'none',
        }}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
        onPointerDown={e => { if (e.target === e.currentTarget) setSelected(null) }}
      >
        {/* Notes */}
        {headerNotes.map((note, idx) => {
          const isSel = selected?.type === 'note' && selected?.idx === idx
          const scale = note.scale || 1
          const w = Math.round(190 * scale)
          return (
            <div
              key={note.id}
              ref={el => { noteRefs.current[note.id] = el }}
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
                minHeight: Math.round(170 * scale),
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
                {/* Note color picker when selected */}
                {isSel && (
                  <div style={{ display: 'flex', gap: 5, marginBottom: 8, justifyContent: 'center' }}
                    onClick={e => e.stopPropagation()} onPointerDown={e => e.stopPropagation()}>
                    {NOTE_COLORS.map(c => (
                      <button key={c} onClick={() => updateNoteAt(idx, { color: c })} style={{
                        width: 14, height: 14, borderRadius: '50%', background: c,
                        border: note.color === c ? '2px solid #3a3340' : '2px solid transparent',
                        cursor: 'pointer', padding: 0,
                      }} />
                    ))}
                  </div>
                )}
                {/* Text — editable when selected */}
                <textarea
                  value={note.text}
                  onChange={e => updateNoteAt(idx, { text: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  onPointerDown={e => { if (isSel) e.stopPropagation() }}
                  readOnly={!isSel}
                  style={{
                    width: '100%', border: 'none', background: 'transparent',
                    fontFamily: "'Patrick Hand', cursive",
                    fontSize: Math.round(18 * scale),
                    lineHeight: 1.35, color: '#6b5a3c',
                    resize: 'none', outline: 'none',
                    minHeight: Math.round(100 * scale),
                    cursor: isSel ? 'text' : 'grab',
                    pointerEvents: isSel ? 'auto' : 'none',
                    textDecoration: note.acknowledged ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(107, 90, 60, 0.5)',
                    textDecorationThickness: '1.5px',
                  }}
                />
              </div>

              {/* Got it! button — hidden once acknowledged */}
              {!note.acknowledged && (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); acknowledgeNote(idx, e.currentTarget) }}
                  style={{
                    position: 'absolute', bottom: -18, left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    padding: `${Math.round(5 * scale)}px ${Math.round(14 * scale)}px`,
                    borderRadius: 999,
                    background: child.theme.accent,
                    color: '#fff',
                    border: '2.5px solid #fff',
                    cursor: 'pointer',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: Math.round(11 * scale),
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    zIndex: 20,
                    boxShadow: `0 2px 10px ${child.theme.shadow}`,
                  }}
                >Got it!</button>
              )}

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

        {/* Stickers */}
        {headerStickers.map((stickerData, idx) => {
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
                {def.image ? (
                  <img src={CUSTOM_STICKER_IMAGES[def.id]} alt={def.label} draggable={false}
                    style={{ width: size * 0.85, height: size * 0.85, objectFit: 'contain', display: 'block' }} />
                ) : (
                  <span style={{ fontSize: size * 0.68, lineHeight: 1, display: 'block', textShadow: WHITE_OUTLINE }}>
                    {def.emoji}
                  </span>
                )}
              </div>
              {isSel && (
                <>
                  <DeleteBtn onDelete={deleteSelected} />
                  <ResizeHandle onPointerDown={e => { e.stopPropagation(); startDrag(e, 'sticker', idx, 'resize') }} />
                  <RotateHandle onPointerDown={e => { e.stopPropagation(); startDrag(e, 'sticker', idx, 'rotate') }} />
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setShowStickerPicker('change') }}
                    style={{
                      position: 'absolute', bottom: 1, left: 1,
                      width: 22, height: 22, borderRadius: '50%',
                      background: child.theme.accent, color: '#fff',
                      border: 'none', cursor: 'pointer', fontSize: 11,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30,
                    }}
                  >✏️</button>
                </>
              )}
            </div>
          )
        })}

        {/* Wall calendar — hanging on the noticeboard */}
        {(() => {
          const { year, month } = calMonth
          const firstDay = new Date(year, month, 1).getDay()
          const daysInMonth = new Date(year, month + 1, 0).getDate()
          const monthName = new Date(year, month).toLocaleString('default', { month: 'long' })
          const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
          const prevMonth = () => setCalMonth(({ year, month }) => { const d = new Date(year, month - 1); return { year: d.getFullYear(), month: d.getMonth() } })
          const nextMonth = () => setCalMonth(({ year, month }) => { const d = new Date(year, month + 1); return { year: d.getFullYear(), month: d.getMonth() } })
          return (
            <div
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
              style={{ position: 'absolute', top: 64, right: 10, zIndex: 7, width: 168 }}
            >
              {/* Hanging cord */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 52, marginBottom: 0 }}>
                {[0, 1].map(i => (
                  <div key={i} style={{ width: 2, height: 12, background: '#b8a8c8', borderRadius: 1 }} />
                ))}
              </div>
              {/* Calendar card */}
              <div style={{ background: '#fffdf8', borderRadius: 10, boxShadow: '0 6px 22px rgba(58,51,64,.18), 0 2px 6px rgba(58,51,64,.08)', overflow: 'hidden' }}>
                {/* Binding rings */}
                <div style={{ background: child.theme.accent, padding: '5px 10px', display: 'flex', justifyContent: 'space-around' }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
                {/* Month navigation */}
                <div style={{ background: child.theme.bg, padding: '5px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: child.theme.accent, fontSize: 16, padding: '0 4px', lineHeight: 1, fontWeight: 700 }}>‹</button>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 13, color: child.theme.accent }}>
                    {monthName}{year !== new Date().getFullYear() ? ` ${year}` : ''}
                  </span>
                  <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: child.theme.accent, fontSize: 16, padding: '0 4px', lineHeight: 1, fontWeight: 700 }}>›</button>
                </div>
                {/* Day grid */}
                <div style={{ padding: '4px 5px 6px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 1 }}>
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <div key={i} style={{ textAlign: 'center', fontSize: 7, color: '#b3a9be', fontFamily: "'Space Mono', monospace", padding: '1px 0' }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                    {cells.map((day, i) => {
                      if (!day) return <div key={i} />
                      const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                      const isToday = dateStr === todayISO
                      const isSelected = dateStr === viewingDay
                      return (
                        <button
                          key={i}
                          onClick={() => setViewingDay((isSelected || (isToday && !viewingDay)) ? null : dateStr)}
                          style={{
                            textAlign: 'center', padding: '3px 1px', borderRadius: 4, border: 'none',
                            background: isToday ? child.theme.accent : isSelected ? child.theme.bg : 'transparent',
                            color: isToday ? '#fff' : isSelected ? child.theme.accent : '#5a5060',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 8, fontWeight: isToday || isSelected ? 700 : 400,
                            cursor: 'pointer', lineHeight: 1.5,
                          }}
                        >{day}</button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Add note / sticker buttons */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 7, zIndex: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); addNote() }}
            style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', border: 'none', borderRadius: 999, padding: '7px 13px', fontSize: 12, fontFamily: "'Space Mono', monospace", color: '#6b5a3c', cursor: 'pointer', boxShadow: '0 2px 8px rgba(58,51,64,.12)' }}
          >📝 Note</button>
          <button
            onClick={e => { e.stopPropagation(); setShowStickerPicker('add') }}
            style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)', border: 'none', borderRadius: 999, padding: '7px 13px', fontSize: 12, fontFamily: "'Space Mono', monospace", color: child.theme.accent, cursor: 'pointer', boxShadow: '0 2px 8px rgba(58,51,64,.12)' }}
          >⭐ Sticker</button>
        </div>

        {/* Center identity */}
        <div style={{ position: 'relative', zIndex: 5, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <Avatar child={child} size={104} square />
          </div>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 46, lineHeight: 1.1, color: '#3a3340', marginTop: 18,
          }}>{child.name}</h1>
          <div style={{
            fontFamily: "'Roboto Mono', monospace",
            fontSize: 18, letterSpacing: '0.06em',
            color: child.theme.targetColor, marginTop: 10,
          }}>{clock.date}</div>
          <div style={{
            fontFamily: "'Roboto Mono', monospace",
            fontWeight: 700, fontSize: 50, color: '#3a3340', marginTop: 2,
          }}>{clock.time}</div>
          <div
            className={ticketPop ? 'ticket-pop' : ''}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 9, marginTop: 20,
              background: '#fff', color: child.theme.textMuted,
              fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 17,
              letterSpacing: '0.04em', padding: '12px 24px', borderRadius: 999,
              boxShadow: `0 3px 12px ${child.theme.shadow}`,
            }}
          >{state.tickets} {state.tickets === 1 ? 'TICKET' : 'TICKETS'}</div>
        </div>
      </div>

      {/* Sticker picker sheet */}
      {showStickerPicker && (
        <div
          onClick={() => setShowStickerPicker(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(58,51,64,0.45)',
            zIndex: 200, display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', background: '#fff',
              borderRadius: '26px 26px 0 0',
              padding: '28px 28px 40px',
              maxHeight: '72vh', overflowY: 'auto',
            }}
          >
            <div style={{ width: 40, height: 4, borderRadius: 999, background: '#e0d4e8', margin: '0 auto 22px' }} />
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#3a3340', marginBottom: 20 }}>
              {showStickerPicker === 'add' ? 'Add a sticker' : 'Change sticker'}
            </div>
            {STICKER_CATEGORIES.map(cat => (
              <div key={cat.id} style={{ marginBottom: 24 }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 11,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: child.theme.accent, marginBottom: 12,
                }}>{cat.label}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))', gap: 10 }}>
                  {STICKERS.filter(s => s.category === cat.id).map(sticker => {
                    const isActive = showStickerPicker === 'change' && selected?.type === 'sticker'
                      && headerStickers[selected.idx]?.id === sticker.id
                    return (
                      <button
                        key={sticker.id}
                        onClick={() => {
                          if (showStickerPicker === 'add') addSticker(sticker.id)
                          else if (selected?.type === 'sticker') {
                            updateStickerAt(selected.idx, { id: sticker.id })
                            setShowStickerPicker(false)
                          }
                        }}
                        style={{
                          height: 68, borderRadius: 18,
                          background: isActive ? child.theme.bg : '#faf6fc',
                          border: `2px solid ${isActive ? child.theme.accent : 'transparent'}`,
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          gap: 4, cursor: 'pointer', fontSize: 30,
                          transition: 'transform 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        {sticker.image
                          ? <img src={CUSTOM_STICKER_IMAGES[sticker.id]} alt={sticker.label} style={{ width: 26, height: 26, objectFit: 'contain', display: 'block' }} />
                          : sticker.emoji}
                        <span style={{
                          fontFamily: "'Space Mono', monospace", fontSize: 8,
                          color: isActive ? child.theme.accent : '#b3a9be', letterSpacing: '0.04em',
                        }}>{sticker.label.toUpperCase()}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick-nav strip */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #ede6e0',
        padding: '0 16px',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {[
          { label: 'Quests',          id: 'section-quests' },
          { label: 'Side Quests',     id: 'section-sideQuests' },
          { label: 'Routine Tracker', id: 'section-routines' },
          { label: 'Rewards Shop',    id: 'section-shop' },
          { label: 'Suggest Reward',  id: 'section-suggest' },
          { label: 'Mood Tracker',    id: 'section-mood' },
        ].map(({ label, id }) => (
          <button
            key={id}
            onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{
              whiteSpace: 'nowrap',
              background: 'none',
              border: 'none',
              borderBottom: '2.5px solid transparent',
              padding: '12px 6px 10px',
              cursor: 'pointer',
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: '#9a8fa6',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = child.theme.accent; e.currentTarget.style.borderBottomColor = child.theme.accent }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9a8fa6'; e.currentTarget.style.borderBottomColor = 'transparent' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Quest section */}
      <div id="section-quests" style={{ padding: '38px 44px 10px' }}>
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: '#3a3340', margin: 0 }}>
              {DAY_PART_LABELS[activeTab].split(' ')[1]} quests
            </h2>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: viewingDay ? child.theme.accent : '#b3a9be',
              background: viewingDay ? child.theme.bg : '#f6f0f9',
              padding: '3px 10px', borderRadius: 999,
            }}>
              {viewingDay ? `${new Date(viewingDay + 'T00:00:00').toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })} preview` : DAY_FULL_LABELS[todayKey]}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 13,
              letterSpacing: '0.08em',
              color: '#9a8fa6',
            }}>{doneCurrent} / {totalCurrent} DONE</span>
            <button
              onClick={() => setShowAddQuest(true)}
              style={{
                background: child.theme.bg,
                border: `1.5px solid ${child.theme.dashed}`,
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
            >+ Add quest</button>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
          {currentQuestOrder(activeTab).map(quest => {
            const done = state.completed[activeTab].includes(quest.id)
            const isDragging = questDragState?.questId === quest.id
            return (
              <div
                key={quest.id}
                ref={el => { questCardRefs.current[quest.id] = el }}
                style={{
                  position: 'relative',
                  opacity: isDragging ? 0.25 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {/* Drag handle */}
                <div
                  onPointerDown={e => startQuestDrag(e, quest.id, activeTab)}
                  style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 10,
                    width: 24, height: 24, borderRadius: 6,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 3, cursor: 'grab', touchAction: 'none',
                    opacity: 0.3,
                  }}
                >
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 12, height: 2, borderRadius: 1, background: '#3a3340' }} />
                  ))}
                </div>

                <button
                  onClick={() => { if (!questDragInfo.current && !viewingDay) toggleQuest(activeTab, quest.id) }}
                  className="press-btn"
                  style={{
                    width: '100%',
                    minHeight: 230,
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
                    position: 'absolute', top: 14, right: 14,
                    width: 30, height: 30, borderRadius: '50%',
                    background: done ? '#5b8a5c' : 'transparent',
                    border: done ? 'none' : `2px solid ${child.theme.dashed}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 15,
                    transition: 'background 0.25s, border 0.25s',
                  }}>{done ? '✓' : ''}</div>

                  <div style={{ opacity: done ? 0.5 : 1, transition: 'opacity 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 96 }}>
                    {resolveQuestImage(quest.id, quest.imageKey)
                      ? <img src={resolveQuestImage(quest.id, quest.imageKey)} alt={quest.title} style={{ width: 96, height: 96, objectFit: 'contain' }} />
                      : <span style={{ fontSize: 46 }}>{quest.icon}</span>
                    }
                  </div>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: done ? '#a99f95' : '#3a3340',
                    textDecoration: done ? 'line-through' : 'none',
                    margin: '12px 0', lineHeight: 1.3,
                    transition: 'color 0.25s',
                  }}>{quest.title}</div>
                  <div style={{
                    display: 'inline-block',
                    fontFamily: "'Space Mono', monospace", fontSize: 12,
                    background: done ? 'transparent' : child.theme.bg,
                    color: done ? '#b3a99e' : child.theme.textMuted,
                    padding: done ? '5px 0' : '5px 12px',
                    borderRadius: 999, transition: 'background 0.25s',
                  }}>{quest.tickets} tickets</div>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Side quests — moved here so kids see them right after daily quests */}
      <div id="section-sideQuests" style={{
        background: '#faf0ec',
        padding: '44px 48px 48px',
        marginTop: 16,
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 84 }}>
                      {resolveQuestImage(sq.id, sq.imageKey)
                        ? <img src={resolveQuestImage(sq.id, sq.imageKey)} alt={sq.title} style={{ width: 84, height: 84, objectFit: 'contain' }} />
                        : <span style={{ fontSize: 40 }}>{sq.icon}</span>
                      }
                    </div>
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
                          background: sq.bg,
                          color: sq.textColor,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: '0.06em',
                          padding: '10px 22px',
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

      {/* Daily routines */}
      <div id="section-routines" style={{ padding: '34px 44px 10px' }}>
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
                  }}>
                    {resolveQuestImage(routine.id, routine.imageKey)
                      ? <img src={resolveQuestImage(routine.id, routine.imageKey)} alt={routine.title} style={{ width: 40, height: 40, objectFit: 'contain' }} />
                      : routine.icon
                    }
                  </div>
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
                        {log.onTime ? 'On time · +1 ticket' : 'Late · try again'}
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
              On time all week → <span style={{ color: child.theme.accent }}>10 bonus tickets</span>
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
      <div id="section-shop" style={{ padding: '30px 44px 8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 22 }}>
          <div style={{
            background: '#f7d6dd',
            borderRadius: 22,
            padding: '24px 26px',
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}>
            <Avatar child={child} size={58} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: '#3a3340' }}>{child.name} &amp; Co</div>
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

          <div id="section-suggest" style={{
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
      <div id="section-mood" style={{ padding: '34px 48px 8px' }}>
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

    </div>

    {showAddQuest && (
      <AddQuestModal
        defaultSections={[activeTab]}
        onSave={handleAddQuest}
        onClose={() => setShowAddQuest(false)}
      />
    )}
    </>
  )
}
