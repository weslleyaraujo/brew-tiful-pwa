import { signal } from '@preact/signals'

// ── Persistent preference helpers ──

function loadPref<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`brew-tiful:${key}`)
    if (raw != null) return JSON.parse(raw)
  } catch { /* ignore */ }
  return fallback
}

function savePref<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`brew-tiful:${key}`, JSON.stringify(value))
  } catch { /* ignore */ }
}

// ── Unit preferences ──

export type MassUnit = 'g' | 'oz'
export type VolumeUnit = 'ml' | 'floz'
export type TemperatureUnit = 'celsius' | 'fahrenheit'

export const massUnit = signal<MassUnit>(loadPref('massUnit', 'g'))
export const volumeUnit = signal<VolumeUnit>(loadPref('volumeUnit', 'ml'))
export const temperatureUnit = signal<TemperatureUnit>(loadPref('temperatureUnit', 'celsius'))

export function setMassUnit(unit: MassUnit) { massUnit.value = unit; savePref('massUnit', unit) }
export function setVolumeUnit(unit: VolumeUnit) { volumeUnit.value = unit; savePref('volumeUnit', unit) }
export function setTemperatureUnit(unit: TemperatureUnit) { temperatureUnit.value = unit; savePref('temperatureUnit', unit) }

// ── Haptics ──

export const hapticsEnabled = signal<boolean>(loadPref('hapticsEnabled', true))
export function setHapticsEnabled(enabled: boolean) { hapticsEnabled.value = enabled; savePref('hapticsEnabled', enabled) }

// ── Auto-timers ──

export const autoTimersEnabled = signal<boolean>(loadPref('autoTimersEnabled', true))
export function setAutoTimersEnabled(enabled: boolean) { autoTimersEnabled.value = enabled; savePref('autoTimersEnabled', enabled) }

// ── Notification sounds ──

export const notificationSoundsEnabled = signal<boolean>(loadPref('notificationSoundsEnabled', true))
export function setNotificationSoundsEnabled(enabled: boolean) { notificationSoundsEnabled.value = enabled; savePref('notificationSoundsEnabled', enabled) }

// ── Brew tutorial ──

export const brewTutorialSeen = signal<boolean>(loadPref('brewTutorialSeen', false))
export function markBrewTutorialSeen() { brewTutorialSeen.value = true; savePref('brewTutorialSeen', true) }

// ── Init ──

export function initPrefs() {
  // All signals are already initialized with their values from localStorage
  // This is a no-op, but exists as a hook for future init logic
}
