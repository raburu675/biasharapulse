import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './styles/auth.css'

function Signup() {
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
        //should login through django admin or hit its url to login
      const res = await axios.post('/api/auth/signup/', {
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
      <div className="auth-box">
        <div className="brand">BiasharaPulse</div>
        <h1>Create your account</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="businessName">Business name</label>
            <input id="businessName" type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="auth-submit" type="submit">Sign up</button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/">Log in</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup