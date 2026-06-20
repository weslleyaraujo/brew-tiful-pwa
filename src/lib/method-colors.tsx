const METHOD_ICONS: Record<string, string> = {
  // Triangle bottom-right — square with \ cut
  V60:           'M0 0 L24 24 L24 0 Z',

  // Rectangle left half — square with | cut
  AEROPRESS:     'M0 0 L12 0 L12 24 L0 24 Z',

  // Triangle top-right — square with / cut
  CHEMEX:        'M24 0 L0 24 L24 24 Z',

  // Two opposing triangles — X cut
  FRENCH_PRESS:  'M0 0 L12 12 L0 24 Z M24 0 L12 12 L24 24 Z',

  // Twin pillars — two vertical thirds
  MOKA_POT:      'M0 0 L8 0 L8 24 L0 24 Z M16 0 L24 0 L24 24 L16 24 Z',

  // Corner L — top-left square cut
  STAGG:         'M0 0 L16 0 L16 8 L8 8 L8 24 L0 24 Z',
}

export function MethodIcon({ method, size = 28 }: { method: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-amber)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={METHOD_ICONS[method] ?? METHOD_ICONS.V60} />
    </svg>
  )
}
