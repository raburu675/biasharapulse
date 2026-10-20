import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './styles/login.css'

// Dev (npm run dev) -> local backend. Build (Firebase) -> Render.
// VITE_API_BASE overrides both if set.
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV
    ? 'http://127.0.0.1:8000'
    : 'https://biasharapulse.onrender.com')

function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login/`, {
        username: identifier,
        password,
      })

      localStorage.setItem('token', res.data.token)
      localStorage.setItem('businessId', res.data.businessId)

      const pending = localStorage.getItem('pendingPlan')
      if (pending) {
        try {
          await axios.post(
            `${API_BASE}/api/business/${res.data.businessId}/select-plan/`,
            { tier: pending },
            { headers: { Authorization: `Token ${res.data.token}` } }
          )
        } catch {
          /* ignore */
        }
        localStorage.removeItem('pendingPlan')
      }
      localStorage.setItem('username', res.data.username)

      setRedirecting(true)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reach the server. Is the backend running?')
      setLoading(false)
    }
  }

  if (redirecting) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-brand">
          <span className="brand-biashara">Biashara</span>
          <span className="brand-pulse">Pulse</span>
        </div>
        <div className="auth-loading-spinner" />
        <span className="auth-loading-text">Taking you to your dashboard…</span>
      </div>
    )
  }

  return (
    <div className="login-shell">

      <Link to="/?view=landing" className="auth-home">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21V14H15V21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Home
      </Link>

      <div className="auth-box">

        <div className="auth-brand">
          <span className="brand-biashara">Biashara</span>
          <span className="brand-pulse">Pulse</span>
        </div>

        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to your Biashara Pulse account.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>

            <div className="field">
              <label htmlFor="identifier">Username or email</label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="your username or you@example.com"
                disabled={loading}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>

          </form>

          <div className="auth-switch">
            Don't have an account? <Link to="/signup">Create one</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Login