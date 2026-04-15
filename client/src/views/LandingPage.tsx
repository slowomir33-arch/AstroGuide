import { useEffect, useRef, useState } from 'react'
import {
  Scan, Layers, Compass, GitBranch, GitMerge, Activity, Moon, Database,
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import './LandingPage.css'

// ── Wave systems ─────────────────────────────────────────────────
type WaveSystem = {
  name: string
  sub: string
  c: [number, number, number]
  base: number
  fa: number
  ea: number
  pat: 'circles' | 'stars' | 'dots' | 'triangles' | 'arcs'
  h: [number, number, number, number][]
}

const WAVE_SYSTEMS: WaveSystem[] = [
  {
    name: 'Harmonic Analysis', sub: 'hidden frequencies of being',
    c: [160, 130, 210], base: 0.26, fa: 0.05, ea: 0.28, pat: 'arcs',
    h: [[0.8,18,0.0,0.50],[1.7,12,1.2,0.37],[2.9,7,2.8,0.28],[4.5,4,0.5,0.22],[6.2,2.5,3.9,0.19],[8.0,1.5,1.7,0.17]],
  },
  {
    name: 'Numerology', sub: 'rhythm encoded in numbers',
    c: [120, 170, 225], base: 0.33, fa: 0.045, ea: 0.24, pat: 'triangles',
    h: [[0.6,20,1.8,0.55],[1.4,14,3.1,0.40],[2.5,9,0.4,0.30],[3.8,5,2.2,0.25],[5.5,3,4.1,0.21],[7.3,1.8,0.9,0.18]],
  },
  {
    name: 'Mayan Tzolkin', sub: 'the soul signature in time',
    c: [215, 155, 95], base: 0.40, fa: 0.05, ea: 0.30, pat: 'dots',
    h: [[0.5,26,3.5,0.60],[1.1,18,0.8,0.45],[2.0,11,2.4,0.34],[3.3,6,4.7,0.27],[5.0,3.5,1.3,0.22],[7.0,2,3.6,0.18]],
  },
  {
    name: 'Sidereal Astrology', sub: 'stars as they truly are',
    c: [110, 190, 165], base: 0.47, fa: 0.045, ea: 0.26, pat: 'stars',
    h: [[0.7,22,5.2,0.52],[1.5,15,2.0,0.39],[2.7,9,3.8,0.29],[4.1,5,0.7,0.24],[5.8,3,5.5,0.20],[8.5,1.5,2.3,0.16]],
  },
  {
    name: 'Western Astrology', sub: 'the mirror of the psyche',
    c: [201, 168, 76], base: 0.54, fa: 0.06, ea: 0.38, pat: 'circles',
    h: [[0.6,24,0.6,0.55],[1.3,16,3.4,0.42],[2.3,10,1.9,0.32],[3.6,6,4.0,0.26],[5.2,3.5,0.2,0.21],[7.8,2,2.8,0.17]],
  },
]

// ── Features ─────────────────────────────────────────────────────
const FEATURES = [
  { Icon: Scan,      title: 'Cosmic Mirror',               desc: 'See your natal chart as a living reflection — not a static label.' },
  { Icon: Layers,    title: 'Multidimensional Integration', desc: 'All planetary voices speaking together, revealing the whole.' },
  { Icon: Compass,   title: 'Contextual AI Navigator',     desc: 'Ask questions. Receive reflections tailored to your unique chart.' },
  { Icon: GitBranch, title: 'Pattern Recognition',         desc: 'Unconscious cycles made visible. Awareness is the first freedom.' },
  { Icon: GitMerge,  title: 'Three Paths of Choice',       desc: 'Continue, transform, or transcend. Every pattern offers three doors.' },
  { Icon: Activity,  title: 'Harmonic Analysis',           desc: 'The hidden music between your planets — resonance and tension revealed.' },
  { Icon: Moon,      title: 'Contemplative Space',         desc: 'A quiet place to sit with what you see. No rush. Just presence.' },
  { Icon: Database,  title: 'Soul Memory',                 desc: 'Your mirror evolves with you. Past reflections illuminate present growth.' },
]

export function LandingPage() {
  const loginDemo = useAppStore((s) => s.loginDemo)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<HTMLDivElement>(null)
  const [legendIdx, setLegendIdx] = useState(WAVE_SYSTEMS.length - 1)

  // ── Stars ──────────────────────────────────────────────────────
  useEffect(() => {
    const container = starsRef.current
    if (!container) return
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('div')
      s.className = 'lp-star'
      s.style.left = Math.random() * 100 + '%'
      s.style.top = Math.random() * 100 + '%'
      s.style.animationDelay = Math.random() * 3.5 + 's'
      const sz = Math.random() * 2.5 + 0.5
      s.style.width = sz + 'px'
      s.style.height = sz + 'px'
      s.style.boxShadow = `0 0 ${sz * 2}px rgba(229,221,208,0.8)`
      container.appendChild(s)
    }
    return () => { container.innerHTML = '' }
  }, [])

  // ── Scroll reveal ──────────────────────────────────────────────
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal')
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // ── Legend cycling ─────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setLegendIdx((i) => (i + 1) % WAVE_SYSTEMS.length), 3500)
    return () => clearInterval(id)
  }, [])

  // ── Canvas wave animation ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1

    function resize() {
      const r = canvas!.parentElement!.getBoundingClientRect()
      canvas!.width = r.width * dpr
      canvas!.height = r.height * dpr
      canvas!.style.width = r.width + 'px'
      canvas!.style.height = r.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    function noise(x: number, seed: number) {
      return Math.sin(x * 12.9898 + seed * 78.233) * 0.5
           + Math.sin(x * 39.346 + seed * 11.135) * 0.25
           + Math.sin(x * 73.156 + seed * 43.729) * 0.125
    }

    function wy(s: WaveSystem, x: number, tt: number) {
      const env = 0.7 + 0.3 * Math.sin(x * 0.4 + tt * 0.08 + s.h[0][2])
                      + 0.15 * Math.sin(x * 0.15 + tt * 0.04 + s.h[1][2])
      let y = 0
      for (let i = 0; i < s.h.length; i++) {
        const [k, a, phi, spd] = s.h[i]
        y += Math.sin(x * Math.PI * 2 * k - tt * spd + phi) * a
      }
      y += noise(x * 3.7 + tt * 0.12, s.h[0][2]) * 6
      y *= env
      y = y > 0 ? y * (1 + y * 0.006) : y * (1 - y * 0.003)
      return y
    }

    function drawPat(s: WaveSystem, w: number, h: number, tt: number) {
      const [r, g, b] = s.c
      const pa = 0.045 + Math.sin(tt * 0.4 + s.h[0][2]) * 0.015
      if (s.pat === 'circles') {
        for (let i = 0; i < 9; i++) {
          const cx = ((i / 9 + tt * 0.006) % 1) * w
          const bt = h * s.base + wy(s, cx / w, tt)
          const cy = bt + 35 + Math.sin(tt * 0.25 + i) * 18
          const rad = 10 + Math.sin(tt * 0.4 + i * 2) * 3
          ctx.strokeStyle = `rgba(${r},${g},${b},${pa})`
          ctx.lineWidth = 0.5
          ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(cx - 3, cy); ctx.lineTo(cx + 3, cy)
          ctx.moveTo(cx, cy - 3); ctx.lineTo(cx, cy + 3)
          ctx.stroke()
        }
      } else if (s.pat === 'stars') {
        for (let i = 0; i < 14; i++) {
          const cx = ((i * 0.071 + tt * 0.005) % 1) * w
          const bt = h * s.base + wy(s, cx / w, tt)
          const cy = bt + 25 + (i % 3) * 22 + Math.sin(tt * 0.35 + i) * 10
          const sz = 2.5 + Math.sin(tt * 0.5 + i * 1.5) * 1
          ctx.fillStyle = `rgba(${r},${g},${b},${pa * 1.3})`
          ctx.beginPath()
          for (let p = 0; p < 8; p++) {
            const a = (p / 8) * Math.PI * 2
            const d = p % 2 === 0 ? sz : sz * 0.35
            p === 0
              ? ctx.moveTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d)
              : ctx.lineTo(cx + Math.cos(a) * d, cy + Math.sin(a) * d)
          }
          ctx.closePath(); ctx.fill()
        }
      } else if (s.pat === 'dots') {
        for (let gx = 0; gx < 12; gx++) {
          const cx = ((gx / 12 + tt * 0.008) % 1) * w
          const bt = h * s.base + wy(s, cx / w, tt)
          for (let gy = 0; gy < 3; gy++) {
            const cy = bt + 20 + gy * 15
            const dc = ((gx + gy) % 4) + 1
            for (let d = 0; d < dc; d++) {
              ctx.fillStyle = `rgba(${r},${g},${b},${pa * 1.5})`
              ctx.beginPath()
              ctx.arc(cx - (dc - 1) * 3.5 + d * 7, cy, 1.8, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      } else if (s.pat === 'triangles') {
        for (let i = 0; i < 8; i++) {
          const cx = ((i * 0.125 + tt * 0.006) % 1) * w
          const bt = h * s.base + wy(s, cx / w, tt)
          const cy = bt + 30 + Math.sin(tt * 0.3 + i * 1.2) * 14
          const sz = 9 + Math.sin(tt * 0.45 + i) * 2.5
          ctx.strokeStyle = `rgba(${r},${g},${b},${pa})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(cx, cy - sz)
          ctx.lineTo(cx + sz * 0.866, cy + sz * 0.5)
          ctx.lineTo(cx - sz * 0.866, cy + sz * 0.5)
          ctx.closePath(); ctx.stroke()
        }
      } else if (s.pat === 'arcs') {
        for (let i = 0; i < 7; i++) {
          const cx = ((i * 0.14 + tt * 0.004) % 1) * w
          const bt = h * s.base + wy(s, cx / w, tt)
          const cy = bt + 28
          for (let a = 0; a < 3; a++) {
            const rad = 7 + a * 7 + Math.sin(tt * 0.35 + i) * 2.5
            ctx.strokeStyle = `rgba(${r},${g},${b},${pa * (1 - a * 0.25)})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.arc(cx, cy, rad, -Math.PI * 0.8, -Math.PI * 0.2)
            ctx.stroke()
          }
        }
      }
    }

    let t = 0
    let rafId: number

    function draw() {
      t += 0.018
      const w = canvas!.offsetWidth
      const h = canvas!.offsetHeight
      ctx.clearRect(0, 0, w, h)

      WAVE_SYSTEMS.forEach((s) => {
        const [r, g, b] = s.c
        ctx.save()
        ctx.beginPath(); ctx.moveTo(-4, h + 4)
        for (let px = -4; px <= w + 4; px += 2) {
          ctx.lineTo(px, h * s.base + wy(s, px / w, t))
        }
        ctx.lineTo(w + 4, h + 4); ctx.closePath()
        const topY = h * s.base - 60
        const grd = ctx.createLinearGradient(0, topY, 0, h)
        grd.addColorStop(0,    `rgba(${r},${g},${b},${s.fa * 2})`)
        grd.addColorStop(0.12, `rgba(${r},${g},${b},${s.fa})`)
        grd.addColorStop(0.4,  `rgba(${r},${g},${b},${s.fa * 0.5})`)
        grd.addColorStop(1,    `rgba(${r},${g},${b},${s.fa * 0.1})`)
        ctx.fillStyle = grd; ctx.fill()
        ctx.clip(); drawPat(s, w, h, t); ctx.restore()

        ctx.strokeStyle = `rgba(${r},${g},${b},${s.ea * 0.25})`
        ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.beginPath()
        for (let px = -4; px <= w + 4; px += 2) {
          const y = h * s.base + wy(s, px / w, t)
          px <= -2 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
        }
        ctx.stroke()

        ctx.strokeStyle = `rgba(${r},${g},${b},${s.ea})`; ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let px = -4; px <= w + 4; px += 2) {
          const y = h * s.base + wy(s, px / w, t)
          px <= -2 ? ctx.moveTo(px, y) : ctx.lineTo(px, y)
        }
        ctx.stroke()

        for (let sh = 0; sh < 4; sh++) {
          const sx = ((t * s.h[0][3] * 0.4 + sh * 0.25 + s.h[0][2] * 0.05) % 1.3) - 0.15
          if (sx < 0 || sx > 1) continue
          const px = sx * w; const py = h * s.base + wy(s, sx, t)
          const sg = ctx.createRadialGradient(px, py, 0, px, py, 20)
          sg.addColorStop(0, `rgba(${Math.min(255, r + 60)},${Math.min(255, g + 60)},${Math.min(255, b + 60)},0.2)`)
          sg.addColorStop(1, 'transparent')
          ctx.fillStyle = sg; ctx.fillRect(px - 20, py - 20, 40, 40)
        }
      })

      ctx.save(); ctx.globalCompositeOperation = 'screen'
      for (let px = 0; px < w; px += 3) {
        const xN = px / w
        const ys = WAVE_SYSTEMS.map((s) => h * s.base + wy(s, xN, t))
        for (let i = 0; i < ys.length; i++) {
          for (let j = i + 1; j < ys.length; j++) {
            const dist = Math.abs(ys[i] - ys[j])
            if (dist < 22) {
              const intensity = (22 - dist) / 22
              const midY = (ys[i] + ys[j]) / 2
              const ci = WAVE_SYSTEMS[i].c; const cj = WAVE_SYSTEMS[j].c
              const mr = Math.min(255, (ci[0] + cj[0]) / 2 + 50) | 0
              const mg = Math.min(255, (ci[1] + cj[1]) / 2 + 50) | 0
              const mb = Math.min(255, (ci[2] + cj[2]) / 2 + 50) | 0
              const pr = 6 + intensity * 24
              const pg = ctx.createRadialGradient(px, midY, 0, px, midY, pr)
              pg.addColorStop(0,   `rgba(${mr},${mg},${mb},${intensity * 0.3})`)
              pg.addColorStop(0.4, `rgba(${mr},${mg},${mb},${intensity * 0.1})`)
              pg.addColorStop(1,   'transparent')
              ctx.fillStyle = pg; ctx.fillRect(px - pr, midY - pr, pr * 2, pr * 2)
              if (dist < 5) {
                ctx.fillStyle = `rgba(255,255,255,${((5 - dist) / 5) * 0.65})`
                ctx.beginPath(); ctx.arc(px, midY, 1.5, 0, Math.PI * 2); ctx.fill()
              }
            }
          }
        }
      }
      ctx.restore()
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const sys = WAVE_SYSTEMS[legendIdx]

  return (
    <div className="lp-root relative">
      <div className="lp-nebula-1" />
      <div className="lp-nebula-2" />
      <div ref={starsRef} className="fixed inset-0 pointer-events-none z-0" />

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 28 28" className="lp-diamond-rotate">
            <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke="#C9A84C" strokeWidth="1.5" />
          </svg>
          <span className="lp-display text-xl tracking-wide" style={{ color: '#E5DDD0' }}>AstroSoul Navigator</span>
        </div>
        <a
          href="#pricing"
          className="hidden sm:block text-sm tracking-wider uppercase"
          style={{ color: 'rgba(201,168,76,0.7)', fontFamily: "'Outfit', sans-serif" }}
          onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) }}
        >
          Pricing
        </a>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-0 md:pt-20 md:pb-0 max-w-5xl mx-auto w-full">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25 pointer-events-none">
          <svg width="500" height="500" viewBox="0 0 500 500" className="lp-diamond-rotate" style={{ animationDuration: '90s' }}>
            <circle cx="250" cy="250" r="200" className="lp-chart-ring" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="160" className="lp-chart-ring-2" strokeWidth="0.5" />
            <circle cx="250" cy="250" r="120" className="lp-chart-ring-2" strokeWidth="0.3" />
            <line x1="250" y1="50" x2="250" y2="450" className="lp-chart-line" strokeWidth="0.3" />
            <line x1="50" y1="250" x2="450" y2="250" className="lp-chart-line" strokeWidth="0.3" />
            <circle cx="250" cy="50" r="3" className="lp-chart-dot" />
            <circle cx="450" cy="250" r="3" className="lp-chart-dot" />
            <circle cx="250" cy="450" r="3" className="lp-chart-dot" />
            <circle cx="50" cy="250" r="3" className="lp-chart-dot" />
          </svg>
        </div>
        <div className="relative mb-10">
          <svg width="80" height="80" viewBox="0 0 80 80" className="lp-diamond-rotate lp-float">
            <polygon points="40,4 76,40 40,76 4,40" fill="none" stroke="#C9A84C" strokeWidth="1.2" />
            <polygon points="40,16 64,40 40,64 16,40" fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth="0.8" />
          </svg>
          <div
            className="absolute inset-0 rounded-full lp-glow-intense"
            style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.25) 0%, transparent 70%)' }}
          />
        </div>
        <h1
          className="lp-display text-4xl sm:text-5xl md:text-7xl leading-tight tracking-tight mb-6 max-w-4xl"
          style={{ fontWeight: 300 }}
        >
          Explore Yourself Through<br />the Eyes of the <span className="lp-text-gold">Cosmos</span>
        </h1>
        <p className="text-base sm:text-lg mb-10 leading-relaxed max-w-2xl" style={{ color: 'rgba(229,221,208,0.6)', fontWeight: 200 }}>
          The cosmic mirror that shows who you truly are — not what will happen to you.
        </p>
        <button onClick={loginDemo} className="lp-cta px-10 py-4">
          Begin Your Free Exploration
        </button>
        <p className="mt-8 mb-14 text-xs" style={{ color: 'rgba(229,221,208,0.3)', fontWeight: 200, letterSpacing: '0.05em' }}>
          Already 12,847 people have looked into their cosmic mirror
        </p>
      </section>

      {/* ── Canvas ────────────────────────────────────────────── */}
      <div className="lp-resonance-wrap relative z-10">
        <canvas ref={canvasRef} />
        <div className="lp-resonance-legend">
          <div className="lp-legend-name" style={{ color: `rgba(${sys.c.join(',')},0.8)` }}>{sys.name}</div>
          <div className="lp-legend-sub">{sys.sub}</div>
        </div>
      </div>

      {/* ── Pain points ───────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20 md:py-28 max-w-6xl mx-auto w-full lp-reveal">
        <div className="text-center mb-16">
          <div className="lp-divider mx-auto mb-8" />
          <h2 className="lp-display text-3xl md:text-5xl mb-4" style={{ fontWeight: 300 }}>
            Tired of horoscopes that explain nothing?
          </h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: 'rgba(229,221,208,0.4)', fontWeight: 200 }}>
            Most astrology stays on the surface. You deserve depth.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Shallow Predictions', desc: 'Vague statements that could apply to anyone. No real self-knowledge, no transformation.' },
            { title: 'One-Time Readings',   desc: 'A static snapshot that collects dust. Your soul is dynamic — your mirror should be too.' },
            { title: 'Lack of Real Depth',  desc: 'Entertainment dressed as wisdom. No integration, no agency, no becoming.' },
          ].map((item) => (
            <div key={item.title} className="lp-glass rounded-2xl p-8 text-center">
              <div className="text-3xl mb-4" style={{ opacity: 0.4 }}>◯</div>
              <h3 className="lp-display text-lg mb-3" style={{ color: 'rgba(229,221,208,0.8)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(229,221,208,0.4)', fontWeight: 200 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20 md:py-28 max-w-6xl mx-auto w-full lp-reveal">
        <div className="text-center mb-16">
          <div className="lp-divider mx-auto mb-8" />
          <h2 className="lp-display text-3xl md:text-5xl" style={{ fontWeight: 300 }}>
            Astrology That Finally Helps You<br /><span className="lp-text-gold">See Yourself</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="lp-glass rounded-2xl p-8 md:p-10">
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'rgba(229,221,208,0.3)' }}>Old Astrology</p>
            <div className="space-y-5">
              {['"Be open to new opportunities"', '"Good energy this week"', '"Trust the universe"', 'One-size-fits-all', 'Zero personal agency'].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0" style={{ color: 'rgba(248,113,113,0.6)' }}>✕</span>
                  <p className="text-sm" style={{ color: 'rgba(229,221,208,0.4)', fontWeight: 200 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="lp-pricing-highlight rounded-2xl p-8 md:p-10">
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: 'rgba(201,168,76,0.5)' }}>AstroSoul Navigator</p>
            <div className="space-y-5">
              {[
                'Venus conjunct your natal Moon — the mirror shows what you truly value',
                'Saturn asks: is this structure serving your becoming?',
                'Here is the unconscious pattern — continue it, transform it, or transcend it',
                'All dimensions of your soul, integrated at once',
                'Always returns to: who are you becoming?',
              ].map((t) => (
                <div key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0" style={{ color: '#C9A84C' }}>◇</span>
                  <p className="text-sm" style={{ color: 'rgba(229,221,208,0.7)', fontWeight: 200 }}>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20 md:py-28 max-w-6xl mx-auto w-full lp-reveal">
        <div className="text-center mb-16">
          <div className="lp-divider mx-auto mb-8" />
          <h2 className="lp-display text-3xl md:text-5xl" style={{ fontWeight: 300 }}>
            Eight Dimensions of <span className="lp-text-gold">Seeing</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="lp-glass rounded-2xl p-6 transition-all duration-500">
              <Icon size={20} style={{ color: '#C9A84C', opacity: 0.6, marginBottom: '1rem' }} />
              <h3 className="lp-display text-base mb-2">{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(229,221,208,0.4)', fontWeight: 200 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20 md:py-28 max-w-5xl mx-auto w-full lp-reveal">
        <div className="text-center mb-16">
          <div className="lp-divider mx-auto mb-8" />
          <h2 className="lp-display text-3xl md:text-5xl" style={{ fontWeight: 300 }}>
            Three Steps to <span className="lp-text-gold">Clarity</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '01', title: 'Enter Your Birth Data', desc: 'Date, time, and place. The cosmos needs coordinates to show you your reflection.' },
            { n: '02', title: 'Receive Your Mirror',   desc: 'Your multidimensional soul map — patterns, tensions, gifts, and the questions only you can answer.' },
            { n: '03', title: 'Choose Consciously',    desc: 'Continue, transform, or transcend. The stars reflect — you decide.' },
          ].map(({ n, title, desc }) => (
            <div key={n} className="text-center">
              <div className="lp-display text-4xl mb-4" style={{ color: '#C9A84C', opacity: 0.4 }}>{n}</div>
              <h3 className="lp-display text-lg mb-3">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(229,221,208,0.4)', fontWeight: 200 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-20 md:py-28 max-w-6xl mx-auto w-full lp-reveal">
        <div className="text-center mb-16">
          <div className="lp-divider mx-auto mb-8" />
          <h2 className="lp-display text-3xl md:text-5xl" style={{ fontWeight: 300 }}>
            Reflections from the <span className="lp-text-gold">Mirror</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { q: '"For the first time, I didn\'t feel like astrology was telling me who I am. It was showing me — and asking what I want to do with what I see."', initial: 'M', name: 'Marina K.',  role: 'Contemplative practitioner' },
            { q: '"The pattern recognition showed me something I\'d been avoiding for years. Not as a judgment — as an invitation. That changed everything."',     initial: 'D', name: 'Daniel R.', role: 'Psychotherapist' },
            { q: '"I\'ve studied astrology for 15 years. This is the first tool that treats it as a mirror for consciousness — not a fortune cookie."',            initial: 'S', name: 'Sofia L.',  role: 'Astrologer & author' },
          ].map(({ q, initial, name, role }) => (
            <div key={name} className="lp-glass rounded-2xl p-8">
              <p className="text-sm leading-relaxed italic mb-6" style={{ color: 'rgba(229,221,208,0.5)', fontWeight: 200 }}>{q}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center lp-display text-xs"
                  style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
                >
                  {initial}
                </div>
                <div>
                  <p className="text-xs" style={{ color: 'rgba(229,221,208,0.6)' }}>{name}</p>
                  <p className="text-xs" style={{ color: 'rgba(229,221,208,0.3)' }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section id="pricing" className="relative z-10 px-6 py-20 md:py-28 max-w-5xl mx-auto w-full lp-reveal">
        <div className="text-center mb-16">
          <div className="lp-divider mx-auto mb-8" />
          <h2 className="lp-display text-3xl md:text-5xl" style={{ fontWeight: 300 }}>
            Look Into Your <span className="lp-text-gold">Mirror</span>
          </h2>
          <p className="text-sm mt-4 max-w-lg mx-auto" style={{ color: 'rgba(229,221,208,0.4)', fontWeight: 200 }}>
            Free will exists only when you know what you're choosing.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="lp-glass rounded-2xl p-8 md:p-10 flex flex-col">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(229,221,208,0.3)' }}>Explorer</p>
            <p className="lp-display text-3xl mb-1" style={{ fontWeight: 300 }}>Free Forever</p>
            <p className="text-xs mb-8" style={{ color: 'rgba(229,221,208,0.3)' }}>Begin seeing clearly</p>
            <ul className="space-y-3 mb-10 flex-1">
              {['Core natal chart mirror', 'Basic pattern recognition', 'Monthly cosmic reflections', 'Contemplative space'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(229,221,208,0.5)', fontWeight: 200 }}>
                  <span style={{ color: '#C9A84C', fontSize: '0.6rem' }}>◇</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={loginDemo} className="lp-cta-secondary">Start Free</button>
          </div>
          <div className="lp-pricing-highlight rounded-2xl p-8 md:p-10 flex flex-col">
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(201,168,76,0.5)' }}>Navigator Pro</p>
            <p className="lp-display text-3xl mb-1" style={{ fontWeight: 300 }}>
              <span className="lp-text-gold">$24.99</span>
              <span className="text-lg" style={{ color: 'rgba(229,221,208,0.4)' }}>/mo</span>
            </p>
            <p className="text-xs mb-8" style={{ color: 'rgba(229,221,208,0.3)' }}>The full cosmic mirror</p>
            <ul className="space-y-3 mb-10 flex-1">
              {['Everything in Explorer', 'Multidimensional integration', 'AI Navigator — contextual dialogue', 'Three Paths of Choice engine', 'Harmonic analysis', 'Soul Memory — evolving reflections'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(229,221,208,0.6)', fontWeight: 200 }}>
                  <span style={{ color: '#C9A84C', fontSize: '0.6rem' }}>◇</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={loginDemo} className="lp-cta py-3">Begin Your Journey</button>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section className="relative z-10 px-6 py-24 md:py-36 text-center max-w-4xl mx-auto w-full lp-reveal">
        <svg width="50" height="50" viewBox="0 0 50 50" className="lp-diamond-rotate mx-auto mb-8">
          <polygon points="25,3 47,25 25,47 3,25" fill="none" stroke="#C9A84C" strokeWidth="1" />
        </svg>
        <h2 className="lp-display text-3xl md:text-5xl mb-4" style={{ fontWeight: 300 }}>The Stars Don't Control You</h2>
        <p className="lp-display text-xl md:text-2xl italic mb-10" style={{ color: 'rgba(229,221,208,0.4)', fontWeight: 300 }}>
          They reflect you.
        </p>
        <button onClick={loginDemo} className="lp-cta px-12 py-4">Begin Your Free Exploration</button>
        <p className="mt-12 text-xs leading-relaxed max-w-md mx-auto" style={{ color: 'rgba(229,221,208,0.2)', fontWeight: 200 }}>
          Once you see the pattern, you can continue it, transform it, or transcend it.
        </p>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer
        className="relative z-10 px-6 py-12 max-w-6xl mx-auto w-full"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="#C9A84C" strokeWidth="0.8" />
            </svg>
            <span className="lp-display text-sm" style={{ color: 'rgba(229,221,208,0.3)' }}>AstroSoul Navigator</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(229,221,208,0.2)', fontWeight: 200 }}>© 2026 AstroSoul Navigator</p>
        </div>
      </footer>
    </div>
  )
}
