import { motion } from 'framer-motion'
import clsx from 'clsx'
import { useAppStore, type MainTab } from '../store/appStore'

const nav: { id: MainTab; label: string; icon: string }[] = [
  { id: 'day', label: 'Analiza dnia', icon: '◈' },
  { id: 'conversations', label: 'Konwersacje', icon: '☍' },
  { id: 'materials', label: 'Materiały', icon: '▤' },
]

type SidebarProps = {
  onOpenJournal: () => void
  onOpenProfiles: () => void
}

export function Sidebar({ onOpenJournal, onOpenProfiles }: SidebarProps) {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggle = useAppStore((s) => s.toggleSidebar)
  const tab = useAppStore((s) => s.mainTab)
  const setTab = useAppStore((s) => s.setMainTab)
  const profiles = useAppStore((s) => s.profiles)
  const activeId = useAppStore((s) => s.activeProfileId)
  const active = profiles.find((p) => p.id === activeId)

  return (
    <motion.aside
      layout
      className="flex h-full shrink-0 flex-col border-r border-white/[0.08] bg-[#0a0710]/80 backdrop-blur-xl"
      style={{ width: collapsed ? 56 : 248 }}
      transition={{ type: 'spring', stiffness: 420, damping: 38 }}
    >
      <div className="flex items-center gap-1 px-1.5 pt-3">
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-white/5 hover:text-white"
          aria-label={collapsed ? 'Rozwiń panel' : 'Zwiń panel'}
          title={collapsed ? 'Rozwiń' : 'Zwiń'}
        >
          <span className="text-lg">{collapsed ? '⟩' : '⟨'}</span>
        </button>
        {!collapsed ? (
          <span className="truncate text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            AstroGuide
          </span>
        ) : null}
      </div>

      <div className="px-2 pt-2">
        <button
          type="button"
          onClick={onOpenProfiles}
          className={clsx(
            'flex w-full items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-left transition hover:border-[#d4a853]/35 hover:bg-white/[0.05]',
            collapsed && 'justify-center px-0',
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff]/80 to-[#d4a853]/50 text-sm font-semibold text-white">
            {(active?.name ?? '?').slice(0, 1).toUpperCase()}
          </span>
          {!collapsed ? (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-white">
                {active?.name ?? 'Wybierz profil'}
              </span>
              <span className="block truncate text-[11px] text-zinc-500">Profil aktywny</span>
            </span>
          ) : null}
          {!collapsed ? <span className="text-zinc-500">▾</span> : null}
        </button>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-0.5 px-2">
        {nav.map((item) => {
          const selected = tab === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left text-sm transition',
                selected
                  ? 'bg-[#d4a853]/12 text-[#f3e5c5]'
                  : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200',
                collapsed && 'justify-center px-0',
              )}
            >
              <span className="w-6 text-center text-base opacity-80">{item.icon}</span>
              {!collapsed ? <span className="truncate font-medium">{item.label}</span> : null}
            </button>
          )
        })}
      </nav>

      <div className="px-2 pb-3 pt-2">
        <button
          type="button"
          onClick={onOpenJournal}
          className={clsx(
            'group relative w-full overflow-hidden rounded-2xl border border-[#d4a853]/35 bg-gradient-to-br from-[#d4a853]/20 via-[#7c5cff]/15 to-[#2fd4a3]/10 px-3 py-3 text-left shadow-[0_0_40px_rgba(212,168,83,0.12)] transition hover:border-[#d4a853]/55',
            collapsed && 'px-0 py-3 text-center',
          )}
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div className="absolute -left-1/2 top-0 h-full w-full rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
          {!collapsed ? (
            <>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4a853]/90">
                Dziennik
              </div>
              <div className="mt-1 text-sm font-semibold text-white">Podsumowanie dnia</div>
              <div className="mt-0.5 text-[11px] leading-snug text-zinc-400">
                Rozmowy, materiały, odniesienia między wątkami
              </div>
            </>
          ) : (
            <span className="text-xl" title="Dziennik">
              📓
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
