import { Link, useLocation } from 'react-router-dom'
import { business, whatsappHref } from '../config/business'
import { IconPhone, IconWhatsApp } from './icons'

/** Keeps the primary action (and the WhatsApp/call fallback this audience
 * expects) within thumb's reach on mobile, where it's easy to lose the header
 * CTA after scrolling. Hidden on the booking flow itself, where the page's
 * own submit action already owns that space. */
export function StickyCtaBar() {
  const location = useLocation()
  if (location.pathname.startsWith('/book')) return null

  return (
    <div className="sticky-cta-bar">
      <a href={business.phoneHref} className="sticky-cta-bar__icon-link" aria-label="Call us">
        <IconPhone size={20} />
      </a>
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noreferrer"
        className="sticky-cta-bar__icon-link"
        aria-label="Message us on WhatsApp"
      >
        <IconWhatsApp size={20} />
      </a>
      <Link to="/book" className="primary-button">
        Book now
      </Link>
    </div>
  )
}
