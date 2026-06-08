import { useState, useEffect, useRef, useCallback } from 'react'

const SESSION_KEY = 'cinedate_v1'

let channel = null
try { channel = new BroadcastChannel('cinedate') } catch { /* SSR */ }

const load = () => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || {} }
  catch { return {} }
}

const save = (s) => {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch {}
}

const broadcast = (data) => {
  try { channel?.postMessage(data) } catch {}
}

export const clearSession = () => {
  try { localStorage.removeItem(SESSION_KEY) } catch {}
  broadcast({ type: 'session_clear' })
}

export const useSync = (player) => {
  const [session, setSession] = useState(load)
  const [newMatch, setNewMatch] = useState(null)
  const prevMatchIds = useRef(new Set((load().matches || []).map(String)))

  const applySession = useCallback((s) => {
    setSession(s)
    const currentMatchIds = new Set((s.matches || []).map(String))
    const freshId = [...currentMatchIds].find(id => !prevMatchIds.current.has(id))
    if (freshId) {
      const movie = (s.movies || []).find(m => String(m.id) === freshId)
      if (movie) setNewMatch(movie)
    }
    prevMatchIds.current = currentMatchIds
  }, [])

  useEffect(() => {
    if (!channel) return
    const handler = (e) => {
      if (e.data?.type === 'session_update') {
        applySession(e.data.data)
      } else if (e.data?.type === 'session_clear') {
        setSession({})
        setNewMatch(null)
        prevMatchIds.current = new Set()
      }
    }
    channel.addEventListener('message', handler)
    return () => channel.removeEventListener('message', handler)
  }, [applySession])

  const recordSwipe = useCallback((movieId, direction) => {
    const s = load()
    if (!s.swipes) s.swipes = {}
    if (!s.swipes[player]) s.swipes[player] = {}
    s.swipes[player][String(movieId)] = direction

    const p1 = s.swipes.player1 || {}
    const p2 = s.swipes.player2 || {}
    const allIds = new Set([...Object.keys(p1), ...Object.keys(p2)])
    s.matches = [...allIds].filter(id => p1[id] === 'right' && p2[id] === 'right')

    save(s)
    applySession(s)
    broadcast({ type: 'session_update', data: s })
    return s.matches
  }, [player, applySession])

  const updateConfig = useCallback((patch) => {
    const s = { ...load(), ...patch }
    save(s)
    setSession(s)
    broadcast({ type: 'session_update', data: s })
    return s
  }, [])

  const dismissMatch = useCallback(() => setNewMatch(null), [])

  return {
    session,
    recordSwipe,
    updateConfig,
    matches: session.matches || [],
    newMatch,
    dismissMatch,
  }
}
