import { useReducer, useEffect } from 'preact/hooks'
import { Lock, Unlock, Minus, Plus } from 'lucide-preact'
import type { Recipe, RecipeAdjustments } from '../db/types'
import { setAdjustment, resetAdjustment } from '../store/recipes'
import { showAdjustmentsSheet, closeAdjustments } from '../store/ui'
import {
  calculateRatio,
  calculateBeansFromWaterAndRatio,
  calculateWaterFromBeansAndRatio,
  calculateWaterFromServings,
  normalizeRatioInput,
} from '../lib/conversion'
import { lightTap, mediumTap } from '../lib/haptics'

const AdjustmentMode = { RATIO: 'RATIO', VOLUME: 'VOLUME' } as const
type AdjustmentMode = (typeof AdjustmentMode)[keyof typeof AdjustmentMode]

interface FormState { ratio: number; water: string; beans: string; mode: AdjustmentMode; mlPerServing: number }
type FormAction =
  | { type: 'SET_RATIO'; payload: number }
  | { type: 'SET_WATER'; payload: string }
  | { type: 'SET_BEANS'; payload: string }
  | { type: 'SET_MODE'; payload: AdjustmentMode }
  | { type: 'SET_SERVINGS'; payload: number }
  | { type: 'SET_ML_PER_SERVING'; payload: number }
  | { type: 'RESET'; payload: FormState }

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_RATIO': {
      if (state.mode === AdjustmentMode.VOLUME) return state
      const newRatio = normalizeRatioInput(action.payload)
      if (!newRatio) return state
      const rounded = Math.round(newRatio * 10) / 10
      const beansValue = calculateBeansFromWaterAndRatio(Number(state.water), rounded)
      if (!beansValue) return state
      return { ...state, ratio: rounded, beans: beansValue.toFixed(1) }
    }
    case 'SET_WATER': {
      if (state.mode === AdjustmentMode.RATIO) return state
      const water = Math.round(Number(action.payload))
      if (!water || water <= 0) return state
      const beansValue = calculateBeansFromWaterAndRatio(water, Number(state.ratio))
      if (!beansValue) return state
      return { ...state, water: water.toString(), beans: beansValue.toFixed(1) }
    }
    case 'SET_BEANS': {
      if (state.mode === AdjustmentMode.RATIO) return state
      const beans = Number(action.payload)
      if (!beans || beans <= 0) return state
      const waterValue = calculateWaterFromBeansAndRatio(beans, Number(state.ratio))
      if (!waterValue) return state
      return { ...state, beans: action.payload, water: waterValue.toString() }
    }
    case 'SET_SERVINGS': {
      const waterValue = calculateWaterFromServings(action.payload, state.mlPerServing)
      if (!waterValue) return state
      const beansValue = calculateBeansFromWaterAndRatio(waterValue, Number(state.ratio))
      if (!beansValue) return state
      return { ...state, water: waterValue.toString(), beans: beansValue.toFixed(1) }
    }
    case 'SET_ML_PER_SERVING': {
      const ml = Math.max(50, Math.min(500, action.payload))
      const servings = Math.round(Number(state.water) / state.mlPerServing)
      const waterValue = calculateWaterFromServings(servings, ml)
      if (!waterValue) return state
      const beansValue = calculateBeansFromWaterAndRatio(waterValue, Number(state.ratio))
      if (!beansValue) return state
      return { ...state, mlPerServing: ml, water: waterValue.toString(), beans: beansValue.toFixed(1) }
    }
    case 'SET_MODE': return { ...state, mode: action.payload }
    case 'RESET': return action.payload
    default: return state
  }
}

const ML_PER_SERVING = 200
const MIN_SERVINGS = 1
const MAX_SERVINGS = 10

interface AdjustmentsSheetProps { recipe: Recipe; displayBeans: number; displayWater: number }

export function AdjustmentsSheet({ recipe, displayBeans, displayWater }: AdjustmentsSheetProps) {
  const open = showAdjustmentsSheet.value

  const initialRatio = calculateRatio({ beans: recipe.beans, water: recipe.water, asNumber: true })

  const initialState: FormState = {
    ratio: Math.max(1, initialRatio),
    water: Math.max(ML_PER_SERVING, displayWater).toString(),
    beans: Math.max(1, displayBeans).toString(),
    mode: AdjustmentMode.VOLUME,
    mlPerServing: ML_PER_SERVING,
  }

  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (open) dispatch({ type: 'RESET', payload: initialState })
  }, [open])

  const currentServings = Math.max(MIN_SERVINGS, Math.min(MAX_SERVINGS, Math.round(Number(state.water) / ML_PER_SERVING)))
  const isRatioMode = state.mode === AdjustmentMode.RATIO

  function handleDone() {
    const waterMult = Number(state.water) / recipe.water
    const ice = recipe.ice ? Math.round(recipe.ice * waterMult) : null
    const adj: RecipeAdjustments = { ratio: state.ratio, water: Number(state.water), beans: Number(state.beans), ice }
    if (Math.abs(adj.water - recipe.water) < 0.5 && Math.abs(adj.beans - recipe.beans) < 0.5) {
      resetAdjustment(recipe.id)
    } else {
      setAdjustment(recipe.id, adj)
    }
    closeAdjustments()
    mediumTap()
  }

  function toggleMode() {
    dispatch({ type: 'SET_MODE', payload: isRatioMode ? AdjustmentMode.VOLUME : AdjustmentMode.RATIO })
    lightTap()
  }

  function changeServings(delta: number) {
    const next = Math.max(MIN_SERVINGS, Math.min(MAX_SERVINGS, currentServings + delta))
    dispatch({ type: 'SET_SERVINGS', payload: next })
  }

  if (!open) return null

  return (
    <>
      <div class="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={closeAdjustments} />

      <div class="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-app)] rounded-t-3xl max-h-[85dvh] overflow-y-auto animate-slide-up">
        <button
          onClick={closeAdjustments}
          class="flex justify-center pt-3 pb-1 w-full cursor-grab active:cursor-grabbing"
        >
          <div class="w-9 h-1 rounded-full bg-[var(--text-tertiary)]/25" />
        </button>

        <div class="p-5 flex flex-col gap-6">
          {/* Servings stepper */}
          <div class="flex flex-col items-center gap-2">
            <p class="text-caption1 text-[var(--text-tertiary)] uppercase tracking-wider">Servings</p>
            <div class="flex items-center gap-5">
              <button
                onClick={() => changeServings(-1)}
                disabled={currentServings <= MIN_SERVINGS}
                class="w-10 h-10 rounded-full border border-[var(--color-separator)] flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform disabled:opacity-25"
              >
                <Minus size={18} strokeWidth={2} />
              </button>
              <span class="text-title1-bold font-mono w-10 text-center">{currentServings}</span>
              <button
                onClick={() => changeServings(1)}
                disabled={currentServings >= MAX_SERVINGS}
                class="w-10 h-10 rounded-full border border-[var(--color-separator)] flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform disabled:opacity-25"
              >
                <Plus size={18} strokeWidth={2} />
              </button>
            </div>
            <label class="flex items-center gap-1 text-caption2 text-[var(--text-tertiary)] cursor-text">
              <input
                type="number"
                defaultValue={state.mlPerServing}
                onBlur={(e) => {
                  const val = Number((e.target as HTMLInputElement).value)
                  if (val >= 50 && val <= 500) {
                    dispatch({ type: 'SET_ML_PER_SERVING', payload: val })
                  } else {
                    ;(e.target as HTMLInputElement).value = String(state.mlPerServing)
                  }
                }}
                class="w-8 text-center font-mono bg-transparent outline-none border-b border-dashed border-[var(--text-tertiary)]/30 focus:border-[var(--color-caramel)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ color: 'var(--text-secondary)' }}
                min="50" max="500" step="10"
              />
              <span>ml per serving</span>
            </label>
          </div>

          <div class="h-px bg-[var(--color-separator)]" />

          {/* Ratio */}
          <div class="flex items-center justify-between">
            <span class="text-body">Ratio</span>
            <div class="flex items-center gap-2">
              <button
                onClick={toggleMode}
                class={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isRatioMode ? 'bg-[var(--color-caramel)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'
                }`}
              >
                {isRatioMode ? <Lock size={15} /> : <Unlock size={15} />}
              </button>
              <span class="text-body-bold font-mono">1:</span>
              <input
                type="number"
                value={state.ratio}
                onInput={(e) => dispatch({ type: 'SET_RATIO', payload: Number((e.target as HTMLInputElement).value) })}
                disabled={!isRatioMode}
                class={`w-14 text-right text-body-bold font-mono bg-transparent border-b-2 pb-0.5 outline-none transition-colors ${
                  !isRatioMode ? 'opacity-30 border-transparent' : 'border-[var(--color-separator)] focus:border-[var(--color-caramel)]'
                } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                step="0.1" min="1"
              />
            </div>
          </div>

          {/* Water */}
          <div class="flex items-center justify-between">
            <span class="text-body">Water</span>
            <div class="flex items-center gap-1.5">
              <input
                type="number"
                value={state.water}
                onInput={(e) => dispatch({ type: 'SET_WATER', payload: (e.target as HTMLInputElement).value })}
                disabled={isRatioMode}
                class={`w-24 text-right text-body-bold font-mono bg-transparent border-b-2 pb-0.5 outline-none transition-colors ${
                  isRatioMode ? 'opacity-30 border-transparent' : 'border-[var(--color-separator)] focus:border-[var(--color-caramel)]'
                } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                inputMode="numeric"
              />
              <span class="text-caption1 text-[var(--text-tertiary)] w-6">ml</span>
            </div>
          </div>

          {/* Beans */}
          <div class="flex items-center justify-between">
            <span class="text-body">Beans</span>
            <div class="flex items-center gap-1.5">
              <input
                type="number"
                value={state.beans}
                onInput={(e) => dispatch({ type: 'SET_BEANS', payload: (e.target as HTMLInputElement).value })}
                disabled={isRatioMode}
                class={`w-24 text-right text-body-bold font-mono bg-transparent border-b-2 pb-0.5 outline-none transition-colors ${
                  isRatioMode ? 'opacity-30 border-transparent' : 'border-[var(--color-separator)] focus:border-[var(--color-caramel)]'
                } [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                inputMode="numeric"
              />
              <span class="text-caption1 text-[var(--text-tertiary)] w-6">g</span>
            </div>
          </div>

          <button
            onClick={handleDone}
            class="w-full py-3.5 rounded-2xl bg-[var(--color-caramel)] text-white text-body-bold active:scale-[0.97] transition-transform"
          >
            Apply
          </button>
        </div>
      </div>
    </>
  )
}
