const METHOD_ICONS: Record<string, string> = {
  // Nested V-shapes — pour-over ridges
  V60: [
    'M6 6 L12 18 L18 6',
    'M8 8 L12 15 L16 8',
    'M10 10 L12 12 L14 10',
  ].join(' '),

  // Parallel horizontals descending — plunger press
  AEROPRESS: [
    'M4 6 L20 6',
    'M4 12 L20 12',
    'M4 18 L20 18',
    'M8 4 L8 20',
    'M16 4 L16 20',
  ].join(' '),

  // X with horizontals — hourglass + collar
  CHEMEX: [
    'M4 6 L12 12 L20 6',
    'M4 18 L12 12 L20 18',
    'M8 10 L16 10',
    'M8 14 L16 14',
  ].join(' '),

  // Vertical slats — plunger mesh
  FRENCH_PRESS: [
    'M6 4 L6 20',
    'M9 4 L9 20',
    'M12 4 L12 20',
    'M15 4 L15 20',
    'M18 4 L18 20',
  ].join(' '),

  // Stepped diagonal — chambers
  MOKA_POT: [
    'M4 6 L10 6 L10 12 L4 12 Z',
    'M10 12 L18 12 L18 18 L10 18 Z',
    'M4 18 L20 18',
  ].join(' '),

  // Zigzag spout — bent kettle
  STAGG: [
    'M6 4 L14 4 L14 10',
    'M10 10 L14 10 L18 14 L18 20',
    'M6 14 L20 14',
  ].join(' '),
}

export function MethodIcon({ method, size = 28 }: { method: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-amber)"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d={METHOD_ICONS[method] ?? METHOD_ICONS.V60} />
    </svg>
  )
}
