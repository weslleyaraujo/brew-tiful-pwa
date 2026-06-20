const METHOD_ICONS: Record<string, string> = {
  // Triangle filling bottom half — V-shape pour
  V60: 'M8 4 L4 20 L20 20 L16 4 Z',

  // Rectangular block left side — plunger body
  AEROPRESS: 'M4 4 L12 4 L12 20 L4 20 Z',

  // Hourglass center shape — two opposing triangles
  CHEMEX: 'M8 4 L16 4 L12 12 L8 4 Z M8 20 L16 20 L12 12 L8 20 Z',

  // Top block with center gap — plunger split
  FRENCH_PRESS: 'M4 4 L20 4 L20 16 L4 16 Z M9 4 L8 16 L16 16 L15 4 Z',

  // Bottom block — chamber base
  MOKA_POT: 'M4 14 L20 14 L20 20 L4 20 Z M6 10 L18 10 L18 14 L6 14 Z M8 4 L16 4 L16 10 L8 10 Z',

  // Corner L-shape — spout and body
  STAGG: 'M4 4 L14 4 L14 10 L20 10 L20 20 L4 20 Z',
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
