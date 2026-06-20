import { useMemo } from 'preact/hooks'
import { brews } from '../store/recipes'
import { formatMethod } from '../lib/format'
import { Flame } from 'lucide-preact'

export function StatsContent() {
  const stats = useMemo(() => {
    const all = brews.value
    if (all.length === 0) return null

    const totalBrews = all.length

    const methodCounts = new Map<string, number>()
    for (const b of all) methodCounts.set(b.method, (methodCounts.get(b.method) ?? 0) + 1)
    let topMethod = ''
    let topCount = 0
    for (const [m, c] of methodCounts) { if (c > topCount) { topMethod = m; topCount = c } }

    const avgRatio = all.reduce((sum, b) => sum + b.ratio, 0) / totalBrews
    const avgBeans = all.reduce((sum, b) => sum + b.beans, 0) / totalBrews

    // Streak
    let streak = 0
    let longestStreak = 0
    const today = new Date(); today.setHours(0, 0, 0, 0)
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

    const sortedDates = [...brewDates].sort((a, b) => a - b)
    let currentRun = 0; let prevDate: number | null = null
    for (const d of sortedDates) {
      if (!prevDate || d - prevDate === 86400000) currentRun++
      else { if (currentRun > longestStreak) longestStreak = currentRun; currentRun = 1 }
      prevDate = d
    }
    if (currentRun > longestStreak) longestStreak = currentRun

    // Weekly brews for sparkline (last 4 weeks)
    const weeklyBrews: number[] = []
    for (let w = 3; w >= 0; w--) {
      const weekStart = new Date(today.getTime() - w * 7 * 86400000 - today.getDay() * 86400000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
      weeklyBrews.push(all.filter(b => b.brewedAt >= weekStart && b.brewedAt < weekEnd).length)
    }

    // Last 7 days
    const weekAgo = new Date(today.getTime() - 7 * 86400000)
    const weekBrews = all.filter(b => b.brewedAt >= weekAgo)
    const weekBeans = weekBrews.reduce((sum, b) => sum + b.beans, 0)

    return { totalBrews, topMethod, avgRatio, avgBeans, streak, longestStreak, methodCounts, weeklyBrews, weekBrews: weekBrews.length, weekBeans }
  }, [brews.value])

  if (!stats) {
    return (
      <div class="flex flex-col items-center justify-center py-20 text-[var(--text-tertiary)]">
        <p class="text-body">No brews yet</p>
        <p class="text-caption1">Complete your first brew to see stats</p>
      </div>
    )
  }

  const maxWeekly = Math.max(...stats.weeklyBrews, 1)
  const maxMethod = Math.max(...stats.methodCounts.values(), 1)

  return (
    <div class="flex flex-col gap-6 px-4 pb-24">
      {/* Streak banner */}
      {stats.streak > 0 && (
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center">
            <Flame size={20} class="text-[var(--color-amber)]" />
          </div>
          <div>
            <p class="text-body-bold">{stats.streak} day streak!</p>
            <p class="text-caption1 text-[var(--text-secondary)]">Longest streak: {stats.longestStreak} days</p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div class="grid grid-cols-2 gap-2">
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-3 text-center">
          <p class="text-title2 font-mono text-[var(--text-primary)]">{stats.totalBrews}</p>
          <p class="text-caption2 text-[var(--text-tertiary)]">Total Brews</p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-3 text-center">
          <p class="text-title2 font-mono text-[var(--text-primary)]">{formatMethod(stats.topMethod)}</p>
          <p class="text-caption2 text-[var(--text-tertiary)]">Top Method</p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-3 text-center">
          <p class="text-title2 font-mono text-[var(--text-primary)]">1:{stats.avgRatio.toFixed(1)}</p>
          <p class="text-caption2 text-[var(--text-tertiary)]">Avg Ratio</p>
        </div>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-3 text-center">
          <p class="text-title2 font-mono text-[var(--text-primary)]">{Math.round(stats.avgBeans)}g</p>
          <p class="text-caption2 text-[var(--text-tertiary)]">Avg Beans</p>
        </div>
      </div>

      {/* Method distribution */}
      <div>
        <h3 class="text-caption1 text-[var(--text-secondary)] uppercase tracking-wider mb-3">Method Distribution</h3>
        <div class="flex flex-col gap-2">
          {[...stats.methodCounts.entries()].sort((a, b) => b[1] - a[1]).map(([method, count]) => (
            <div key={method} class="flex items-center gap-2">
              <span class="text-caption1 text-[var(--text-secondary)] w-20 flex-shrink-0">{formatMethod(method)}</span>
              <div class="flex-1 h-5 bg-[var(--bg-tertiary)]/50 rounded-full overflow-hidden">
                <div
                  class="h-full bg-[var(--color-amber)]/30 rounded-full transition-all"
                  style={{ width: `${(count / maxMethod) * 100}%` }}
                />
              </div>
              <span class="text-caption2 font-mono text-[var(--text-tertiary)] w-5 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sparkline - last 4 weeks */}
      <div>
        <h3 class="text-caption1 text-[var(--text-secondary)] uppercase tracking-wider mb-3">Last 4 Weeks</h3>
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4">
          <svg viewBox="0 0 100 40" class="w-full h-16">
            {/* Grid lines */}
            <line x1="0" y1="30" x2="100" y2="30" stroke="var(--color-separator)" strokeWidth="0.5" />
            <line x1="0" y1="15" x2="100" y2="15" stroke="var(--color-separator)" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="100" y2="0" stroke="var(--color-separator)" strokeWidth="0.5" />

            {/* Area fill */}
            {stats.weeklyBrews.some(v => v > 0) && (
              <polygon
                points={`0,35 ${stats.weeklyBrews.map((v, i) => `${i * 33.3},${35 - (v / maxWeekly) * 30}`).join(' ')} 100,35`}
                fill="var(--color-amber)"
                opacity="0.1"
              />
            )}

            {/* Line */}
            <polyline
              points={stats.weeklyBrews.map((v, i) => `${i * 33.3},${35 - (v / maxWeekly) * 30}`).join(' ')}
              fill="none"
              stroke="var(--color-amber)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {stats.weeklyBrews.map((v, i) => (
              <circle
                key={i}
                cx={i * 33.3}
                cy={35 - (v / maxWeekly) * 30}
                r="2"
                fill="var(--color-amber)"
              />
            ))}
          </svg>
          <div class="flex justify-between mt-1 text-caption2 text-[var(--text-tertiary)]">
            <span>3 weeks ago</span>
            <span>2 weeks ago</span>
            <span>Last week</span>
            <span>This week</span>
          </div>
        </div>
      </div>

      {/* Weekly summary */}
      <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-4">
        <p class="text-caption1 text-[var(--text-secondary)]">
          Last 7 days: {stats.weekBrews} brew{stats.weekBrews !== 1 ? 's' : ''}
          {stats.weekBeans > 0 && <> · {stats.weekBeans}g beans used</>}
        </p>
      </div>
    </div>
  )
}
