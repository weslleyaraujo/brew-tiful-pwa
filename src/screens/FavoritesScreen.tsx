import { favorites, getRecipeById } from '../store/recipes'
import { navigateTo } from '../store/ui'
import { formatMethod, formatGrind, formatWeight } from '../lib/format'
import { calculateRatio } from '../lib/conversion'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Heart } from 'lucide-preact'

export function FavoritesScreen() {
  const favs = favorites.value

  return (
    <div class="flex flex-col gap-4 p-4 pt-[calc(16px+var(--safe-top))] pb-24">
      <h1 class="text-title1-bold font-display">Favorites</h1>

      {favs.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart icon on a recipe to save it here"
        />
      ) : (
        <div class="flex flex-col gap-2">
          {favs.map((fav) => {
            const recipe = getRecipeById(fav.recipeId)
            if (!recipe) return null

            return (
              <Card
                key={fav.recipeId}
                padded={false}
                onClick={() => navigateTo({ type: 'recipe', recipeId: fav.recipeId })}
              >
                  <div class="flex items-center gap-4 px-4 py-3.5">
                    <div class="flex-1 min-w-0">
                      <p class="text-body-bold truncate">{recipe.name}</p>
                      <div class="flex items-center gap-2 mt-0.5 text-caption1 text-[var(--text-tertiary)]">
                        <span>{formatMethod(recipe.method)}</span>
                        <span>·</span>
                        <span>{formatGrind(recipe.grind)}</span>
                        <span>·</span>
                        <span class="font-mono">{calculateRatio({ beans: recipe.beans, water: recipe.water })}</span>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <p class="text-caption1-bold text-[var(--text-primary)] font-mono">
                        {formatWeight(recipe.beans, 'mass')}
                      </p>
                      <p class="text-caption1 text-[var(--text-tertiary)] font-mono">
                        {formatWeight(recipe.water, 'volume')}
                      </p>
                    </div>
                  </div>
                </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
