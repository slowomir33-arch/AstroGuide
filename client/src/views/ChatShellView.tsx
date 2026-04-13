import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { useAppStore, type AnalysisMode } from '../store/appStore'

function baselineSnippet(profileId: string): string {
  const m = useAppStore
    .getState()
    .materials.find((x) => x.profileId === profileId && x.kind === 'baseline_md')
  if (!m) return '(brak jeszcze bazy Markdown — uruchom analizę profilu.)'
  return m.content.slice(0, 420).trim() + (m.content.length > 420 ? '…' : '')
}

export function ChatShellView() {
  const profileId = useAppStore((s) => s.activeProfileId)
  const profile = useAppStore((s) => s.profiles.find((p) => p.id === profileId))
  const conversations = useAppStore((s) => s.conversations)
  const activeId = useAppStore((s) => s.activeConversationId)
  const appendMessage = useAppStore((s) => s.appendMessage)
  const updateConversation = useAppStore((s) => s.updateConversation)
  const addConversation = useAppStore((s) => s.addConversation)
  const setActiveConversation = useAppStore((s) => s.setActiveConversationId)
  const dayAnalysisDate = useAppStore((s) => s.dayAnalysisDate)

  const list = useMemo(
    () => conversations.filter((c) => c.profileId === profileId),
    [conversations, profileId],
  )

  const conv = useMemo(
    () => conversations.find((c) => c.id === activeId && c.profileId === profileId),
    [conversations, activeId, profileId],
  )

  const [draft, setDraft] = useState('')
  const [mode, setMode] = useState<AnalysisMode>(conv?.analysisMode ?? 'quick')
  const [mobileList, setMobileList] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conv) setMode(conv.analysisMode)
  }, [conv?.analysisMode, conv?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages.length])

  useEffect(() => {
    if (activeId) setMobileList(false)
  }, [activeId])

  const startNew = () => {
    if (!profileId) return
    const id = addConversation({
      profileId,
      title: 'Nowa rozmowa',
      analysisMode: 'quick',
    })
    setActiveConversation(id)
    setMobileList(false)
  }

  const send = () => {
    if (!conv || !profileId) return
    const text = draft.trim()
    if (!text) return
    appendMessage(conv.id, { role: 'user', content: text })
    setDraft('')
    const base = baselineSnippet(profileId)
    const echo =
      mode === 'deep'
        ? `(Głęboka analiza — placeholder API)\n\n**Pytanie:** «${text}»\n\n**Skrót z bazy wiedzy profilu:** ${profile?.name ?? '—'}\n${base}\n\n— Tu trafi pełna odpowiedź modelu z RAG (historia + JSON/MD + tranzyty). Dzień kontekstu: ${dayAnalysisDate}.`
        : `(Szybkie omówienie — placeholder API)\n\n**Pytanie:** «${text}»\n\n**Z bazy:** ${base.slice(0, 280)}…\n\n— Krótka odpowiedź API. Dzień: ${dayAnalysisDate}.`
    window.setTimeout(() => {
      appendMessage(conv.id, { role: 'assistant', content: echo })
    }, 450)
  }

  const changeMode = (m: AnalysisMode) => {
    setMode(m)
    if (conv) updateConversation(conv.id, { analysisMode: m })
  }

  if (!profileId) {
    return (
      <div className="flex flex-1 items-center justify-center pb-24 text-sm text-zinc-500">
        Wybierz profil w panelu bocznym.
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[320px] flex-1 flex-col gap-0 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#08060f]/90 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] md:h-[calc(100dvh-5rem)] md:flex-row">
      {/* Lista wątków */}
      <aside
        className={clsx(
          'flex w-full shrink-0 flex-col border-white/[0.06] bg-black/20 md:w-[min(100%,280px)] md:border-r',
          mobileList ? 'flex' : 'hidden md:flex',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Konwersacje
          </span>
          <button
            type="button"
            onClick={startNew}
            className="rounded-lg bg-gradient-to-r from-[#7c5cff] to-[#d4a853] px-2.5 py-1 text-[11px] font-bold text-[#0c0a12]"
          >
            + Nowa
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {list.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-zinc-500">
              Brak wątków — utwórz pierwszą rozmowę.
            </p>
          ) : (
            list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setActiveConversation(c.id)
                  setMobileList(false)
                }}
                className={clsx(
                  'w-full rounded-xl border px-3 py-2.5 text-left text-sm transition',
                  c.id === activeId
                    ? 'border-[#d4a853]/40 bg-[#d4a853]/10 text-white'
                    : 'border-transparent bg-white/[0.03] text-zinc-300 hover:border-white/10',
                )}
              >
                <span className="line-clamp-2 font-medium">{c.title}</span>
                <span className="mt-1 block text-[10px] text-zinc-500">
                  {c.analysisMode === 'deep' ? 'Głęboka' : 'Szybka'} ·{' '}
                  {new Date(c.updatedAt).toLocaleDateString('pl-PL')}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Okno czatu */}
      <section
        className={clsx(
          'relative flex min-h-0 min-w-0 flex-1 flex-col',
          !mobileList || activeId ? 'flex' : 'hidden md:flex',
        )}
      >
        {!conv ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-serif text-lg text-zinc-300">Wybierz wątek lub utwórz nowy</p>
            <p className="max-w-sm text-sm text-zinc-500">
              Tak jak w innych czatach z AI — pytasz o horoskop, tranzyty, numerologię; model
              korzysta z bazy wiedzy profilu {profile?.name ? `„${profile.name}”` : ''}.
            </p>
            <button
              type="button"
              onClick={startNew}
              className="rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#d4a853] px-6 py-2.5 text-sm font-bold text-[#0c0a12]"
            >
              Nowa rozmowa
            </button>
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2">
              <button
                type="button"
                className="rounded-lg p-2 text-zinc-400 md:hidden"
                aria-label="Lista wątków"
                onClick={() => setMobileList(true)}
              >
                ☰
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-serif text-lg font-light text-white">{conv.title}</h1>
                <p className="truncate text-[11px] text-zinc-500">
                  Baza wiedzy profilu · {profile?.baselineCompletedAt ? 'aktywna' : 'oczekuje analizy'}
                </p>
              </div>
            </header>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {conv.messages.map((m) => (
                <div
                  key={m.id}
                  className={clsx(
                    'max-w-[min(92%,720px)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'ml-auto bg-[#7c5cff]/22 text-zinc-100'
                      : 'border border-white/[0.06] bg-white/[0.04] text-zinc-200',
                  )}
                >
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 border-t border-white/[0.06] bg-[#0c0a12]/95 p-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
              <div className="mb-2 flex gap-1 rounded-xl bg-black/40 p-1">
                <button
                  type="button"
                  onClick={() => changeMode('quick')}
                  className={clsx(
                    'flex-1 rounded-lg py-2 text-xs font-bold',
                    mode === 'quick'
                      ? 'bg-[#d4a853]/20 text-[#f3e5c5]'
                      : 'text-zinc-500 hover:text-zinc-300',
                  )}
                >
                  Szybkie omówienie
                </button>
                <button
                  type="button"
                  onClick={() => changeMode('deep')}
                  className={clsx(
                    'flex-1 rounded-lg py-2 text-xs font-bold',
                    mode === 'deep'
                      ? 'bg-[#7c5cff]/25 text-violet-100'
                      : 'text-zinc-500 hover:text-zinc-300',
                  )}
                >
                  Głęboka analiza
                </button>
              </div>
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  rows={2}
                  placeholder="Napisz wiadomość…"
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#d4a853]/40"
                />
                <button
                  type="button"
                  onClick={send}
                  className="mb-0.5 shrink-0 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#d4a853] px-4 py-2 text-sm font-bold text-[#0c0a12]"
                >
                  Wyślij
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
