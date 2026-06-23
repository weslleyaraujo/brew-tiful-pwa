import { signal, computed } from '@preact/signals'
import type { Recipe, RecipeAdjustments, Favorite, BrewRecord } from '../db/types'

// ── Recipes ──

export const recipes = signal<Recipe[]>([])
export const loading = signal(true)

export const recipesByMethod = computed(() => {
  const map = new Map<string, Recipe[]>()
  for (const r of recipes.value) {
    const list = map.get(r.method) ?? []
    list.push(r)
    map.set(r.method, list)
  }
  return map
})

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.value.find((r) => r.id === id)
}

async function loadRecipeModules(): Promise<Recipe[]> {
  const recipeModules = import.meta.glob<{ default: Omit<Recipe, 'id'> }>(
    '../recipes/*.json',
    { eager: true }
  )

  const loaded: Recipe[] = []
  for (const [path, module] of Object.entries(recipeModules)) {
    const raw = module.default
    const filename = path.split('/').pop()?.replace('.json', '') ?? 'unknown'
    const recipe: Recipe = { ...raw, id: filename }
    loaded.push(recipe)
  }

  loaded.sort((a, b) => {
    const cmp = a.method.localeCompare(b.method)
    if (cmp !== 0) return cmp
    return a.name.localeCompare(b.name)
  })

  return loaded
}

export async function loadRecipes() {
  try {
    recipes.value = await loadRecipeModules()
  } catch (err) {
    console.error('Failed to load recipes:', err)
  } finally {
    loading.value = false
  }
}

// ── Adjustments ──

function loadAdjustments(): Map<string, RecipeAdjustments> {
  try {
    const raw = localStorage.getItem('brew-tiful:adjustments')
    if (raw) {
      const obj = JSON.parse(raw)
      return new Map(Object.entries(obj))
    }
  } catch { /* ignore */ }
  return new Map()
}

function saveAdjustments(map: Map<string, RecipeAdjustments>) {
  try { localStorage.setItem('brew-tiful:adjustments', JSON.stringify(Object.fromEntries(map))) } catch { /* ignore */ }
}

export const adjustments = signal<Map<string, RecipeAdjustments>>(loadAdjustments())

export function getAdjustment(recipeId: string): RecipeAdjustments | undefined {
  return adjustments.value.get(recipeId)
}

export function setAdjustment(recipeId: string, adj: RecipeAdjustments) {
  const next = new Map(adjustments.value)
  next.set(recipeId, adj)
  adjustments.value = next
  saveAdjustments(next)
}

export function resetAdjustment(recipeId: string) {
  const next = new Map(adjustments.value)
  next.delete(recipeId)
  adjustments.value = next
  saveAdjustments(next)
}

export function isRecipeAdjusted(recipeId: string): boolean {
  return adjustments.value.has(recipeId)
}

// ── Favorites ──

function loadFavorites(): Favorite[] {
  try {
    const raw = localStorage.getItem('brew-tiful:favorites')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveFavorites(favs: Favorite[]) {
  try { localStorage.setItem('brew-tiful:favorites', JSON.stringify(favs)) } catch { /* ignore */ }
}

export const favorites = signal<Favorite[]>(loadFavorites())
export const favoriteIds = computed(() => new Set(favorites.value.map((f) => f.recipeId)))

export function toggleFavorite(recipeId: string) {
  const current = favorites.value
  const idx = current.findIndex((f) => f.recipeId === recipeId)
  if (idx >= 0) {
    const next = [...current]
    next.splice(idx, 1)
    favorites.value = next
  } else {
    favorites.value = [...current, { recipeId, addedAt: new Date() }]
  }
  saveFavorites(favorites.value)
}

// ── Brew history ──

function loadBrews(): BrewRecord[] {
  try {
    const raw = localStorage.getItem('brew-tiful:brews')
    if (raw) return JSON.parse(raw).map((b: any) => ({ ...b, brewedAt: new Date(b.brewedAt) }))
  } catch { /* ignore */ }
  return []
}

function saveBrews(brews: BrewRecord[]) {
  try { localStorage.setItem('brew-tiful:brews', JSON.stringify(brews)) } catch { /* ignore */ }
}

export const brews = signal<BrewRecord[]>(loadBrews())
export const recentBrews = computed(() =>
  [...brews.value].sort((a, b) => b.brewedAt.getTime() - a.brewedAt.getTime()).slice(0, 5)
)

export function addBrew(brew: Omit<BrewRecord, 'id' | 'brewedAt'>) {
  const record: BrewRecord = {
    ...brew,
    id: crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
    brewedAt: new Date(),
  }
  brews.value = [record, ...brews.value]
  saveBrews(brews.value)
  return record
}

export function updateBrew(id: string, updates: Partial<Pick<BrewRecord, 'rating' | 'notes'>>) {
  const list = [...brews.value]
  const idx = list.findIndex((b) => b.id === id)
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates }
    brews.value = list
    saveBrews(brews.value)
  }
}

export function deleteBrew(id: string) {
  brews.value = brews.value.filter((b) => b.id !== id)
  saveBrews(brews.value)
}

export function getBrewsForRecipe(recipeId: string): BrewRecord[] {
  return brews.value
    .filter((b) => b.recipeId === recipeId)
    .sort((a, b) => b.brewedAt.getTime() - a.brewedAt.getTime())
}

export const lastRecipeByMethod = computed(() => {
  const map = new Map<string, string>()
  for (const brew of [...brews.value].sort((a, b) => b.brewedAt.getTime() - a.brewedAt.getTime())) {
    if (!map.has(brew.method)) map.set(brew.method, brew.recipeId)
  }
  return map
})
