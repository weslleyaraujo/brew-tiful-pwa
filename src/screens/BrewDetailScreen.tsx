import { useState } from 'preact/hooks'
import { goBack, navigateTo, activeView } from '../store/ui'
import { brews, updateBrew, deleteBrew } from '../store/recipes'
import { formatMethod } from '../lib/format'
import { ArrowLeft, Play, Star, Trash2, Clock, BookOpen } from 'lucide-preact'

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

export function BrewDetailScreen() {
  const view = activeView.value
  if (view.type !== 'brew-detail') return null

  const brewId = view.brewId
  const brew = brews.value.find(b => b.id === brewId)
  if (!brew) {
    return (
      <div class="flex flex-col h-full items-center justify-center gap-3">
        <p class="text-body text-[var(--text-secondary)]">Brew not found</p>
        <button onClick={goBack} class="text-[var(--color-caramel)] text-body">← Go back</button>
      </div>
    )
  }

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notes, setNotes] = useState(brew.notes ?? '')
  const [notesDirty, setNotesDirty] = useState(false)

  function handleRate(star: number) {
    const newRating = star === brew!.rating ? 0 : star
    updateBrew(brewId, { rating: newRating })
  }

  function handleSaveNotes() {
    if (notesDirty) {
      updateBrew(brewId, { notes: notes.trim() || undefined })
      setNotesDirty(false)
    }
  }

  function handleDelete() {
    deleteBrew(brewId)
    goBack()
  }

  return (
    <div class="flex flex-col h-full relative overflow-y-auto">
      {/* Warm ambient */}
      <div class="fixed inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, transparent 50%)' }} />

      {/* Header */}
      <div class="relative flex items-center gap-3 px-4 pt-[calc(16px+var(--safe-top))] pb-2">
        <button
          onClick={() => { handleSaveNotes(); goBack() }}
          class="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 class="text-title2-bold font-display flex-1 truncate">{brew.recipeName}</h1>
        <button
          onClick={() => setConfirmDelete(!confirmDelete)}
          class="p-2 rounded-xl text-[var(--text-tertiary)] active:scale-90 transition-transform"
        >
          <Trash2 size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Content */}
      <div class="relative px-4 flex flex-col gap-6 pb-24">
        {/* Meta pills */}
        <div class="flex items-center gap-2 flex-wrap">
          <span class="bg-[var(--color-amber)]/10 text-[var(--color-amber)] text-caption1 font-medium px-3 py-1 rounded-full">
            {formatMethod(brew.method)}
          </span>
          <span class="bg-[var(--bg-tertiary)]/50 text-[var(--text-secondary)] text-caption2 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Clock size={10} />
            {formatDate(brew.brewedAt)}
          </span>
        </div>

        {/* Recipe link */}
        <button
          onClick={() => navigateTo({ type: 'recipe', recipeId: brew.recipeId })}
          class="bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div class="w-8 h-8 rounded-lg bg-[var(--color-amber)]/10 flex items-center justify-center flex-shrink-0">
            <BookOpen size={16} strokeWidth={1.5} class="text-[var(--color-amber)]" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-caption1 text-[var(--text-tertiary)]">Recipe</p>
            <p class="text-body text-[var(--text-primary)] truncate">{brew.recipeName}</p>
          </div>
          <span class="text-caption2 text-[var(--color-amber)]">View →</span>
        </button>

        {/* Brew stats */}
        <div class="grid grid-cols-3 gap-3">
          <StatBlock label="Beans" value={`${brew.beans}g`} />
          <StatBlock label="Water" value={`${brew.water}ml`} />
          <StatBlock label="Ratio" value={`1:${brew.ratio.toFixed(1)}`} />
        </div>

        {/* Rating — large tappable stars */}
        <div class="flex flex-col items-center gap-2 py-2">
          <p class="text-caption1 text-[var(--text-tertiary)] uppercase tracking-wider">Rating</p>
          <div class="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                class="p-1 transition-transform active:scale-110"
              >
                <Star
                  size={36}
                  strokeWidth={1.5}
                  class={(brew.rating != null && star <= brew.rating)
                    ? 'text-[var(--color-amber)] fill-[var(--color-amber)]'
                    : 'text-[var(--text-tertiary)]/20'}
                />
              </button>
            ))}
          </div>
          <div class="h-5 flex items-center justify-center">
            {brew.rating != null && brew.rating > 0 ? (
              <p class="text-caption1 text-[var(--text-tertiary)]">
                {brew.rating}/5
              </p>
            ) : (
              <p class="text-caption1 text-[var(--text-tertiary)]/0">0/5</p>
            )}
          </div>
        </div>

        <div class="h-px bg-[var(--color-separator)]" />

        {/* Notes */}
        <div>
          <p class="text-caption1 text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Notes</p>
          <textarea
            value={notes}
            onInput={(e) => { setNotes((e.target as HTMLTextAreaElement).value); setNotesDirty(true) }}
            onBlur={handleSaveNotes}
            placeholder="Add tasting notes..."
            rows={4}
            class="w-full bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-4 py-3 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none outline-none focus:border-[var(--color-caramel)] transition-colors"
          />
          {notesDirty && (
            <p class="text-caption2 text-[var(--color-amber)] mt-1">Tap outside to save</p>
          )}
        </div>

        {/* Delete confirmation */}
        {confirmDelete && (
          <div class="bg-[var(--color-red)]/5 rounded-xl border border-[var(--color-red)]/20 p-4 flex items-center gap-3">
            <span class="text-caption1 text-[var(--color-red)] flex-1">Delete this brew?</span>
            <button
              onClick={handleDelete}
              class="px-4 py-2 rounded-xl bg-[var(--color-red)] text-white text-caption1 font-medium active:scale-95 transition-transform"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              class="px-4 py-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-caption1 font-medium active:scale-95 transition-transform"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Brew Again FAB */}
      <div class="fixed right-4 bottom-[calc(16px+var(--safe-bottom))] z-10">
        <button
          onClick={() => navigateTo({ type: 'brew', recipeId: brew.recipeId })}
          class="px-6 py-3.5 rounded-2xl bg-[var(--color-caramel)] text-white shadow-lg flex items-center gap-2 active:scale-95 transition-transform"
        >
          <Play size={18} strokeWidth={2.5} fill="currentColor" class="ml-0.5" />
          <span class="text-body-bold">Brew Again</span>
        </button>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div class="bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-3 py-3 flex flex-col items-center gap-1">
      <span class="text-title3 font-mono text-[var(--text-primary)]">{value}</span>
      <span class="text-caption2 text-[var(--text-tertiary)]">{label}</span>
    </div>
  )
}
