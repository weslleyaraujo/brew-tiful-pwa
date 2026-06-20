interface FABProps {
  onClick: () => void
  children?: any
  label: string
  class?: string
}

export function FAB({ onClick, children, label, class: extra = '' }: FABProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      class={`fixed right-4 px-6 py-3.5 rounded-2xl
             text-white shadow-lg flex items-center justify-center gap-2 z-10
             bottom-[calc(16px+var(--safe-bottom))] 
             bg-[var(--color-caramel)]
             animate-breath-shadow active:scale-95 transition-transform
             ${extra}`}
    >
      {children}
    </button>
  )
}
