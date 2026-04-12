import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            aria-label="Zamknij"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={clsx(
              'relative z-[81] mb-[env(safe-area-inset-bottom)] w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-[#0f0b18]/95 shadow-[0_-24px_80px_rgba(0,0,0,0.55)] sm:mb-0 sm:rounded-3xl',
              className,
            )}
          >
            {title ? (
              <div className="border-b border-white/10 px-5 py-4">
                <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>
              </div>
            ) : null}
            <div className="max-h-[min(78vh,720px)] overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
