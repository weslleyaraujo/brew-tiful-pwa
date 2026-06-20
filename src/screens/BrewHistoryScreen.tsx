import { brews } from '../store/recipes'
import { navigateTo, goBack, activeView } from '../store/ui'
import { formatMethod, formatWeight } from '../lib/format'
import { ArrowLeft, Play, Clock } from 'lucide-preact'
import { EmptyState } from '../components/ui/EmptyState'

export function BrewHistoryScreen() {
  const allBrews = [...brews.value].sort((a, b) => b.brewedAt.getTime() - a.brewedAt.getTime())
  const isModal = activeView.value.type === 'history'

  return (
    <div class="flex flex-col h-full relative">
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.03) 0%, transparent 50%)' }} />

      <div class="relative flex items-center gap-3 px-4 pt-[calc(16px+var(--safe-top))] pb-4">
        {isModal && (
          <button
            onClick={goBack}
            class="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        )}
        <h1 class="text-title1-bold font-display">History</h1>
        <span class="text-caption1 text-[var(--text-tertiary)] mt-1">{allBrews.length} brews</span>
      </div>

      <div class="relative flex-1 overflow-y-auto px-4 pb-24">
        {allBrews.length === 0 ? (
          <EmptyState title="No brews yet" description="Your brewing history will appear here" />
        ) : (
          <div class="flex flex-col gap-2">
            {allBrews.map((brew, idx) => (
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
                    <div class="flex items-center gap-1 mt-0.5 text-caption2 text-[var(--text-tertiary)]">
                      <Clock size={10} />
                      <span>{formatDate(brew.brewedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo({ type: 'brew', recipeId: brew.recipeId })}
                    class="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Play size={16} strokeWidth={2.5} class="text-[var(--color-amber)] ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
