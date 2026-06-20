// Ported from brew-tiful utils/conversion.ts
// Removed React Native dependencies — pure math

const GRAMS_TO_OUNCES = 0.03527396195
const MILLILITERS_TO_FLUID_OUNCES = 0.033814022702

export function calculateRatio({
  beans,
  water,
  asNumber,
}: {
  beans: number
  water: number
  asNumber: true
}): number
export function calculateRatio({
  beans,
  water,
  asNumber,
}: {
  beans: number
  water: number
  asNumber?: false
}): string
export function calculateRatio({
  beans,
  water,
  asNumber = false,
}: {
  beans: number
  water: number
  asNumber?: boolean
}): string | number {
  // Handle division by zero cases
  if (beans === 0 || !isFinite(beans)) {
    return asNumber ? 0 : '1:0'
  }
  if (water === 0) {
    return asNumber ? 0 : '1:0'
  }

  const ratio = water / beans

  if (!isFinite(ratio)) {
    return asNumber ? 0 : '1:0'
  }

  if (asNumber) {
    return ratio
  }

  return ratio === 1 ? '1:1' : `1:${roundToDecimal(ratio, 1)}`
}

export function convertGramsToOunces(grams: number): number {
  return grams * GRAMS_TO_OUNCES
}

export function convertMillilitersToFluidOunces(ml: number): number {
  return ml * MILLILITERS_TO_FLUID_OUNCES
}

export function convertOuncesToGrams(ounces: number): number {
  return ounces / GRAMS_TO_OUNCES
}

export function convertFluidOuncesToMilliliters(flOz: number): number {
  return flOz / MILLILITERS_TO_FLUID_OUNCES
}

export function convertCelsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

export function convertFahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9
}

export function roundToDecimal(value: number, decimalPlaces: number = 1): string {
  const multiplier = 10 ** decimalPlaces
  const rounded = Math.round(value * multiplier) / multiplier
  return Number.isInteger(rounded)
    ? rounded.toString()
    : rounded.toFixed(decimalPlaces)
}

export function crossMultiply(value = 0, multiplier = 1, next = 0): number {
  // Handle division by zero and invalid inputs
  if (value === 0 || !isFinite(value)) {
    return 0
  }

  const result = (multiplier * next) / value
  return isFinite(result) ? result : 0
}

export function calculateBeansFromWaterAndRatio(
  water: number,
  ratio: number
): number | null {
  // Prevent division by zero or invalid values
  if (!ratio || ratio <= 0 || !isFinite(ratio) || !isFinite(water)) {
    return null
  }

  const beansValue = water / ratio
  return isFinite(beansValue) ? beansValue : null
}

export function calculateWaterFromBeansAndRatio(
  beans: number,
  ratio: number
): number | null {
  // Prevent multiplication overflow or invalid values
  if (!isFinite(beans) || !isFinite(ratio)) {
    return null
  }

  const waterValue = beans * ratio
  return isFinite(waterValue) ? waterValue : null
}

export function calculateWaterFromServings(
  servings: number,
  mlPerServing: number = 200
): number | null {
  const waterValue = mlPerServing * servings
  return isFinite(waterValue) ? waterValue : null
}

export function normalizeRatioInput(ratio: number): number | null {
  return ratio > 0 && isFinite(ratio) ? ratio : null
}
