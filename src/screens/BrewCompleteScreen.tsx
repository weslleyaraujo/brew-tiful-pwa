import { useState } from 'preact/hooks'
import { goBack, navigateTo, activeView } from '../store/ui'
import { getRecipeById, updateBrew } from '../store/recipes'
import { Coffee, Star } from 'lucide-preact'

export function BrewCompleteScreen() {
  const view = activeView.value
  if (view.type !== 'brew-complete') return null

  const recipeId = view.recipeId
  const brewId = view.brewId
  const recipe = getRecipeById(recipeId)
  const [notes, setNotes] = useState('')

  function handleSave() {
    if (notes.trim()) updateBrew(brewId, { notes: notes.trim() })
  }

  function handleBrewAgain() {
    handleSave()
    navigateTo({ type: 'brew', recipeId })
  }

  function handleBackHome() {
    handleSave()
    goBack()
  }

  // Brew display details use recipe data

  return (
    <div class="flex flex-col h-full bg-[var(--bg-app)] animate-fade-in">
      {/* Celebration area */}
      <div class="flex-1 flex flex-col items-center justify-center gap-6 px-6 pt-[calc(32px+var(--safe-top))]">
        {/* Animated coffee cup */}
        <div class="relative">
          <div class="animate-[wobble_0.5s_ease-in-out_infinite]">
            <Coffee size={72} strokeWidth={1} class="text-[var(--color-amber)]" />
          </div>
          {/* Steam dots */}
          <div class="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)]/40 animate-[float-up_1.5s_ease-out_infinite]" />
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)]/30 animate-[float-up_1.5s_ease-out_0.3s_infinite]" />
            <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-amber)]/20 animate-[float-up_1.5s_ease-out_0.6s_infinite]" />
          </div>
        </div>

        <div class="text-center">
          <h1 class="text-title1-bold font-display">Brew complete!</h1>
          {recipe && (
            <p class="text-body text-[var(--text-secondary)] mt-1">{recipe.name}</p>
          )}
        </div>

        {/* Brew stats */}
        {recipe && (
          <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] px-5 py-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span class="text-caption1 font-mono text-[var(--text-secondary)]">
              {recipe.beans}g
            </span>
            <span class="text-caption2 text-[var(--text-tertiary)]">·</span>
            <span class="text-caption1 font-mono text-[var(--text-secondary)]">
              {recipe.water}ml
            </span>
            <span class="text-caption2 text-[var(--text-tertiary)]">·</span>
            <span class="text-caption1 font-mono text-[var(--text-secondary)]">
              1:{(recipe.water / recipe.beans).toFixed(1)}
            </span>
            <span class="text-caption2 text-[var(--text-tertiary)]">·</span>
            <span class="text-caption1 font-mono text-[var(--text-secondary)]">
              {recipe.temperature}°C
            </span>
          </div>
        )}

        {/* Rate link */}
        <button
          onClick={() => { handleSave(); navigateTo({ type: 'brew-detail', brewId }) }}
          class="flex items-center gap-1.5 text-caption1 text-[var(--color-amber)] active:scale-95 transition-transform"
        >
          <Star size={14} strokeWidth={2} />
          Rate this brew
        </button>

        {/* Notes */}
        <div class="w-full max-w-xs">
          <textarea
            value={notes}
            onInput={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
            placeholder="Add a note..."
            rows={3}
            class="w-full bg-[var(--bg-card)] rounded-xl border border-[var(--color-separator)] px-4 py-3 text-body text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] resize-none outline-none focus:border-[var(--color-caramel)] transition-colors"
          />
        </div>
      </div>

      {/* Actions */}
      <div class="px-4 pb-[calc(16px+var(--safe-bottom))] flex flex-col gap-2">
        <button
          onClick={handleBackHome}
          class="w-full py-3.5 rounded-2xl bg-[var(--color-caramel)] text-white text-body-bold active:scale-[0.98] transition-transform"
        >
          Back to Home
        </button>
        <button
          onClick={handleBrewAgain}
          class="w-full py-3.5 rounded-2xl bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--color-separator)] text-body active:scale-[0.98] transition-transform"
        >
          Brew Again
        </button>
      </div>
    </div>
  )
}
