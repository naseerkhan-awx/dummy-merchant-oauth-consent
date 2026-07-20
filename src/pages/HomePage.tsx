import { Link } from 'react-router-dom'
import './HomePage.css'

const BOOKS = [
  {
    id: '1',
    title: 'Lumario',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book1.png',
    priceCents: 6800,
    currency: 'USD',
  },
  {
    id: '2',
    title: 'Your Passport to Global Business',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book2.png',
    priceCents: 6800,
    currency: 'USD',
  },
  {
    id: '3',
    title: 'Game of Taco',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book3.png',
    priceCents: 6800,
    currency: 'USD',
  },
  {
    id: '4',
    title: '1985',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book4.png',
    priceCents: 6800,
    currency: 'USD',
  },
  {
    id: '5',
    title: 'A Tale of Two Islands',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book5.png',
    priceCents: 6800,
    currency: 'USD',
  },
  {
    id: '6',
    title: 'Transparency is the New History',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book6.png',
    priceCents: 6800,
    currency: 'USD',
  },
  {
    id: '7',
    title: 'The Great Kitties',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book7.png',
    priceCents: 6800,
    currency: 'USD',
  },
  {
    id: '8',
    title: 'Golden hat of the sun',
    imageUrl: 'https://staging-pacheckoutdemo.airwallex.com/assets/img/book8.png',
    priceCents: 6800,
    currency: 'USD',
  },
]

function formatPrice(amountCents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amountCents / 100)
}

export default function HomePage() {
  return (
    <div className="demo-merchant-home">
      <div className="demo-merchant-bg" aria-hidden="true" />

      <header className="demo-merchant-nav">
        <div className="demo-merchant-nav-inner">
          <Link to="/" className="demo-merchant-brand">
            <span className="demo-merchant-mark" aria-hidden="true" />
            <span className="demo-merchant-brand-text">
              <span className="demo-merchant-brand-name">Demo Bookstore</span>
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
          <p className="demo-merchant-eyebrow">Online bookstore demo</p>
          <h1 id="hero-heading" className="demo-merchant-hero-title">
            Browse our shelves at the{' '}
            <span className="demo-merchant-hero-accent">Demo Bookstore</span>
          </h1>
          <p className="demo-merchant-lede">
            A sample online bookstore you can use while wiring up Airwallex payment flows. Pick a
            title below—this storefront is for demos only.
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

        <section className="demo-merchant-section" aria-labelledby="catalog-heading">
          <div className="demo-merchant-section-head">
            <h2 id="catalog-heading">Featured books</h2>
            <p>Image, title, and price for each title in the demo catalog.</p>
          </div>
          <ul className="demo-merchant-book-grid">
            {BOOKS.map((book) => (
              <li key={book.id} className="demo-merchant-book-card">
                <img
                  className="demo-merchant-book-cover"
                  src={book.imageUrl}
                  alt=""
                  loading="lazy"
                />
                <h3 className="demo-merchant-book-title">{book.title}</h3>
                <p className="demo-merchant-book-price">
                  {formatPrice(book.priceCents, book.currency)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="demo-merchant-footer">
        <p>
          Sample bookstore only—not for production. Airwallex and related marks belong to their
          respective owners.
        </p>
      </footer>
    </div>
  )
}
