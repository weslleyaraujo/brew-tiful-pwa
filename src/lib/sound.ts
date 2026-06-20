import { notificationSoundsEnabled } from '../store/prefs'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (!notificationSoundsEnabled.value) return null
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioCtx
  } catch {
    return null
  }
}

export function playBeep(frequency: number = 880, durationMs: number = 200) {
  const ctx = getAudioContext()
  if (!ctx) return

  try {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000)

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + durationMs / 1000)
  } catch { /* ignore */ }
}

export function playDoneSound() {
  if (!notificationSoundsEnabled.value) return
  playBeep(880, 150)
  setTimeout(() => playBeep(1100, 300), 150)
}

export function playTickSound() {
  if (!notificationSoundsEnabled.value) return
  playBeep(660, 50)
}
