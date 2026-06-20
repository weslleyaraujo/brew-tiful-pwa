interface UpdatePromptProps {
  needRefresh: boolean
  updateServiceWorker: (() => Promise<void>) | undefined
}

export function UpdatePrompt({ needRefresh, updateServiceWorker }: UpdatePromptProps) {
  if (!needRefresh || !updateServiceWorker) return null

  return (
    <div class="fixed bottom-20 left-4 right-4 z-50">
      <div class="bg-[var(--color-caramel)] text-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
        <span class="text-body flex-1">New version available</span>
        <button
          onClick={() => updateServiceWorker()}
          class="px-4 py-2 bg-white text-[var(--color-caramel)] rounded-xl text-caption1-bold font-semibold"
        >
          Update
        </button>
      </div>
    </div>
  )
}
