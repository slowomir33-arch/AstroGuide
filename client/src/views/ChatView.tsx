import { useEffect, useMemo, useRef, useState } from 'react'
import { useAppStore, type AnalysisMode } from '../store/appStore'

export function ChatView() {
  const profileId = useAppStore((s) => s.activeProfileId)
  const conversations = useAppStore((s) => s.conversations)
  const activeId = useAppStore((s) => s.activeConversationId)
  const appendMessage = useAppStore((s) => s.appendMessage)
  const updateConversation = useAppStore((s) => s.updateConversation)
  const setTab = useAppStore((s) => s.setMainTab)
  const dayAnalysisDate = useAppStore((s) => s.dayAnalysisDate)

  const conv = useMemo(
    () => conversations.find((c) => c.id === activeId && c.profileId === profileId),
    [conversations, activeId, profileId],
  )

  const [draft, setDraft] = useState('')
  const [mode, setMode] = useState<AnalysisMode>(conv?.analysisMode ?? 'quick')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conv) setMode(conv.analysisMode)
  }, [conv?.analysisMode, conv?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conv?.messages.length])

  if (!profileId) {
    return (
      <div className="pb-28 pt-8 text-center text-sm text-zinc-500">Wybierz profil, aby rozmawiać.</div>
    )
  }

  if (!conv) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 pb-28 pt-16 text-center">
        <p className="max-w-xs text-sm text-zinc-500">Brak aktywnej rozmowy.</p>
        <button
          type="button"
          onClick={() => setTab('conversations')}
          className="rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#d4a853] px-5 py-2.5 text-sm font-semibold text-[#0c0a12]"
        >
          Wybierz lub utwórz wątek
        </button>
      </div>
    )
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    appendMessage(conv.id, { role: 'user', content: text })
    setDraft('')
    const echo =
      mode === 'deep'
        ? `(Głęboka analiza) Model zintegruje astrologię, numerologię, tarot i historię profilu. Twoja intencja:\n«${text}»\n\n— Tu pojawi się odpowiedź API (embeddingi + RAG po historii).\n\nKontekst analizy dnia: ${dayAnalysisDate}.`
        : `(Szybkie omówienie) Skrót perspektyw dla:\n«${text}»\n\n— Tu pojawi się odpowiedź API.\n\nKontekst analizy dnia: ${dayAnalysisDate}.`
    window.setTimeout(() => {
      appendMessage(conv.id, { role: 'assistant', content: echo })
    }, 400)
  }

  const changeMode = (m: AnalysisMode) => {
    setMode(m)
    updateConversation(conv.id, { analysisMode: m })
  }

  return (
    <div className="flex h-full min-h-0 flex-col pb-36 pt-2">
      <header className="shrink-0 border-b border-white/[0.06] px-1 pb-3">
        <button
          type="button"
          onClick={() => setTab('conversations')}
          className="text-xs font-semibold text-[#d4a853] hover:underline"
        >
          ← Konwersacje
        </button>
        <h1 className="mt-1 truncate font-serif text-xl font-light text-white">{conv.title}</h1>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4 pr-1">
        {conv.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-auto bg-[#7c5cff]/25 text-zinc-100'
                : 'border border-white/[0.06] bg-white/[0.04] text-zinc-200'
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 px-3 sm:left-56 sm:px-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0c0a12]/95 p-2 shadow-[0_16px_48px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="mb-2 flex gap-1 rounded-xl bg-black/40 p-1">
            <button
              type="button"
              onClick={() => changeMode('quick')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                mode === 'quick'
                  ? 'bg-[#d4a853]/20 text-[#f3e5c5]'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Szybkie omówienie
            </button>
            <button
              type="button"
              onClick={() => changeMode('deep')}
              className={`flex-1 rounded-lg py-2 text-xs font-bold ${
                mode === 'deep'
                  ? 'bg-[#7c5cff]/25 text-violet-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
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
              placeholder="Zapytaj model…"
              className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#d4a853]/40"
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
      </div>
    </div>
  )
}
