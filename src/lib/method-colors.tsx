const METHOD_ICONS: Record<string, string> = {
  V60: [
    // Carafe body
    'M9 16 L9 22 L15 22 L15 16',
    // Carafe neck
    'M10.5 16 L12 10 L12 10',
    'M13.5 16 L12 10',
    // Dripper cone
    'M8.5 6 L5 10 L12 14 L19 10 L15.5 6',
    // Filter paper visible inside
    'M9.5 7 L7 10 L12 13 L17 10 L14.5 7',
    // Ridge lines on dripper
    'M11 9 L11 12.5',
    'M13 9 L13 12.5',
    // Base ring
    'M7 14 L12 16 L17 14',
  ].join(' '),

  AEROPRESS: [
    // Mug
    'M7 18 L7 22 L17 22 L17 18',
    'M8 18 L8 16 L16 16 L16 18',
    // Aeropress body (cylinder)
    'M9 5 L15 5 L15 14 L9 14 Z',
    // Plunger top
    'M10 2 L14 2 L14 5 L10 5 Z',
    // Plunger rod
    'M12 2 L12 1',
    'M11 1 L13 1',
    // Hex cap at bottom
    'M8.5 14 L9 16 L15 16 L15.5 14',
    // Label area
    'M10.5 9 L12 7.5 L13.5 9',
  ].join(' '),

  CHEMEX: [
    // Base
    'M9.5 21 L14.5 21',
    // Lower bulb
    'M10 21 C7 18 6 15 7 12',
    'M14 21 C17 18 18 15 17 12',
    // Neck narrows
    'M7 12 C8 10 9 8 10 7',
    'M17 12 C16 10 15 8 14 7',
    // Upper funnel
    'M8 2 L10 7',
    'M16 2 L14 7',
    // Rim
    'M7 2 L17 2',
    // Wooden collar
    'M9.5 10 L14.5 10',
    // Leather tie
    'M14.5 10 C16 10.5 16.5 11.5 16 12.5',
    // Glass highlight
    'M8.5 5 L8.5 15',
  ].join(' '),

  FRENCH_PRESS: [
    // Base
    'M8 21 L16 21',
    'M9 21 L10 20 L14 20 L15 21',
    // Glass beaker
    'M10 7 L14 7 L14 18 L10 18 Z',
    // Spout
    'M10 8 L8 8 L9 7 L10 7',
    // Plunger lid
    'M10 5 L14 5 L14 7 L10 7 Z',
    // Plunger rod
    'M12 3 L11.5 5',
    'M11 3 L13 3',
    // Handle
    'M14 11 L17 11 L17 14 L14 14',
    // Mesh line
    'M10.5 16 L13.5 16',
    'M10.5 17 L13.5 17',
  ].join(' '),

  MOKA_POT: [
    // Lower chamber (octagonal visual)
    'M9.5 21 L14.5 21 L15 19 L9 19 Z',
    // Chamber body
    'M10 14 L14 14 L14.5 18 L9.5 18 Z',
    // Middle filter section
    'M9.5 13 L14.5 13 L14 14 L10 14 Z',
    // Upper chamber
    'M11 7 L13 7 L13.5 13 L10.5 13 Z',
    // Lid
    'M11 6 L13 6 L12.5 7 L11.5 7 Z',
    // Lid knob
    'M11.5 5 L12.5 5 L12.5 6 L11.5 6 Z',
    // Spout
    'M13 8 L15.5 8 L14 11 L13 11',
    // Handle
    'M10 11 L8 11 L8 15 L10 15',
    // Safety valve
    'M14 19 L14.5 17.5',
    'M13.5 19 L13 17.5',
  ].join(' '),

  STAGG: [
    // Base
    'M8 21 L16 21',
    // Kettle body
    'M9 21 L9 13',
    'M15 21 L15 13',
    'M9 13 C9 9 10 7 12 7',
    'M15 13 C15 9 14 7 12 7',
    // Flat top
    'M10 7 L14 7',
    // Thermometer
    'M12 7 L12 4',
    'M11 4 L13 4',
    // Gooseneck spout
    'M12 7 C14 7 16 8 17 10',
    'M17 10 C18 12 18 14 17.5 15',
    // Spout tip
    'M17.5 15 L17 16 L18 16 L18.5 15',
    // Handle
    'M15 10 C18 10 18.5 13 17 15',
    // Lid line
    'M10.5 7 L13.5 7',
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
