const METHOD_ICONS: Record<string, string> = {
  // Diagonal \ — bottom-right filled
  V60: 'M0 0 L24 24 L24 0 Z',

  // Vertical center — left filled
  AEROPRESS: 'M0 0 L12 0 L12 24 L0 24 Z',

  // Horizontal center — top filled
  CHEMEX: 'M0 0 L24 0 L24 12 L0 12 Z',

  // Diagonal / — top-right filled
  FRENCH_PRESS: 'M24 0 L0 24 L24 24 Z',

  // Dual vertical thirds — left third + right third filled (center open)
  MOKA_POT: 'M0 0 L8 0 L8 24 L0 24 Z M16 0 L24 0 L24 24 L16 24 Z',

  // Corner cut — top-left triangle filled
  STAGG: 'M0 0 L16 0 L0 16 Z',
}

export function MethodIcon({ method, size = 28 }: { method: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="var(--color-amber)"
      stroke="none"
    >
      <path d={METHOD_ICONS[method] ?? METHOD_ICONS.V60} />
    </svg>
  )
}
