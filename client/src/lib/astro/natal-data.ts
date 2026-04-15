// natal-data.ts
// Single source of truth for Slice 2+.
// All values from LOGOS-44 (Sławomir Gątkowski · 19.02.1983 · 10:53 · Sosnowiec).

export type PlanetName =
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars'
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto'
  | 'NNode' | 'Chiron'

export type AngleName = 'Asc' | 'MC' | 'Dsc' | 'IC'

export type PlanetDef = {
  deg: number
  symbol: string
  cat: 'luminary' | 'personal' | 'social' | 'trans' | 'node' | 'asteroid'
  color: string
  speed: 'fast' | 'slow'
}

export type AspectDef = {
  name: string
  angle: number
  orb: number
  sym: string
  w: number
  col: string
  nature: string
}

export type FoundAspect = {
  p1: PlanetName
  p2: PlanetName
  asp: string
  sym: string
  exact: number
  actual: string
  orb: string
  tight: string
  w: number
  col: string
  nature: string
}

// ── Constants ────────────────────────────────────────────────

export const NATAL: Record<PlanetName, PlanetDef> = {
  Sun:     { deg: 330.18, symbol: '☉', cat: 'luminary',  color: '#F59E0B', speed: 'fast' },
  Moon:    { deg: 43.83,  symbol: '☽', cat: 'luminary',  color: '#C0C9D6', speed: 'fast' },
  Mercury: { deg: 323.45, symbol: '☿', cat: 'personal',  color: '#6EE7B7', speed: 'fast' },
  Venus:   { deg: 355.68, symbol: '♀', cat: 'personal',  color: '#F472B6', speed: 'fast' },
  Mars:    { deg: 355.67, symbol: '♂', cat: 'personal',  color: '#EF4444', speed: 'fast' },
  Jupiter: { deg: 246.82, symbol: '♃', cat: 'social',    color: '#818CF8', speed: 'slow' },
  Saturn:  { deg: 213.47, symbol: '♄', cat: 'social',    color: '#A8A29E', speed: 'slow' },
  Uranus:  { deg: 247.93, symbol: '♅', cat: 'trans',     color: '#22D3EE', speed: 'slow' },
  Neptune: { deg: 268.12, symbol: '♆', cat: 'trans',     color: '#A78BFA', speed: 'slow' },
  Pluto:   { deg: 208.33, symbol: '♇', cat: 'trans',     color: '#FB923C', speed: 'slow' },
  NNode:   { deg: 82.50,  symbol: '☊', cat: 'node',      color: '#4ADE80', speed: 'slow' },
  Chiron:  { deg: 69.75,  symbol: '⚷', cat: 'asteroid',  color: '#FDA4AF', speed: 'slow' },
}

export const ANGLES: Record<AngleName, { deg: number; symbol: string; color: string }> = {
  Asc: { deg: 73.00,  symbol: 'AC', color: '#34D399' },
  MC:  { deg: 343.00, symbol: 'MC', color: '#FBBF24' },
  Dsc: { deg: 253.00, symbol: 'DC', color: '#F87171' },
  IC:  { deg: 163.00, symbol: 'IC', color: '#60A5FA' },
}

// Placidus house cusps (12 values, index 0 = cusp of house 1 = Asc)
export const HOUSES: number[] = [73, 97, 124, 163, 195, 225, 253, 277, 304, 343, 15, 45]

export const ASPECTS: AspectDef[] = [
  { name: 'Koniunkcja',        angle: 0,   orb: 8, sym: '☌',  w: 10, col: '#F59E0B', nature: 'fuzja'     },
  { name: 'Opozycja',          angle: 180, orb: 8, sym: '☍',  w: 8,  col: '#EF4444', nature: 'napięcie'  },
  { name: 'Trygon',            angle: 120, orb: 7, sym: '△',  w: 7,  col: '#10B981', nature: 'harmonia'  },
  { name: 'Kwadratura',        angle: 90,  orb: 7, sym: '□',  w: 6,  col: '#F97316', nature: 'napięcie'  },
  { name: 'Sekstyl',           angle: 60,  orb: 5, sym: '⚹',  w: 4,  col: '#3B82F6', nature: 'harmonia'  },
  { name: 'Kwinkunks',         angle: 150, orb: 3, sym: '⚻',  w: 2,  col: '#A855F7', nature: 'napięcie'  },
  { name: 'Półsekstyl',        angle: 30,  orb: 2, sym: '⚺',  w: 1,  col: '#64748B', nature: 'neutralny' },
  { name: 'Półkwadrat',        angle: 45,  orb: 2, sym: '∠',  w: 2,  col: '#DC2626', nature: 'napięcie'  },
  { name: 'Sesqui-kwadratura', angle: 135, orb: 2, sym: '⊼',  w: 2,  col: '#B91C1C', nature: 'napięcie'  },
  { name: 'Kwintyl',           angle: 72,  orb: 2, sym: 'Q',  w: 3,  col: '#8B5CF6', nature: 'twórczy'   },
  { name: 'Bi-kwintyl',        angle: 144, orb: 2, sym: 'bQ', w: 3,  col: '#7C3AED', nature: 'twórczy'   },
]

export const SIGNS_SYM: string[] =
  ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓']

// Element for each zodiac sign (index 0 = Aries)
const SIGN_ELEMENTS: readonly string[] =
  ['Fire','Earth','Air','Water','Fire','Earth','Air','Water','Fire','Earth','Air','Water']

// Element fill colors for SVG zodiac sectors (15 % opacity pre-applied)
export const ELEMENT_COLORS: Record<string, string> = {
  Fire:  'rgba(239,68,68,0.15)',
  Earth: 'rgba(132,204,22,0.15)',
  Air:   'rgba(56,189,248,0.15)',
  Water: 'rgba(129,140,148,0.15)',
}

// ── Pure functions ───────────────────────────────────────────

export function mod360(d: number): number {
  return ((d % 360) + 360) % 360
}

/**
 * Returns SVG angle (degrees) for an ecliptic longitude.
 * At rotOffset=0: Asc at 180° (9 o'clock), MC at 270° (12 o'clock).
 */
export function degToSVGAngle(eclipticDeg: number, rotOffset: number): number {
  return mod360((ANGLES.Asc.deg + 180 + rotOffset) - eclipticDeg)
}

/** Polar→Cartesian in SVG space (y-axis down, angles clockwise from right). */
export function svgPoint(
  angle: number,
  r: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** Fill color for zodiac sector at sign index si (0 = Aries). */
export function elementColorForSign(si: number): string {
  return ELEMENT_COLORS[SIGN_ELEMENTS[si % 12]]
}

/**
 * Find all aspects between planet pairs.
 * orbMult=1 uses nominal orbs; lower values tighten orbs.
 */
export function findAspects(
  positions: Partial<Record<PlanetName, number>>,
  orbMult = 1,
): FoundAspect[] {
  const found: FoundAspect[] = []
  const names = Object.keys(positions) as PlanetName[]
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = positions[names[i]]!
      const b = positions[names[j]]!
      let diff = Math.abs(a - b)
      if (diff > 180) diff = 360 - diff
      for (const asp of ASPECTS) {
        const orb = asp.orb * orbMult
        const dev = Math.abs(diff - asp.angle)
        if (dev <= orb) {
          found.push({
            p1: names[i],
            p2: names[j],
            asp: asp.name,
            sym: asp.sym,
            exact: asp.angle,
            actual: diff.toFixed(2),
            orb: dev.toFixed(2),
            tight: (1 - dev / orb).toFixed(3),
            w: asp.w * (1 - dev / orb),
            col: asp.col,
            nature: asp.nature,
          })
        }
      }
    }
  }
  return found.sort((a, b) => b.w - a.w)
}
