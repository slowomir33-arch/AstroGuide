import clsx from 'clsx'
import { useAppStore } from '../store/appStore'

type BottomDockProps = {
  onNewProfile: () => void
  onAccount: () => void
}

export function BottomDock({ onNewProfile, onAccount }: BottomDockProps) {
  const account = useAppStore((s) => s.account)
  const session = useAppStore((s) => s.sessionActive)

  return (
    <footer className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
      <div
        className={clsx(
          'pointer-events-auto flex w-full max-w-md items-stretch gap-2 rounded-2xl border border-white/[0.08] bg-[#0c0a12]/90 p-2 shadow-[0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl',
          !session && 'opacity-60',
        )}
      >
        <button
          type="button"
          onClick={onNewProfile}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5 text-sm font-semibold text-white transition hover:border-[#7c5cff]/40 hover:bg-white/[0.07]"
        >
          <span className="text-base">＋</span>
          <span>Nowy profil</span>
        </button>
        <button
          type="button"
          onClick={onAccount}
          className="flex min-w-0 flex-[1.15] items-center gap-2 rounded-xl border border-white/[0.06] bg-gradient-to-r from-white/[0.06] to-white/[0.02] px-3 py-2 text-left transition hover:border-[#d4a853]/35"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#7c5cff] to-[#d4a853] text-xs font-bold text-white">
            {account.avatarDataUrl ? (
              <img src={account.avatarDataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              account.displayName.slice(0, 1).toUpperCase()
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">
              {account.displayName}
            </span>
            <span className="block truncate text-[11px] text-zinc-500">
              Plan {account.plan} · Ustawienia
            </span>
          </span>
          <span className="shrink-0 text-zinc-500">⚙</span>
        </button>
      </div>
    </footer>
  )
}
