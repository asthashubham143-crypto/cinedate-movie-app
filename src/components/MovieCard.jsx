import { useEffect, useRef, useState, useCallback } from 'react'
import { getImageUrl, fetchMovieCredits } from '../utils/tmdb'
import './MovieCard.css'

const SWIPE_THRESHOLD = 90
const ROTATION_FACTOR = 0.08

export default function MovieCard({ movie, onSwipe, isTop }) {
  const [deltaX, setDeltaX] = useState(0)
  const [deltaY, setDeltaY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState(null)   // 'left' | 'right'
  const [entering, setEntering] = useState(true)
  const [cast, setCast] = useState([])
  const [showDetail, setShowDetail] = useState(false)
  const startPos = useRef({ x: 0, y: 0 })
  const cardRef = useRef()

  // Slide in from top on mount
  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 50)
    return () => clearTimeout(t)
  }, [])

  // Fetch cast for top card only
  useEffect(() => {
    if (!isTop || !movie?.id) return
    fetchMovieCredits(movie.id).then(setCast).catch(() => {})
  }, [movie?.id, isTop])

  const triggerSwipe = useCallback((dir) => {
    if (exitDir) return
    setExitDir(dir)
    setIsDragging(false)
    setTimeout(() => onSwipe(dir), 320)
  }, [exitDir, onSwipe])

  // Mouse events
  const onMouseDown = useCallback((e) => {
    if (exitDir || entering) return
    e.preventDefault()
    setIsDragging(true)
    startPos.current = { x: e.clientX, y: e.clientY }
    setDeltaX(0)
    setDeltaY(0)
  }, [exitDir, entering])

  useEffect(() => {
    if (!isDragging) return
    const move = (e) => {
      setDeltaX(e.clientX - startPos.current.x)
      setDeltaY(e.clientY - startPos.current.y)
    }
    const up = () => {
      setIsDragging(false)
      setDeltaX(prev => {
        if (Math.abs(prev) >= SWIPE_THRESHOLD) {
          triggerSwipe(prev > 0 ? 'right' : 'left')
        } else {
          setDeltaX(0)
          setDeltaY(0)
        }
        return prev
      })
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
  }, [isDragging, triggerSwipe])

  // Touch events
  const onTouchStart = useCallback((e) => {
    if (exitDir || entering) return
    const touch = e.touches[0]
    setIsDragging(true)
    startPos.current = { x: touch.clientX, y: touch.clientY }
    setDeltaX(0)
    setDeltaY(0)
  }, [exitDir, entering])

  const onTouchMove = useCallback((e) => {
    if (!isDragging) return
    const touch = e.touches[0]
    setDeltaX(touch.clientX - startPos.current.x)
    setDeltaY(touch.clientY - startPos.current.y)
  }, [isDragging])

  const onTouchEnd = useCallback(() => {
    setIsDragging(false)
    setDeltaX(prev => {
      if (Math.abs(prev) >= SWIPE_THRESHOLD) {
        triggerSwipe(prev > 0 ? 'right' : 'left')
      } else {
        setDeltaX(0)
        setDeltaY(0)
      }
      return prev
    })
  }, [triggerSwipe])

  // Compute transform
  const rotation = isDragging ? deltaX * ROTATION_FACTOR : 0
  let transform = `translateX(${isDragging ? deltaX : 0}px) translateY(${entering ? '-110vh' : isDragging ? deltaY * 0.3 : 0}px) rotate(${rotation}deg)`
  let transition = isDragging ? 'none' : entering ? 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'transform 0.35s ease'

  if (exitDir === 'left')  { transform = `translateX(-160vw) rotate(-25deg)`; transition = 'transform 0.32s ease-in' }
  if (exitDir === 'right') { transform = `translateX(160vw) rotate(25deg)`;   transition = 'transform 0.32s ease-in' }

  const likeOpacity  = Math.min(Math.max(deltaX / SWIPE_THRESHOLD, 0), 1)
  const nopeOpacity  = Math.min(Math.max(-deltaX / SWIPE_THRESHOLD, 0), 1)

  const posterUrl = getImageUrl(movie.poster_path, 'w500')
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '—'
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null
  const overview = movie.overview ? (movie.overview.length > 120 ? movie.overview.slice(0, 120) + '…' : movie.overview) : ''

  return (
    <div
      ref={cardRef}
      className={`movie-card ${isTop ? 'top' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{ transform, transition }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Poster */}
      {posterUrl ? (
        <img className="card-poster" src={posterUrl} alt={movie.title} draggable={false} />
      ) : (
        <div className="card-poster card-poster--placeholder">
          <span>🎬</span>
          <span>{movie.title}</span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="card-gradient" />

      {/* LIKE / NOPE badges */}
      <div className="badge badge--like" style={{ opacity: likeOpacity }}>LIKE ♥</div>
      <div className="badge badge--nope" style={{ opacity: nopeOpacity }}>NOPE ✕</div>

      {/* Info panel */}
      <div className={`card-info ${showDetail ? 'expanded' : ''}`}>
        <div className="card-info-main">
          <div className="card-title-row">
            <h2 className="card-title">{movie.title}</h2>
            <span className="card-year">{year}</span>
          </div>

          {rating && (
            <div className="card-rating">
              ⭐ <strong>{rating}</strong>
              <span className="card-votes">({(movie.vote_count || 0).toLocaleString()} votes)</span>
            </div>
          )}

          {cast.length > 0 && (
            <div className="card-cast">
              {cast.map((name, i) => (
                <span key={i} className="cast-tag">{name}</span>
              ))}
            </div>
          )}

          <p className="card-overview">{overview}</p>
        </div>

        <button
          className="detail-toggle"
          onClick={(e) => { e.stopPropagation(); setShowDetail(p => !p) }}
        >
          {showDetail ? '▾ Less' : '▴ More'}
        </button>
      </div>

      {/* Action hints (shown when not dragging) */}
      {isTop && !isDragging && !exitDir && (
        <div className="swipe-hint">
          <span>← Nope</span>
          <span>Like →</span>
        </div>
      )}
    </div>
  )
}
