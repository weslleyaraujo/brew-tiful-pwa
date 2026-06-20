const METHOD_ICONS: Record<string, string> = {
  // Center square
  V60: 'M8 8 L16 8 L16 16 L8 16 Z',

  // Quarter blocks — top-left + bottom-right
  AEROPRESS: 'M2 2 L11 2 L11 11 L2 11 Z M13 13 L22 13 L22 22 L13 22 Z',

  // Horizontal split
  CHEMEX: 'M2 2 L22 2 L22 11 L2 11 Z M2 13 L22 13 L22 22 L2 22 Z',

  // Vertical split
  FRENCH_PRESS: 'M2 2 L11 2 L11 22 L2 22 Z M13 2 L22 2 L22 22 L13 22 Z',

  // Four small squares
  MOKA_POT: 'M3 3 L9 3 L9 9 L3 9 Z M15 3 L21 3 L21 9 L15 9 Z M3 15 L9 15 L9 21 L3 21 Z M15 15 L21 15 L21 21 L15 21 Z',

  // Top-left corner square
  STAGG: 'M2 2 L14 2 L14 14 L2 14 Z',
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
