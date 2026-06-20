import { hapticsEnabled } from '../store/prefs'

export function lightTap() {
  if (!hapticsEnabled.value) return
  try {
    navigator.vibrate?.(10)
  } catch { /* ignore */ }
}

export function mediumTap() {
  if (!hapticsEnabled.value) return
  try {
    navigator.vibrate?.(20)
  } catch { /* ignore */ }
}

export function warningVibrate() {
  if (!hapticsEnabled.value) return
  try {
    navigator.vibrate?.([30, 50, 30])
  } catch { /* ignore */ }
}
