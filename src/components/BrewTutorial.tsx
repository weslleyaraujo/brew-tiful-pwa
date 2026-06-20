import { useState } from 'preact/hooks'
import { Droplets, ChevronsUpDown, Timer } from 'lucide-preact'
import { markBrewTutorialSeen } from '../store/prefs'

const STEPS = [
  {
    icon: Droplets,
    title: 'Water target',
    description: 'This shows the target weight on your scale. Pour until you hit this number.',
  },
  {
    icon: ChevronsUpDown,
    title: 'Navigate steps',
    description: 'Swipe up/down or tap "Next Step" to advance through the recipe.',
  },
  {
    icon: Timer,
    title: 'Auto-timers',
    description: 'Timers auto-start when you reach a timed step. Tap to pause or resume.',
  },
]

export function BrewTutorial({ onDismiss }: { onDismiss: () => void }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Icon = current.icon

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      markBrewTutorialSeen()
      onDismiss()
    }
  }

  return (
    <>
      <div class="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onDismiss} />

      <div class="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-app)] rounded-t-3xl animate-slide-up">
        <div class="flex justify-center pt-3 pb-4">
          <div class="w-9 h-1 rounded-full bg-[var(--text-tertiary)]/25" />
        </div>

        <div class="px-5 pb-8 flex flex-col items-center gap-4">
          {/* Step dots */}
          <div class="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                class={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === step ? 'bg-[var(--color-amber)] w-4' : 'bg-[var(--bg-tertiary)]'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div class="w-14 h-14 rounded-2xl bg-[var(--color-amber)]/10 flex items-center justify-center">
            <Icon size={28} strokeWidth={1.5} class="text-[var(--color-amber)]" />
          </div>

          {/* Text */}
          <div class="text-center">
            <h3 class="text-title3-bold">{current.title}</h3>
            <p class="text-body text-[var(--text-secondary)] mt-1 max-w-xs mx-auto">
              {current.description}
            </p>
          </div>

          {/* Button */}
          <button
            onClick={handleNext}
            class="mt-2 px-8 py-3 rounded-2xl bg-[var(--color-caramel)] text-white text-body-bold active:scale-95 transition-transform w-full max-w-xs"
          >
            {step < STEPS.length - 1 ? 'Next' : 'Start Brewing'}
          </button>
        </div>
      </div>
    </>
  )
}
