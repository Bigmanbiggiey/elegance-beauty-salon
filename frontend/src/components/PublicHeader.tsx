import { Link } from 'react-router-dom'

export function PublicHeader() {
  return (
    <header className="public-header">
      <Link to="/" className="public-header__brand">
        The Salon
      </Link>
      <nav className="public-header__nav">
        <Link to="/services" className="public-header__link">
          Services
        </Link>
        <Link to="/shop" className="public-header__link">
          Shop
        </Link>
        <Link to="/book" className="public-header__cta">
          Book now
        </Link>
      </nav>
    </header>
  )
}
