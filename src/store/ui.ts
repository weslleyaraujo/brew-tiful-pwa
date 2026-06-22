import { signal } from '@preact/signals'

// ── Active tab ──

export type Tab = 'home' | 'history' | 'settings'

export const activeTab = signal<Tab>('home')

// ── Navigation stack for sub-screens ──

export interface MethodView { type: 'method'; method: string }
export interface RecipeView { type: 'recipe'; recipeId: string }
export interface BrewView { type: 'brew'; recipeId: string }
export interface BrewCompleteView { type: 'brew-complete'; recipeId: string; brewId: string }
export interface HistoryView { type: 'history' }
export interface FavoritesView { type: 'favorites' }

export interface BrewDetailView { type: 'brew-detail'; brewId: string }

export type ViewState = 
  | { type: 'tabs' }
  | BrewDetailView
  | MethodView
  | RecipeView
  | BrewView
  | BrewCompleteView
  | HistoryView
  | FavoritesView

export const activeView = signal<ViewState>({ type: 'tabs' })

export function navigateTo(view: ViewState) {
  activeView.value = view
}

export function goBack() {
  activeView.value = { type: 'tabs' }
}

// ── Dark mode ──

export type ThemeMode = 'system' | 'light' | 'dark'

function getSystemDark(): boolean {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return false
}

export const themeMode = signal<ThemeMode>(
  (() => {
    try {
      const raw = localStorage.getItem('brew-tiful:themeMode')
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return 'system'
  })()
)

const systemChangeTick = signal(0)

export const isDark = (() => {
  const s = signal<boolean>(false)
  // Recompute whenever themeMode or systemChangeTick changes
  const update = () => {
    const mode = themeMode.value
    void systemChangeTick.value // force dependency
    if (mode === 'dark') s.value = true
    else if (mode === 'light') s.value = false
    else s.value = getSystemDark()
  }
  // Subscribe to changes
  themeMode.subscribe(update)
  systemChangeTick.subscribe(update)
  update()
  return s
})()

// Apply dark class to <html> reactively
isDark.subscribe((dark) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
  }
})

if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    systemChangeTick.value++
  })
}

export function setThemeMode(mode: ThemeMode): void {
  themeMode.value = mode
  try { localStorage.setItem('brew-tiful:themeMode', JSON.stringify(mode)) } catch { /* ignore */ }
}

export function toggleDarkMode(): void {
  if (isDark.value) {
    setThemeMode('light')
  } else {
    setThemeMode('dark')
  }
}

// ── Sheet / Modal states ──

export const showAdjustmentsSheet = signal(false)
export const adjustmentsRecipeId = signal<string | null>(null)

export function openAdjustments(recipeId: string) {
  adjustmentsRecipeId.value = recipeId
  showAdjustmentsSheet.value = true
}

export function closeAdjustments() {
  showAdjustmentsSheet.value = false
}
