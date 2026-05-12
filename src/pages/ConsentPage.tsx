import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './ConsentPage.css'

type View = 'loading' | 'auth' | 'consent' | 'error'

type AuthMode = 'signin' | 'signup'

function useAuthorizationId() {
  const [searchParams] = useSearchParams()
  return useMemo(() => {
    const id = searchParams.get('authorization_id')
    return id?.trim() || null
  }, [searchParams])
}

export default function ConsentPage() {
  const authorizationId = useAuthorizationId()
  const [view, setView] = useState<View>('loading')
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loginError, setLoginError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [clientName, setClientName] = useState('—')
  const [scopes, setScopes] = useState<string[]>([])

  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [consentSubmitting, setConsentSubmitting] = useState(false)

  const showError = useCallback((msg: string) => {
    setErrorMessage(msg)
    setView('error')
  }, [])

  const loadConsentDetails = useCallback(async () => {
    if (!authorizationId) return
    setView('loading')
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId)
    if (error || !data) {
      showError(error?.message ?? 'Invalid or expired authorization request.')
      return
    }
    if (!('authorization_id' in data)) {
      window.location.href = data.redirect_url
      return
    }
    setClientName(data.client?.name ?? 'Unknown Application')
    const list = data.scope?.trim()
      ? data.scope
          .trim()
          .split(/\s+/)
          .filter(Boolean)
      : []
    setScopes(list)
    setView('consent')
  }, [authorizationId, showError])

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!authorizationId) {
        showError(
          'Missing authorization_id parameter. Open this page from an OAuth authorization request (your project should redirect to /auth/consent on this host after visiting /oauth/authorize).',
        )
        return
      }
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (cancelled) return
      if (!session) {
        setView('auth')
        return
      }
      await loadConsentDetails()
    }

    init()
    return () => {
      cancelled = true
    }
  }, [authorizationId, loadConsentDetails, showError])

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setLoginError('Enter email and password.')
      return
    }
    setAuthSubmitting(true)
    try {
      if (authMode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        })
        if (error) {
          setLoginError(error.message)
          return
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        })
        if (error) {
          setLoginError(error.message)
          return
        }
        if (!data.session) {
          setLoginError(
            'Check your email to confirm your account, then return to this page and sign in.',
          )
          return
        }
      }
      await loadConsentDetails()
    } finally {
      setAuthSubmitting(false)
    }
  }

  async function handleApprove() {
    if (!authorizationId) return
    setConsentSubmitting(true)
    const { data, error } = await supabase.auth.oauth.approveAuthorization(authorizationId)
    setConsentSubmitting(false)
    if (error || !data?.redirect_url) {
      showError(error?.message ?? 'Failed to approve authorization.')
      return
    }
    window.location.href = data.redirect_url
  }

  async function handleDeny() {
    if (!authorizationId) return
    setConsentSubmitting(true)
    const { data, error } = await supabase.auth.oauth.denyAuthorization(authorizationId)
    setConsentSubmitting(false)
    if (error || !data?.redirect_url) {
      showError(error?.message ?? 'Failed to deny authorization.')
      return
    }
    window.location.href = data.redirect_url
  }

  return (
    <div className="consent-page">
      <div className="consent-bg" aria-hidden="true" />

      <header className="consent-nav">
        <div className="consent-nav-inner">
          <Link to="/" className="consent-brand">
            <span className="consent-mark" aria-hidden="true" />
            <span className="consent-brand-text">
              <span className="consent-brand-name">Demo merchant</span>
              <span className="consent-brand-tag">Airwallex sample</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="consent-layout">
        <div className="consent-card">
          {view === 'loading' && (
            <p className="consent-loading" role="status">
              Loading…
            </p>
          )}

          {view === 'auth' && (
            <>
              <h1>Sign in to continue</h1>
              <p className="consent-subtitle">
                Use your account before authorizing the application that sent you here.
              </p>
              <div className="consent-segment" role="tablist" aria-label="Account access">
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === 'signin'}
                  className={authMode === 'signin' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('signin')
                    setLoginError(null)
                  }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={authMode === 'signup'}
                  className={authMode === 'signup' ? 'active' : ''}
                  onClick={() => {
                    setAuthMode('signup')
                    setLoginError(null)
                  }}
                >
                  Create account
                </button>
              </div>
              {loginError && (
                <div className="consent-alert consent-alert-error" role="alert">
                  {loginError}
                </div>
              )}
              <form onSubmit={handleAuthSubmit} className="consent-form">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                />
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                />
                <button type="submit" className="consent-btn consent-btn-primary" disabled={authSubmitting}>
                  {authSubmitting ? 'Please wait…' : authMode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
              </form>
            </>
          )}

          {view === 'consent' && (
            <>
              <h1>Authorize application</h1>
              <p className="consent-subtitle">Review the request and approve or deny access.</p>
              <div className="consent-client-info">
                <p className="consent-client-label">Requesting application</p>
                <strong className="consent-client-name">{clientName}</strong>
              </div>
              {scopes.length > 0 && (
                <div className="consent-scopes">
                  <span className="consent-scopes-label">Requested permissions</span>
                  <ul className="consent-scope-list">
                    {scopes.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                type="button"
                className="consent-btn consent-btn-primary"
                disabled={consentSubmitting}
                onClick={handleApprove}
              >
                Approve
              </button>
              <button
                type="button"
                className="consent-btn consent-btn-danger"
                disabled={consentSubmitting}
                onClick={handleDeny}
              >
                Deny
              </button>
            </>
          )}

          {view === 'error' && errorMessage && (
            <>
              <h1>Something went wrong</h1>
              <p className="consent-subtitle">{errorMessage}</p>
              <Link to="/" className="consent-btn consent-btn-primary">
                Back to home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
