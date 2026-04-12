import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GradientBackdrop } from './components/GradientBackdrop'
import { Sidebar } from './components/Sidebar'
import { BottomDock } from './components/BottomDock'
import { ProfilePickerModal } from './components/ProfilePickerModal'
import { NewProfileModal } from './components/NewProfileModal'
import { AccountModal } from './components/AccountModal'
import { JournalModal } from './components/JournalModal'
import { DayAnalysisView } from './views/DayAnalysisView'
import { ConversationsView } from './views/ConversationsView'
import { MaterialsView } from './views/MaterialsView'
import { ChatView } from './views/ChatView'
import { ensureDefaultProfile, useAppStore } from './store/appStore'

export default function App() {
  const mainTab = useAppStore((s) => s.mainTab)
  const session = useAppStore((s) => s.sessionActive)
  const loginDemo = useAppStore((s) => s.loginDemo)
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const setActiveConversation = useAppStore((s) => s.setActiveConversationId)
  const setMainTab = useAppStore((s) => s.setMainTab)

  const [profilesOpen, setProfilesOpen] = useState(false)
  const [newProfileOpen, setNewProfileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)

  useEffect(() => {
    ensureDefaultProfile()
    const done = useAppStore.persist.onFinishHydration(() => {
      ensureDefaultProfile()
    })
    return done
  }, [])

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#05040a] text-zinc-100">
      <GradientBackdrop />

      <AnimatePresence>
        {!session ? (
          <motion.div
            key="gate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-[#05040a]/95 p-8 text-center backdrop-blur-md"
          >
            <p className="max-w-sm font-serif text-2xl font-light text-white">Sesja wygasła</p>
            <p className="max-w-sm text-sm text-zinc-400">
              Zaloguj się, aby zsynchronizować profile, historię rozmów i embeddingi z modelem.
            </p>
            <button
              type="button"
              onClick={loginDemo}
              className="rounded-2xl bg-gradient-to-r from-[#7c5cff] to-[#d4a853] px-8 py-3 text-sm font-bold text-[#0c0a12]"
            >
              Kontynuuj (demo)
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar onOpenJournal={() => setJournalOpen(true)} onOpenProfiles={() => setProfilesOpen(true)} />
        <main
          className="relative min-h-0 min-w-0 flex-1 overflow-y-auto px-4 sm:px-8"
          style={{ paddingLeft: collapsed ? '0.75rem' : undefined }}
        >
          <div className="mx-auto max-w-3xl">
            {mainTab === 'day' ? <DayAnalysisView /> : null}
            {mainTab === 'conversations' ? <ConversationsView /> : null}
            {mainTab === 'materials' ? <MaterialsView /> : null}
            {mainTab === 'chat' ? <ChatView /> : null}
          </div>
        </main>
      </div>

      <BottomDock onNewProfile={() => setNewProfileOpen(true)} onAccount={() => setAccountOpen(true)} />

      <ProfilePickerModal open={profilesOpen} onClose={() => setProfilesOpen(false)} />
      <NewProfileModal open={newProfileOpen} onClose={() => setNewProfileOpen(false)} />
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
      <JournalModal
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        onGoConversation={(id) => {
          setActiveConversation(id)
          setMainTab('chat')
          setJournalOpen(false)
        }}
      />
    </div>
  )
}
