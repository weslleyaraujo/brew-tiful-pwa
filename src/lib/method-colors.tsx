const METHOD_ICONS: Record<string, string> = {
  V60:           'M0 0 L24 24',
  AEROPRESS:     'M12 0 L12 24',
  CHEMEX:        'M0 12 L24 12',
  FRENCH_PRESS:  'M24 0 L0 24',
  MOKA_POT:      'M8 0 L8 24 M16 0 L16 24',
  STAGG:         'M0 0 L16 0 L0 16',
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
    >
      <path d={METHOD_ICONS[method] ?? METHOD_ICONS.V60} />
    </svg>
  )
}
