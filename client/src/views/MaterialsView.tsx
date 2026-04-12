import { useAppStore } from '../store/appStore'

function downloadMaterial(title: string, mime: string, content: string) {
  const ext = mime.includes('svg') ? 'svg' : mime.includes('json') ? 'json' : 'txt'
  const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/\s+/g, '_')}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

export function MaterialsView() {
  const profileId = useAppStore((s) => s.activeProfileId)
  const materials = useAppStore((s) => s.materials.filter((m) => m.profileId === profileId))
  const addMaterial = useAppStore((s) => s.addMaterial)
  const removeMaterial = useAppStore((s) => s.removeMaterial)

  const seedDemo = () => {
    if (!profileId) return
    addMaterial({
      profileId,
      title: 'Przykładowy wykres (SVG)',
      kind: 'chart',
      mime: 'image/svg+xml',
      content:
        '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="120" viewBox="0 0 320 120"><defs><linearGradient id="g" x1="0" x2="1"><stop stop-color="#7c5cff"/><stop offset="1" stop-color="#d4a853"/></linearGradient></defs><rect width="320" height="120" rx="16" fill="#0c0a12"/><text x="24" y="40" fill="#e8e4f2" font-size="16" font-family="system-ui">Materiał zapisany w historii profilu</text><rect x="24" y="56" width="272" height="40" rx="10" fill="url(#g)" opacity="0.35"/></svg>',
    })
  }

  return (
    <div className="pb-28 pt-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4a853]/80">
            Materiały
          </p>
          <h1 className="mt-1 font-serif text-2xl font-light text-white">Wykresy i tabele</h1>
          <p className="mt-2 max-w-prose text-sm text-zinc-500">
            Zapisane artefakty z modelu (eksport, podgląd, powiązanie z rozmową).
          </p>
        </div>
        <button
          type="button"
          onClick={seedDemo}
          disabled={!profileId}
          className="shrink-0 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-white/5 disabled:opacity-40"
        >
          Demo
        </button>
      </div>

      {!profileId ? (
        <p className="mt-6 text-sm text-zinc-500">Wybierz profil.</p>
      ) : materials.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Brak materiałów — dodaj demo lub zapisz z czatu (API modelu).</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {materials.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-white">{m.title}</div>
                <div className="text-xs text-zinc-500">
                  {m.kind} · {new Date(m.createdAt).toLocaleString('pl-PL')}
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => downloadMaterial(m.title, m.mime, m.content)}
                  className="rounded-lg border border-[#d4a853]/35 px-2 py-1 text-xs font-semibold text-[#d4a853] hover:bg-[#d4a853]/10"
                >
                  Pobierz
                </button>
                <button
                  type="button"
                  onClick={() => removeMaterial(m.id)}
                  className="rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-white/5 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
