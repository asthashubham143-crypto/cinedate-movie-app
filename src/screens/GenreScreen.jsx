import { useEffect, useState } from 'react'
import { fetchGenres, GENRE_COLORS, GENRE_EMOJIS, TIME_FRAMES, fetchMovies } from '../utils/tmdb'
import { useSync } from '../hooks/useSync'
import './GenreScreen.css'

export default function GenreScreen({ player, onNext }) {
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fetchingMovies, setFetchingMovies] = useState(false)
  const { session, updateConfig } = useSync(player)

  const selectedGenre = session.genreId
  const selectedTime = session.timeFrame || 'decade'

  useEffect(() => {
    fetchGenres()
      .then(d => setGenres(d.genres || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleGenreSelect = (genre) => {
    updateConfig({ genreId: genre.id, genreName: genre.name })
  }

  const handleTimeSelect = (tf) => {
    updateConfig({ timeFrame: tf })
  }

  const handleStart = async () => {
    if (!selectedGenre) return
    setFetchingMovies(true)
    try {
      // Fetch first 3 pages to build a pool, merge + dedupe
      const pages = await Promise.all([1, 2, 3].map(p =>
        fetchMovies({ genreId: selectedGenre, timeFrame: selectedTime, page: p })
      ))
      const movies = []
      const seen = new Set()
      for (const page of pages) {
        for (const m of page.results || []) {
          if (!seen.has(m.id) && m.poster_path) {
            seen.add(m.id)
            movies.push(m)
          }
        }
      }
      updateConfig({ movies, swipes: {}, matches: [] })
      onNext()
    } catch (e) {
      setError(e.message)
    } finally {
      setFetchingMovies(false)
    }
  }

  if (error === 'NO_API_KEY') {
    return (
      <div className="genre-screen">
        <div className="api-key-error">
          <span className="api-key-icon">🔑</span>
          <h2>TMDB API Key Required</h2>
          <p>Create a <code>.env</code> file in <code>movie-swipe-app/</code>:</p>
          <pre>VITE_TMDB_API_KEY=your_key_here</pre>
          <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer">
            Get your free API key →
          </a>
          <p className="api-key-note">Then restart the dev server.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="genre-screen">
      <div className="genre-header">
        <div className="genre-header-top">
          <span className="player-badge" data-player={player}>
            {player === 'player1' ? '👤 Player 1' : '👤 Player 2'}
          </span>
          <h2>Choose a Genre</h2>
          <p>Pick what you're in the mood for</p>
        </div>

        <div className="timeframe-section">
          <span className="section-label">Era</span>
          <div className="timeframe-chips">
            {Object.entries(TIME_FRAMES).map(([key, tf]) => (
              <button
                key={key}
                className={`tf-chip ${selectedTime === key ? 'active' : ''}`}
                onClick={() => handleTimeSelect(key)}
              >
                {tf.emoji} {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="genre-grid-container">
        {loading ? (
          <div className="genre-loading">
            <div className="spinner" />
            <p>Loading genres…</p>
          </div>
        ) : (
          <div className="genre-grid">
            {genres.map(genre => {
              const colors = GENRE_COLORS[genre.id] || ['#555', '#333']
              const emoji = GENRE_EMOJIS[genre.id] || '🎬'
              const active = selectedGenre === genre.id
              return (
                <button
                  key={genre.id}
                  className={`genre-card ${active ? 'active' : ''}`}
                  style={{ '--g1': colors[0], '--g2': colors[1] }}
                  onClick={() => handleGenreSelect(genre)}
                >
                  <span className="genre-emoji">{emoji}</span>
                  <span className="genre-name">{genre.name}</span>
                  {active && <span className="genre-check">✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="genre-footer">
        {session.genreName && (
          <p className="genre-selection-label">
            <strong>{GENRE_EMOJIS[selectedGenre] || '🎬'} {session.genreName}</strong>
            {' · '}
            <span>{TIME_FRAMES[selectedTime]?.label}</span>
          </p>
        )}
        <button
          className={`start-btn ${!selectedGenre ? 'disabled' : ''} ${fetchingMovies ? 'loading' : ''}`}
          onClick={handleStart}
          disabled={!selectedGenre || fetchingMovies}
        >
          {fetchingMovies ? (
            <><div className="btn-spinner" /> Loading movies…</>
          ) : (
            <>Start Swiping 🎬</>
          )}
        </button>
      </div>
    </div>
  )
}
