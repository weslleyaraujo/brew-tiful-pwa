import { recipesByMethod, recentBrews } from '../store/recipes'
import { navigateTo } from '../store/ui'
import { formatMethod } from '../lib/format'
import { MethodIcon } from '../lib/method-colors'
import { Play, Clock } from 'lucide-preact'
import { useMemo } from 'preact/hooks'
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

export function HomeScreen() {
  const greeting = useGreeting()
  const lastBrew = recentBrews.value[0]

  return (
    <div class="flex flex-col gap-6 p-4 pt-[calc(16px+var(--safe-top))] pb-24 relative">
      {/* Warm ambient */}
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.03) 0%, transparent 40%)' }} />

      {/* Greeting */}
      <div class="relative flex items-start justify-between">
        <div class="flex flex-col gap-0.5">
          <h1 class="text-largetitle-bold font-display">{greeting.title}</h1>
          <p class="text-body text-[var(--text-secondary)]">{greeting.subtitle}</p>
        </div>
      </div>

      {/* Last brew — quick action */}
      {lastBrew && (
        <div class="relative">
          <button
            onClick={() => navigateTo({ type: 'brew', recipeId: lastBrew.recipeId })}
            class="w-full text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4 active:scale-[0.98] transition-transform"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center flex-shrink-0">
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
            const recipeCount = recipesByMethod.value.get(method)?.length ?? 0
            return (
              <button
                key={method}
                onClick={() => navigateTo({ type: 'method', method })}
                class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4 flex flex-col gap-1 items-start text-left active:scale-[0.97] transition-transform animate-scale-in"
                style={{
                  animationDelay: `${idx * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                <MethodIcon method={method} size={28} />
                <span class="text-headline mt-1">{formatMethod(method)}</span>
                <span class="text-caption1 text-[var(--text-tertiary)]">
                  {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
                </span>
              </button>
            )
          })}
        </div>
      </section>

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
