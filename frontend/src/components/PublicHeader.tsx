import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { IconClose, IconMenu } from './icons'

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services', end: false },
  { to: '/shop', label: 'Shop', end: false },
  { to: '/team', label: 'Our team', end: false },
  { to: '/contact', label: 'Contact', end: false },
]

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <header className={`public-header${scrolled ? ' public-header--scrolled' : ''}`}>
      <Link to="/" className="public-header__brand">
        Elegance Beauty
      </Link>

      <nav className="public-header__nav">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `public-header__link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="public-header__actions">
        <Link to="/book" className="public-header__cta">
          Book now
        </Link>
        <button
          type="button"
          className="public-header__menu-toggle"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
        >
          <IconMenu />
        </button>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="public-header__drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div className="public-header__drawer-scrim" onClick={() => setDrawerOpen(false)} />
            <motion.div
              className="public-header__drawer-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                type="button"
                className="public-header__menu-toggle"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                style={{ alignSelf: 'flex-end', marginBottom: 8 }}
              >
                <IconClose />
              </button>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className="public-header__drawer-link"
                  onClick={() => setDrawerOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/book" className="primary-button" style={{ marginTop: 16 }} onClick={() => setDrawerOpen(false)}>
                Book now
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
