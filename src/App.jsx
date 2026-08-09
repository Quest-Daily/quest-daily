import { useState, useEffect } from 'react'
import { createInitialState, QUESTS } from './data'
import SignIn from './screens/SignIn'
import ParentPin from './screens/ParentPin'
import FamilyHome from './screens/FamilyHome'
import ChildView from './screens/ChildView'
import Shop from './screens/Shop'
import SuggestReward from './screens/SuggestReward'
import ParentDashboard from './screens/ParentDashboard'

export default function App() {
  const [screen, setScreen] = useState('signin')
  const [currentChild, setCurrentChild] = useState(null)

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
          if (!parsed[id].headerStickers) parsed[id].headerStickers = [null, null, null, null]
        })
        return parsed
      }
    } catch {}
    return createInitialState()
  })

  const [quests, setQuests] = useState(() => {
    try {
      const saved = localStorage.getItem('quest-daily-quests')
      if (saved) return JSON.parse(saved)
    } catch {}
    return QUESTS
  })

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
