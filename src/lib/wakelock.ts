/**
 * Always-on screen keep-alive. Uses every trick available:
 * 1. Screen Wake Lock API (modern browsers)
 * 2. Silent AudioContext loop (iOS fallback — most reliable)
 * 3. Hidden video playback (Android Chrome fallback)
 *
 * All three are activated on first user gesture (tap/scroll).
 * Re-acquired on visibility change (app switching, screen unlock).
 */

let wakeLockSentinel: WakeLockSentinel | null = null
let audioCtx: AudioContext | null = null
let noSleepVideo: HTMLVideoElement | null = null
let initialized = false

// ── AudioContext trick (iOS — prevents sleep during silent audio playback) ──

function startAudioNoSleep() {
  if (audioCtx) {
    // AudioContext may be suspended after app background — resume it
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {})
    }
    return
  }
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const buffer = audioCtx.createBuffer(1, 1, 22050)
    const source = audioCtx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(audioCtx.destination)
    source.start()
  } catch { /* not supported */ }
}

// ── Video trick (Android Chrome — prevents sleep during video playback) ──

function startVideoNoSleep() {
  if (noSleepVideo) {
    if (noSleepVideo.paused) noSleepVideo.play().catch(() => {})
    return
  }
  try {
    noSleepVideo = document.createElement('video')
    noSleepVideo.setAttribute('playsinline', '')
    noSleepVideo.setAttribute('muted', '')
    noSleepVideo.setAttribute('loop', '')
    noSleepVideo.setAttribute('width', '1')
    noSleepVideo.setAttribute('height', '1')
    noSleepVideo.style.position = 'fixed'
    noSleepVideo.style.bottom = '0'
    noSleepVideo.style.left = '0'
    noSleepVideo.style.opacity = '0.01'
    noSleepVideo.style.pointerEvents = 'none'

    // Inline tiny WebM: 1×1 black pixel, silent, 1s loop
    noSleepVideo.src = 'data:video/webm;base64,GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAAHTEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHGTbuMU6uEElTDZ1OsggEVTbuMU6uEHFO7a1Osggsn7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVINAQAAAAAAAYXJhZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfQAAAGVOZGF0YS6JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVIND6QAAAABcTkRBRC6JgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

    document.body.appendChild(noSleepVideo)
    noSleepVideo.play().catch(() => {})
  } catch { /* not supported */ }
}

// ── Native Wake Lock API ──

async function acquireWakeLock() {
  if (wakeLockSentinel || !('wakeLock' in navigator)) return
  if (document.visibilityState !== 'visible') return
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen')
    wakeLockSentinel.addEventListener('release', () => {
      wakeLockSentinel = null
      if (document.visibilityState === 'visible') acquireWakeLock()
    })
  } catch { /* not supported or denied */ }
}

async function releaseWakeLock() {
  if (wakeLockSentinel) {
    await wakeLockSentinel.release().catch(() => {})
    wakeLockSentinel = null
  }
}

// ── Activate all tricks ──

function activateAll() {
  acquireWakeLock()
  startAudioNoSleep()
  startVideoNoSleep()
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    activateAll()
  } else {
    releaseWakeLock()
  }
}

// ── Public API ──

export function initWakeLock() {
  if (initialized) return
  initialized = true

  document.addEventListener('visibilitychange', onVisibilityChange)

  // Try immediately (works if Wake Lock is supported without gesture)
  activateAll()

  // Retry on first user gesture (required by AudioContext + some browsers)
  const onGesture = () => {
    activateAll()
    document.removeEventListener('touchend', onGesture)
    document.removeEventListener('click', onGesture)
    document.removeEventListener('keydown', onGesture)
  }
  document.addEventListener('touchend', onGesture, { once: true })
  document.addEventListener('click', onGesture, { once: true })
  document.addEventListener('keydown', onGesture, { once: true })
}
