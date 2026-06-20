const METHOD_ICONS: Record<string, string> = {
  // V shape converging downward — abstract dripper
  V60: [
    'M4 4 L12 18 L20 4',
    'M4 4 L20 4',
  ].join(' '),

  // Vertical plunger abstraction — rectangle with center line
  AEROPRESS: [
    'M6 4 L18 4 L18 16 L6 16 Z',
    'M12 4 L12 20',
    'M6 14 L18 14',
  ].join(' '),

  // Hourglass — two opposing triangles meeting at center
  CHEMEX: [
    'M4 4 L20 4 L12 12 L4 4',
    'M4 20 L20 20 L12 12 L4 20',
  ].join(' '),

  // Block with vertical split — plunger in a cylinder
  FRENCH_PRESS: [
    'M6 4 L18 4 L18 17 L6 17 Z',
    'M12 4 L12 20',
    'M4 20 L20 20',
  ].join(' '),

  // Stacked chambers — three-tier abstract pot
  MOKA_POT: [
    'M6 4 L18 4 L18 7 L6 7 Z',
    'M8 7 L16 7 L16 13 L8 13 Z',
    'M6 13 L18 13 L18 20 L6 20 Z',
    'M6 7 L18 7',
  ].join(' '),

  // Diagonal gooseneck — abstract kettle spout
  STAGG: [
    'M4 4 L14 4 L14 10',
    'M10 10 L14 10 L18 14 L18 20',
    'M14 4 L14 16',
    'M4 10 L14 10',
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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={METHOD_ICONS[method] ?? METHOD_ICONS.V60} />
    </svg>
  )
}
