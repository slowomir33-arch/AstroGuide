# Cosmic Analysis Slice 2 — SVG AstroChart Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `ChartPanel` in `CosmicAnalysisView` with a real interactive SVG natal chart wheel with drag-to-rotate, snap controls, and planet-click aspect highlighting.

**Architecture:** Four files touched — one new data module (`natal-data.ts`) with typed constants and pure calc functions, one new SVG component (`AstroChart.tsx`/`.css`), and a modification to `CosmicAnalysisView.tsx` that adds five state variables and replaces the static placeholder with the real chart plus `ChartControls`. No external chart libraries. All chart state lives in `CosmicAnalysisView` so future slices can read `selectedPlanet`.

**Tech Stack:** React 19, TypeScript 6 (strict: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`), Vite, plain CSS (no modules). No test framework — verification via `npx tsc --noEmit` (TypeScript IS the test) and `npm run build`.

---

## File Map

| Action | Path |
|--------|------|
| Create | `client/src/lib/astro/natal-data.ts` |
| Create | `client/src/components/AstroChart/AstroChart.tsx` |
| Create | `client/src/components/AstroChart/AstroChart.css` |
| Modify | `client/src/views/CosmicAnalysisView.tsx` |
| Modify | `client/src/views/CosmicAnalysisView.css` |

---

## Task 1: natal-data.ts — Types, Constants, Pure Functions

**Files:**
- Create: `client/src/lib/astro/natal-data.ts`

- [ ] **Step 1: Create the `astro` subdirectory**

```bash
cd client && mkdir -p src/lib/astro
```

- [ ] **Step 2: Write `natal-data.ts`**

Create `client/src/lib/astro/natal-data.ts` with the full content below. Values are copied verbatim from `od claude/cosmic_analysis_engine.jsx` — do NOT change any numbers.

```ts
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
  Water: 'rgba(129,140,248,0.15)',
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
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd client && npx tsc --noEmit
```

Expected: 0 errors. If `noUnusedLocals` fires on `SIGN_ELEMENTS`, verify it is used inside `elementColorForSign` — it should be.

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/astro/natal-data.ts
git commit -m "feat(slice2): add natal-data.ts — typed LOGOS-44 constants and pure chart functions"
```

---

## Task 2: AstroChart.css — Chart-Scoped Styles

**Files:**
- Create: `client/src/components/AstroChart/AstroChart.css`

- [ ] **Step 1: Create the `AstroChart` component directory**

```bash
cd client && mkdir -p src/components/AstroChart
```

- [ ] **Step 2: Write `AstroChart.css`**

Create `client/src/components/AstroChart/AstroChart.css` with this exact content:

```css
/* AstroChart.css */

/* ── Chart wrapper ──────────────────────────────────────── */
.astro-chart-wrap {
  width: 100%;
  aspect-ratio: 1;
  max-width: 400px;
  cursor: grab;
  user-select: none;
  touch-action: none; /* prevent scroll during touch-drag */
}
.astro-chart-wrap:active { cursor: grabbing; }

.astro-chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* ── Rotating group — CSS transition for snap animation ─ */
.astro-chart-rotating {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
/* Disable transition while dragging (data-dragging attr set imperatively) */
.astro-chart-wrap[data-dragging] .astro-chart-rotating {
  transition: none;
}

/* ── Chart controls ──────────────────────────────────────── */
.chart-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px 4px;
  flex-shrink: 0;
}
.chart-controls__row {
  display: flex;
  gap: 6px;
  justify-content: center;
}
.chart-btn {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 10px;
  letter-spacing: 1px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.03);
  color: rgba(229,221,208,0.5);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  font-family: 'Outfit', sans-serif;
}
.chart-btn:hover {
  border-color: rgba(255,255,255,0.20);
  color: rgba(229,221,208,0.8);
}
.chart-btn--active {
  border-color: rgba(201,168,76,0.45);
  color: #C9A84C;
  background: rgba(201,168,76,0.08);
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/components/AstroChart/AstroChart.css
git commit -m "feat(slice2): add AstroChart.css — chart wrap, rotating-group transition, control button styles"
```

---

## Task 3: AstroChart.tsx — SVG Natal Chart Component

**Files:**
- Create: `client/src/components/AstroChart/AstroChart.tsx`

- [ ] **Step 1: Write `AstroChart.tsx`**

Create `client/src/components/AstroChart/AstroChart.tsx` with the full content below.

Architecture notes:
- All SVG elements are drawn at `rotOffset=0` using `degToSVGAngle(deg, 0)`.
- A single `<g className="astro-chart-rotating">` with `transform: rotate(${rotOffset}deg)` wraps all chart content. The CSS transition in `AstroChart.css` animates snap moves. During drag, a `data-dragging` attribute on the wrapper div disables the transition imperatively (no extra re-render needed).
- `setPointerCapture` keeps events on the SVG even when the pointer leaves.
- Drag delta is computed in SVG-space angles: `getSVGAngle` maps `clientX/Y` → SVG user units → `atan2` → degrees.
- Planet `onClick` calls `e.stopPropagation()` to prevent the SVG's background `onClick` from deselecting immediately. A `draggedRef` suppresses click-deselect after a drag ends.

```tsx
import './AstroChart.css'
import { useRef } from 'react'
import {
  type PlanetName,
  type AngleName,
  NATAL,
  ANGLES,
  HOUSES,
  SIGNS_SYM,
  elementColorForSign,
  degToSVGAngle,
  svgPoint,
  findAspects,
} from '../../lib/astro/natal-data'

export type AstroChartProps = {
  size?: number
  rotOffset?: number
  onRotOffsetChange?: (deg: number) => void
  showHouses?: boolean
  showAspects?: boolean
  showLabels?: boolean
  selectedPlanet?: PlanetName | null
  onPlanetClick?: (planet: PlanetName | null) => void
}

export function AstroChart({
  size = 400,
  rotOffset = 0,
  onRotOffsetChange,
  showHouses = true,
  showAspects = true,
  showLabels = true,
  selectedPlanet = null,
  onPlanetClick,
}: AstroChartProps) {
  const R  = size / 2
  const cx = R
  const cy = R

  const rZodiacOuter = 0.95 * R
  const rZodiacInner = 0.80 * R
  const rPlanet      = 0.87 * R
  const rHouseOuter  = 0.78 * R
  const rHouseInner  = 0.38 * R
  const rHouseLabel  = 0.56 * R
  const rAspect      = 0.34 * R
  const rCenter      = 0.04 * R

  const wrapRef        = useRef<HTMLDivElement>(null)
  const isDraggingRef  = useRef(false)
  const draggedRef     = useRef(false) // true if pointer moved during current press
  const startAngleRef  = useRef(0)
  const startOffsetRef = useRef(0)

  function getSVGAngle(e: React.PointerEvent<SVGSVGElement>): number {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (size / rect.width)  - cx
    const y = (e.clientY - rect.top)  * (size / rect.height) - cy
    return (Math.atan2(y, x) * 180) / Math.PI
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    isDraggingRef.current  = true
    draggedRef.current     = false
    startAngleRef.current  = getSVGAngle(e)
    startOffsetRef.current = rotOffset
    wrapRef.current?.setAttribute('data-dragging', '')
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!isDraggingRef.current) return
    draggedRef.current = true
    onRotOffsetChange?.(startOffsetRef.current + getSVGAngle(e) - startAngleRef.current)
  }

  function endDrag() {
    isDraggingRef.current = false
    wrapRef.current?.removeAttribute('data-dragging')
  }

  function handleSVGClick() {
    if (draggedRef.current) {
      draggedRef.current = false
      return // don't deselect when click is synthesised after a drag
    }
    onPlanetClick?.(null)
  }

  // Aspect data (cheap to compute; no memoisation needed for 12 planets)
  const natalDegrees = Object.fromEntries(
    (Object.keys(NATAL) as PlanetName[]).map(p => [p, NATAL[p].deg])
  ) as Record<PlanetName, number>
  const aspects = showAspects ? findAspects(natalDegrees) : []

  // SVG path for one zodiac annular sector (signs go CCW in this projection)
  function zodiacSectorPath(si: number): string {
    const startAngle = degToSVGAngle(si * 30,       0)
    const endAngle   = degToSVGAngle((si + 1) * 30, 0)
    const so  = svgPoint(startAngle, rZodiacOuter, cx, cy)
    const eo  = svgPoint(endAngle,   rZodiacOuter, cx, cy)
    const ei  = svgPoint(endAngle,   rZodiacInner, cx, cy)
    const si2 = svgPoint(startAngle, rZodiacInner, cx, cy)
    // Outer arc CCW (sweep=0), inner arc CW (sweep=1), both < 180° so largeArc=0
    return [
      `M ${so.x} ${so.y}`,
      `A ${rZodiacOuter} ${rZodiacOuter} 0 0 0 ${eo.x} ${eo.y}`,
      `L ${ei.x} ${ei.y}`,
      `A ${rZodiacInner} ${rZodiacInner} 0 0 1 ${si2.x} ${si2.y}`,
      'Z',
    ].join(' ')
  }

  return (
    <div className="astro-chart-wrap" ref={wrapRef}>
      <svg
        className="astro-chart-svg"
        viewBox={`0 0 ${size} ${size}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClick={handleSVGClick}
      >
        <defs>
          <filter id="planetGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Layer 1: Static background fill (not rotated) */}
        <circle cx={cx} cy={cy} r={rZodiacOuter} fill="#060A14" />

        {/* All layers 2–10 rotate together */}
        <g
          className="astro-chart-rotating"
          style={{
            transform: `rotate(${rotOffset}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
          }}
        >
          {/* Layer 2: Zodiac ring — 12 annular sectors */}
          {Array.from({ length: 12 }, (_, si) => {
            const midAngle = degToSVGAngle(si * 30 + 15, 0)
            const rMid     = rZodiacInner + (rZodiacOuter - rZodiacInner) / 2
            const lp       = svgPoint(midAngle, rMid, cx, cy)
            return (
              <g key={si}>
                <path
                  d={zodiacSectorPath(si)}
                  fill={elementColorForSign(si)}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.5}
                />
                <text
                  x={lp.x} y={lp.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fill="rgba(229,221,208,0.6)"
                >
                  {SIGNS_SYM[si]}
                </text>
              </g>
            )
          })}

          {/* Layers 3 & 4: House cusp lines + house number labels */}
          {showHouses && HOUSES.map((cuspDeg, i) => {
            const a     = degToSVGAngle(cuspDeg, 0)
            const outer = svgPoint(a, rHouseOuter, cx, cy)
            const inner = svgPoint(a, rHouseInner, cx, cy)
            // Midpoint of house sector (handle 360° wrap)
            const nextCusp = HOUSES[(i + 1) % 12]
            const midEcl   = nextCusp > cuspDeg
              ? (cuspDeg + nextCusp) / 2
              : (cuspDeg + nextCusp + 360) / 2
            const midPt = svgPoint(degToSVGAngle(midEcl, 0), rHouseLabel, cx, cy)
            return (
              <g key={i}>
                <line
                  x1={outer.x} y1={outer.y}
                  x2={inner.x} y2={inner.y}
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth={0.5}
                />
                <text
                  x={midPt.x} y={midPt.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fill="rgba(229,221,208,0.3)"
                >
                  {i + 1}
                </text>
              </g>
            )
          })}

          {/* Layer 5: Inner circle — separates aspect web from house area */}
          <circle
            cx={cx} cy={cy} r={rHouseInner}
            fill="#060A14"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth={1}
          />

          {/* Layer 6: Aspect lines */}
          {showAspects && aspects.map((asp, idx) => {
            const pt1          = svgPoint(degToSVGAngle(NATAL[asp.p1].deg, 0), rAspect, cx, cy)
            const pt2          = svgPoint(degToSVGAngle(NATAL[asp.p2].deg, 0), rAspect, cx, cy)
            const isHighlighted = asp.p1 === selectedPlanet || asp.p2 === selectedPlanet
            const opacity = selectedPlanet !== null
              ? (isHighlighted ? 0.9 : 0.12)
              : 0.45
            return (
              <line
                key={idx}
                x1={pt1.x} y1={pt1.y}
                x2={pt2.x} y2={pt2.y}
                stroke={asp.col}
                strokeWidth={1}
                opacity={opacity}
              />
            )
          })}

          {/* Layer 7: Angle markers (Asc/MC/Dsc/IC) */}
          {(Object.keys(ANGLES) as AngleName[]).map(key => {
            const angle = ANGLES[key]
            const a     = degToSVGAngle(angle.deg, 0)
            const outer = svgPoint(a, rHouseOuter,      cx, cy)
            const tip   = svgPoint(a, rPlanet + 10,     cx, cy)
            const lbl   = svgPoint(a, rZodiacInner - 8, cx, cy)
            return (
              <g key={key}>
                <line
                  x1={outer.x} y1={outer.y}
                  x2={tip.x}   y2={tip.y}
                  stroke={angle.color}
                  strokeWidth={1.5}
                />
                <text
                  x={lbl.x} y={lbl.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={600}
                  fill={angle.color}
                >
                  {angle.symbol}
                </text>
              </g>
            )
          })}

          {/* Layers 8 & 9: Planet dots + glyphs */}
          {(Object.keys(NATAL) as PlanetName[]).map(name => {
            const planet     = NATAL[name]
            const a          = degToSVGAngle(planet.deg, 0)
            const pt         = svgPoint(a, rPlanet,      cx, cy)
            const gl         = svgPoint(a, rPlanet + 14, cx, cy)
            const isSelected = name === selectedPlanet
            return (
              <g
                key={name}
                onClick={(e) => { e.stopPropagation(); onPlanetClick?.(name) }}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={pt.x} cy={pt.y}
                  r={isSelected ? 6 : 4}
                  fill={planet.color}
                  stroke="#060A14"
                  strokeWidth={1.5}
                  filter={isSelected ? 'url(#planetGlow)' : undefined}
                />
                {showLabels && (
                  <text
                    x={gl.x} y={gl.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={12}
                    fill={planet.color}
                  >
                    {planet.symbol}
                  </text>
                )}
              </g>
            )
          })}

          {/* Layer 10: Center dot */}
          <circle
            cx={cx} cy={cy} r={rCenter}
            fill="rgba(201,168,76,0.3)"
            stroke="rgba(201,168,76,0.6)"
            strokeWidth={1}
          />
        </g>
      </svg>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd client && npx tsc --noEmit
```

Expected: 0 errors. Common pitfalls:
- `filter={undefined}` on SVG `<circle>` is valid React (removes the attribute).
- `fontWeight={600}` on SVG `<text>` is valid (number, not string).
- `dominantBaseline` is a valid SVG React prop.
- If TypeScript complains about `AngleName` not covering all ANGLES keys, check that `AngleName = 'Asc' | 'MC' | 'Dsc' | 'IC'` matches the keys in `ANGLES` exactly.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/AstroChart/AstroChart.tsx
git commit -m "feat(slice2): add AstroChart.tsx — SVG natal wheel with drag-rotate and planet click"
```

---

## Task 4: Wire AstroChart into CosmicAnalysisView

**Files:**
- Modify: `client/src/views/CosmicAnalysisView.tsx`
- Modify: `client/src/views/CosmicAnalysisView.css`

### Step 1: Update CosmicAnalysisView.css

- [ ] **Remove placeholder chart styles and add SVG wrap styles**

In `client/src/views/CosmicAnalysisView.css`, make two changes:

**A) Remove the placeholder-only blocks** (no longer rendered, just dead CSS):
- `.cosmic-chart-ring` and `.cosmic-chart-ring__mid` and `.cosmic-chart-ring__inner` and `.cosmic-chart-ring__center-label`
- `.cosmic-planet-dot` and `@keyframes cosmic-pulse`
- `.cosmic-chart-caption`

**B) Replace `.cosmic-chart-panel` and add `.cosmic-chart-svg-wrap`:**

Old `.cosmic-chart-panel`:
```css
.cosmic-chart-panel {
  width: 55%;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(124,92,255,0.06) 0%, transparent 70%);
  flex-shrink: 0;
}
```

New `.cosmic-chart-panel` (remove `align-items`/`justify-content` centering, add `overflow: hidden`):
```css
.cosmic-chart-panel {
  width: 55%;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  position: relative;
  background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(124,92,255,0.06) 0%, transparent 70%);
  flex-shrink: 0;
  overflow: hidden;
}
```

Add after `.cosmic-chart-panel`:
```css
/* Flex container for the SVG — fills available space and centers the chart */
.cosmic-chart-svg-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
```

Also update the mobile block to remove stale height that referenced the placeholder:
```css
@media (max-width: 767px) {
  .cosmic-body { flex-direction: column; }
  .cosmic-chart-panel {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
}
```
(Changed `240px` → `300px` to give the real chart enough space on mobile.)

### Step 2: Update CosmicAnalysisView.tsx

- [ ] **Replace `CosmicAnalysisView.tsx` with the complete file below**

The following changes vs the current file:
1. Add `import type { PlanetName }` from natal-data.
2. Add `import { AstroChart }` from AstroChart component.
3. Remove `PLANET_DOTS` constant (was only used by old `ChartPanel`).
4. Add `ChartControlsProps` type and `ChartControls` component.
5. Add `ChartPanelProps` type and replace `ChartPanel` function.
6. In `CosmicAnalysisView`, add five state vars and pass them to `ChartPanel`.

Complete new file:

```tsx
import './CosmicAnalysisView.css'
import { useState, useEffect, useRef } from 'react'
import { format, getWeek, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useAppStore } from '../store/appStore'
import { type PlanetName } from '../lib/astro/natal-data'
import { AstroChart } from '../components/AstroChart/AstroChart'

// ── date helpers ──────────────────────────────────────────
function formatDisplayDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM yyyy', { locale: pl })
  } catch {
    return dateStr
  }
}

function getDayName(dateStr: string): string {
  try {
    const name = format(parseISO(dateStr), 'EEEE', { locale: pl })
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return ''
  }
}

function getWeekNumber(dateStr: string): number {
  try {
    return getWeek(parseISO(dateStr))
  } catch {
    return 1
  }
}

// ── CosmicHeader ──────────────────────────────────────────
function CosmicHeader() {
  const profiles           = useAppStore((s) => s.profiles)
  const activeProfileId    = useAppStore((s) => s.activeProfileId)
  const setActiveProfileId = useAppStore((s) => s.setActiveProfileId)
  const dayAnalysisDate    = useAppStore((s) => s.dayAnalysisDate)
  const setDayAnalysisDate = useAppStore((s) => s.setDayAnalysisDate)

  const activeProfile = profiles.find((p) => p.id === activeProfileId)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const profileWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (profileWrapRef.current && !profileWrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const initials = activeProfile
    ? activeProfile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <header className="cosmic-header">
      <div className="cosmic-header__profile-wrap" ref={profileWrapRef}>
        <button
          type="button"
          className="cosmic-header__profile-btn"
          onClick={() => setDropdownOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span className="cosmic-header__avatar">{initials}</span>
          <span className="cosmic-header__profile-name">
            {activeProfile?.name ?? 'Brak profilu'}
          </span>
          <span className="cosmic-header__chevron" aria-hidden="true">▾</span>
        </button>

        {dropdownOpen && (
          <ul className="cosmic-header__dropdown" role="listbox">
            {profiles.map((p) => (
              <li
                key={p.id}
                role="option"
                aria-selected={p.id === activeProfileId}
                className={[
                  'cosmic-header__dropdown-item',
                  p.id === activeProfileId ? 'cosmic-header__dropdown-item--active' : '',
                ].join(' ')}
                onClick={() => {
                  setActiveProfileId(p.id)
                  setDropdownOpen(false)
                }}
              >
                {p.name}
              </li>
            ))}
            {profiles.length === 0 && (
              <li className="cosmic-header__dropdown-item cosmic-header__dropdown-item--empty">
                Brak profili
              </li>
            )}
          </ul>
        )}
      </div>

      <label className="cosmic-header__date-label">
        <span className="cosmic-header__date-icon" aria-hidden="true">📅</span>
        <span className="cosmic-header__date-display">
          {formatDisplayDate(dayAnalysisDate)}
        </span>
        <input
          type="date"
          className="cosmic-header__date-input"
          value={dayAnalysisDate}
          onChange={(e) => setDayAnalysisDate(e.target.value)}
          aria-label="Data analizy"
        />
      </label>

      <span className="cosmic-header__week-info">
        {getDayName(dayAnalysisDate)} · Tydzień {getWeekNumber(dayAnalysisDate)}
      </span>
    </header>
  )
}

// ── ChartControls ─────────────────────────────────────────
// Snap target when ♈ button pressed: 0° Aries at right (0° SVG angle)
// svgAngle(0°) = (73 + 180 + rotOffset) - 0 = 253 + rotOffset = 0 → rotOffset = -253
const SNAP_ARIES = -253

type ChartControlsProps = {
  rotOffset: number
  onSnap: (deg: number) => void
  showHouses: boolean
  onToggleHouses: () => void
  showAspects: boolean
  onToggleAspects: () => void
  showLabels: boolean
  onToggleLabels: () => void
}

function ChartControls({
  rotOffset,
  onSnap,
  showHouses,
  onToggleHouses,
  showAspects,
  onToggleAspects,
  showLabels,
  onToggleLabels,
}: ChartControlsProps) {
  return (
    <div className="chart-controls">
      <div className="chart-controls__row">
        <button type="button" className="chart-btn" onClick={() => onSnap(0)}>
          AC · MC
        </button>
        <button type="button" className="chart-btn" onClick={() => onSnap(SNAP_ARIES)}>
          ♈
        </button>
        <button type="button" className="chart-btn" onClick={() => onSnap(0)}>
          ↺ {Math.round(rotOffset)}°
        </button>
      </div>
      <div className="chart-controls__row">
        <button
          type="button"
          className={`chart-btn${showHouses ? ' chart-btn--active' : ''}`}
          onClick={onToggleHouses}
        >
          ♁ Domy
        </button>
        <button
          type="button"
          className={`chart-btn${showAspects ? ' chart-btn--active' : ''}`}
          onClick={onToggleAspects}
        >
          ⋆ Aspekty
        </button>
        <button
          type="button"
          className={`chart-btn${showLabels ? ' chart-btn--active' : ''}`}
          onClick={onToggleLabels}
        >
          Aa Etykiety
        </button>
      </div>
    </div>
  )
}

// ── ChartPanel ────────────────────────────────────────────
// Defined outside CosmicAnalysisView to keep React identity stable.
// State lives in CosmicAnalysisView so future slices can read selectedPlanet.
type ChartPanelProps = {
  rotOffset: number
  onRotOffsetChange: (n: number) => void
  selectedPlanet: PlanetName | null
  onPlanetClick: (p: PlanetName | null) => void
  showHouses: boolean
  onToggleHouses: () => void
  showAspects: boolean
  onToggleAspects: () => void
  showLabels: boolean
  onToggleLabels: () => void
}

function ChartPanel({
  rotOffset,
  onRotOffsetChange,
  selectedPlanet,
  onPlanetClick,
  showHouses,
  onToggleHouses,
  showAspects,
  onToggleAspects,
  showLabels,
  onToggleLabels,
}: ChartPanelProps) {
  return (
    <div className="cosmic-chart-panel">
      <div className="cosmic-chart-svg-wrap">
        <AstroChart
          rotOffset={rotOffset}
          onRotOffsetChange={onRotOffsetChange}
          showHouses={showHouses}
          showAspects={showAspects}
          showLabels={showLabels}
          selectedPlanet={selectedPlanet}
          onPlanetClick={onPlanetClick}
        />
      </div>
      <ChartControls
        rotOffset={rotOffset}
        onSnap={onRotOffsetChange}
        showHouses={showHouses}   onToggleHouses={onToggleHouses}
        showAspects={showAspects} onToggleAspects={onToggleAspects}
        showLabels={showLabels}   onToggleLabels={onToggleLabels}
      />
    </div>
  )
}

// ── Shared tile shell ─────────────────────────────────────
function TileShell({
  title,
  badge,
  children,
}: {
  title: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <div className="cosmic-tile">
      <div className="cosmic-tile__header">
        <span className="cosmic-tile__title">{title}</span>
        {badge && <span className="cosmic-tile__badge">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

// ── EnergyTile ────────────────────────────────────────────
function EnergyTile({ dateStr }: { dateStr: string }) {
  return (
    <TileShell title="Energia dnia" badge={getDayName(dateStr)}>
      <div className="cosmic-tile__placeholder" />
    </TileShell>
  )
}

// ── HarmonicsTile ─────────────────────────────────────────
const HARMONIC_BARS = [
  { label: 'H19', value: 5.27, color: '#10B981' },
  { label: 'H11', value: 4.88, color: '#3B82F6' },
  { label: 'H13', value: 4.35, color: '#1E40AF' },
  { label: 'H17', value: 3.70, color: '#0EA5E9' },
  { label: 'H5',  value: 2.10, color: '#A855F7' },
  { label: 'H3',  value: 1.40, color: '#555555' },
] as const

const H_MAX = 6

function HarmonicsTile() {
  return (
    <TileShell title="Harmoniki" badge="H19 · 5.27">
      <div className="cosmic-tile__bars">
        {HARMONIC_BARS.map((b) => (
          <div
            key={b.label}
            className="cosmic-tile__bar"
            style={{ height: `${(b.value / H_MAX) * 100}%`, background: b.color }}
            title={`${b.label}: ${b.value}`}
          />
        ))}
      </div>
    </TileShell>
  )
}

// ── AspectsTile ───────────────────────────────────────────
const NATAL_ASPECT_TAGS = [
  '☉♀ Koniunkcja',
  '☽♃ Trygon',
  '♂♄ Kwadratura',
  '☉♂ Koniunkcja',
] as const

function AspectsTile() {
  return (
    <TileShell title="Aspekty natalne">
      <div className="cosmic-tile__tags">
        {NATAL_ASPECT_TAGS.map((tag) => (
          <span key={tag} className="cosmic-tile__tag">{tag}</span>
        ))}
      </div>
    </TileShell>
  )
}

// ── NumerologyTile ────────────────────────────────────────
function NumerologyTile() {
  return (
    <TileShell title="Numerologia">
      <div className="cosmic-tile__tags">
        <span className="cosmic-tile__tag cosmic-tile__tag--gold">Liczba dnia: 8</span>
        <span className="cosmic-tile__tag">Rok osobisty: 3</span>
        <span className="cosmic-tile__tag">Karma: 14/5</span>
      </div>
    </TileShell>
  )
}

// ── TimelineTile ──────────────────────────────────────────
function TimelineTile() {
  return (
    <TileShell title="Timeline">
      <div className="cosmic-tile__placeholder" />
    </TileShell>
  )
}

// ── DashboardPanel ────────────────────────────────────────
function DashboardPanel({ dateStr }: { dateStr: string }) {
  return (
    <div className="cosmic-dashboard">
      <EnergyTile dateStr={dateStr} />
      <HarmonicsTile />
      <AspectsTile />
      <NumerologyTile />
      <TimelineTile />
    </div>
  )
}

// ── TalkButton ────────────────────────────────────────────
function TalkButton() {
  return (
    <div className="cosmic-talk-wrap">
      <button
        type="button"
        className="cosmic-talk-btn"
        onClick={() => { /* wired in Slice 5 */ }}
      >
        ✦ Porozmawiaj o tym układzie
      </button>
    </div>
  )
}

// ── CosmicAnalysisView — main export ─────────────────────
export function CosmicAnalysisView() {
  const dayAnalysisDate = useAppStore((s) => s.dayAnalysisDate)

  // Chart state lives here so Slice 3+ can read selectedPlanet
  const [rotOffset,      setRotOffset]      = useState(0)
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetName | null>(null)
  const [showHouses,     setShowHouses]     = useState(true)
  const [showAspects,    setShowAspects]    = useState(true)
  const [showLabels,     setShowLabels]     = useState(true)

  return (
    <div className="cosmic-root">
      <CosmicHeader />
      <div className="cosmic-body">
        <ChartPanel
          rotOffset={rotOffset}
          onRotOffsetChange={setRotOffset}
          selectedPlanet={selectedPlanet}
          onPlanetClick={setSelectedPlanet}
          showHouses={showHouses}
          onToggleHouses={() => setShowHouses(v => !v)}
          showAspects={showAspects}
          onToggleAspects={() => setShowAspects(v => !v)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(v => !v)}
        />
        <DashboardPanel dateStr={dayAnalysisDate} />
      </div>
      <TalkButton />
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd client && npx tsc --noEmit
```

Expected: 0 errors. If `noUnusedLocals` fires on anything, check that every import is actually used in JSX or logic.

- [ ] **Step 4: Build check**

```bash
cd client && npm run build
```

Expected: successful build with no errors. Bundle size increase for the SVG chart module is expected (pure JS, no new dependencies).

- [ ] **Step 5: Commit**

```bash
git add client/src/views/CosmicAnalysisView.tsx client/src/views/CosmicAnalysisView.css
git commit -m "feat(slice2): wire AstroChart into CosmicAnalysisView — replace placeholder with real SVG natal wheel"
```

---

## Verification Checklist (manual, in browser)

After all tasks are complete and the dev server is running (`npm run dev`):

- [ ] App builds without TypeScript errors
- [ ] "Day" tab shows a real SVG chart (not the old placeholder dots)
- [ ] Zodiac ring: 12 color-coded segments with ♈–♓ symbols
- [ ] 12 house cusp lines visible
- [ ] House numbers (1–12) visible in their sectors
- [ ] 12 planet dots visible with correct colors
- [ ] Planet glyphs (☉ ☽ etc.) visible outside planet dots
- [ ] AC / MC / DC / IC markers visible with colored lines and labels
- [ ] Aspect web visible in the chart center area
- [ ] Drag rotates the chart smoothly
- [ ] AC·MC snap button resets rotation to 0 with 0.35s animation
- [ ] ♈ snap button rotates to natural zodiac view with animation
- [ ] ↺ button label shows current degrees and resets to 0 on click
- [ ] Planet click highlights that planet's aspects (others dim to 0.12 opacity)
- [ ] Click empty background deselects (aspects return to 0.45 opacity)
- [ ] Click after drag does NOT deselect (draggedRef suppresses it)
- [ ] House toggle button hides/shows house lines and numbers
- [ ] Aspect toggle button hides/shows aspect web
- [ ] Label toggle button hides/shows planet glyphs
- [ ] Active toggle buttons show gold border (`.chart-btn--active`)
- [ ] Mobile: chart fills width, controls below, touch drag works
