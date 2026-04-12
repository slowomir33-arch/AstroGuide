import { isSameDay, parseISO } from 'date-fns'
import type { Conversation, Material } from '../store/appStore'

export type JournalReference = {
  index: number
  conversationId: string
  label: string
  snippet: string
}

export type JournalBundle = {
  date: string
  conversations: Conversation[]
  materials: Material[]
  references: JournalReference[]
}

export function buildJournalBundle(
  profileId: string,
  dateStr: string,
  conversations: Conversation[],
  materials: Material[],
): JournalBundle {
  const day = parseISO(dateStr)
  const convosToday = conversations.filter(
    (c) =>
      c.profileId === profileId &&
      c.messages.some((m) => isSameDay(parseISO(m.createdAt), day)),
  )
  const materialsToday = materials.filter(
    (m) => m.profileId === profileId && isSameDay(parseISO(m.createdAt), day),
  )

  const other = conversations.filter(
    (c) => c.profileId === profileId && !convosToday.some((t) => t.id === c.id),
  )

  const references: JournalReference[] = []
  let idx = 1
  for (const c of other) {
    const hit = c.messages.some((m) => m.content.includes(dateStr))
    if (!hit) continue
    const last = c.messages[c.messages.length - 1]
    references.push({
      index: idx++,
      conversationId: c.id,
      label: c.title || 'Rozmowa',
      snippet: last?.content.slice(0, 160) ?? '',
    })
  }

  return {
    date: dateStr,
    conversations: convosToday,
    materials: materialsToday,
    references,
  }
}
