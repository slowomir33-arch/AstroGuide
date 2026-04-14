import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import { GradientBackdrop } from './components/GradientBackdrop'
import { Sidebar } from './components/Sidebar'
import { BottomDock } from './components/BottomDock'
import { ProfilePickerModal } from './components/ProfilePickerModal'
import { NewProfileModal } from './components/NewProfileModal'
import { AccountModal } from './components/AccountModal'
import { AdminLlmModal } from './components/AdminLlmModal'
import { JournalModal } from './components/JournalModal'
import { LandingPage } from './views/LandingPage'
import { CosmicAnalysisView } from './views/CosmicAnalysisView'
import { ChatShellView } from './views/ChatShellView'
import { MaterialsView } from './views/MaterialsView'
import { runInitialHydration, useAppStore } from './store/appStore'

export default function App() {
  const mainTab = useAppStore((s) => s.mainTab)
  const session = useAppStore((s) => s.sessionActive)
  const setActiveConversation = useAppStore((s) => s.setActiveConversationId)
  const setMainTab = useAppStore((s) => s.setMainTab)

  const [profilesOpen, setProfilesOpen] = useState(false)
  const [newProfileOpen, setNewProfileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const [llmAdminOpen, setLlmAdminOpen] = useState(false)

  useEffect(() => {
    runInitialHydration()
    const done = useAppStore.persist.onFinishHydration(() => {
      runInitialHydration()
    })
    return done
  }, [])

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#05040a] text-zinc-100">
      <GradientBackdrop />

      <AnimatePresence mode="wait">
        {!session ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="absolute inset-0 z-[100] overflow-auto"
          >
            <LandingPage />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar onOpenJournal={() => setJournalOpen(true)} onOpenProfiles={() => setProfilesOpen(true)} />
        <main
          className={clsx(
            'relative min-h-0 min-w-0 flex-1',
            mainTab === 'conversations'
              ? 'flex flex-col overflow-hidden px-2 sm:px-4'
              : mainTab === 'day'
                ? 'flex flex-col overflow-hidden'
                : 'overflow-y-auto px-4 sm:px-8',
          )}
        >
          <div
            className={clsx(
              'mx-auto w-full',
              mainTab === 'conversations'
                ? 'flex h-full min-h-0 max-w-6xl flex-1 flex-col pb-28'
                : mainTab === 'day'
                  ? 'flex h-full min-h-0 flex-1 flex-col'
                  : 'max-w-3xl pb-28',
            )}
          >
            {mainTab === 'day' ? <CosmicAnalysisView /> : null}
            {mainTab === 'conversations' ? <ChatShellView /> : null}
            {mainTab === 'materials' ? <MaterialsView /> : null}
          </div>
        </main>
      </div>

      <BottomDock onNewProfile={() => setNewProfileOpen(true)} onAccount={() => setAccountOpen(true)} />

      <ProfilePickerModal open={profilesOpen} onClose={() => setProfilesOpen(false)} />
      <NewProfileModal open={newProfileOpen} onClose={() => setNewProfileOpen(false)} />
      <AccountModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        onOpenLlmAdmin={() => setLlmAdminOpen(true)}
      />
      <AdminLlmModal open={llmAdminOpen} onClose={() => setLlmAdminOpen(false)} />
      <JournalModal
        open={journalOpen}
        onClose={() => setJournalOpen(false)}
        onGoConversation={(id) => {
          setActiveConversation(id)
          setMainTab('conversations')
          setJournalOpen(false)
        }}
      />
    </div>
  )
}
