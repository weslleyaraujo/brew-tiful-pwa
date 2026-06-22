interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Yes', cancelLabel = 'Cancel', onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null

  return (
    <>
      <div class="fixed inset-0 bg-black/50 z-40 animate-fade-in" onClick={onCancel} />
      <div class="fixed inset-0 z-50 flex items-center justify-center p-6 animate-scale-in">
        <div class="bg-[var(--bg-elevated)] rounded-2xl w-full max-w-xs shadow-xl">
          <div class="p-5 flex flex-col items-center gap-2 text-center">
            <h3 class="text-title3-bold">{title}</h3>
            <p class="text-body text-[var(--text-secondary)]">{message}</p>
          </div>
          <div class="flex border-t border-[var(--color-separator)]">
            <button
              onClick={onCancel}
              class="flex-1 py-3 text-body text-[var(--text-secondary)] active:bg-[var(--bg-tertiary)]/30 rounded-bl-2xl transition-colors"
            >
              {cancelLabel}
            </button>
            <div class="w-px bg-[var(--color-separator)]" />
            <button
              onClick={onConfirm}
              class="flex-1 py-3 text-body-bold text-[var(--color-caramel)] active:bg-[var(--bg-tertiary)]/30 rounded-br-2xl transition-colors"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
