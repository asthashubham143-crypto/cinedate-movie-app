import { useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import GenreScreen from './screens/GenreScreen'
import SwipeScreen from './screens/SwipeScreen'
import { clearSession } from './hooks/useSync'

const SCREENS = { LOGIN: 'login', GENRE: 'genre', SWIPE: 'swipe' }

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LOGIN)
  const [player, setPlayer] = useState(null)

  const handleLogin = (p) => {
    setPlayer(p)
    setScreen(SCREENS.GENRE)
  }

  const handleGenreNext = () => setScreen(SCREENS.SWIPE)

  const handleLogout = () => {
    setPlayer(null)
    setScreen(SCREENS.LOGIN)
  }

  const handleNewSession = () => {
    clearSession()
    handleLogout()
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {screen === SCREENS.LOGIN && <LoginScreen onLogin={handleLogin} />}
      {screen === SCREENS.GENRE && (
        <GenreScreen player={player} onNext={handleGenreNext} />
      )}
      {screen === SCREENS.SWIPE && (
        <SwipeScreen player={player} onLogout={handleLogout} />
      )}
    </div>
  )
}
