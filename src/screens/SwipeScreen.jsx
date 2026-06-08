import { useCallback, useEffect, useState } from 'react'
import { useSync } from '../hooks/useSync'
import { fetchMovies } from '../utils/tmdb'
import MovieCard from '../components/MovieCard'
import MatchOverlay from '../components/MatchOverlay'
import './SwipeScreen.css'

export default function SwipeScreen({ player, onLogout }) {
  const { session, recordSwipe, updateConfig, matches, newMatch, dismissMatch } = useSync(player)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [done, setDone] = useState(false)
  const [page, setPage] = useState(4) // started at 1-3 in GenreScreen

  const movies = session.movies || []
  const totalSwiped = Object.keys((session.swipes?.[player]) || {}).length
  const myMatches = matches.length

  // Load more movies when near the end
  useEffect(() => {
    if (!movies.length || loadingMore) return
    if (currentIndex >= movies.length - 5 && !done) {
      loadMore()
    }
  }, [currentIndex, movies.length, done, loadingMore])

  const loadMore = async () => {
    if (!session.genreId || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await fetchMovies({ genreId: session.genreId, timeFrame: session.timeFrame || 'decade', page })
      const existing = new Set(movies.map(m => m.id))
      const fresh = (data.results || []).filter(m => !existing.has(m.id) && m.poster_path)
      if (!fresh.length) { setDone(true); return }
      updateConfig({ movies: [...movies, ...fresh] })
      setPage(p => p + 1)
    } catch (e) {
      console.error('loadMore failed', e)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSwipe = useCallback((dir) => {
    const movie = movies[currentIndex]
    if (!movie) return
    recordSwipe(movie.id, dir)
    if (currentIndex + 1 >= movies.length && done) {
      setDone(true)
    } else {
      setCurrentIndex(i => i + 1)
    }
  }, [movies, currentIndex, recordSwipe, done])

  const handleLike  = () => handleSwipe('right')
  const handleNope  = () => handleSwipe('left')

  const currentMovie = movies[currentIndex]
  const nextMovie    = movies[currentIndex + 1]
  const isOutOfCards = !currentMovie && (done || movies.length === 0)

  // Build match movies list for sidebar
  const matchMovies = (session.movies || []).filter(m => matches.includes(String(m.id)) || matches.includes(m.id))

  return (
    <div className="swipe-screen">
      {/* Header */}
      <header className="swipe-header">
        <button className="back-btn" onClick={onLogout}>← Back</button>
        <div className="header-center">
          <span className="header-logo">🎬</span>
          <span className="player-tag" data-player={player}>
            {player === 'player1' ? 'Player 1' : 'Player 2'}
          </span>
        </div>
        <div className="header-stats">
          {myMatches > 0 && (
            <span className="match-badge">❤️ {myMatches}</span>
          )}
        </div>
      </header>

      {/* Genre + Era label */}
      {session.genreName && (
        <div className="swipe-meta">
          <span className="swipe-genre">{session.genreName}</span>
          {session.timeFrame && <span className="swipe-era">{session.timeFrame}</span>}
          <span className="swipe-count">{totalSwiped} swiped</span>
        </div>
      )}

      {/* Card stack */}
      <div className="card-stack">
        {isOutOfCards ? (
          <div className="out-of-cards">
            <span className="ooc-icon">🍿</span>
            <h2>All done!</h2>
            <p>You've swiped through all the movies</p>
            {myMatches > 0 ? (
              <div className="ooc-matches">
                <p>You matched on <strong>{myMatches}</strong> {myMatches === 1 ? 'movie' : 'movies'}!</p>
                <div className="ooc-match-list">
                  {matchMovies.slice(0, 5).map(m => (
                    <span key={m.id} className="ooc-match-tag">🎬 {m.title}</span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="ooc-sub">Keep swiping with your partner to find matches</p>
            )}
            <button className="ooc-back-btn" onClick={onLogout}>Choose Another Genre</button>
          </div>
        ) : (
          <>
            {/* Next card (behind) */}
            {nextMovie && (
              <div className="card-slot card-slot--next">
                <MovieCard
                  key={`next-${nextMovie.id}`}
                  movie={nextMovie}
                  onSwipe={() => {}}
                  isTop={false}
                />
              </div>
            )}
            {/* Current card (front) */}
            {currentMovie && (
              <div className="card-slot card-slot--current">
                <MovieCard
                  key={`cur-${currentMovie.id}-${currentIndex}`}
                  movie={currentMovie}
                  onSwipe={handleSwipe}
                  isTop={true}
                />
              </div>
            )}
          </>
        )}

        {loadingMore && (
          <div className="loading-more">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        )}
      </div>

      {/* Action buttons */}
      {!isOutOfCards && currentMovie && (
        <div className="action-buttons">
          <button className="action-btn action-btn--nope" onClick={handleNope} aria-label="Nope">
            <span>✕</span>
          </button>
          <button className="action-btn action-btn--super" onClick={() => {}} aria-label="Super Like">
            <span>⭐</span>
          </button>
          <button className="action-btn action-btn--like" onClick={handleLike} aria-label="Like">
            <span>♥</span>
          </button>
        </div>
      )}

      {/* Matches sidebar (show when > 0) */}
      {matchMovies.length > 0 && (
        <div className="matches-sidebar">
          <span className="matches-sidebar-label">❤️ Matches</span>
          <div className="matches-sidebar-list">
            {matchMovies.map(m => (
              <span key={m.id} className="match-pill" title={m.title}>🎬 {m.title}</span>
            ))}
          </div>
        </div>
      )}

      {/* Match overlay */}
      {newMatch && (
        <MatchOverlay
          movie={newMatch}
          allMatches={matches}
          onDismiss={dismissMatch}
        />
      )}
    </div>
  )
}
