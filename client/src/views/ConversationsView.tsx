import { useAppStore } from '../store/appStore'

export function ConversationsView() {
  const profileId = useAppStore((s) => s.activeProfileId)
  const list = useAppStore((s) => s.conversations.filter((c) => c.profileId === profileId))
  const addConversation = useAppStore((s) => s.addConversation)
  const setTab = useAppStore((s) => s.setMainTab)
  const setActiveConversation = useAppStore((s) => s.setActiveConversationId)

  const startNew = () => {
    if (!profileId) return
    const id = addConversation({
      profileId,
      title: 'Nowa rozmowa',
      analysisMode: 'quick',
    })
    setActiveConversation(id)
    setTab('chat')
  }

  return (
    <div className="pb-28 pt-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4a853]/80">
            Konwersacje
          </p>
          <h1 className="mt-1 font-serif text-2xl font-light text-white">Wątki profilu</h1>
        </div>
        <button
          type="button"
          onClick={startNew}
          disabled={!profileId}
          className="shrink-0 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#d4a853] px-4 py-2 text-xs font-bold text-[#0c0a12] disabled:opacity-40"
        >
          Nowa
        </button>
      </div>

      {!profileId ? (
        <p className="mt-6 text-sm text-zinc-500">Wybierz profil.</p>
      ) : list.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Brak rozmów — utwórz pierwszą.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  setActiveConversation(c.id)
                  setTab('chat')
                }}
                className="flex w-full flex-col rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-left transition hover:border-[#7c5cff]/35"
              >
                <span className="font-medium text-white">{c.title}</span>
                <span className="mt-1 text-xs text-zinc-500">
                  {c.analysisMode === 'deep' ? 'Głęboka analiza' : 'Szybkie omówienie'} ·{' '}
                  {new Date(c.updatedAt).toLocaleString('pl-PL')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
