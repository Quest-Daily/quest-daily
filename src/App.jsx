import { useState, useEffect } from 'react'
import { createInitialState } from './data'
import SignIn from './screens/SignIn'
import ParentPin from './screens/ParentPin'
import FamilyHome from './screens/FamilyHome'
import ChildView from './screens/ChildView'
import ParentDashboard from './screens/ParentDashboard'

export default function App() {
  const [screen, setScreen] = useState('signin')
  const [currentChild, setCurrentChild] = useState(null)
  const [childState, setChildState] = useState(() => {
    try {
      const saved = localStorage.getItem('quest-daily-state')
      return saved ? JSON.parse(saved) : createInitialState()
    } catch {
      return createInitialState()
    }
  })

  useEffect(() => {
    localStorage.setItem('quest-daily-state', JSON.stringify(childState))
  }, [childState])

  function updateChild(id, updater) {
    setChildState(prev => ({ ...prev, [id]: updater(prev[id]) }))
  }

  function handleSignIn(who) {
    if (who === 'parent') {
      setScreen('parent-pin')
    } else {
      setCurrentChild(who)
      setScreen('child-view')
    }
  }

  if (screen === 'signin') {
    return <SignIn onSelect={handleSignIn} />
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
        onSelectChild={id => { setCurrentChild(id); setScreen('child-view') }}
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
      />
    )
  }

  if (screen === 'parent-dashboard') {
    return (
      <ParentDashboard
        childState={childState}
        onBack={() => setScreen('family-home')}
        onResetState={() => {
          setChildState(createInitialState())
          setScreen('family-home')
        }}
      />
    )
  }

  return <SignIn onSelect={handleSignIn} />
}
