import { massUnit, volumeUnit, temperatureUnit } from '../store/prefs'
import {
  convertGramsToOunces,
  convertMillilitersToFluidOunces,
  convertOuncesToGrams,
  convertFluidOuncesToMilliliters,
  convertCelsiusToFahrenheit,
  roundToDecimal,
} from './conversion'

// ── Weight formatter ──

export function formatWeight(
  value: number,
  type: 'mass' | 'volume'
): string {
  if (type === 'mass') {
    const unit = massUnit.value
    if (unit === 'oz') {
      const oz = convertGramsToOunces(value)
      return `${roundToDecimal(oz, 2)} oz`
    }
    return `${roundToDecimal(value, 1)} g`
  }

  // Volume
  const unit = volumeUnit.value
  if (unit === 'floz') {
    const floz = convertMillilitersToFluidOunces(value)
    return `${roundToDecimal(floz, 2)} fl oz`
  }
  return `${roundToDecimal(value, 1)} ml`
}

export function formatWeightValue(
  value: number,
  type: 'mass' | 'volume'
): number {
  if (type === 'mass') {
    return massUnit.value === 'oz' ? convertGramsToOunces(value) : value
  }
  return volumeUnit.value === 'floz' ? convertMillilitersToFluidOunces(value) : value
}

export function parseWeightInput(value: string, type: 'mass' | 'volume'): number {
  const num = parseFloat(value)
  if (isNaN(num)) return 0

  if (type === 'mass' && massUnit.value === 'oz') {
    return convertOuncesToGrams(num)
  }
  if (type === 'volume' && volumeUnit.value === 'floz') {
    return convertFluidOuncesToMilliliters(num)
  }
  return num
}

// ── Temperature formatter ──

export function formatTemperature(value: number): string {
  if (temperatureUnit.value === 'fahrenheit') {
    return `${Math.round(convertCelsiusToFahrenheit(value))}°F`
  }
  return `${Math.round(value)}°C`
}

// ── Duration formatter ──

export function formatDuration(
  seconds: number,
  opts: { short?: boolean } = {}
): string {
  if (seconds < 60) {
    return opts.short ? `${seconds}s` : `${seconds} seconds`
  }

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  if (secs === 0) {
    return opts.short
      ? `${mins}m`
      : `${mins} minute${mins > 1 ? 's' : ''}`
  }

  return opts.short
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${mins}:${secs.toString().padStart(2, '0')}`
}

// ── Grind formatter ──

const GRIND_LABELS: Record<string, string> = {
  FINE: 'Fine',
  MEDIUM_FINE: 'Medium-Fine',
  MEDIUM: 'Medium',
  MEDIUM_COARSE: 'Medium-Coarse',
  COARSE: 'Coarse',
}

export function formatGrind(grind: string): string {
  return GRIND_LABELS[grind] ?? grind
}

// ── Method formatter ──

const METHOD_LABELS: Record<string, string> = {
  V60: 'V60',
  AEROPRESS: 'Aeropress',
  CHEMEX: 'Chemex',
  FRENCH_PRESS: 'French Press',
  MOKA_POT: 'Moka Pot',
  STAGG: 'Stagg',
}

export function formatMethod(method: string): string {
  return METHOD_LABELS[method] ?? method
}

// ── Method descriptions ──

const METHOD_DESCRIPTIONS: Record<string, string> = {
  V60: 'Pour-over dripper',
  AEROPRESS: 'Immersion & pressure',
  CHEMEX: 'Glass pour-over',
  FRENCH_PRESS: 'Full-immersion',
  MOKA_POT: 'Stovetop espresso',
  STAGG: 'Flat-bed pour-over',
}

export function formatMethodDescription(method: string): string {
  return METHOD_DESCRIPTIONS[method] ?? ''
}

// ── Step title formatter ──

const STEP_TITLES: Record<string, string> = {
  GRIND_COFFEE: 'Grind Coffee',
  RINSE_FILTER: 'Rinse Filter',
  INVERT_AEROPRESS: 'Invert Aeropress',
  ADD_ICE: 'Add Ice',
  ADD_COFFEE_AND_WATER: 'Add Coffee & Water',
  BLOOM: 'Bloom',
  ADD_WATER: 'Pour Water',
  BREW: 'Brew',
  STIR: 'Stir',
  PLUNGE: 'Plunge',
  WIGGLE: 'Wiggle',
}

export function formatStepTitle(step: string): string {
  return STEP_TITLES[step] ?? step
}
