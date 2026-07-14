import { Link } from 'react-router-dom'
import { business, whatsappHref } from '../config/business'

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="public-footer__grid">
          <div>
            <span className="public-footer__brand">{business.name}</span>
            <p className="public-footer__tagline">
              Bold color, precision cuts, and glam styling — book your next appointment in under a
              minute.
            </p>
          </div>

          <div>
            <div className="public-footer__heading">Explore</div>
            <nav className="public-footer__list">
              <Link to="/services">Services</Link>
              <Link to="/team">Our team</Link>
              <Link to="/shop">Shop</Link>
              <Link to="/contact">Contact</Link>
            </nav>
          </div>

          <div>
            <div className="public-footer__heading">Get in touch</div>
            <div className="public-footer__list">
              <a href={business.phoneHref}>{business.phoneDisplay}</a>
              <a href={whatsappHref()} target="_blank" rel="noreferrer">
                Message us on WhatsApp
              </a>
              <span>{business.addressLines.join(', ')}</span>
            </div>
          </div>
        </div>

        <div className="public-footer__bottom">
          <span>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </span>
          <Link to="/book">Book an appointment →</Link>
        </div>
      </div>
    </footer>
  )
}
