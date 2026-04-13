import { useState } from 'react'
import { Modal } from './Modal'
import { useAppStore } from '../store/appStore'
import type { PlanTier } from '../store/appStore'

type Props = { open: boolean; onClose: () => void; onOpenLlmAdmin?: () => void }

export function AccountModal({ open, onClose, onOpenLlmAdmin }: Props) {
  const account = useAppStore((s) => s.account)
  const updateAccount = useAppStore((s) => s.updateAccount)
  const profiles = useAppStore((s) => s.profiles)
  const updateProfile = useAppStore((s) => s.updateProfile)
  const removeProfile = useAppStore((s) => s.removeProfile)
  const logout = useAppStore((s) => s.logout)

  const [name, setName] = useState(account.displayName)
  const [email, setEmail] = useState(account.email)

  const saveAccount = () => {
    updateAccount({ displayName: name.trim() || account.displayName, email: email.trim() || account.email })
  }

  return (
    <Modal open={open} onClose={onClose} title="Konto">
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Edycja konta</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveAccount}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-[#d4a853]/45"
          placeholder="Wyświetlana nazwa"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={saveAccount}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm outline-none focus:border-[#d4a853]/45"
          placeholder="E-mail"
        />
      </section>

      <section className="mt-6 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Profile</h3>
        <ul className="space-y-2">
          {profiles.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 py-2"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <input
                defaultValue={p.name}
                key={p.id + p.name}
                onBlur={(e) => updateProfile(p.id, { name: e.target.value.trim() || p.name })}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
              />
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-white"
                title="Usuń"
                onClick={() => {
                  if (confirm(`Usunąć profil „${p.name}”?`)) removeProfile(p.id)
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      {onOpenLlmAdmin ? (
        <section className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Administrator</h3>
          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenLlmAdmin()
            }}
            className="mt-2 w-full rounded-xl border border-[#7c5cff]/35 bg-[#7c5cff]/10 py-3 text-sm font-semibold text-violet-200 transition hover:border-[#7c5cff]/50 hover:bg-[#7c5cff]/15"
          >
            Panel API modeli (LLM)
          </button>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-white/[0.07] bg-black/25 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Subskrypcja</h3>
        <p className="mt-2 text-sm text-zinc-300">
          Plan <span className="font-semibold text-[#d4a853]">{account.plan}</span> — rozliczenie
          enterprise, limity zapytań i retencja historii zgodnie z umową.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(['Orbit', 'Nebula', 'Cosmos'] as PlanTier[]).map((pl) => (
            <button
              key={pl}
              type="button"
              onClick={() => updateAccount({ plan: pl })}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                account.plan === pl
                  ? 'border-[#d4a853]/50 bg-[#d4a853]/15 text-[#f3e5c5]'
                  : 'border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              {pl}
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
          logout()
          onClose()
        }}
        className="mt-6 w-full rounded-xl border border-red-500/30 py-3 text-sm font-semibold text-red-300/90 hover:bg-red-500/10"
      >
        Wyloguj
      </button>
    </Modal>
  )
}
