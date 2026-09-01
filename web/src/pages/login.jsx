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
        //should login through django admin or hit its url to login
      const res = await axios.post('/api/auth/login/', { email, password })
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Incorrect email or password')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-box">
        <div className="brand">BiasharaPulse</div>
        <h1>Log in</h1>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="auth-submit" type="submit">Log in</button>
        </form>

        <div className="auth-switch">
          No account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  )
}

export default Login