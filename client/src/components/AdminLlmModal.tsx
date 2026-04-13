import clsx from 'clsx'
import { Modal } from './Modal'
import { useAppStore, type LlmConfig, type LlmProviderId } from '../store/appStore'

type Props = { open: boolean; onClose: () => void }

const rows: { id: LlmProviderId; title: string; hint: string }[] = [
  { id: 'gemini', title: 'Gemini', hint: 'Google AI Studio / Vertex — klucz API' },
  { id: 'opus', title: 'Claude Opus', hint: 'Anthropic — klucz API' },
  { id: 'sonnet', title: 'Claude Sonnet', hint: 'Anthropic — klucz API' },
]

function apiValue(id: LlmProviderId, cfg: LlmConfig): string {
  if (id === 'gemini') return cfg.geminiKey
  if (id === 'opus') return cfg.opusKey
  return cfg.sonnetKey
}

export function AdminLlmModal({ open, onClose }: Props) {
  const llmConfig = useAppStore((s) => s.llmConfig)
  const setLlmApiKey = useAppStore((s) => s.setLlmApiKey)
  const setLlmActiveProvider = useAppStore((s) => s.setLlmActiveProvider)

  const toggleActive = (id: LlmProviderId, currentlyActive: boolean) => {
    if (currentlyActive) setLlmActiveProvider(null)
    else setLlmActiveProvider(id)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Panel administratora — API LLM"
      className="max-w-xl"
    >
      <p className="text-xs leading-relaxed text-zinc-500">
        Klucze są zapisywane wyłącznie w tej przeglądarce (localStorage). W danym momencie może być
        aktywny <strong className="text-zinc-300">tylko jeden</strong> model — włączenie innego
        wyłącza poprzedni.
      </p>

      <div className="mt-5 space-y-4">
        {rows.map((row) => {
          const active = llmConfig.activeProvider === row.id

          return (
            <div
              key={row.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">{row.title}</h3>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{row.hint}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span
                    className={clsx(
                      'text-[10px] font-bold uppercase tracking-wide',
                      active ? 'text-emerald-400' : 'text-zinc-500',
                    )}
                  >
                    {active ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={active ? 'true' : 'false'}
                    aria-label={active ? `Wyłącz ${row.title}` : `Uaktywnij ${row.title}`}
                    onClick={() => toggleActive(row.id, active)}
                    className={clsx(
                      'relative h-8 w-14 rounded-full transition-colors',
                      active ? 'bg-emerald-600' : 'bg-zinc-600',
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
                        active ? 'left-7' : 'left-1',
                      )}
                    />
                  </button>
                </div>
              </div>
              <label className="mt-3 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                API key
                <input
                  type="password"
                  autoComplete="off"
                  value={apiValue(row.id, llmConfig)}
                  onChange={(e) => setLlmApiKey(row.id, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 font-mono text-sm text-white outline-none focus:border-[#d4a853]/45"
                  placeholder="Wklej klucz…"
                />
              </label>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-[11px] text-zinc-600">
        Aktywny provider:{' '}
        <span className="text-zinc-400">
          {llmConfig.activeProvider === null
            ? 'brak'
            : llmConfig.activeProvider === 'gemini'
              ? 'Gemini'
              : llmConfig.activeProvider === 'opus'
                ? 'Claude Opus'
                : 'Claude Sonnet'}
        </span>
      </p>
    </Modal>
  )
}
