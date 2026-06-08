import { useState } from 'react'
import './LoginScreen.css'

export default function LoginScreen({ onLogin }) {
  const [hovering, setHovering] = useState(null)

  return (
    <div className="login-screen">
      <div className="login-bg">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="star" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
          }} />
        ))}
      </div>

      <div className="login-content">
        <div className="login-logo">
          <span className="logo-icon">🎬</span>
          <h1 className="logo-text">CinéDate</h1>
          <p className="logo-sub">Find movies you <em>both</em> love</p>
        </div>

        <p className="login-instruction">Who are you?</p>

        <div className="player-cards">
          <button
            className={`player-card ${hovering === 'player1' ? 'hovered' : ''}`}
            onMouseEnter={() => setHovering('player1')}
            onMouseLeave={() => setHovering(null)}
            onClick={() => onLogin('player1')}
          >
            <div className="player-avatar p1">👤</div>
            <div className="player-info">
              <span className="player-name">Player 1</span>
              <span className="player-desc">First picker</span>
            </div>
            <span className="player-arrow">→</span>
          </button>

          <div className="player-divider">
            <span>or</span>
          </div>

          <button
            className={`player-card ${hovering === 'player2' ? 'hovered' : ''}`}
            onMouseEnter={() => setHovering('player2')}
            onMouseLeave={() => setHovering(null)}
            onClick={() => onLogin('player2')}
          >
            <div className="player-avatar p2">👤</div>
            <div className="player-info">
              <span className="player-name">Player 2</span>
              <span className="player-desc">Second picker</span>
            </div>
            <span className="player-arrow">→</span>
          </button>
        </div>

        <p className="login-hint">
          💡 Open two browser tabs — one for each player
        </p>
      </div>
    </div>
  )
}
