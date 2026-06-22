import { useState, useMemo, useRef, useEffect } from 'preact/hooks'
import { recipesByMethod } from '../store/recipes'
import { navigateTo, goBack, activeView } from '../store/ui'
import { formatMethod, formatWeight, formatTemperature, formatMethodDescription } from '../lib/format'
import { calculateRatio } from '../lib/conversion'

import { ArrowLeft, Clock, Search, X } from 'lucide-preact'
import { EmptyState } from '../components/ui/EmptyState'

type TimeFilter = 'all' | 'quick' | 'medium' | 'long'
type SortBy = 'name' | 'time' | 'ratio'

function estimateTime(steps: { configs: { type: string; value: number }[] }[]): number {
  return steps.reduce((sum, s) => {
    const dur = s.configs.find(c => c.type === 'DURATION')
    return sum + (dur?.value ?? 0)
  }, 0)
}

function formatTime(seconds: number): string {
  const mins = Math.round(seconds / 60)
  return `${mins} min`
}

function grindLevel(grind: string): { label: string; width: number } {
  const map: Record<string, string> = { FINE: 'Fine', MEDIUM_FINE: 'M-Fine', MEDIUM: 'Med', MEDIUM_COARSE: 'M-Coarse', COARSE: 'Coarse' }
  const widths: Record<string, number> = { FINE: 1, MEDIUM_FINE: 2, MEDIUM: 3, MEDIUM_COARSE: 4, COARSE: 5 }
  return { label: map[grind] ?? grind, width: widths[grind] ?? 3 }
}

const TIME_FILTERS: { id: TimeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'quick', label: 'Quick (<4 min)' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long (>8 min)' },
]

const SORT_OPTIONS: { id: SortBy; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'time', label: 'Time' },
  { id: 'ratio', label: 'Ratio' },
]

export function MethodScreen() {
  const view = activeView.value
  if (view.type !== 'method') return null

  const method = view.method
  const allRecipes = recipesByMethod.value.get(method) ?? []
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [icedOnly, setIcedOnly] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    let list = [...allRecipes]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(r => r.name.toLowerCase().includes(q))
    }

    // Time filter
    if (timeFilter !== 'all') {
      list = list.filter(r => {
        const t = estimateTime(r.steps) / 60
        if (timeFilter === 'quick') return t < 4
        if (timeFilter === 'medium') return t >= 4 && t <= 8
        if (timeFilter === 'long') return t > 8
        return true
      })
    }

    // Iced filter
    if (icedOnly) {
      list = list.filter(r => r.ice != null && r.ice > 0)
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'time') return estimateTime(a.steps) - estimateTime(b.steps)
      if (sortBy === 'ratio') {
        const ra = calculateRatio({ beans: a.beans, water: a.water, asNumber: true })
        const rb = calculateRatio({ beans: b.beans, water: b.water, asNumber: true })
        return (ra as number) - (rb as number)
      }
      return 0
    })

    return list
  }, [allRecipes, search, timeFilter, icedOnly, sortBy])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div class="flex flex-col h-full relative">
      {/* Warm ambient */}
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, transparent 50%)' }} />

      {/* Header */}
      <div class="relative flex items-center gap-3 px-4 pt-[calc(16px+var(--safe-top))] pb-2">
        <button
          onClick={goBack}
          class="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Hero area */}
      <div class="relative px-4 pb-4 flex items-center gap-4">

        <div class="flex-1 min-w-0">
          <h1 class="text-title1-bold font-display">{formatMethod(method)}</h1>
          <p class="text-caption1 text-[var(--text-secondary)]">{formatMethodDescription(method)}</p>
          <span class="inline-block mt-1.5 bg-[var(--color-amber)]/10 text-[var(--color-amber)] text-caption2 font-medium px-2 py-0.5 rounded-full">
            {allRecipes.length} recipes
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div class="px-4 pb-3">
        <div class="relative">
          <Search size={14} strokeWidth={2} class="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
            placeholder="Search recipes..."
            class="w-full bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] pl-9 pr-8 py-2.5 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--color-caramel)] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-tertiary)] active:bg-[var(--bg-tertiary)]"
            >
              <X size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      {/* Filter chips + sort */}
      <div class="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <div class="flex gap-1.5 flex-shrink-0">
          {TIME_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              class={`px-3 py-1.5 rounded-full text-caption1 font-medium whitespace-nowrap transition-all ${
                timeFilter === f.id
                  ? 'bg-[var(--color-caramel)] text-white'
                  : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] active:bg-[var(--bg-tertiary)]'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setIcedOnly(!icedOnly)}
            class={`px-3 py-1.5 rounded-full text-caption1 font-medium whitespace-nowrap transition-all ${
              icedOnly
                ? 'bg-[var(--color-blue)] text-white'
                : 'bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] active:bg-[var(--bg-tertiary)]'
            }`}
          >
            Iced
          </button>
        </div>
        <div class="w-px h-5 bg-[var(--color-separator)] flex-shrink-0" />
        <div class="flex gap-1 flex-shrink-0">
          {SORT_OPTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              class={`px-2.5 py-1.5 rounded-full text-caption2 font-medium transition-all ${
                sortBy === s.id
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)]'
                  : 'text-[var(--text-tertiary)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe list */}
      <div class="relative flex-1 overflow-y-auto px-4 pb-24">
        <div class="sticky top-0 left-0 right-0 h-6 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, var(--bg-app), transparent)' }} />
        <div class="sticky bottom-0 left-0 right-0 h-8 -mt-8 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, var(--bg-app), transparent)' }} />

        {filtered.length === 0 ? (
          <EmptyState
            title="No recipes found"
            description={search ? 'Try a different search or filter' : 'Try a different filter'}
          />
        ) : (
          <div class="flex flex-col gap-2 pt-2">
            {filtered.map((recipe, idx) => {
              const ratio = calculateRatio({ beans: recipe.beans, water: recipe.water })
              const time = formatTime(estimateTime(recipe.steps))
              const grind = grindLevel(recipe.grind)

              return (
                <button
                  key={recipe.id}
                  onClick={() => navigateTo({ type: 'recipe', recipeId: recipe.id })}
                  class="text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] px-4 py-3.5 active:scale-[0.98] transition-transform animate-scale-in flex items-center gap-3"
                  style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'backwards' }}
                >


                  <div class="flex-1 min-w-0">
                    <p class="text-body-bold truncate">{recipe.name}</p>
                    <div class="flex items-center gap-2 mt-1 text-caption2 text-[var(--text-tertiary)]">
                      <span class="font-mono bg-[var(--color-amber)]/8 text-[var(--color-amber)] px-1.5 py-0.5 rounded-md">{ratio}</span>
                      <span class="flex items-center gap-0.5">
                        <Clock size={10} />
                        {time}
                      </span>
                      <span class="text-[10px] opacity-60">{grind.label}</span>
                    </div>
                  </div>

                  <div class="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span class="text-caption1 font-mono text-[var(--text-secondary)]">{formatTemperature(recipe.temperature)}</span>
                    <span class="text-caption2 text-[var(--text-tertiary)] font-mono">
                      {formatWeight(recipe.beans, 'mass')} / {formatWeight(recipe.water, 'volume')}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
