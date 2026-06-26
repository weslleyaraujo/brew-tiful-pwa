import { useState, useRef, useEffect, useCallback } from 'preact/hooks'
import { X, Play, Pause, Droplets, RotateCw } from 'lucide-preact'
import { getRecipeById, getAdjustment, addBrew } from '../store/recipes'
import { goBack, navigateTo, replaceWith, activeView } from '../store/ui'
import { formatWeight, formatDuration, formatStepTitle, formatGrind } from '../lib/format'
import { calculateRatio } from '../lib/conversion'
import type { StepData, Recipe } from '../db/types'
import { lightTap, mediumTap, warningVibrate } from '../lib/haptics'
import { playDoneSound } from '../lib/sound'
import { autoTimersEnabled, brewTutorialSeen } from '../store/prefs'
import { TimerRing } from '../components/TimerRing'
import { BrewTutorial } from '../components/BrewTutorial'
import { ConfirmModal } from '../components/ConfirmModal'

// ── Helpers ──

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

function calculateTotalWaterPoured(
  currentStepIndex: number,
  steps: Recipe['steps'],
  waterMultiplier: number
): number {
  let total = 0
  for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
    const data = reduceConfigs(steps[i].configs)
    if (data.water) total += data.water
  }
  return Math.round(total * waterMultiplier)
}

export function BrewScreen() {
  const view = activeView.value
  if (view.type !== 'brew') return null

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
  const displayIce = adj?.ice ?? recipe.ice

  // Scale water per step
  const totalWaterInSteps = recipe.steps.reduce((sum, s) => {
    const waterConfig = s.configs.find((c) => c.type === 'AMOUNT_OF_WATER')
    return sum + (waterConfig?.value ?? 0)
  }, 0)
  const waterMultiplier = totalWaterInSteps > 0 ? displayWater / recipe.water : 1

  const steps = recipe.steps
  const totalSteps = steps.length
  const [currentStep, setCurrentStep] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Duration timer state
  const currentStepData = reduceConfigs(steps[currentStep]?.configs ?? [])
  if (currentStepData.water && waterMultiplier !== 1) {
    currentStepData.water = Math.round(currentStepData.water * waterMultiplier)
  }
  const hasDuration = Boolean(currentStepData.duration && currentStepData.duration > 0)
  const [timerState, setTimerState] = useState<'inactive' | 'running' | 'paused'>('inactive')
  const [timerCount, setTimerCount] = useState(currentStepData.duration ?? 0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleNextRef = useRef<() => void>(() => {})
  const timerStateRef = useRef(timerState)
  timerStateRef.current = timerState
  const [showTutorial, setShowTutorial] = useState(false)
  const [showStopConfirm, setShowStopConfirm] = useState(false)

  useEffect(() => {
    if (!brewTutorialSeen.value) {
      const t = setTimeout(() => setShowTutorial(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  // Auto-start timer
  useEffect(() => {
    setTimerState('inactive')
    setTimerCount(currentStepData.duration ?? 0)

    if (hasDuration && autoTimersEnabled.value) {
      const t = setTimeout(() => {
        if (timerStateRef.current !== 'running') {
          mediumTap()
          setTimerState('running')
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = setInterval(() => {
            setTimerCount((prev) => {
              if (prev <= 1) {
                if (timerRef.current) clearInterval(timerRef.current)
                setTimerState('inactive')
                warningVibrate()
                playDoneSound()
                setTimeout(() => handleNextRef.current(), 600)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }
      }, 500)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleTimerStart = useCallback(() => {
    if (timerState === 'running') return
    mediumTap()
    setTimerState('running')
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimerCount((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimerState('inactive')
          warningVibrate()
          playDoneSound()
          setTimeout(() => handleNextRef.current(), 600)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [timerState])

  const handleTimerPause = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerState('paused')
    mediumTap()
  }, [])

  const handleNext = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setTimerState('inactive')

    if (currentStep >= totalSteps - 1) {
      const ratio = calculateRatio({
        beans: displayBeans,
        water: displayWater,
        asNumber: true,
      })
      const record = addBrew({
        recipeId,
        recipeName: recipe.name,
        method: recipe.method,
        beans: displayBeans,
        water: displayWater,
        ratio,
        ice: displayIce ?? null,
      })
      replaceWith({ type: 'brew-complete', recipeId, brewId: record.id })
    } else {
      setCurrentStep((prev) => prev + 1)
      lightTap()
      if (containerRef.current) {
        const stepHeight = containerRef.current.clientHeight
        isProgrammaticScroll.current = true
        containerRef.current.scrollTo({ top: (currentStep + 1) * stepHeight, behavior: 'smooth' })
        setTimeout(() => { isProgrammaticScroll.current = false }, 500)
      }
    }
  }, [currentStep, totalSteps])

  handleNextRef.current = handleNext

  const handleDismiss = () => {
    if (currentStep === 0 || currentStep >= totalSteps - 1) {
      if (timerRef.current) clearInterval(timerRef.current)
      goBack()
      return
    }
    setShowStopConfirm(true)
  }

  const handleStopConfirm = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setShowStopConfirm(false)
    goBack()
  }

  const totalWaterPoured = calculateTotalWaterPoured(currentStep, steps, waterMultiplier)
  const showFab = !hasDuration || timerState === 'inactive' || timerState === 'paused'

  // Progress reaches 100% only when all steps complete
  const timerFraction = hasDuration && currentStepData.duration
    ? 1 - timerCount / currentStepData.duration
    : 0
  const totalProgress = ((currentStep + timerFraction) / totalSteps) * 100

  // ── Detect manual scroll (mouse wheel / trackpad) ──
  const isProgrammaticScroll = useRef(false)
  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return
    if (!containerRef.current) return
    const container = containerRef.current
    const stepHeight = container.clientHeight
    if (stepHeight <= 0) return
    const rawStep = Math.round(container.scrollTop / stepHeight)
    const clamped = Math.max(0, Math.min(totalSteps - 1, rawStep))
    if (clamped !== currentStep) {
      if (timerRef.current) clearInterval(timerRef.current)
      setTimerState('inactive')
      setCurrentStep(clamped)
      lightTap()
    }
  }, [currentStep, totalSteps])

  return (
    <div class="flex flex-col h-full bg-[var(--bg-app)] relative">
      {/* ── Water-level background ── */}
      <div
        class="absolute inset-0 z-0 pointer-events-none transition-all duration-[1500ms] ease-out"
        style={{
          background: `linear-gradient(to top, rgba(217,119,6,0.14) 0%, rgba(217,119,6,0.10) ${totalProgress * 0.4}%, rgba(217,119,6,0.04) ${totalProgress}%, transparent ${Math.min(totalProgress + 8, 100)}%, transparent 100%)`,
        }}
      />

      {/* ── SVG wave layers ── */}
      <svg
        class="absolute inset-x-0 bottom-0 z-0 pointer-events-none animate-wave-morph-slow"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: `${Math.max(15, totalProgress * 0.7)}%`, opacity: totalProgress > 1 ? 0.10 : 0 }}
      >
        <path
          fill="var(--color-amber)"
          opacity={0.5}
          d="M0,256 C180,224 360,288 540,256 C720,224 900,288 1080,256 C1260,224 1350,288 1440,256 L1440,320 L0,320 Z"
        />
      </svg>
      <svg
        class="absolute inset-x-0 bottom-0 z-0 pointer-events-none animate-wave-morph"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: `${Math.max(12, totalProgress * 0.55)}%`, opacity: totalProgress > 1 ? 0.12 : 0 }}
      >
        <path
          fill="var(--color-amber)"
          opacity={0.6}
          d="M0,224 C120,192 240,256 360,224 C480,192 600,256 720,224 C840,192 960,256 1080,224 C1200,192 1320,256 1440,224 L1440,320 L0,320 Z"
        />
      </svg>

      {/* ── Header bar ── */}
      <div
        class="absolute top-[calc(16px+var(--safe-top))] left-0 right-0 z-10 grid items-center px-4"
        style={{ gridTemplateColumns: '80px 1fr 80px' }}
      >
        <button
          onClick={handleDismiss}
          class="w-10 h-10 rounded-full bg-[var(--bg-elevated)]/70 shadow-sm flex items-center justify-center text-[var(--text-secondary)] active:scale-90 transition-transform"
        >
          <X size={18} strokeWidth={2} />
        </button>

        <div class="flex justify-center">
          <div class="bg-[var(--color-amber)]/15 px-3 py-1.5 rounded-full">
            <span class="text-caption1-bold text-[var(--color-caramel)] font-mono">
              {currentStep + 1}/{totalSteps}
            </span>
          </div>
        </div>

        <div class="flex justify-end">
          {totalWaterPoured > 0 && (
            <div class="bg-[var(--color-amber)]/15 px-4 py-2 rounded-full flex items-center gap-2 animate-fade-in whitespace-nowrap ring-1 ring-[var(--color-amber)]/30">
              <Droplets size={14} strokeWidth={2.5} class="text-[var(--color-amber)] flex-shrink-0" />
              <span class="text-body-bold font-mono text-[var(--color-amber)]">
                {formatWeight(totalWaterPoured, 'volume')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar + step dots ── */}
      <div class="absolute top-[calc(80px+var(--safe-top))] left-4 right-4 z-10 flex flex-col gap-2">
        {/* Step dots */}
        <div class="flex justify-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              class={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                i < currentStep
                  ? 'bg-[var(--color-amber)]/60'
                  : i === currentStep
                    ? 'bg-[var(--color-amber)] shadow-[0_0_6px_rgba(245,158,11,0.4)]'
                    : 'bg-[var(--bg-tertiary)]'
              }`}
            />
          ))}
        </div>
        {/* Progress bar */}
        <div class="h-1 rounded-full bg-[var(--bg-tertiary)]/50 overflow-hidden">
          <div
            class="h-full rounded-full bg-[var(--color-amber)]/50 transition-all duration-700 ease-out"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
      </div>

      {/* ── Steps (snap scroll, free-floating) ── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        class="flex-1 overflow-y-auto"
        style="scroll-snap-type: y mandatory"
      >
        {steps.map((step, index) => {
          const data = reduceConfigs(step.configs)
          if (data.water && waterMultiplier !== 1) {
            data.water = Math.round(data.water * waterMultiplier)
          }
          const isGrind = step.step === 'GRIND_COFFEE'
          const isCurrent = index === currentStep
          const detailParts: string[] = []
          if (data.water) detailParts.push(formatWeight(data.water, 'volume'))
          if (data.duration && !(isCurrent && hasDuration)) detailParts.push(formatDuration(data.duration))
          if (data.times) detailParts.push(`${data.times}×`)
          if (isGrind) {
            detailParts.unshift(formatWeight(displayBeans, 'mass'))
            detailParts.push(formatGrind(recipe.grind))
          }
          if (step.step === 'ADD_COFFEE_AND_WATER') {
            detailParts.unshift(formatWeight(displayBeans, 'mass'))
          }
          if (step.step === 'ADD_ICE' && displayIce) {
            detailParts.push(formatWeight(displayIce, 'mass'))
          }

          return (
            <div
              key={step.id}
              class="h-full snap-start flex flex-col items-center justify-center gap-4 px-6 pt-[calc(80px+var(--safe-top))] pb-[calc(80px+var(--safe-bottom))]"
              style="scroll-snap-align: start"
            >
              {/* Step number — large, ambient */}
              <span class={`text-[56px] font-display leading-none transition-colors duration-500
                ${isCurrent ? 'text-[var(--color-amber)]/25' : 'text-[var(--text-tertiary)]/10'}`}>
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Step title */}
              <h2 class={`text-title1-bold font-display text-center transition-colors duration-500 flex items-center justify-center gap-2
                ${isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'}`}>
                {step.step === 'INVERT_AEROPRESS' && (
                  <RotateCw size={28} strokeWidth={1.5} class={isCurrent ? 'text-[var(--color-amber)]' : 'text-[var(--text-tertiary)]/40'} />
                )}
                {formatStepTitle(step.step)}
              </h2>

              {/* Step details */}
              {detailParts.length > 0 && (
                <p class={`text-body text-center font-mono transition-colors duration-500
                  ${isCurrent ? 'text-[var(--text-secondary)]' : 'text-[var(--text-tertiary)]/60'}`}>
                  {detailParts.join(' · ')}
                </p>
              )}

              {/* Timer */}
              {isCurrent && hasDuration && (
                <div class="mt-2 flex flex-col items-center gap-5">
                  <span class="text-largetitle-bold font-display tabular-nums">
                    {formatDuration(timerCount, { short: false })}
                  </span>
                  <div class="relative">
                    <TimerRing
                      duration={currentStepData.duration!}
                      current={timerCount}
                      isRunning={timerState === 'running'}
                    />
                    <div class="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={() => timerState === 'running' ? handleTimerPause() : handleTimerStart()}
                        class={`w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md active:scale-90 transition-all duration-200
                          ${timerState === 'running'
                            ? 'bg-[var(--color-amber)] animate-glow-pulse'
                            : 'bg-[var(--color-amber)]'}`}
                      >
                        {timerState === 'running' ? (
                          <Pause size={18} strokeWidth={2.5} fill="currentColor" />
                        ) : (
                          <Play size={18} strokeWidth={2.5} fill="currentColor" class="ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── FAB: Next / Done ── */}
      {showFab && (
        <div class="fixed right-4 bottom-[calc(16px+var(--safe-bottom))] z-10 animate-slide-up">
          <button
            onClick={handleNext}
            class="px-6 py-3.5 rounded-2xl bg-[var(--color-caramel)] text-white shadow-lg flex items-center gap-2 active:scale-95 transition-transform animate-breath-shadow"
          >
            <span class="text-body-bold">
              {currentStep >= totalSteps - 1 ? 'Finish Brew' : 'Next Step'}
            </span>
          </button>
        </div>
      )}

      {showTutorial && <BrewTutorial onDismiss={() => setShowTutorial(false)} />}

      <ConfirmModal
        open={showStopConfirm}
        title="Stop brewing?"
        message="You can resume this brew later."
        confirmLabel="Stop"
        onConfirm={handleStopConfirm}
        onCancel={() => setShowStopConfirm(false)}
      />
    </div>
  )
}
