import { Coffee } from 'lucide-preact'

interface EmptyStateProps {
  icon?: typeof Coffee
  title: string
  description?: string
}

export function EmptyState({ icon: Icon = Coffee, title, description }: EmptyStateProps) {
  return (
    <div class="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-tertiary)]">
      <Icon size={48} strokeWidth={1} />
      <p class="text-body">{title}</p>
      {description && <p class="text-caption1">{description}</p>}
    </div>
  )
}
