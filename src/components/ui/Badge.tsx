import type { ComponentChildren } from 'preact'

export interface BadgeProps {
  children: ComponentChildren
  variant?: 'default' | 'blue' | 'red' | 'green' | 'amber'
  class?: string
}

const variantClasses: Record<string, string> = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
  blue: 'bg-[var(--color-blue)]/10 text-[var(--color-blue)]',
  red: 'bg-[var(--color-red)]/10 text-[var(--color-red)]',
  green: 'bg-[var(--color-green)]/10 text-[var(--color-green)]',
  amber: 'bg-[var(--color-amber)]/10 text-[var(--color-amber)]',
}

export function Badge({ children, variant = 'default', class: extra = '' }: BadgeProps) {
  return (
    <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-caption1-bold ${variantClasses[variant]} ${extra}`}>
      {children}
    </span>
  )
}
