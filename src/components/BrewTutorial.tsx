import { useState } from 'preact/hooks'
import { Droplets, ChevronUpDown, Timer } from 'lucide-preact'
import { markBrewTutorialSeen } from '../store/prefs'

const STEPS = [
  {
    icon: Droplets,
    title: 'Water target',
    description: 'This shows the target weight on your scale. Pour until you hit this number.',
    position: 'top-right',
  },
  {
    icon: ChevronUpDown,
    title: 'Navigate steps',
    description: 'Swipe up/down or tap "Next Step" to advance through the recipe.',
    position: 'center',
  },
  {
    icon: Timer,
    title: 'Auto-timers',
    description: 'Timers auto-start. Tap to pause, tap again to resume.',
    position: 'bottom-right',
  },
]

export function BrewTutorial({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      markBrewTutorialSeen()
      onDismiss()
    }
  }

  const Icon = current.icon

  return (
    <div class="fixed inset-0 z-50 bg-black/70 animate-fade-in" onClick={handleNext}>
      {/* Highlight spot */}
      {current.position === 'top-right' && (
        <div class="absolute top-[calc(80px+var(--safe-top))] right-4 w-32 h-9 rounded-full ring-2 ring-[var(--color-amber)] ring-offset-2 ring-offset-transparent animate-glow-pulse" />
      )}
      {current.position === 'center' && (
        <div class="absolute inset-x-0 top-[50%] -translate-y-1/2 h-20 ring-2 ring-[var(--color-amber)] ring-offset-2 ring-offset-transparent animate-glow-pulse mx-4 rounded-2xl" />
      )}
      {current.position === 'bottom-right' && (
        <div class="absolute right-4 bottom-[calc(100px+var(--safe-bottom))] w-16 h-16 rounded-full ring-2 ring-[var(--color-amber)] ring-offset-2 ring-offset-transparent animate-glow-pulse" />
      )}

      {/* Coach mark card */}
      <div
        class="absolute left-4 right-4 bg-[var(--bg-elevated)] rounded-2xl p-5 shadow-lg animate-slide-up"
        style={{
          top: current.position === 'top-right'
            ? 'calc(130px + var(--safe-top))'
            : current.position === 'center'
              ? 'calc(50% + 60px)'
              : 'calc(100% - 220px - var(--safe-bottom))',
        }}
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-[var(--color-amber)]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon size={20} strokeWidth={1.5} class="text-[var(--color-amber)]" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-body-bold text-[var(--text-primary)]">{current.title}</h3>
            <p class="text-caption1 text-[var(--text-secondary)] mt-1">{current.description}</p>
          </div>
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                class={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === step ? 'bg-[var(--color-amber)]' : 'bg-[var(--bg-tertiary)]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            class="px-4 py-2 rounded-xl bg-[var(--color-caramel)] text-white text-caption1-bold active:scale-95 transition-transform"
          >
            {step < STEPS.length - 1 ? 'Next' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  )
}
