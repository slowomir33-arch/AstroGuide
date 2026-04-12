import { Modal } from './Modal'
import type { Conversation } from '../store/appStore'

type Props = {
  open: boolean
  conversation: Conversation | null
  onClose: () => void
  onOpenFull: (id: string) => void
}

export function ConversationPopup({ open, conversation, onClose, onOpenFull }: Props) {
  return (
    <Modal open={open && !!conversation} onClose={onClose} title={conversation?.title ?? ''}>
      <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
        {(conversation?.messages ?? []).map((m) => (
          <div
            key={m.id}
            className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'ml-4 bg-[#7c5cff]/20 text-zinc-100'
                : 'mr-4 border border-white/[0.06] bg-white/[0.04] text-zinc-200'
            }`}
          >
            {m.content}
          </div>
        ))}
        {(conversation?.messages.length ?? 0) === 0 ? (
          <p className="text-center text-sm text-zinc-500">Brak wiadomości w tym wątku.</p>
        ) : null}
      </div>
      <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-white/5"
        >
          Zamknij
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenFull(conversation!.id)
            onClose()
          }}
          className="flex-1 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#d4a853] py-2.5 text-sm font-semibold text-[#0c0a12]"
        >
          Pełna rozmowa →
        </button>
      </div>
    </Modal>
  )
}
