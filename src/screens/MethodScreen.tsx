import { recipesByMethod } from '../store/recipes'
import { navigateTo, goBack, activeView } from '../store/ui'
import { formatMethod, formatWeight, formatTemperature } from '../lib/format'
import { calculateRatio } from '../lib/conversion'
import { ArrowLeft, Clock } from 'lucide-preact'
import { EmptyState } from '../components/ui/EmptyState'

// Estimate total brew time from step durations
function estimateTime(steps: { configs: { type: string; value: number }[] }[]): string {
  const totalSeconds = steps.reduce((sum, s) => {
    const dur = s.configs.find(c => c.type === 'DURATION')
    return sum + (dur?.value ?? 0)
  }, 0)
  const mins = Math.round(totalSeconds / 60)
  return `${mins} min`
}

// Grind color indicator
function grindLevel(grind: string): { label: string; width: number } {
  const map: Record<string, string> = { FINE: 'Fine', MEDIUM_FINE: 'M-Fine', MEDIUM: 'Med', MEDIUM_COARSE: 'M-Coarse', COARSE: 'Coarse' }
  const widths: Record<string, number> = { FINE: 1, MEDIUM_FINE: 2, MEDIUM: 3, MEDIUM_COARSE: 4, COARSE: 5 }
  return { label: map[grind] ?? grind, width: widths[grind] ?? 3 }
}

export function MethodScreen() {
  const view = activeView.value
  if (view.type !== 'method') return null

  const method = view.method
  const methodRecipes = recipesByMethod.value.get(method) ?? []

  return (
    <div class="flex flex-col h-full relative">
      {/* Warm ambient */}
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.03) 0%, transparent 50%)' }} />

      {/* Header with count */}
      <div class="relative flex items-center gap-3 px-4 pt-[calc(16px+var(--safe-top))] pb-2">
        <button
          onClick={goBack}
          class="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div>
          <h1 class="text-title1-bold font-display">{formatMethod(method)}</h1>
          <p class="text-caption1 text-[var(--text-tertiary)]">{methodRecipes.length} recipes</p>
        </div>
      </div>

      {/* Recipe list — clean cards */}
      <div class="relative flex-1 overflow-y-auto px-4 pb-24">
        {/* Top fade gradient */}
        <div class="sticky top-0 left-0 right-0 h-6 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, var(--bg-app), transparent)' }} />
        {/* Bottom fade gradient */}
        <div class="sticky bottom-0 left-0 right-0 h-8 -mt-8 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, var(--bg-app), transparent)' }} />
        {methodRecipes.length === 0 ? (
          <EmptyState title="No recipes yet" description="Recipes for this method will appear here" />
        ) : (
          <div class="flex flex-col gap-2 pt-2">
            {methodRecipes.map((recipe, idx) => {
              const ratio = calculateRatio({ beans: recipe.beans, water: recipe.water })
              const time = estimateTime(recipe.steps)
              const grind = grindLevel(recipe.grind)

              return (
                <button
                  key={recipe.id}
                  onClick={() => navigateTo({ type: 'recipe', recipeId: recipe.id })}
                  class="text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] px-4 py-3.5 active:scale-[0.98] transition-transform animate-scale-in flex items-center gap-3"
                  style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'backwards' }}
                >
                  {/* Left: recipe name + subtle details */}
                  <div class="flex-1 min-w-0">
                    <p class="text-body-bold truncate">{recipe.name}</p>
                    <div class="flex items-center gap-2 mt-1 text-caption2 text-[var(--text-tertiary)]">
                      {/* Ratio pill */}
                      <span class="font-mono bg-[var(--color-amber)]/8 text-[var(--color-amber)] px-1.5 py-0.5 rounded-md">{ratio}</span>
                      {/* Time */}
                      <span class="flex items-center gap-0.5">
                        <Clock size={10} />
                        {time}
                      </span>
                      {/* Grind bar */}
                      <span class="flex items-center gap-1">
                        <span class="text-[10px] opacity-60">{grind.label}</span>
                        <span class="flex gap-px">
                          {[1,2,3,4,5].map(i => (
                            <span key={i} class={`w-1 h-2 rounded-full ${i <= grind.width ? 'bg-[var(--color-amber)]/40' : 'bg-[var(--color-separator)]'}`} />
                          ))}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right: temp + serving size */}
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
