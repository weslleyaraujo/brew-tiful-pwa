import { useMemo, useState } from 'preact/hooks'
import { brews, deleteBrew } from '../store/recipes'
import { navigateTo, goBack, activeView } from '../store/ui'
import { formatMethod, formatWeight } from '../lib/format'
import { ArrowLeft, Play, Clock, Star, FileText, Trash2, BarChart3, Coffee, TrendingUp, Flame } from 'lucide-preact'
import { EmptyState } from '../components/ui/EmptyState'
import { StatsContent } from './StatsScreen'

function getStats() {
  const all = brews.value
  if (all.length === 0) return null

  const methodCounts = new Map<string, number>()
  for (const b of all) methodCounts.set(b.method, (methodCounts.get(b.method) ?? 0) + 1)
  let topMethod = ''
  let topCount = 0
  for (const [m, c] of methodCounts) { if (c > topCount) { topMethod = m; topCount = c } }

  const avgRatio = all.reduce((sum, b) => sum + b.ratio, 0) / all.length

  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const brewDates = new Set(all.map(b => { const d = new Date(b.brewedAt); d.setHours(0, 0, 0, 0); return d.getTime() }))
  let check = new Date(today)
  while (brewDates.has(check.getTime())) { streak++; check.setDate(check.getDate() - 1) }
  if (streak === 0) {
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    if (brewDates.has(yesterday.getTime())) {
      check = new Date(yesterday)
      while (brewDates.has(check.getTime())) { streak++; check.setDate(check.getDate() - 1) }
    }
  }

  return { totalBrews: all.length, topMethod, avgRatio, streak }
}

interface Group {
  label: string
  brews: typeof brews.value
}

function groupBrews(allBrews: typeof brews.value): Group[] {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const weekStart = new Date(todayStart.getTime() - todayStart.getDay() * 86400000)

  const groups: Group[] = []
  const todayBrews = allBrews.filter(b => b.brewedAt >= todayStart)
  const yesterdayBrews = allBrews.filter(b => b.brewedAt >= yesterdayStart && b.brewedAt < todayStart)
  const thisWeekBrews = allBrews.filter(b => b.brewedAt >= weekStart && b.brewedAt < yesterdayStart)

  if (todayBrews.length > 0) groups.push({ label: 'Today', brews: todayBrews })
  if (yesterdayBrews.length > 0) groups.push({ label: 'Yesterday', brews: yesterdayBrews })
  if (thisWeekBrews.length > 0) groups.push({ label: 'This Week', brews: thisWeekBrews })

  const older = allBrews.filter(b => b.brewedAt < weekStart)
  if (older.length > 0) {
    const monthGroups = new Map<string, typeof allBrews>()
    for (const b of older) {
      const key = b.brewedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      const list = monthGroups.get(key) ?? []
      list.push(b)
      monthGroups.set(key, list)
    }
    for (const [month, list] of monthGroups) {
      groups.push({ label: month, brews: list })
    }
  }

  return groups
}

function Stars({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <span class="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          size={10}
          strokeWidth={1.5}
          class={s <= rating ? 'text-[var(--color-amber)] fill-[var(--color-amber)]' : 'text-[var(--text-tertiary)]/20'}
        />
      ))}
    </span>
  )
}

export function BrewHistoryScreen() {
  const allBrews = useMemo(() =>
    [...brews.value].sort((a, b) => b.brewedAt.getTime() - a.brewedAt.getTime()),
    [brews.value]
  )
  const stats = useMemo(() => getStats(), [brews.value])
  const groups = useMemo(() => groupBrews(allBrews), [allBrews])
  const isModal = activeView.value.type === 'history'
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showStats, setShowStats] = useState(false)

  return (
    <div class="flex flex-col h-full relative">
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, transparent 50%)' }} />

      {/* Header */}
      <div class="relative flex items-center gap-3 px-4 pt-[calc(16px+var(--safe-top))] pb-2">
        {isModal && (
          <button
            onClick={goBack}
            class="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        )}
        <h1 class="text-title1-bold font-display">History</h1>
        <div class="flex-1" />
        <button
          onClick={() => setShowStats(!showStats)}
          class={`p-2 rounded-xl transition-colors ${
            showStats ? 'bg-[var(--color-amber)]/10 text-[var(--color-amber)]' : 'text-[var(--text-tertiary)]'
          }`}
        >
          <BarChart3 size={18} strokeWidth={2} />
        </button>
      </div>

      {showStats ? <StatsContent /> : (
        <div class="flex flex-col flex-1">
          {/* Stats pills */}
          {stats && (
            <div class="px-4 pb-4 flex gap-2 overflow-x-auto scrollbar-none">
              <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-3 py-2.5 flex-shrink-0 flex items-center gap-2">
                <Coffee size={16} strokeWidth={1.5} class="text-[var(--color-amber)]/60 flex-shrink-0" />
                <div>
                  <p class="text-headline font-mono text-[var(--text-primary)]">{stats.totalBrews}</p>
                  <p class="text-[10px] text-[var(--text-tertiary)]">Total</p>
                </div>
              </div>
              <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-3 py-2.5 flex-shrink-0 flex items-center gap-2">
                <TrendingUp size={16} strokeWidth={1.5} class="text-[var(--color-amber)]/60 flex-shrink-0" />
                <div>
                  <p class="text-headline font-mono text-[var(--text-primary)]">{formatMethod(stats.topMethod)}</p>
                  <p class="text-[10px] text-[var(--text-tertiary)]">Top</p>
                </div>
              </div>
              <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-3 py-2.5 flex-shrink-0 flex items-center gap-2">
                <Flame size={16} strokeWidth={1.5} class="text-[var(--color-amber)]/60 flex-shrink-0" />
                <div>
                  <p class="text-headline font-mono text-[var(--text-primary)]">1:{stats.avgRatio.toFixed(1)}</p>
                  <p class="text-[10px] text-[var(--text-tertiary)]">Avg Ratio</p>
                </div>
              </div>
              {stats.streak > 0 && (
                <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-3 py-2.5 flex-shrink-0 flex items-center gap-2">
                  <Flame size={16} strokeWidth={1.5} class="text-[var(--color-amber)] flex-shrink-0" />
                  <div>
                    <p class="text-headline font-mono text-[var(--text-primary)]">{stats.streak}d</p>
                    <p class="text-[10px] text-[var(--text-tertiary)]">Streak</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Brew list with groups */}
          <div class="relative flex-1 overflow-y-auto px-4 pb-24">
            {allBrews.length === 0 ? (
              <EmptyState title="Your brewing journey starts here" description="Complete your first brew to see it here" />
            ) : (
              <div class="flex flex-col gap-4">
                {groups.map((group) => (
                  <div key={group.label}>
                    <div class="sticky top-0 z-10 pb-2 bg-[var(--bg-app)]">
                      <h2 class="text-caption1 text-[var(--text-secondary)] uppercase tracking-wider">
                        {group.label}
                        <span class="ml-1 text-[var(--text-tertiary)] font-normal normal-case tracking-normal">
                          · {group.brews.length}
                        </span>
                      </h2>
                    </div>

                    <div class="flex flex-col gap-2">
                      {group.brews.map((brew, idx) => (
                        <div
                          key={brew.id}
                          class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4 animate-scale-in"
                          style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'backwards' }}
                        >
                          <div class="flex items-start justify-between gap-3">
                            <div class="flex-1 min-w-0">
                              <p class="text-body-bold truncate">{brew.recipeName}</p>
                              <div class="flex items-center gap-2 mt-1 text-caption1 text-[var(--text-tertiary)]">
                                <span>{formatMethod(brew.method)}</span>
                                <span>·</span>
                                <span class="font-mono">{formatWeight(brew.beans, 'mass')}</span>
                                <span>·</span>
                                <span class="font-mono">{formatWeight(brew.water, 'volume')}</span>
                              </div>
                              <div class="flex items-center gap-2 mt-1 text-caption2 text-[var(--text-tertiary)]">
                                <Clock size={10} />
                                <span>{formatDate(brew.brewedAt)}</span>
                                {brew.rating && <Stars rating={brew.rating} />}
                              </div>
                              {brew.notes && (
                                <div class="mt-2">
                                  <button
                                    onClick={() => setExpandedNotes(expandedNotes === brew.id ? null : brew.id)}
                                    class="flex items-center gap-1 text-caption2 text-[var(--text-tertiary)]"
                                  >
                                    <FileText size={10} />
                                    <span class={expandedNotes === brew.id ? '' : 'truncate max-w-[200px]'}>
                                      {expandedNotes === brew.id ? brew.notes : brew.notes.slice(0, 60) + (brew.notes.length > 60 ? '...' : '')}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>

                            <div class="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => navigateTo({ type: 'brew', recipeId: brew.recipeId })}
                                class="w-8 h-8 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center active:scale-90 transition-transform"
                              >
                                <Play size={14} strokeWidth={2.5} class="text-[var(--color-amber)] ml-0.5" />
                              </button>
                              <button
                                onClick={() => setConfirmDelete(confirmDelete === brew.id ? null : brew.id)}
                                class="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform text-[var(--text-tertiary)]"
                              >
                                <Trash2 size={14} strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>

                          {confirmDelete === brew.id && (
                            <div class="mt-3 pt-3 border-t border-[var(--color-separator)] flex items-center gap-2">
                              <span class="text-caption1 text-[var(--text-secondary)]">Delete this brew?</span>
                              <button
                                onClick={() => { deleteBrew(brew.id); setConfirmDelete(null) }}
                                class="px-3 py-1 rounded-lg bg-[var(--color-red)] text-white text-caption2 font-medium active:scale-95 transition-transform"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                class="px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-caption2 font-medium active:scale-95 transition-transform"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
