import { X } from 'lucide-preact'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children?: any
  variant?: 'sheet' | 'dialog'
}

export function Modal({ open, onClose, title, children, variant = 'sheet' }: ModalProps) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        class="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet/Dialog */}
      <div
        class={`fixed z-50 bg-[var(--bg-app)] animate-slide-up ${
          variant === 'sheet'
            ? 'bottom-0 left-0 right-0 rounded-t-2xl max-h-[85dvh] overflow-y-auto'
            : 'inset-[10%] rounded-2xl overflow-hidden'
        }`}
      >
        {/* Handle for sheet */}
        {variant === 'sheet' && (
          <div class="flex justify-center pt-3 pb-1">
            <div class="w-9 h-1 rounded-full bg-[var(--text-tertiary)]/30" />
          </div>
        )}

        {/* Header */}
        {title && (
          <div class="flex items-center justify-between px-5 py-3 border-b border-[var(--color-separator)]">
            <h2 class="text-title3-bold">{title}</h2>
            <button onClick={onClose} class="p-1 text-[var(--text-secondary)]">
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Content */}
        <div class="p-5">{children}</div>
      </div>
    </>
  )
}
