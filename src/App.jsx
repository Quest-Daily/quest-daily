import { useState, useEffect } from 'react'
import { createInitialState, QUESTS, CHILD_ORDER } from './data'
import SignIn from './screens/SignIn'
import ParentPin from './screens/ParentPin'
import FamilyHome from './screens/FamilyHome'
import ChildView from './screens/ChildView'
import Shop from './screens/Shop'
import SuggestReward from './screens/SuggestReward'
import ParentDashboard from './screens/ParentDashboard'
import ParentProfile from './screens/ParentProfile'

function parseHash() {
  const h = window.location.hash.slice(1)
  if (h === 'home') return { screen: 'family-home', child: null }
  if (h === 'jessie') return { screen: 'parent-profile', child: null }
  if (h.startsWith('child/') && CHILD_ORDER.includes(h.slice(6))) return { screen: 'child-view', child: h.slice(6) }
  if (h.startsWith('shop/') && CHILD_ORDER.includes(h.slice(5))) return { screen: 'shop', child: h.slice(5) }
  if (h.startsWith('suggest/') && CHILD_ORDER.includes(h.slice(8))) return { screen: 'suggest-reward', child: h.slice(8) }
  return { screen: 'signin', child: null }
}

export default function App() {
  const [screen, setScreen] = useState(() => parseHash().screen)
  const [currentChild, setCurrentChild] = useState(() => parseHash().child)

  const [childState, setChildState] = useState(() => {
    try {
      const saved = localStorage.getItem('quest-daily-state')
      if (saved) {
        const parsed = JSON.parse(saved)
        const initial = createInitialState()
        Object.keys(initial).forEach(id => {
          if (!parsed[id]) return
          if (!parsed[id].shopItems) {
            parsed[id].shopItems = initial[id].shopItems
            parsed[id].redemptions = []
            parsed[id].suggestions = []
          }
          if (!parsed[id].disabledQuests) parsed[id].disabledQuests = []
          if (!parsed[id].notePositions) parsed[id].notePositions = initial[id].notePositions
          if (parsed[id].headerStickers) {
            const toRemove = { hendrix: 'rocket', max: 'unicorn', felix: 'bunny' }
            if (toRemove[id]) {
              parsed[id].headerStickers = parsed[id].headerStickers.filter(s => s.id !== toRemove[id])
            }
          }
          if (!parsed[id].headerStickers) {
            parsed[id].headerStickers = []
          } else if (parsed[id].headerStickers.some(s => s === null || typeof s === 'string')) {
            const defaultPos = [
              { x: 12, y: 22, size: 72, rotate: -12 },
              { x: 87, y: 10, size: 68, rotate:   8 },
              { x: 30, y: 80, size: 60, rotate:   5 },
              { x: 94, y: 38, size: 70, rotate:  14 },
            ]
            parsed[id].headerStickers = parsed[id].headerStickers
              .map((s, i) => typeof s === 'string' ? { id: s, ...defaultPos[i] } : null)
              .filter(Boolean)
          }
        })
        return parsed
      }
    } catch {}
    return createInitialState()
  })

  const [quests, setQuests] = useState(() => {
    try {
      const saved = localStorage.getItem('quest-daily-quests')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (!parsed.routineOverrides) parsed.routineOverrides = {}
        if (!parsed.sideQuestOverrides) {
          const oldKeys = parsed.sideQuestImageKeys || {}
          parsed.sideQuestOverrides = Object.fromEntries(
            Object.entries(oldKeys).map(([id, imageKey]) => [id, { imageKey }])
          )
          delete parsed.sideQuestImageKeys
        }
        return parsed
      }
    } catch {}
    return QUESTS
  })

  useEffect(() => {
    const hash =
      screen === 'family-home'                      ? '#home' :
      screen === 'parent-profile'                   ? '#jessie' :
      screen === 'child-view'   && currentChild     ? `#child/${currentChild}` :
      screen === 'shop'         && currentChild     ? `#shop/${currentChild}` :
      screen === 'suggest-reward' && currentChild   ? `#suggest/${currentChild}` :
      '#'
    window.history.replaceState(null, '', hash)
  }, [screen, currentChild])

  useEffect(() => {
    localStorage.setItem('quest-daily-state', JSON.stringify(childState))
  }, [childState])

  useEffect(() => {
    localStorage.setItem('quest-daily-quests', JSON.stringify(quests))
  }, [quests])

  function updateChild(id, updater) {
    setChildState(prev => ({ ...prev, [id]: updater(prev[id]) }))
  }

  function goToChild(id, nextScreen = 'child-view') {
    setCurrentChild(id)
    setScreen(nextScreen)
  }

  if (screen === 'signin') {
    return <SignIn onSelect={who => {
      if (who === 'parent') setScreen('parent-pin')
      else if (who === 'jessie') setScreen('parent-profile')
      else goToChild(who, 'child-view')
    }} />
  }

  if (screen === 'parent-pin') {
    return (
      <ParentPin
        onSuccess={() => setScreen('parent-dashboard')}
        onBack={() => setScreen('signin')}
      />
    )
  }

  if (screen === 'family-home') {
    return (
      <FamilyHome
        childState={childState}
        onSelectChild={id => goToChild(id, 'child-view')}
        onParentView={() => setScreen('parent-pin')}
        onSignOut={() => setScreen('signin')}
      />
    )
  }

  if (screen === 'child-view' && currentChild) {
    return (
      <ChildView
        childId={currentChild}
        state={childState[currentChild]}
        quests={quests}
        onUpdate={updater => updateChild(currentChild, updater)}
        onUpdateQuests={setQuests}
        onUpdateChild={updateChild}
        onBack={() => setScreen('family-home')}
        onOpenShop={() => setScreen('shop')}
        onSuggestReward={() => setScreen('suggest-reward')}
      />
    )
  }

  if (screen === 'shop' && currentChild) {
    return (
      <Shop
        childId={currentChild}
        state={childState[currentChild]}
        onUpdate={updater => updateChild(currentChild, updater)}
        onBack={() => setScreen('child-view')}
        onSuggest={() => setScreen('suggest-reward')}
      />
    )
  }

  if (screen === 'suggest-reward' && currentChild) {
    return (
      <SuggestReward
        childId={currentChild}
        state={childState[currentChild]}
        onUpdate={updater => updateChild(currentChild, updater)}
        onBack={() => setScreen('shop')}
      />
    )
  }

  if (screen === 'parent-profile') {
    return (
      <ParentProfile
        onBack={() => setScreen('signin')}
      />
    )
  }

  if (screen === 'parent-dashboard') {
    return (
      <ParentDashboard
        childState={childState}
        quests={quests}
        onUpdateQuests={setQuests}
        onUpdate={updateChild}
        onBack={() => setScreen('family-home')}
        onResetState={() => {
          setChildState(createInitialState())
          setQuests(QUESTS)
          setScreen('family-home')
        }}
      />
    )
  }

  return <SignIn onSelect={who => {
    if (who === 'parent') setScreen('parent-pin')
    else goToChild(who, 'child-view')
  }} />
}
