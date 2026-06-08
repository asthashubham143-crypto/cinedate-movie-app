const API_KEY = import.meta.env.VITE_TMDB_API_KEY || ''
const BASE = 'https://api.themoviedb.org/3'

export const TIME_FRAMES = {
  latest:  { gte: '2025-01-01', lte: '2026-12-31', label: 'Latest (2025–26)', emoji: '🔥' },
  last5:   { gte: '2021-01-01', lte: '2026-12-31', label: 'Last 5 Years',      emoji: '⚡' },
  decade:  { gte: '2016-01-01', lte: '2026-12-31', label: 'Past Decade',       emoji: '📅' },
  '2010s': { gte: '2010-01-01', lte: '2019-12-31', label: '2010s',             emoji: '💫' },
  '2000s': { gte: '2000-01-01', lte: '2009-12-31', label: '2000s',             emoji: '🌀' },
  '90s':   { gte: '1990-01-01', lte: '1999-12-31', label: '90s',              emoji: '🎸' },
  '80s':   { gte: '1980-01-01', lte: '1989-12-31', label: '80s',              emoji: '🕺' },
  '70s':   { gte: '1970-01-01', lte: '1979-12-31', label: '70s',              emoji: '✌️'  },
  'classic':{ gte: '1900-01-01', lte: '1969-12-31', label: 'Classics',         emoji: '🎞️'  },
}

export const GENRE_COLORS = {
  28:    ['#e50914', '#b00000'],
  12:    ['#00b4d8', '#0077b6'],
  16:    ['#ffb703', '#fb8500'],
  35:    ['#f72585', '#b5179e'],
  80:    ['#4a4e69', '#22223b'],
  99:    ['#588157', '#3a5a40'],
  18:    ['#7b2d8b', '#4a0e8f'],
  14:    ['#3a86ff', '#8338ec'],
  36:    ['#c77dff', '#7b2fff'],
  27:    ['#370617', '#6a040f'],
  10402: ['#ff006e', '#8338ec'],
  9648:  ['#023e8a', '#03045e'],
  10749: ['#ff4d6d', '#c9184a'],
  878:   ['#0077b6', '#023e8a'],
  10770: ['#6d6875', '#4a4e69'],
  53:    ['#212529', '#495057'],
  10752: ['#495057', '#212529'],
  37:    ['#a47148', '#6f4e37'],
}

export const GENRE_EMOJIS = {
  28: '💥', 12: '🗺️', 16: '✨', 35: '😂', 80: '🔫', 99: '📽️',
  18: '🎭', 14: '🧙', 36: '📜', 27: '👻', 10402: '🎵', 9648: '🔍',
  10749: '❤️', 878: '🚀', 10770: '📺', 53: '😱', 10752: '⚔️', 37: '🤠',
}

const get = async (path, params = {}) => {
  if (!API_KEY) throw new Error('NO_API_KEY')
  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('api_key', API_KEY)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

export const fetchGenres = () => get('/genre/movie/list')

export const fetchMovies = async ({ genreId, timeFrame, page = 1 }) => {
  const tf = TIME_FRAMES[timeFrame]
  return get('/discover/movie', {
    with_genres: genreId,
    'primary_release_date.gte': tf?.gte,
    'primary_release_date.lte': tf?.lte,
    sort_by: 'popularity.desc',
    'vote_count.gte': 30,
    include_adult: false,
    page,
  })
}

export const fetchMovieCredits = async (movieId) => {
  try {
    const data = await get(`/movie/${movieId}/credits`)
    return (data.cast || []).slice(0, 4).map(a => a.name)
  } catch {
    return []
  }
}

export const getImageUrl = (path, size = 'w500') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null
