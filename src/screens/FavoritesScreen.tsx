import { useMemo } from 'preact/hooks'
import { favorites, getRecipeById, toggleFavorite, favoriteIds } from '../store/recipes'
import { navigateTo, goBack } from '../store/ui'
import { formatMethod, formatWeight, formatTemperature } from '../lib/format'
import { calculateRatio } from '../lib/conversion'

import { EmptyState } from '../components/ui/EmptyState'
import { ArrowLeft, Heart, X, Clock } from 'lucide-preact'

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

export function FavoritesScreen() {
  const favs = favorites.value
  const totalFavs = favoriteIds.value.size

  // Build enriched list — resolve recipe data + sort by most recent first
  const enriched = useMemo(() => {
    return favs
      .map(fav => {
        const recipe = getRecipeById(fav.recipeId)
        return recipe ? { ...fav, recipe } : null
      })
      .filter(Boolean) as (typeof favs[0] & { recipe: NonNullable<ReturnType<typeof getRecipeById>> })[]
  }, [favs])

  // Group by method
  const grouped = useMemo(() => {
    const map = new Map<string, typeof enriched>()
    for (const item of enriched) {
      const list = map.get(item.recipe.method) ?? []
      list.push(item)
      map.set(item.recipe.method, list)
    }
    return [...map.entries()]
  }, [enriched])

  return (
    <div class="flex flex-col h-full relative overflow-y-auto">
      {/* Warm ambient gradient */}
      <div class="fixed inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, transparent 50%)' }} />

      {/* Header */}
      <div class="relative flex items-center justify-between px-4 pt-[calc(16px+var(--safe-top))] pb-2">
        <button
          onClick={goBack}
          class="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Hero area */}
      <div class="relative px-4 pb-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-[var(--color-red)]/10 border border-[var(--color-red)]/15 flex items-center justify-center flex-shrink-0">
          <Heart size={24} strokeWidth={2} class="text-[var(--color-red)] fill-[var(--color-red)]" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-title1-bold font-display">Favorites</h1>
          <p class="text-caption1 text-[var(--text-secondary)]">Your saved recipes</p>
          <span class="inline-block mt-1.5 bg-[var(--color-red)]/8 text-[var(--color-red)] text-caption2 font-medium px-2 py-0.5 rounded-full">
            {totalFavs} recipe{totalFavs !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content */}
      <div class="relative flex-1 px-4 pb-24">
        {/* Fade edges */}
        <div class="sticky top-0 left-0 right-0 h-6 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, var(--bg-app), transparent)' }} />
        <div class="sticky bottom-0 left-0 right-0 h-8 -mt-8 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, var(--bg-app), transparent)' }} />

        {enriched.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Tap the heart on any recipe to save it here"
          />
        ) : (
          <div class="flex flex-col gap-6 pt-2">
            {grouped.map(([method, items]) => (
              <section key={method}>
                <div class="flex items-center gap-2 mb-3">

                  <h2 class="text-body text-[var(--text-secondary)] font-medium">{formatMethod(method)}</h2>
                  <span class="text-caption2 text-[var(--text-tertiary)]">{items.length}</span>
                </div>

                <div class="flex flex-col gap-2">
                  {items.map((item, idx) => {
                    const recipe = item.recipe
                    const ratio = calculateRatio({ beans: recipe.beans, water: recipe.water })
                    const time = formatTime(estimateTime(recipe.steps))

                    return (
                      <div
                        key={item.recipeId}
                        class="relative group animate-scale-in"
                        style={{ animationDelay: `${idx * 40}ms`, animationFillMode: 'backwards' }}
                      >
                        <button
                          onClick={() => navigateTo({ type: 'recipe', recipeId: item.recipeId })}
                          class="w-full text-left bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] px-4 py-3.5 active:scale-[0.98] transition-transform flex items-center gap-3"
                        >
                          {/* Method icon */}


                          {/* Info */}
                          <div class="flex-1 min-w-0">
                            <p class="text-body-bold truncate">{recipe.name}</p>
                            <div class="flex items-center gap-2 mt-1 text-caption2 text-[var(--text-tertiary)]">
                              <span class="font-mono bg-[var(--color-amber)]/8 text-[var(--color-amber)] px-1.5 py-0.5 rounded-md">{ratio}</span>
                              <span class="flex items-center gap-0.5">
                                <Clock size={10} />
                                {time}
                              </span>
                            </div>
                          </div>

                          {/* Meta */}
                          <div class="flex flex-col items-end gap-0.5 flex-shrink-0">
                            <span class="text-caption1 font-mono text-[var(--text-secondary)]">{formatTemperature(recipe.temperature)}</span>
                            <span class="text-caption2 text-[var(--text-tertiary)] font-mono">
                              {formatWeight(recipe.beans, 'mass')} / {formatWeight(recipe.water, 'volume')}
                            </span>
                          </div>
                        </button>

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(item.recipeId)
                          }}
                          class="absolute top-2 right-2 w-7 h-7 rounded-full bg-[var(--bg-app)]/80 backdrop-blur-sm flex items-center justify-center text-[var(--text-tertiary)] opacity-60 hover:opacity-100 active:opacity-100 transition-all active:scale-90 hover:text-[var(--color-red)]"
                          aria-label="Remove from favorites"
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
