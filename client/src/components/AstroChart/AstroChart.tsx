import './AstroChart.css'
import { useRef, useId } from 'react'
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

  const uid    = useId().replace(/:/g, '_')
  const glowId = `planetGlow_${uid}`

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
          <filter id={glowId}>
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
                  filter={isSelected ? `url(#${glowId})` : undefined}
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
