import { Modal } from './Modal'
import { useAppStore } from '../store/appStore'
import clsx from 'clsx'

type Props = { open: boolean; onClose: () => void }

export function ProfilePickerModal({ open, onClose }: Props) {
  const profiles = useAppStore((s) => s.profiles)
  const activeId = useAppStore((s) => s.activeProfileId)
  const setActive = useAppStore((s) => s.setActiveProfileId)

  return (
    <Modal open={open} onClose={onClose} title="Profile">
      <ul className="space-y-1">
        {profiles.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => {
                setActive(p.id)
                onClose()
              }}
              className={clsx(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition',
                p.id === activeId
                  ? 'bg-[#d4a853]/15 ring-1 ring-[#d4a853]/35'
                  : 'hover:bg-white/[0.04]',
              )}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-white">{p.name}</span>
                <span className="block truncate text-xs text-zinc-500">
                  {[p.birthDate, p.birthPlace].filter(Boolean).join(' · ') || 'Uzupełnij dane urodzenia'}
                </span>
              </span>
              {p.id === activeId ? (
                <span className="text-xs font-semibold text-[#d4a853]">Aktywny</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
