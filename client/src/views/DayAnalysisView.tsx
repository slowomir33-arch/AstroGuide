import { useAppStore } from '../store/appStore'
import CosmicAnalysisEngine from '../features/cosmic/CosmicAnalysisEngine.jsx'
import { DayChartsPanel } from '../components/DayChartsPanel'

export function DayAnalysisView() {
  const dayAnalysisDate = useAppStore((s) => s.dayAnalysisDate)
  const setDayAnalysisDate = useAppStore((s) => s.setDayAnalysisDate)
  const profile = useAppStore((s) => s.profiles.find((p) => p.id === s.activeProfileId))
  const activeProfileId = useAppStore((s) => s.activeProfileId)

  return (
    <div className="pb-28 pt-4">
      <header className="px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4a853]/80">
          Analiza dnia
        </p>
        <h1 className="mt-1 font-serif text-2xl font-light text-white">Kosmos w ogniu danych</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-zinc-400">
          Wykresy dla wybranej daty (placeholder pod tranzyty) oraz mapa referencyjna (LOGOS-44).
          Pełna personalizacja: model + efemerydy względem karty profilu.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Data analizy
            <input
              type="date"
              value={dayAnalysisDate}
              onChange={(e) => setDayAnalysisDate(e.target.value)}
              className="ml-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#d4a853]/45"
            />
          </label>
          {profile ? (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400">
              Profil: <span className="font-medium text-zinc-200">{profile.name}</span>
            </span>
          ) : null}
        </div>
      </header>

      <div className="mt-6">
        <DayChartsPanel dateStr={dayAnalysisDate} profileId={activeProfileId} />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-black/20 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
        <div className="border-b border-white/[0.06] bg-gradient-to-r from-[#7c5cff]/10 to-[#d4a853]/10 px-4 py-3 text-center text-xs text-zinc-400">
          Mapa referencyjna (LOGOS-44) — warstwa wizualna jak w{' '}
          <code className="text-[#d4a853]">cosmic_analysis_engine.jsx</code>
          <span className="mx-1 text-zinc-600">·</span>
          <span className="text-zinc-500">Data kontekstu: {dayAnalysisDate}</span>
        </div>
        <div className="cosmic-host max-h-[min(70vh,820px)] overflow-y-auto overflow-x-hidden">
          <CosmicAnalysisEngine />
        </div>
      </div>
    </div>
  )
}
