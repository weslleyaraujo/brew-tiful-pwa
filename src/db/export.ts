import { brews, favorites, adjustments } from '../store/recipes'
import type { RecipeAdjustments } from '../db/types'
import {
  massUnit, volumeUnit, temperatureUnit,
  hapticsEnabled, autoTimersEnabled, notificationSoundsEnabled,
  brewTutorialSeen,
} from '../store/prefs'
import { themeMode as themeModeSignal } from '../store/ui'

// ── Types ──

interface ExportData {
  version: 1
  exportedAt: string
  brews: any[]
  favorites: any[]
  adjustments: Record<string, RecipeAdjustments>
  preferences: {
    massUnit: string
    volumeUnit: string
    temperatureUnit: string
    hapticsEnabled: boolean
    autoTimersEnabled: boolean
    notificationSoundsEnabled: boolean
    brewTutorialSeen: boolean
  }
  themeMode: string
}

// ── Export ──

export function exportData(): string {
  const adjMap: Record<string, RecipeAdjustments> = {}
  adjustments.value.forEach((v, k) => {
    adjMap[k] = v
  })

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    brews: brews.value.map(b => ({
      ...b,
      brewedAt: b.brewedAt.toISOString(),
    })),
    favorites: favorites.value.map(f => ({
      ...f,
      addedAt: f.addedAt.toISOString(),
    })),
    adjustments: adjMap,
    preferences: {
      massUnit: massUnit.value,
      volumeUnit: volumeUnit.value,
      temperatureUnit: temperatureUnit.value,
      hapticsEnabled: hapticsEnabled.value,
      autoTimersEnabled: autoTimersEnabled.value,
      notificationSoundsEnabled: notificationSoundsEnabled.value,
      brewTutorialSeen: brewTutorialSeen.value,
    },
    themeMode: themeModeSignal.value,
  }

  return JSON.stringify(data, null, 2)
}

export function downloadExport() {
  const json = exportData()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `brew-tiful-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Import ──

export function validateImportData(json: string): ExportData | null {
  try {
    const data = JSON.parse(json)
    if (!data || typeof data !== 'object') return null
    if (data.version !== 1) return null
    if (!Array.isArray(data.brews)) return null
    if (!Array.isArray(data.favorites)) return null
    if (!data.preferences || typeof data.preferences !== 'object') return null
    return data as ExportData
  } catch {
    return null
  }
}

export function importData(json: string): { success: boolean; error?: string } {
  const data = validateImportData(json)
  if (!data) {
    return { success: false, error: 'Invalid backup file format' }
  }

  try {
    // Restore preferences
    const p = data.preferences
    if (p.massUnit) localStorage.setItem('brew-tiful:massUnit', JSON.stringify(p.massUnit))
    if (p.volumeUnit) localStorage.setItem('brew-tiful:volumeUnit', JSON.stringify(p.volumeUnit))
    if (p.temperatureUnit) localStorage.setItem('brew-tiful:temperatureUnit', JSON.stringify(p.temperatureUnit))
    if (typeof p.hapticsEnabled === 'boolean') localStorage.setItem('brew-tiful:hapticsEnabled', JSON.stringify(p.hapticsEnabled))
    if (typeof p.autoTimersEnabled === 'boolean') localStorage.setItem('brew-tiful:autoTimersEnabled', JSON.stringify(p.autoTimersEnabled))
    if (typeof p.notificationSoundsEnabled === 'boolean') localStorage.setItem('brew-tiful:notificationSoundsEnabled', JSON.stringify(p.notificationSoundsEnabled))
    if (typeof p.brewTutorialSeen === 'boolean') localStorage.setItem('brew-tiful:brewTutorialSeen', JSON.stringify(p.brewTutorialSeen))

    if (data.themeMode) {
      localStorage.setItem('brew-tiful:themeMode', JSON.stringify(data.themeMode))
    }

    // Restore brews
    const brewsData = data.brews.map(b => ({
      ...b,
      brewedAt: new Date(b.brewedAt).toISOString(),
    }))
    localStorage.setItem('brew-tiful:brews', JSON.stringify(brewsData))

    // Restore favorites
    const favsData = data.favorites.map(f => ({
      ...f,
      addedAt: new Date(f.addedAt).toISOString(),
    }))
    localStorage.setItem('brew-tiful:favorites', JSON.stringify(favsData))

    // Restore adjustments
    localStorage.setItem('brew-tiful:adjustments', JSON.stringify(data.adjustments ?? {}))

    return { success: true }
  } catch (err) {
    return { success: false, error: `Failed to import: ${err instanceof Error ? err.message : 'Unknown error'}` }
  }
}

// ── File picker helper ──

export function pickImportFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { resolve(null); return }
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    // Handle cancel
    input.oncancel = () => resolve(null)
    input.click()
  })
}
