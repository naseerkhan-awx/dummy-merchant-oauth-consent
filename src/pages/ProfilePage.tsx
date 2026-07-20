import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Payment } from '@airwallex/components-sdk'
import { createCardElement } from '../lib/airwallex'
import { listPaymentMethods, setupAddCard, type SavedCard } from '../lib/backendClient'
import { supabase } from '../lib/supabaseClient'
import './ConsentPage.css'
import './ProfilePage.css'

function initialsFromEmail(email: string | null | undefined) {
  if (!email) return '?'
  const local = email.split('@')[0]?.trim() ?? ''
  if (!local) return '?'
  const parts = local.split(/[.\-_]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
  }
  return local.slice(0, 2).toUpperCase()
}

function formatBrand(brand: string) {
  if (brand === 'visa') return 'Visa'
  if (brand === 'mastercard') return 'Mastercard'
  if (brand === 'american-express') return 'American Express'
  return brand.charAt(0).toUpperCase() + brand.slice(1)
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<SavedCard[]>([])
  const [cardsLoading, setCardsLoading] = useState(false)
  const [cardsError, setCardsError] = useState<string | null>(null)
  const [showAddCard, setShowAddCard] = useState(false)
  const [cardReady, setCardReady] = useState(false)
  const [cardComplete, setCardComplete] = useState(false)
  const [savingCard, setSavingCard] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const cardElementRef = useRef<Payment.CardElementType | null>(null)

  const initials = useMemo(() => initialsFromEmail(email), [email])

  const loadCards = useCallback(async (token: string) => {
    setCardsLoading(true)
    setCardsError(null)
    try {
      const items = await listPaymentMethods(token)
      setCards(items)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load saved cards'
      setCardsError(message)
      setCards([])
    } finally {
      setCardsLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) {
        navigate('/login', { replace: true })
        return
      }
      setEmail(session.user.email ?? null)
      setAccessToken(session.access_token)
      setLoading(false)
      await loadCards(session.access_token)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate, loadCards])

  useEffect(() => {
    if (!showAddCard) {
      cardElementRef.current?.destroy()
      cardElementRef.current = null
      setCardReady(false)
      setCardComplete(false)
      return
    }

    let cancelled = false

    async function mountCard() {
      try {
        const element = await createCardElement('profile-card-element')
        if (cancelled) {
          element.destroy()
          return
        }
        cardElementRef.current = element
        element.on('ready', () => {
          if (!cancelled) setCardReady(true)
        })
        element.on('change', (event) => {
          if (!cancelled) setCardComplete(event.detail.completed)
        })
      } catch (err) {
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : 'Failed to load card form')
        }
      }
    }

    mountCard()

    return () => {
      cancelled = true
      cardElementRef.current?.destroy()
      cardElementRef.current = null
    }
  }, [showAddCard])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  async function handleSaveCard() {
    if (!accessToken || !cardElementRef.current || savingCard) return

    setSavingCard(true)
    setSaveError(null)
    try {
      const { client_secret } = await setupAddCard(accessToken)
      // Consent is already created on the backend — verify it with the card details.
      // createPaymentConsent() expects a Customer/PaymentIntent client_secret and would
      // try to create a new consent (causing consent_id mismatch with this secret).
      await cardElementRef.current.verifyConsent({
        client_secret,
        currency: 'USD',
      })
      setShowAddCard(false)
      await loadCards(accessToken)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save card')
    } finally {
      setSavingCard(false)
    }
  }

  return (
    <div className="consent-page">
      <div className="consent-bg" aria-hidden="true" />

      <header className="consent-nav">
        <div className="consent-nav-inner consent-nav-inner--split">
          <Link to="/" className="consent-brand">
            <span className="consent-mark" aria-hidden="true" />
            <span className="consent-brand-text">
              <span className="consent-brand-name">Demo Bookstore</span>
              <span className="consent-brand-tag">Airwallex sample</span>
            </span>
          </Link>
          <div className="profile-nav-actions">
            <Link to="/" className="consent-btn consent-btn-profile-ghost">
              Home
            </Link>
            <button type="button" className="consent-btn consent-btn-profile-ghost" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="consent-layout">
        <div className="consent-card profile-card profile-card--wide">
          {loading ? (
            <p className="consent-loading" role="status">
              Loading…
            </p>
          ) : (
            <>
              <h1 className="profile-title">Your profile</h1>
              <p className="consent-subtitle profile-subtitle">Signed in as</p>

              <div className="profile-block" aria-label="Profile summary">
                <div className="profile-avatar" aria-hidden="true">
                  <span className="profile-avatar-inner">{initials}</span>
                </div>
                <p className="profile-email">{email ?? '—'}</p>
              </div>

              <section className="profile-section" aria-labelledby="saved-cards-heading">
                <div className="profile-section-head">
                  <h2 id="saved-cards-heading" className="profile-section-title">
                    Saved cards
                  </h2>
                  {!showAddCard && (
                    <button
                      type="button"
                      className="consent-btn consent-btn-profile-ghost profile-add-btn"
                      onClick={() => {
                        setSaveError(null)
                        setShowAddCard(true)
                      }}
                    >
                      Add card
                    </button>
                  )}
                </div>

                {cardsLoading ? (
                  <p className="profile-muted" role="status">
                    Loading cards…
                  </p>
                ) : cardsError ? (
                  <p className="profile-error" role="alert">
                    {cardsError.includes('awx_customer_id')
                      ? 'Your account is missing awx_customer_id in the login token. Add it to Supabase user metadata and sign in again.'
                      : cardsError}
                  </p>
                ) : cards.length === 0 ? (
                  <p className="profile-muted">No saved cards yet.</p>
                ) : (
                  <ul className="profile-card-list">
                    {cards.map((card) => (
                      <li key={card.id} className="profile-card-item">
                        <span className="profile-card-brand">{formatBrand(card.brand)}</span>
                        <span className="profile-card-number">•••• {card.last4}</span>
                        <span className="profile-card-expiry">
                          {card.expiry_month}/{card.expiry_year.slice(-2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {showAddCard && (
                <section className="profile-section" aria-labelledby="add-card-heading">
                  <h2 id="add-card-heading" className="profile-section-title">
                    Add a card
                  </h2>
                  <div id="profile-card-element" className="profile-card-element" />
                  {saveError && (
                    <p className="profile-error" role="alert">
                      {saveError}
                    </p>
                  )}
                  <div className="profile-form-actions">
                    <button
                      type="button"
                      className="consent-btn consent-btn-primary"
                      disabled={!cardReady || savingCard}
                      onClick={handleSaveCard}
                    >
                      {savingCard ? 'Saving…' : 'Save card'}
                    </button>
                    <button
                      type="button"
                      className="consent-btn consent-btn-profile-ghost"
                      disabled={savingCard}
                      onClick={() => setShowAddCard(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
