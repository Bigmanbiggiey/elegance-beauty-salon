import { Link } from 'react-router-dom'
import { business, whatsappHref } from '../config/business'
import { Reveal } from '../components/ui/Reveal'
import { IconClock, IconMapPin, IconPhone, IconWhatsApp } from '../components/icons'

export function Contact() {
  return (
    <div className="page">
      <div className="container container--narrow">
        <div className="section-head">
          <span className="eyebrow">Contact</span>
          <h1>Come say hello</h1>
          <p>Questions before you book? Call or message us — we usually reply within minutes.</p>
        </div>

        <Reveal>
          <div className="contact-grid">
            <div className="card contact-panel">
              <div className="contact-panel__row">
                <span className="contact-panel__icon">
                  <IconMapPin size={18} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Visit us</div>
                  {business.addressLines.map((line) => (
                    <div key={line} className="meta">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <div className="contact-panel__row">
                <span className="contact-panel__icon">
                  <IconPhone size={16} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Call us</div>
                  <a href={business.phoneHref} className="meta" style={{ textDecoration: 'none' }}>
                    {business.phoneDisplay}
                  </a>
                </div>
              </div>
              <div className="contact-panel__row">
                <span className="contact-panel__icon">
                  <IconWhatsApp size={16} />
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Message us</div>
                  <a
                    href={whatsappHref()}
                    target="_blank"
                    rel="noreferrer"
                    className="meta"
                    style={{ textDecoration: 'none' }}
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>

              <div className="contact-cta-row">
                <a href={business.phoneHref} className="primary-button">
                  <IconPhone size={16} /> Call now
                </a>
                <a href={whatsappHref()} target="_blank" rel="noreferrer" className="secondary-button">
                  <IconWhatsApp size={16} /> WhatsApp
                </a>
              </div>
            </div>

            <div className="card contact-panel">
              <div className="contact-panel__row">
                <span className="contact-panel__icon">
                  <IconClock size={16} />
                </span>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Hours</div>
              </div>
              <div style={{ marginTop: 8 }}>
                {business.hours.map((row) => (
                  <div key={row.label} className="hours-row">
                    <span className="hours-row__label">{row.label}</span>
                    <span className="hours-row__value">{row.value}</span>
                  </div>
                ))}
              </div>
              <p className="field__hint" style={{ marginTop: 16 }}>
                Prefer to skip the wait? Book your slot online any time.
              </p>
              <Link to="/book" className="secondary-button" style={{ marginTop: 12 }}>
                Book an appointment
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
