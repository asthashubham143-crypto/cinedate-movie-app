# CinéDate 🎬

Tinder-style movie matching for two players. Swipe right to like, left to pass — when you both swipe right on the same movie, it's a match!

## Quick Start (No build needed)

**Open `standalone.html` directly in your browser.**

1. Get a free TMDB API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Double-click `standalone.html` or open it in Chrome/Safari/Firefox
3. Enter your TMDB API key when prompted (saved in localStorage)
4. Open a second tab for Player 2

That's it — no npm, no install, no server required.

## Features

- 🎬 **Tinder-style swipe** — drag cards left/right, or tap ✕/♥ buttons
- 🎞️ **Movie cards** — poster, title, year, rating, cast, description
- 📱 **Vertical slide-in** — each new card slides in from the top
- 🏷️ **Genre selection** — 18 genres with colorful cards
- ⏰ **Era filter** — Latest, Last 5 Years, Past Decade, 2010s, 2000s, 90s, 80s, 70s, Classics
- ❤️ **Real-time match** — match overlay fires when both players like the same movie
- 🔄 **Cross-tab sync** — BroadcastChannel keeps two browser tabs in sync instantly
- 🍿 **Endless movies** — automatically loads more pages as you swipe

## How Two Players Work

Both players open the app in **separate tabs in the same browser**. They share a session via `localStorage` + `BroadcastChannel` — swipes sync in real-time between tabs.

- **Player 1** picks genre + era → starts the session
- **Player 2** opens the app in a second tab → sees the same genre selection → starts swiping
- When both swipe right on the same movie → match overlay appears on both screens

## Vite App (Optional)

A full Vite + React app is also included. If npm works in your environment:

```bash
cp .env.example .env
# Add your TMDB API key to .env
npm install
npm run dev
```

## TMDB API

This app uses the [TMDB API](https://www.themoviedb.org/documentation/api) for movie data. Free tier allows up to 1,000 requests/day.
