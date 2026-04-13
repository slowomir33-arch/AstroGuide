import { useMemo, useState, useCallback, useEffect } from 'react'
import { Modal } from './Modal'
import { useAppStore } from '../store/appStore'
import { buildJournalBundle } from '../lib/journal'
import { ConversationPopup } from './ConversationPopup'
import type { Conversation } from '../store/appStore'

type Props = {
  open: boolean
  onClose: () => void
  onGoConversation: (id: string) => void
}

export function JournalModal({ open, onClose, onGoConversation }: Props) {
  const profileId = useAppStore((s) => s.activeProfileId)
  const conversations = useAppStore((s) => s.conversations)
  const materials = useAppStore((s) => s.materials)
  const journalEntries = useAppStore((s) => s.journalEntries)
  const defaultDate = useAppStore((s) => s.dayAnalysisDate)
  const generateJournalEntryForDay = useAppStore((s) => s.generateJournalEntryForDay)

  const [date, setDate] = useState(defaultDate)
  const [peek, setPeek] = useState<Conversation | null>(null)

  useEffect(() => {
    if (open) setDate(defaultDate)
  }, [open, defaultDate])

  const aiEntry = useMemo(() => {
    if (!profileId) return null
    return journalEntries.find((e) => e.profileId === profileId && e.date === date) ?? null
  }, [profileId, date, journalEntries])

  const bundle = useMemo(() => {
    if (!profileId) return null
    return buildJournalBundle(profileId, date, conversations, materials)
  }, [profileId, date, conversations, materials])

  const download = useCallback((title: string, mime: string, content: string) => {
    const ext = mime.includes('svg') ? 'svg' : mime.includes('json') ? 'json' : 'txt'
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  const refreshAi = () => {
    if (profileId) generateJournalEntryForDay(profileId, date)
  }

  useEffect(() => {
    if (!open || !profileId) return
    const exists = useAppStore
      .getState()
      .journalEntries.some((e) => e.profileId === profileId && e.date === date)
    if (!exists) generateJournalEntryForDay(profileId, date)
  }, [open, profileId, date, generateJournalEntryForDay])

  return (
    <>
      <Modal open={open} onClose={onClose} title="Dziennik">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Data
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#d4a853]/45"
          />
        </label>

        {!profileId ? (
          <p className="mt-4 text-sm text-zinc-500">Wybierz profil.</p>
        ) : (
          <div className="mt-5 space-y-6">
            <section className="rounded-2xl border border-[#d4a853]/25 bg-[#d4a853]/5 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4a853]">
                  Wpis AI na ten dzień
                </h3>
                <button
                  type="button"
                  onClick={refreshAi}
                  className="rounded-lg border border-[#d4a853]/40 px-2 py-1 text-[11px] font-semibold text-[#f3e5c5] hover:bg-[#d4a853]/10"
                >
                  Odśwież (demo)
                </button>
              </div>
              {aiEntry ? (
                <div className="mt-3 max-h-[40vh] overflow-y-auto text-sm leading-relaxed text-zinc-200">
                  <p className="font-medium text-white">{aiEntry.title}</p>
                  <pre className="mt-2 whitespace-pre-wrap font-sans text-xs text-zinc-300">
                    {aiEntry.markdown}
                  </pre>
                </div>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">Generowanie…</p>
              )}
              <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
                Esencja astrologiczna + to, co przekazałeś w rozmowach tego dnia. Produkcja: pełny
                pipeline modelu z RAG po bazie profilu.
              </p>
            </section>

            {bundle ? (
              <>
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Rozmowy tego dnia
                  </h3>
                  {bundle.conversations.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">Brak wiadomości w tym dniu.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {bundle.conversations.map((c) => (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => setPeek(c)}
                            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-left text-sm text-zinc-200 hover:border-[#d4a853]/30"
                          >
                            <span className="font-medium text-white">{c.title}</span>
                            <span className="mt-1 line-clamp-2 block text-xs text-zinc-500">
                              {c.messages[c.messages.length - 1]?.content}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Materiały z tego dnia
                  </h3>
                  {bundle.materials.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">Brak materiałów zapisanych tego dnia.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {bundle.materials.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-black/25 px-3 py-2"
                        >
                          <span className="min-w-0 truncate text-sm text-zinc-200">{m.title}</span>
                          <button
                            type="button"
                            onClick={() => download(m.title, m.mime, m.content)}
                            className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-xs font-semibold text-[#d4a853] hover:bg-white/5"
                          >
                            Pobierz
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Odniesienia (inne wątki wspominające ten dzień)
                  </h3>
                  {bundle.references.length === 0 ? (
                    <p className="mt-2 text-sm text-zinc-500">Brak dopasowań po dacie w treści.</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {bundle.references.map((r) => (
                        <li key={r.conversationId} className="text-sm leading-relaxed text-zinc-300">
                          <button
                            type="button"
                            className="mr-1 inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#d4a853]/20 text-xs font-bold text-[#d4a853] ring-1 ring-[#d4a853]/30"
                            title={`Otwórz: ${r.label}`}
                            onClick={() => {
                              const c = conversations.find((x) => x.id === r.conversationId)
                              if (c) setPeek(c)
                            }}
                          >
                            {r.index}
                          </button>
                          <span className="text-zinc-400">{r.label}</span>
                          {r.snippet ? (
                            <span className="mt-1 block text-xs italic text-zinc-500">
                              „{r.snippet}…”
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              </>
            ) : null}
          </div>
        )}
      </Modal>

      <ConversationPopup
        open={!!peek}
        conversation={peek}
        onClose={() => setPeek(null)}
        onOpenFull={(id) => {
          setPeek(null)
          onGoConversation(id)
        }}
      />
    </>
  )
}
