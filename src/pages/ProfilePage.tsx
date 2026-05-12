import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

export default function ProfilePage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const initials = useMemo(() => initialsFromEmail(email), [email])

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
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="consent-page">
      <div className="consent-bg" aria-hidden="true" />

      <header className="consent-nav">
        <div className="consent-nav-inner consent-nav-inner--split">
          <Link to="/" className="consent-brand">
            <span className="consent-mark" aria-hidden="true" />
            <span className="consent-brand-text">
              <span className="consent-brand-name">Demo merchant</span>
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
        <div className="consent-card profile-card">
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
