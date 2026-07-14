import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { whatsappHref } from '../config/business'
import { IconWhatsApp } from './icons'

/** Persistent low-friction fallback contact — this audience already uses
 * WhatsApp as a primary channel, so it stays visible (after a small scroll)
 * on every public page, not tucked away in a menu. */
export function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 240)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  if (shouldReduceMotion) {
    return (
      <a href={whatsappHref()} target="_blank" rel="noreferrer" className="whatsapp-float" aria-label="Chat with us on WhatsApp">
        <IconWhatsApp />
      </a>
    )
  }

  return (
    <motion.a
      href={whatsappHref()}
      target="_blank"
      rel="noreferrer"
      className="whatsapp-float"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      <IconWhatsApp />
    </motion.a>
  )
}
