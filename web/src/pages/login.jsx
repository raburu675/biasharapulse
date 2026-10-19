import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './styles/auth.css'

// Keep in sync with API_BASE in your other pages
// const API_BASE = 'http://127.0.0.1:8000'
const API_BASE = 'https://your-backend.onrender.com'

function Login() {
  const [identifier, setIdentifier] = useState('') // username or email
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
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

      // If the user picked a plan before signing in, apply it now
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

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reach the server. Is the backend running?')
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
          <h1>Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to your Biashara Pulse account.
          </p>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

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
                required
              />
            </div>

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
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