import { useState, useEffect } from 'react'
import { createInitialState } from './data'
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
        // Migrate old saves: add missing shop fields if absent
        const initial = createInitialState()
        Object.keys(initial).forEach(id => {
          if (parsed[id] && !parsed[id].shopItems) {
            parsed[id].shopItems = initial[id].shopItems
            parsed[id].redemptions = []
            parsed[id].suggestions = []
          }
        })
        return parsed
      }
    } catch {}
    return createInitialState()
  })

  useEffect(() => {
    localStorage.setItem('quest-daily-state', JSON.stringify(childState))
  }, [childState])

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
        onUpdate={updateChild}
        onBack={() => setScreen('family-home')}
        onResetState={() => {
          setChildState(createInitialState())
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
