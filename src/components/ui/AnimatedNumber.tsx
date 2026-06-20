import NumberFlow, { type Format } from '@number-flow/react'

interface AnimatedNumberProps {
  value: number
  suffix?: string
  class?: string
}

const numberFormat: Format = { useGrouping: false }

export function AnimatedNumber({ value, suffix, class: extra = '' }: AnimatedNumberProps) {
  return (
    <span class={`inline-flex items-baseline ${extra}`}>
      <NumberFlow
        value={value}
        format={numberFormat}
      />
      {suffix && <span class="text-[0.6em] ml-0.5 opacity-60">{suffix}</span>}
    </span>
  )
}
