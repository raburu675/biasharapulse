import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './styles/auth.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const res = await axios.post('/api/auth/login/', { email, password })
      localStorage.setItem('token', res.data.token)
      // PLAN: needed by usePlan() to fetch this business's plan
      localStorage.setItem('businessId', res.data.business_id)
      navigate('/dashboard')
    } catch (err) {
      setError('Incorrect email or password')
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
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button className="auth-submit" type="submit">
              Sign in
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