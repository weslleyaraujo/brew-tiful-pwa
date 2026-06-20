interface TimerRingProps {
  duration: number
  current: number
  isRunning: boolean
}

const RADIUS = 45
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TimerRing({ duration, current, isRunning }: TimerRingProps) {
  const progress = duration > 0 ? Math.max(0, Math.min(1, current / duration)) : 0
  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div class="relative w-[60px] h-[60px]">
      <svg
        width="60"
        height="60"
        viewBox="0 0 100 100"
        class="absolute inset-0"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke="var(--color-amber)"
          opacity={0.15}
          fill="transparent"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={0}
        />

        {/* Foreground circle with CSS transition + glow */}
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke="var(--color-amber)"
          fill="transparent"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          filter={isRunning ? 'drop-shadow(0px 0px 6px rgba(245, 158, 11, 0.4))' : undefined}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            transition: isRunning
              ? 'stroke-dashoffset 1s linear, filter 0.3s ease'
              : 'stroke-dashoffset 0.3s ease-out, filter 0.3s ease',
          }}
        />
      </svg>
    </div>
  )
}
