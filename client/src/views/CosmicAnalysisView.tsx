import './CosmicAnalysisView.css'
import { useState, useEffect, useRef } from 'react'
import { format, getWeek, parseISO } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useAppStore } from '../store/appStore'

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
  const profiles        = useAppStore((s) => s.profiles)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
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
      {/* Profile dropdown */}
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

      {/* Date picker — visually styled label, hidden native input */}
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

      {/* Week info */}
      <span className="cosmic-header__week-info">
        {getDayName(dayAnalysisDate)} · Tydzień {getWeekNumber(dayAnalysisDate)}
      </span>
    </header>
  )
}

// ── Planet dot data ───────────────────────────────────────
const PLANET_DOTS = [
  { color: '#F59E0B', label: '☉', top: '10%', left: '62%' },
  { color: '#C0C9D6', label: '☽', top: '22%', left: '78%' },
  { color: '#F472B6', label: '♀', top: '55%', left: '94%' },
  { color: '#EF4444', label: '♂', top: '75%', left: '85%' },
  { color: '#818CF8', label: '♃', top: '88%', left: '52%' },
  { color: '#A8A29E', label: '♄', top: '75%', left: '22%' },
  { color: '#22D3EE', label: '♅', top: '50%', left: '5%'  },
  { color: '#6EE7B7', label: '☿', top: '28%', left: '12%' },
] as const

// ── ChartPanel ────────────────────────────────────────────
function ChartPanel() {
  return (
    <div className="cosmic-chart-panel">
      <div className="cosmic-chart-ring">
        {PLANET_DOTS.map((dot) => (
          <span
            key={dot.label}
            className="cosmic-planet-dot"
            style={{
              top: dot.top,
              left: dot.left,
              background: dot.color,
              boxShadow: `0 0 6px ${dot.color}`,
            }}
            aria-label={dot.label}
          />
        ))}
        <div className="cosmic-chart-ring__mid">
          <div className="cosmic-chart-ring__inner">
            <span className="cosmic-chart-ring__center-label">
              ASTRO<br />CHART
            </span>
          </div>
        </div>
      </div>
      <p className="cosmic-chart-caption">interaktywne · obracalne · klik = detail</p>
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

  return (
    <div className="cosmic-root">
      <CosmicHeader />
      <div className="cosmic-body">
        <ChartPanel />
        <DashboardPanel dateStr={dayAnalysisDate} />
      </div>
      <TalkButton />
    </div>
  )
}
