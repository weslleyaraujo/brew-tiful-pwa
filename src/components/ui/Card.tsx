interface CardProps {
  children?: any
  class?: string
  onClick?: () => void
  padded?: boolean
}

export function Card({ children, class: extra = '', onClick, padded = true }: CardProps) {
  return (
    <div
      onClick={onClick}
      class={`bg-[var(--bg-card)] rounded-2xl border border-[var(--color-separator)] overflow-hidden
        ${padded ? 'p-4' : ''}
        ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''}
        ${extra}`}
    >
      {children}
    </div>
  )
}
