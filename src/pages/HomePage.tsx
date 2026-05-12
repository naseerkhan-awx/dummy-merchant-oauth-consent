import { Link } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  return (
    <div className="demo-merchant-home">
      <div className="demo-merchant-bg" aria-hidden="true" />

      <header className="demo-merchant-nav">
        <div className="demo-merchant-nav-inner">
          <Link to="/" className="demo-merchant-brand">
            <span className="demo-merchant-mark" aria-hidden="true" />
            <span className="demo-merchant-brand-text">
              <span className="demo-merchant-brand-name">Demo merchant</span>
              <span className="demo-merchant-brand-tag">Airwallex sample</span>
            </span>
          </Link>
          <nav className="demo-merchant-nav-links" aria-label="Primary">
            <a
              href="https://www.airwallex.com/docs"
              className="demo-merchant-nav-cta demo-merchant-nav-cta--ghost"
              target="_blank"
              rel="noreferrer"
            >
              Airwallex docs
            </a>
            <Link to="/login" className="demo-merchant-nav-cta demo-merchant-nav-cta--ghost">
              Log in
            </Link>
            <Link to="/auth/consent" className="demo-merchant-nav-cta">
              Sample sign-in
            </Link>
          </nav>
        </div>
      </header>

      <main className="demo-merchant-main">
        <section className="demo-merchant-hero" aria-labelledby="hero-heading">
          <p className="demo-merchant-eyebrow">Reference storefront</p>
          <h1 id="hero-heading" className="demo-merchant-hero-title">
            A simple demo merchant for{' '}
            <span className="demo-merchant-hero-accent">Airwallex integrations</span>
          </h1>
          <p className="demo-merchant-lede">
            This website is a lightweight example you can extend while you hook up different
            Airwallex capabilities—payments, balances, onboarding, and whatever else your flow needs.
            It is not a real shop; it is a place to try ideas and wire features together.
          </p>
          <div className="demo-merchant-hero-actions">
            <Link to="/login" className="demo-merchant-btn demo-merchant-btn-primary">
              Log in
            </Link>
            <a
              href="https://www.airwallex.com/docs"
              className="demo-merchant-btn demo-merchant-btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              Browse Airwallex docs ↗
            </a>
          </div>
        </section>

        <section className="demo-merchant-section demo-merchant-section-simple" aria-labelledby="simple-heading">
          <h2 id="simple-heading" className="demo-merchant-simple-title">
            What it is for
          </h2>
          <p className="demo-merchant-simple-copy">
            Use this project as a starting UI: replace copy, branding, and screens as you connect each
            Airwallex feature to your backend. One codebase can host several integration examples as
            you build them out.
          </p>
        </section>
      </main>

      <footer className="demo-merchant-footer">
        <p>
          Sample only—not for production. Airwallex and related marks belong to their respective
          owners.
        </p>
      </footer>
    </div>
  )
}
