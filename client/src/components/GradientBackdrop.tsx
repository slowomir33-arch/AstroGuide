import { motion } from 'framer-motion'

export function GradientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-1/4 -top-1/4 h-[70vmin] w-[70vmin] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(124,92,255,0.55), transparent 55%)',
        }}
        animate={{ x: [0, 24, 0], y: [0, 18, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-1/4 -right-1/4 h-[65vmin] w-[65vmin] rounded-full opacity-35 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 60% 60%, rgba(212,168,83,0.45), transparent 55%)',
        }}
        animate={{ x: [0, -20, 0], y: [0, -14, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-1/3 top-1/2 h-[50vmin] w-[50vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(47,212,163,0.35), transparent 60%)',
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.32, 0.2] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(160deg, rgba(5,4,10,0.2) 0%, rgba(12,10,18,0.75) 45%, rgba(5,4,10,0.9) 100%)',
        }}
      />
    </div>
  )
}
