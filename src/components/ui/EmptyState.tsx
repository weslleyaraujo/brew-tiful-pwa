import { Coffee } from 'lucide-preact'

interface EmptyStateProps {
  icon?: typeof Coffee
  title: string
  description?: string
}

export function EmptyState({ icon: Icon = Coffee, title, description }: EmptyStateProps) {
  return (
    <div class="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <div class="relative">
        <Icon size={56} strokeWidth={1} class="text-[var(--color-amber)]/60" />
        <span class="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[var(--color-amber)]/20" />
        <span class="absolute -bottom-1 -left-2 w-1 h-1 rounded-full bg-[var(--color-amber)]/15" />
        <span class="absolute top-2 -left-3 w-1 h-1 rounded-full bg-[var(--color-amber)]/10" />
      </div>
      <p class="text-body text-[var(--text-secondary)]">{title}</p>
      {description && <p class="text-caption1 text-[var(--text-tertiary)]">{description}</p>}
    </div>
  )
}
