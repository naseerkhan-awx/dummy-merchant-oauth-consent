import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import './App.css'

type View = 'loading' | 'auth' | 'consent' | 'error'

type AuthMode = 'signin' | 'signup'

function useAuthorizationId() {
  return useMemo(() => {
    const id = new URLSearchParams(window.location.search).get('authorization_id')
    return id?.trim() || null
  }, [])
}

export default function App() {
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
          'Missing authorization_id parameter. Open this page from an OAuth authorization request (your project redirects here after visiting /oauth/authorize).',
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
    <div className="oauth-page">
      <div className="oauth-card">
        <div className="oauth-logo" aria-hidden="true">
          A
        </div>

        {view === 'loading' && (
          <p className="oauth-loading" role="status">
            Loading…
          </p>
        )}

        {view === 'auth' && (
          <>
            <h1>Sign in to continue</h1>
            <p className="oauth-subtitle">
              Use your account before authorizing the application that sent you here.
            </p>
            <div className="oauth-segment" role="tablist" aria-label="Account access">
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
              <div className="oauth-alert oauth-alert-error" role="alert">
                {loginError}
              </div>
            )}
            <form onSubmit={handleAuthSubmit} className="oauth-form">
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
              <button type="submit" className="oauth-btn oauth-btn-primary" disabled={authSubmitting}>
                {authSubmitting ? 'Please wait…' : authMode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </>
        )}

        {view === 'consent' && (
          <>
            <h1>Authorize application</h1>
            <p className="oauth-subtitle">Review the request and approve or deny access.</p>
            <div className="oauth-client-info">
              <p className="oauth-client-label">Requesting application</p>
              <strong className="oauth-client-name">{clientName}</strong>
            </div>
            {scopes.length > 0 && (
              <div className="oauth-scopes">
                <span className="oauth-scopes-label">Requested permissions</span>
                <ul className="oauth-scope-list">
                  {scopes.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            <button
              type="button"
              className="oauth-btn oauth-btn-primary"
              disabled={consentSubmitting}
              onClick={handleApprove}
            >
              Approve
            </button>
            <button
              type="button"
              className="oauth-btn oauth-btn-danger"
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
            <p className="oauth-subtitle">{errorMessage}</p>
          </>
        )}
      </div>
    </div>
  )
}
