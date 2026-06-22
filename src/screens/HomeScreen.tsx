import { recentBrews, brews, favoriteIds, lastRecipeByMethod } from '../store/recipes'
import { navigateTo } from '../store/ui'
import { formatMethod, formatMethodDescription } from '../lib/format'

import { Play, Clock, Bookmark, Flame } from 'lucide-preact'
import { useMemo, useRef, useCallback } from 'preact/hooks'
import type { Method } from '../db/types'

function useGreeting() {
  return useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return { title: 'Good morning', subtitle: 'Ready for a fresh brew?' }
    if (hour < 17) return { title: 'Good afternoon', subtitle: 'Time for a pick-me-up?' }
    return { title: 'Good evening', subtitle: 'Wind down with a brew' }
  }, [])
}

const ALL_METHODS: Method[] = ['V60', 'AEROPRESS', 'CHEMEX', 'FRENCH_PRESS', 'MOKA_POT', 'STAGG']

function getWeeklyStats() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekBrews = brews.value.filter(b => b.brewedAt >= weekAgo)
  if (weekBrews.length === 0) return null

  const methodCounts = new Map<string, number>()
  for (const b of weekBrews) methodCounts.set(b.method, (methodCounts.get(b.method) ?? 0) + 1)
  let topMethod = ''
  let topCount = 0
  for (const [m, c] of methodCounts) { if (c > topCount) { topMethod = m; topCount = c } }

  return { count: weekBrews.length, topMethod }
}

export function HomeScreen() {
  const greeting = useGreeting()
  const lastBrew = recentBrews.value[0]
  const weeklyStats = useMemo(() => getWeeklyStats(), [])
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLongPress = useRef(false)

  const handleMethodPress = useCallback((method: Method) => {
    if (isLongPress.current) {
      isLongPress.current = false
      return
    }
    navigateTo({ type: 'method', method })
  }, [])

  const handleMethodLongPress = useCallback((method: Method) => {
    isLongPress.current = true
    const lastRecipe = lastRecipeByMethod.value.get(method)
    if (lastRecipe) {
      navigateTo({ type: 'brew', recipeId: lastRecipe })
    } else {
      navigateTo({ type: 'method', method })
    }
  }, [])

  const startLongPress = useCallback((method: Method) => {
    isLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      handleMethodLongPress(method)
    }, 400)
  }, [handleMethodLongPress])

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  return (
    <div class="flex flex-col gap-6 p-4 pt-[calc(16px+var(--safe-top))] pb-24 relative overflow-y-auto">
      {/* Warm ambient */}
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, transparent 40%)' }} />

      {/* Greeting + Favorites */}
      <div class="relative flex items-start justify-between">
        <div class="flex flex-col gap-0.5">
          <h1 class="text-largetitle-bold font-display">{greeting.title}</h1>
          <p class="text-body text-[var(--text-secondary)]">{greeting.subtitle}</p>
        </div>
        <button
          onClick={() => navigateTo({ type: 'favorites' })}
          class="p-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
        >
          <Bookmark
            size={20}
            strokeWidth={2}
            class={favoriteIds.value.size > 0 ? 'text-[var(--color-amber)] fill-[var(--color-amber)]' : ''}
          />
        </button>
      </div>

      {/* Quick stats (if brewed this week) */}
      {weeklyStats && (
        <div class="relative">
          <div class="flex items-center gap-3 text-caption1 text-[var(--text-secondary)] bg-[var(--bg-card)]/50 rounded-xl px-3 py-2">
            <span class="flex items-center gap-1">
              <Flame size={12} class="text-[var(--color-amber)]" />
              {weeklyStats.count} brew{weeklyStats.count !== 1 ? 's' : ''}
            </span>
            <span>·</span>
            <span>Most used: {formatMethod(weeklyStats.topMethod)}</span>
          </div>
        </div>
      )}

      {/* Last brew — quick action */}
      {lastBrew && (
        <div class="relative">
          <button
            onClick={() => navigateTo({ type: 'brew', recipeId: lastBrew.recipeId })}
            class="w-full text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4 active:scale-[0.98] transition-transform"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center flex-shrink-0 animate-[glow-pulse_3s_ease-in-out_infinite]"
                style={{ boxShadow: '0 0 12px rgba(245,158,11,0.15)' }}>
                <Play size={18} strokeWidth={2.5} class="text-[var(--color-amber)] ml-0.5" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-caption1 text-[var(--text-tertiary)]">Brew again</p>
                <p class="text-body-bold truncate">{lastBrew.recipeName}</p>
                <div class="flex items-center gap-2 mt-0.5 text-caption1 text-[var(--text-tertiary)]">
                  <span>{formatMethod(lastBrew.method)}</span>
                  <span>·</span>
                  <span class="font-mono">{lastBrew.beans}g / {lastBrew.water}ml</span>
                  <span>·</span>
                  <span class="flex items-center gap-1">
                    <Clock size={10} />
                    {timeAgo(lastBrew.brewedAt)}
                  </span>
                </div>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Method grid */}
      <section class="relative flex flex-col gap-3">
        <h2 class="text-caption1 text-[var(--text-secondary)] uppercase tracking-wider">Brew Methods</h2>
        <div class="grid grid-cols-2 gap-2">
          {ALL_METHODS.map((method, idx) => {
            return (
              <button
                key={method}
                onClick={() => handleMethodPress(method)}
                onTouchStart={() => startLongPress(method)}
                onTouchEnd={cancelLongPress}
                onTouchMove={cancelLongPress}
                onMouseDown={() => startLongPress(method)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4 flex flex-col gap-1 items-start text-left active:scale-[0.97] transition-transform animate-scale-in"
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <span class="text-headline mt-1">{formatMethod(method)}</span>
                <span class="text-caption1 text-[var(--text-tertiary)]">
                  {formatMethodDescription(method)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Daily coffee tip */}
    </div>
  )
}

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
