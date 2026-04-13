import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AnalysisMode = 'quick' | 'deep'

export type Profile = {
  id: string
  name: string
  birthDate?: string
  birthTime?: string
  birthPlace?: string
  avatarDataUrl?: string
  createdAt: string
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type Conversation = {
  id: string
  profileId: string
  title: string
  analysisMode: AnalysisMode
  messages: Message[]
  updatedAt: string
}

export type MaterialKind = 'chart' | 'table' | 'other'

export type Material = {
  id: string
  profileId: string
  conversationId?: string
  title: string
  kind: MaterialKind
  mime: string
  content: string
  createdAt: string
}

export type PlanTier = 'Orbit' | 'Nebula' | 'Cosmos'

export type Account = {
  displayName: string
  email: string
  plan: PlanTier
  avatarDataUrl?: string
}

export type MainTab = 'day' | 'conversations' | 'materials' | 'chat'

type AppState = {
  sidebarCollapsed: boolean
  mainTab: MainTab
  activeProfileId: string | null
  activeConversationId: string | null
  dayAnalysisDate: string
  account: Account
  profiles: Profile[]
  conversations: Conversation[]
  materials: Material[]
  sessionActive: boolean

  setSidebarCollapsed: (v: boolean) => void
  toggleSidebar: () => void
  setMainTab: (t: MainTab) => void
  setActiveProfileId: (id: string | null) => void
  setActiveConversationId: (id: string | null) => void
  setDayAnalysisDate: (isoDate: string) => void
  updateAccount: (p: Partial<Account>) => void
  logout: () => void
  loginDemo: () => void

  addProfile: (p: Omit<Profile, 'id' | 'createdAt'>) => void
  updateProfile: (id: string, p: Partial<Profile>) => void
  removeProfile: (id: string) => void

  addConversation: (c: Omit<Conversation, 'id' | 'updatedAt' | 'messages'> & { messages?: Message[] }) => string
  updateConversation: (id: string, p: Partial<Conversation>) => void
  appendMessage: (conversationId: string, m: Omit<Message, 'id' | 'createdAt'>) => void

  addMaterial: (m: Omit<Material, 'id' | 'createdAt'>) => string
  removeMaterial: (id: string) => void
}

const newId = () => crypto.randomUUID()

const seedAccount: Account = {
  displayName: 'Gość kosmiczny',
  email: 'you@astro.guide',
  plan: 'Nebula',
}

export function ensureDefaultProfile() {
  const s = useAppStore.getState()
  if (s.profiles.length === 0) {
    s.addProfile({
      name: 'Profil główny',
      birthDate: '1983-02-19',
      birthTime: '10:53',
      birthPlace: 'Sosnowiec',
    })
    return
  }
  const activeOk =
    s.activeProfileId != null && s.profiles.some((p) => p.id === s.activeProfileId)
  if (!activeOk && s.profiles[0]) s.setActiveProfileId(s.profiles[0].id)
}

/** Pierwsze uruchomienie / pusta historia — przykładowe wątki pod aktywny profil. */
export function ensureStarterConversations() {
  const s = useAppStore.getState()
  if (s.conversations.length > 0) return
  const pid = s.activeProfileId ?? s.profiles[0]?.id
  if (!pid) return

  const day = s.dayAnalysisDate
  const now = new Date().toISOString()
  const assistant = (body: string) =>
    `${body}\n\nKontekst analizy dnia: ${day}.`

  const c1: Conversation = {
    id: newId(),
    profileId: pid,
    title: 'Wprowadzenie — jak działa doradca',
    analysisMode: 'quick',
    messages: [
      {
        id: newId(),
        role: 'assistant',
        content: assistant(
          'Witaj w AstroGuide. Wątki są powiązane z profilem: model może korzystać z historii, materiałów (wykresy, tabele) i kontekstu dnia. Wybierz **Szybkie omówienie** lub **Głęboką analizę** u dołu czatu.',
        ),
        createdAt: now,
      },
    ],
    updatedAt: now,
  }
  const c2: Conversation = {
    id: newId(),
    profileId: pid,
    title: 'Przykład: głębsza warstwa',
    analysisMode: 'deep',
    messages: [
      {
        id: newId(),
        role: 'assistant',
        content: assistant(
          '(Głęboka analiza) Tu pojawią się dłuższe syntezy z RAG po historii profilu oraz po wielowymiarowych danych (astrologia, numerologia, tarot itd.). Zadaj pierwsze pytanie poniżej.',
        ),
        createdAt: now,
      },
    ],
    updatedAt: now,
  }

  useAppStore.setState((st) => ({
    conversations: [c2, c1, ...st.conversations],
  }))
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mainTab: 'day',
      activeProfileId: null,
      activeConversationId: null,
      dayAnalysisDate: new Date().toISOString().slice(0, 10),
      account: seedAccount,
      profiles: [],
      conversations: [],
      materials: [],
      sessionActive: true,

      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMainTab: (t) => set({ mainTab: t }),
      setActiveProfileId: (id) => set({ activeProfileId: id }),
      setActiveConversationId: (id) => set({ activeConversationId: id }),
      setDayAnalysisDate: (isoDate) => set({ dayAnalysisDate: isoDate }),
      updateAccount: (p) => set((s) => ({ account: { ...s.account, ...p } })),
      logout: () => set({ sessionActive: false }),
      loginDemo: () => set({ sessionActive: true }),

      addProfile: (p) => {
        const id = newId()
        const profile: Profile = {
          ...p,
          id,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          profiles: [...s.profiles, profile],
          activeProfileId: id,
        }))
      },
      updateProfile: (id, p) =>
        set((s) => ({
          profiles: s.profiles.map((x) => (x.id === id ? { ...x, ...p } : x)),
        })),
      removeProfile: (id) =>
        set((s) => {
          const profiles = s.profiles.filter((x) => x.id !== id)
          const nextActive =
            s.activeProfileId === id ? profiles[0]?.id ?? null : s.activeProfileId
          return {
            profiles,
            activeProfileId: nextActive,
            conversations: s.conversations.filter((c) => c.profileId !== id),
            materials: s.materials.filter((m) => m.profileId !== id),
          }
        }),

      addConversation: (c) => {
        const id = newId()
        const now = new Date().toISOString()
        const conv: Conversation = {
          ...c,
          id,
          messages: c.messages ?? [],
          updatedAt: now,
        }
        set((s) => ({ conversations: [conv, ...s.conversations] }))
        return id
      },
      updateConversation: (id, p) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, ...p, updatedAt: new Date().toISOString() } : c,
          ),
        })),
      appendMessage: (conversationId, m) => {
        const msg: Message = { ...m, id: newId(), createdAt: new Date().toISOString() }
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, msg],
                  updatedAt: msg.createdAt,
                  title:
                    c.messages.length === 0 && m.role === 'user'
                      ? m.content.slice(0, 48) || 'Nowa rozmowa'
                      : c.title,
                }
              : c,
          ),
        }))
      },

      addMaterial: (m) => {
        const id = newId()
        const mat: Material = { ...m, id, createdAt: new Date().toISOString() }
        set((s) => ({ materials: [mat, ...s.materials] }))
        return id
      },
      removeMaterial: (id) =>
        set((s) => ({ materials: s.materials.filter((m) => m.id !== id) })),
    }),
    {
      name: 'astroguide-v1',
      partialize: (s) => ({
        account: s.account,
        profiles: s.profiles,
        conversations: s.conversations,
        materials: s.materials,
        activeProfileId: s.activeProfileId,
        dayAnalysisDate: s.dayAnalysisDate,
        sessionActive: s.sessionActive,
      }),
    },
  ),
)
