import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './styles/auth.css'

function Signup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const res = await axios.post('/api/auth/signup/', {
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
        email,
        password,
      })

      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Could not create account. Check your details.')
    }
  }

  return (
    <div className="auth-shell">
      <Link to="/?view=landing" className="auth-home">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21V14H15V21" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
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
          <p className="auth-subtitle">Set up your Biashara Pulse account.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="name-fields">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" required />
              </div>

              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="businessName">Business name</label>
              <input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Your business name" required />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="password-field">
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button className="auth-submit" type="submit">Create account</button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup