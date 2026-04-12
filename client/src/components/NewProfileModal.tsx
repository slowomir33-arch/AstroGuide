import { useState } from 'react'
import { Modal } from './Modal'
import { useAppStore } from '../store/appStore'

type Props = { open: boolean; onClose: () => void }

export function NewProfileModal({ open, onClose }: Props) {
  const addProfile = useAppStore((s) => s.addProfile)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [birthTime, setBirthTime] = useState('')
  const [birthPlace, setBirthPlace] = useState('')

  const submit = () => {
    const n = name.trim() || 'Nowy profil'
    addProfile({ name: n, birthDate: birthDate || undefined, birthTime: birthTime || undefined, birthPlace: birthPlace || undefined })
    setName('')
    setBirthDate('')
    setBirthTime('')
    setBirthPlace('')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nowy profil">
      <div className="space-y-3">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Nazwa
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none ring-0 focus:border-[#d4a853]/45"
            placeholder="np. Ja · praca · partner"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Data urodzenia
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d4a853]/45"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Godzina
          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d4a853]/45"
          />
        </label>
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Miejsce
          <input
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d4a853]/45"
            placeholder="Miasto, kraj"
          />
        </label>
        <p className="text-[11px] leading-relaxed text-zinc-500">
          Profil jest kontekstem dla modelu: historia, embeddingi i materiały są rozdzielane per profil.
        </p>
        <button
          type="button"
          onClick={submit}
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#d4a853] py-3 text-sm font-semibold text-[#0c0a12]"
        >
          Utwórz profil
        </button>
      </div>
    </Modal>
  )
}
