import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'
import { StickyCtaBar } from './StickyCtaBar'
import { WhatsAppButton } from './WhatsAppButton'

export function PublicShell() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="public-shell">
      <PublicHeader />

      {shouldReduceMotion ? (
        <Outlet />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      )}

      <PublicFooter />
      <WhatsAppButton />
      <StickyCtaBar />
    </div>
  )
}
