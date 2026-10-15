import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './styles/auth.css'

// Keep in sync with API_BASE in your other pages
const API_BASE = 'http://127.0.0.1:8000'

function Signup() {
  const [businessName, setBusinessName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Quick check here so the user gets an instant message
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Creates the user and their first business in one request
      const res = await axios.post(`${API_BASE}/api/auth/signup/`, {
        business_name: businessName,
        username,
        email,
        password,
      })

      // Same storage as login, so the app treats both the same way
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('businessId', res.data.businessId)
      // If the user picked a plan before signing up, apply it now
      const pending = localStorage.getItem('pendingPlan')
      if (pending) {
        try {
          await axios.post(
            `${API_BASE}/api/business/${res.data.businessId}/select-plan/`,
            { tier: pending },
            { headers: { Authorization: `Token ${res.data.token}` } }
          )
        } catch {
          /* ignore — they'll still land on Starter */
        }
        localStorage.removeItem('pendingPlan')
      }
      localStorage.setItem('username', res.data.username)

      // Already picked a plan → dashboard. Otherwise let them choose now.
      navigate(pending ? '/dashboard' : '/choose-plan')
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many sign-ups from this network. Please try again later.')
      } else {
        setError(err.response?.data?.error || 'Could not reach the server. Is the backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">

      <Link to="/?view=landing" className="auth-home">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 21V14H15V21"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Home
      </Link>

      <div className="auth-box">

        <div className="auth-brand">
          <span className="brand-biashara">Biashara</span>
          <span className="brand-pulse">Pulse</span>
        </div>

        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-subtitle">
            Set up your business on Biashara Pulse in a minute.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="field">
              <label htmlFor="business">Business name</label>
              <input
                id="business"
                type="text"
                autoComplete="organization"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. 34 Fitted"
              />
            </div>

            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>

          </form>

          <p className="auth-subtitle" style={{ marginTop: 14, textAlign: 'center' }}>
            By creating an account you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Signup