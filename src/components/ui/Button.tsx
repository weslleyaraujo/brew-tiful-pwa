type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost'

interface ButtonProps {
  children?: any
  variant?: ButtonVariant
  fullWidth?: boolean
  disabled?: boolean
  class?: string
  onClick?: (e: MouseEvent) => void
  type?: 'button' | 'submit'
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--color-caramel)] text-white border-[var(--color-caramel)] active:opacity-80',
  secondary:
    'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--color-separator)] active:bg-[var(--bg-elevated)]',
  destructive:
    'bg-[var(--color-red)]/10 text-[var(--color-red)] border-[var(--color-red)]/20 active:bg-[var(--color-red)]/20',
  ghost:
    'bg-transparent text-[var(--text-secondary)] border-transparent active:bg-[var(--bg-card)]',
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  class: extraClass = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      class={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl
        text-body-bold border transition-colors
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-40 pointer-events-none' : ''}
        ${extraClass}`}
    >
      {children}
    </button>
  )
}
