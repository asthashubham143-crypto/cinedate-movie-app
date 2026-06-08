import { useEffect, useState } from 'react'
import { getImageUrl } from '../utils/tmdb'
import './MatchOverlay.css'

export default function MatchOverlay({ movie, allMatches, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setVisible(false)
    setTimeout(onDismiss, 400)
  }

  const posterUrl = getImageUrl(movie.poster_path, 'w342')
  const year = movie.release_date?.slice(0, 4)

  return (
    <div className={`match-overlay ${visible ? 'visible' : ''}`} onClick={dismiss}>
      <div className="match-bg-rings">
        {[...Array(4)].map((_, i) => <div key={i} className="ring" style={{ animationDelay: `${i * 0.15}s` }} />)}
      </div>

      <div className="hearts-container">
        {[...Array(12)].map((_, i) => (
          <span key={i} className="heart-particle" style={{
            '--x': `${(Math.random() - 0.5) * 300}px`,
            '--y': `${-(Math.random() * 300 + 100)}px`,
            animationDelay: `${i * 0.08}s`,
            left: '50%',
            top: '40%',
            fontSize: `${Math.random() * 20 + 14}px`,
          }}>
            {['❤️', '🎬', '🍿', '✨', '💫'][Math.floor(Math.random() * 5)]}
          </span>
        ))}
      </div>

      <div className="match-content" onClick={e => e.stopPropagation()}>
        <div className="match-label">
          <span className="match-icon">🎉</span>
          <h1>It's a Match!</h1>
          <p>You both want to watch this</p>
        </div>

        <div className="match-movie">
          {posterUrl ? (
            <img className="match-poster" src={posterUrl} alt={movie.title} />
          ) : (
            <div className="match-poster match-poster--placeholder">🎬</div>
          )}
          <div className="match-movie-info">
            <h2>{movie.title}</h2>
            {year && <span className="match-year">{year}</span>}
            {movie.overview && (
              <p className="match-overview">
                {movie.overview.length > 100 ? movie.overview.slice(0, 100) + '…' : movie.overview}
              </p>
            )}
          </div>
        </div>

        {allMatches.length > 1 && (
          <div className="match-count">
            🎯 {allMatches.length} total matches so far!
          </div>
        )}

        <button className="match-continue-btn" onClick={dismiss}>
          Keep Swiping →
        </button>
      </div>
    </div>
  )
}
