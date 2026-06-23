// Always-on screen wake lock. Acquires on app open, re-acquires on visibility change.

let sentinel: WakeLockSentinel | null = null

async function acquire() {
  if (sentinel) return
  if (document.visibilityState !== 'visible') return
  try {
    sentinel = await navigator.wakeLock?.request('screen')
    if (sentinel) {
      sentinel.addEventListener('release', () => {
        sentinel = null
        if (document.visibilityState === 'visible') acquire()
      })
    }
  } catch { /* not supported or denied */ }
}

async function release() {
  if (sentinel) {
    await sentinel.release().catch(() => {})
    sentinel = null
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') acquire()
  else release()
}

export function initWakeLock() {
  if (!('wakeLock' in navigator)) return
  document.addEventListener('visibilitychange', onVisibilityChange)
  acquire()
  // Fallback: some browsers need a user gesture — retry on first tap
  const onGesture = () => {
    acquire()
    document.removeEventListener('click', onGesture)
    document.removeEventListener('touchstart', onGesture)
  }
  document.addEventListener('click', onGesture, { once: true })
  document.addEventListener('touchstart', onGesture, { once: true })
}
