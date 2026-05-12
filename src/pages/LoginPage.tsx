import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import './ConsentPage.css'

type AuthMode = 'signin' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState<AuthMode>('signin')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      if (session) navigate('/profile', { replace: true })
    })
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoginError(null)
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setLoginError('Enter email and password.')
      return
    }
    setSubmitting(true)
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
            'Check your email to confirm your account, then return here and sign in.',
          )
          return
        }
      }
      navigate('/profile', { replace: true })
    } finally {
      setSubmitting(false)
    }
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
          <h1>{authMode === 'signin' ? 'Sign in' : 'Create an account'}</h1>
          <p className="consent-subtitle">
            {authMode === 'signin'
              ? 'Use your email and password to open your profile.'
              : 'Register with email and password, then you will go to your profile.'}
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
              Register
            </button>
          </div>

          {loginError && (
            <div className="consent-alert consent-alert-error" role="alert">
              {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="consent-form">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
            />
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
            <button type="submit" className="consent-btn consent-btn-primary" disabled={submitting}>
              {submitting
                ? 'Please wait…'
                : authMode === 'signin'
                  ? 'Log in'
                  : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
