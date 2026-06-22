// ── Enums ──

export const METHODS = ['V60', 'AEROPRESS', 'CHEMEX', 'FRENCH_PRESS', 'MOKA_POT', 'STAGG'] as const
export type Method = typeof METHODS[number]

export const STEPS = [
  'GRIND_COFFEE',
  'RINSE_FILTER',
  'INVERT_AEROPRESS',
  'ADD_ICE',
  'ADD_COFFEE_AND_WATER',
  'BLOOM',
  'ADD_WATER',
  'BREW',
  'STIR',
  'PLUNGE',
  'WIGGLE',
] as const
export type StepEnum = typeof STEPS[number]

export const STEP_CONFIGS = ['AMOUNT_OF_WATER', 'DURATION', 'TIMES'] as const
export type StepConfigEnum = typeof STEP_CONFIGS[number]

export const GRINDS = ['FINE', 'MEDIUM_FINE', 'MEDIUM', 'MEDIUM_COARSE', 'COARSE'] as const
export type GrindEnum = typeof GRINDS[number]

// ── Data types ──

export interface StepConfig {
  type: StepConfigEnum
  value: number
}

export interface RecipeStep {
  id: string
  step: StepEnum
  position: number
  configs: StepConfig[]
}

export interface Recipe {
  id: string
  name: string
  method: Method
  beans: number       // grams
  water: number       // milliliters
  temperature: number  // celsius
  grind: GrindEnum
  ice?: number        // grams, for iced recipes
  steps: RecipeStep[]
}

// Reduced config data keyed by step id
export interface StepData {
  water?: number
  duration?: number
  times?: number
}

// ── Adjustments ──

export interface RecipeAdjustments {
  beans: number
  ice: number | null
  ratio: number
  water: number
}

// ── Brew history ──

export interface BrewRecord {
  id: string
  recipeId: string
  recipeName: string
  method: Method
  beans: number
  water: number
  ratio: number
  rating?: number
  notes?: string
  ice?: number | null
  brewedAt: Date
}

// ── Favorites ──

export interface Favorite {
  recipeId: string
  addedAt: Date
}
