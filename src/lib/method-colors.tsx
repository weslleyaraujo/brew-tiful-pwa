const METHOD_ICONS: Record<string, string> = {
  V60:           'M12 2 L22 18 L20 20 L12 12 L4 20 L2 18 Z',
  AEROPRESS:     'M8 4 L16 4 L16 8 L8 8 Z M10 10 L14 10 L14 18 L10 18 Z M8 16 L16 16',
  CHEMEX:        'M10 4 L14 4 L16 12 L18 20 L6 20 L8 12 Z',
  FRENCH_PRESS:  'M8 6 L16 6 L16 14 L8 14 Z M10 4 L14 4 L14 6 L10 6 Z M9 10 L15 10 M9 12 L15 12',
  MOKA_POT:      'M10 6 L14 6 L14 8 L10 8 Z M8 8 L16 8 L14 16 L10 16 Z',
  STAGG:         'M10 4 L14 4 L13 14 L11 14 Z M9 14 L15 14 L14 20 L10 20 Z M7 20 L17 20',
}

export function MethodIcon({ method, size = 28 }: { method: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-amber)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={METHOD_ICONS[method] ?? METHOD_ICONS.V60} />
    </svg>
  )
}
