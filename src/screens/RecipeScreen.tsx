import { getRecipeById, getAdjustment, isRecipeAdjusted, getBrewsForRecipe, setAdjustment } from '../store/recipes'
import { navigateTo, goBack, activeView, openAdjustments } from '../store/ui'
import {
  formatMethod, formatGrind, formatWeight, formatTemperature,
  formatDuration, formatStepTitle
} from '../lib/format'
import { calculateRatio } from '../lib/conversion'
import type { StepData, Recipe } from '../db/types'
import { FAB } from '../components/ui/FAB'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, SlidersHorizontal, Play, Timer, Star } from 'lucide-preact'
import { AdjustmentsSheet } from '../components/AdjustmentsSheet'

// ── Reduce step configs ──

const STEP_CONFIG_KEY_MAP: Record<string, keyof StepData> = {
  AMOUNT_OF_WATER: 'water',
  DURATION: 'duration',
  TIMES: 'times',
}

function reduceConfigs(configs: { type: string; value: number }[]): StepData {
  return configs.reduce<StepData>(
    (acc, current) => ({
      ...acc,
      [STEP_CONFIG_KEY_MAP[current.type]]: current.value,
    }),
    {}
  )
}

// ── Total brew time estimate ──

function estimateTotalTime(steps: Recipe['steps']): string {
  const totalSeconds = steps.reduce((sum, s) => {
    const dur = s.configs.find(c => c.type === 'DURATION')
    return sum + (dur?.value ?? 0)
  }, 0)
  if (totalSeconds === 0) return ''
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  if (mins === 0) return `${secs}s`
  if (secs === 0) return `${mins} min`
  return `${mins}m ${secs}s`
}

// ── Step detail formatter ──

function formatStepDetails(
  step: string,
  data: StepData,
  recipe: Recipe
): string {
  const parts: string[] = []
  if (data.water) parts.push(formatWeight(data.water, 'volume'))
  if (data.duration) parts.push(formatDuration(data.duration))
  if (data.times) parts.push(`${data.times}×`)
  if (step === 'GRIND_COFFEE') parts.push(formatGrind(recipe.grind))
  if (step === 'ADD_COFFEE_AND_WATER') parts.unshift(formatWeight(recipe.beans, 'mass'))
  return parts.join(' · ')
}

export function RecipeScreen() {
  const view = activeView.value
  if (view.type !== 'recipe') return null

  const recipeId = view.recipeId
  const recipe = getRecipeById(recipeId)
  if (!recipe) {
    return (
      <div class="flex flex-col h-full items-center justify-center gap-3">
        <p class="text-body text-[var(--text-secondary)]">Recipe not found</p>
        <button onClick={goBack} class="text-[var(--color-caramel)] text-body">← Go back</button>
      </div>
    )
  }

  const adj = getAdjustment(recipeId)
  const displayBeans = adj?.beans ?? recipe.beans
  const displayWater = adj?.water ?? recipe.water
  const adjusted = isRecipeAdjusted(recipeId)

  const r = recipe
  const totalWaterInSteps = r.steps.reduce((sum, s) => {
    const waterConfig = s.configs.find((c) => c.type === 'AMOUNT_OF_WATER')
    return sum + (waterConfig?.value ?? 0)
  }, 0)
  const waterMultiplier = totalWaterInSteps > 0 ? displayWater / r.water : 1

  function getStepConfigData(step: (typeof r.steps)[number]): StepData {
    const data = reduceConfigs(step.configs)
    if (data.water && waterMultiplier !== 1) {
      data.water = Math.round(data.water * waterMultiplier)
    }
    return data
  }

  const ratio = calculateRatio({ beans: displayBeans, water: displayWater })
  const totalTime = estimateTotalTime(recipe.steps)

  return (
    <div class="flex flex-col h-full relative">
      {/* Warm ambient */}
      <div class="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(217,119,6,0.04) 0%, transparent 50%)' }} />

      {/* ── Top bar ── */}
      <div class="flex items-center justify-between px-4 pt-[calc(16px+var(--safe-top))] pb-1">
        <button
          onClick={goBack}
          class="p-2 -ml-2 rounded-xl text-[var(--text-secondary)] active:scale-90 transition-transform"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
        <div class="flex items-center gap-1">
          <button
            onClick={() => openAdjustments(recipeId)}
            class="p-2 rounded-xl text-[var(--text-secondary)] relative active:scale-90 transition-transform"
          >
            <SlidersHorizontal size={20} strokeWidth={2} />
            {adjusted && (
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-red)]" />
            )}
          </button>
        </div>
      </div>

      {/* ── Title ── */}
      <div class="px-4 pb-3">
        <h1 class="text-largetitle-bold font-display text-[var(--text-primary)] leading-tight line-clamp-2">
          {recipe.name}
        </h1>
        <div class="flex items-center gap-2 mt-1.5">
          <Badge variant="amber">{formatMethod(recipe.method)}</Badge>
          {adjusted && <Badge variant="red">Adjusted</Badge>}
        </div>
      </div>

      {/* ── Hero stats card ── */}
      <div class="px-4 pb-6">
        <div class="bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] p-5 flex flex-col gap-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          {/* Beans & Water — big, prominent */}
          <div class="flex items-stretch gap-2">
            <div class="flex-1 bg-[var(--bg-tertiary)]/30 rounded-xl p-3 flex flex-col gap-1">
              <span class="text-caption2 text-[var(--text-tertiary)] uppercase tracking-wider">Beans</span>
              <span class="text-title1-bold font-display text-[var(--text-primary)]">
                {displayBeans}<span class="text-body text-[var(--text-tertiary)] font-normal ml-0.5">g</span>
              </span>
            </div>
            <div class="flex-1 bg-[var(--bg-tertiary)]/30 rounded-xl p-3 flex flex-col gap-1">
              <span class="text-caption2 text-[var(--text-tertiary)] uppercase tracking-wider">Water</span>
              <span class="text-title1-bold font-display text-[var(--text-primary)]">
                {displayWater}<span class="text-body text-[var(--text-tertiary)] font-normal ml-0.5">ml</span>
              </span>
            </div>
          </div>

          {/* Secondary stats row */}
          <div class="flex items-center gap-3 text-caption1 text-[var(--text-tertiary)]">
            <span class="font-mono text-[var(--text-secondary)]">{ratio}</span>
            <span class="opacity-40">·</span>
            <span class="font-mono text-[var(--text-secondary)]">{formatTemperature(recipe.temperature)}</span>
            {totalTime && (
              <>
                <span class="opacity-40">·</span>
                <span class="text-[var(--text-secondary)]">~{totalTime}</span>
              </>
            )}
          </div>

          {/* Grind — stepped indicator */}
          <div class="flex items-center gap-1">
            {(['FINE', 'MEDIUM_FINE', 'MEDIUM', 'MEDIUM_COARSE', 'COARSE'] as const).map((g) => {
              const isActive = recipe.grind === g
              return (
                <div key={g} class={`flex-1 flex flex-col items-center gap-1`}>
                  <div class={`w-full h-1.5 rounded-full transition-colors ${
                    isActive ? 'bg-[var(--color-caramel)]' : 'bg-[var(--bg-tertiary)]'
                  }`} />
                  <span class={`text-[9px] font-medium leading-none whitespace-nowrap transition-colors ${
                    isActive ? 'text-[var(--color-caramel)]' : 'text-[var(--text-tertiary)]/40'
                  }`}>
                    {formatGrind(g)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Steps ── */}
      <div class="flex-1 overflow-y-auto px-4 pb-24 relative">
        {/* Top fade gradient */}
        <div class="sticky top-0 left-0 right-0 h-6 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, var(--bg-app), transparent)' }} />
        {/* Bottom fade gradient */}
        <div class="sticky bottom-0 left-0 right-0 h-8 -mt-8 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to top, var(--bg-app), transparent)' }} />
        <h2 class="text-caption1 text-[var(--text-secondary)] uppercase tracking-wider mb-5 ml-8">
          Steps
        </h2>
        <div class="relative pl-8">
          {/* Vertical line */}
          <div class="absolute left-[11px] top-1 bottom-1 w-px bg-[var(--color-amber)]/20" />

          {recipe.steps.map((step, index) => {
            const data = getStepConfigData(step)
            const detail = formatStepDetails(step.step, data, recipe)
            const hasDuration = Boolean(data.duration)
            const isLast = index === recipe.steps.length - 1

            return (
              <div
                key={step.id}
                class={`relative animate-scale-in ${isLast ? '' : 'pb-4'}`}
                style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'backwards' }}
              >
                {/* Circle on timeline */}
                <div class="absolute -left-[25px] top-1.5 w-[13px] h-[13px] rounded-full bg-[var(--color-amber)]/70 border-2 border-[var(--bg-app)] flex-shrink-0 z-10" />

                {/* Step content */}
                <div class="flex items-center justify-between gap-3 min-h-[44px]">
                  <div class="flex-1 min-w-0">
                    <p class="text-body-bold">{formatStepTitle(step.step)}</p>
                    <p class="text-caption1 text-[var(--text-tertiary)] font-mono mt-0.5 min-h-[16px]">
                      {detail || '\u00A0'}
                    </p>
                  </div>
                  {hasDuration && (
                    <div class="bg-[var(--color-amber)]/10 px-2.5 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                      <Timer size={11} strokeWidth={1.5} class="text-[var(--color-amber)]" />
                      <span class="text-caption1 font-mono text-[var(--color-amber)]">{formatDuration(data.duration!, { short: true })}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Fade-out line */}
          <div class="absolute left-[11px] top-[calc(100%-12px)] w-px h-6 bg-gradient-to-b from-[var(--color-amber)]/20 to-transparent" />
        </div>

        {/* ── Brew History for this Recipe ── */}
        <BrewsForRecipeSection recipeId={recipeId} />
      </div>

      {/* ── FAB ── */}
      <FAB onClick={() => navigateTo({ type: 'brew', recipeId })} label="Start Brew">
        <Play size={20} strokeWidth={2.5} fill="currentColor" class="ml-0.5" />
        <span class="text-body-bold">Start</span>
      </FAB>

      <AdjustmentsSheet recipe={recipe} displayBeans={displayBeans} displayWater={displayWater} />
    </div>
  )
}

function BrewsForRecipeSection({ recipeId }: { recipeId: string }) {
  const brews = getBrewsForRecipe(recipeId)
  if (brews.length === 0) return null

  return (
    <div class="mt-8">
      <h2 class="text-caption1 text-[var(--text-secondary)] uppercase tracking-wider mb-3 ml-8">
        Your Brews of this Recipe
      </h2>
      <div class="flex flex-col gap-2">
        {brews.slice(0, 5).map((brew) => {
          const recipe = getRecipeById(recipeId)
          const isAdjusted = recipe && (brew.beans !== recipe.beans || brew.water !== recipe.water)
          
          return (
            <div
              key={brew.id}
              class="bg-[var(--bg-card)]/50 rounded-xl border border-[var(--color-separator)]/50 px-3 py-2.5"
            >
              <div class="flex items-center justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    {brew.rating && (
                      <span class="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            size={10}
                            strokeWidth={1.5}
                            class={s <= brew.rating! ? 'text-[var(--color-amber)] fill-[var(--color-amber)]' : 'text-[var(--text-tertiary)]/20'}
                          />
                        ))}
                      </span>
                    )}
                    <span class="text-caption2 text-[var(--text-tertiary)]">
                      {formatBrewDate(brew.brewedAt)}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 mt-1 text-caption1 font-mono text-[var(--text-secondary)]">
                    <span>{brew.beans}g</span>
                    <span class="text-[var(--text-tertiary)]">/</span>
                    <span>{brew.water}ml</span>
                    <span class="text-[var(--text-tertiary)]">·</span>
                    <span>1:{brew.ratio.toFixed(1)}</span>
                    {isAdjusted && (
                      <span class="text-[var(--text-tertiary)]/60 text-caption2 font-sans">adjusted</span>
                    )}
                  </div>
                  {brew.notes && (
                    <p class="text-caption1 text-[var(--text-secondary)] mt-1 italic line-clamp-2">
                      "{brew.notes}"
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (isAdjusted) {
                      setAdjustment(recipeId, {
                        beans: brew.beans,
                        water: brew.water,
                        ice: brew.ice ?? null,
                        ratio: brew.ratio,
                      })
                    }
                    navigateTo({ type: 'brew', recipeId })
                  }}
                  class="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--bg-tertiary)]/50 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Play size={12} strokeWidth={2.5} class="text-[var(--text-tertiary)] ml-0.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatBrewDate(date: Date): string {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  return 'Last month'
}
