import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './sidebar'
import { api } from '../hooks/usePlan'
import './styles/account.css'

const PLAN_LABELS = {
  starter: 'Starter',
  lite: 'Biashara Lite',
  growth: 'Biashara Growth',
  pro: 'Biashara Pro',
  multi_branch: 'Pro Multi-Branch',
}

// Only the fields you can edit here
const emptyForm = { email: '', phone: '', location: '', businessName: '' }

function Account() {
  const navigate = useNavigate()

  const [username, setUsername] = useState(localStorage.getItem('username') || '')
  const [tier, setTier] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [saved, setSaved] = useState(emptyForm) // last loaded values, used by Discard
  const [dirty, setDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fill the page from what was entered at signup
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const { data } = await api.get('/api/auth/me/')
        if (cancelled) return

        const businessId = Number(localStorage.getItem('businessId'))
        const business = data.businesses.find((b) => b.id === businessId) || data.businesses[0]

        const loaded = {
          email: data.email || '',
          phone: '',
          location: '',
          businessName: business?.name || '',
        }
        setUsername(data.username)
        setTier(business?.subscription_tier || '')
        setForm(loaded)
        setSaved(loaded)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Could not load your account.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setDirty(true)
  }

  const handleSave = () => {
    // TODO: persist changes (needs an update endpoint on the backend)
    setSaved(form)
    setDirty(false)
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/')
    } catch {
      /* token may already be expired */
    }
    localStorage.removeItem('token')
    localStorage.removeItem('businessId')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const initials = (username || '?').slice(0, 2).toUpperCase()

  return (
    <div className="acct-layout">
      <Sidebar current="account" />

      <div className="acct-page">

        {/* Mobile top strip — matches the dashboard navbar on phones */}
        <div className="acct-topbar">
          <span className="acct-topbar-dot" />
          <span className="acct-topbar-title">Account</span>
        </div>

        <div className="acct-header">
          <h1>Account</h1>
          <p>Manage your profile, business details, and security.</p>
        </div>

        {error && <p className="acct-security-sub" style={{ color: '#B91C1C' }}>{error}</p>}

        <div className="acct-grid">
          <div className="acct-card acct-profile-card">
            <div className="acct-avatar">{initials}</div>
            <h2>{username}</h2>
            <p className="acct-email">{loading ? 'Loading...' : form.email || 'No email on file'}</p>
            <span className="acct-badge">Owner</span>

            <div className="acct-meta">
              <div className="acct-meta-row">
                <span>Business</span>
                <span>{saved.businessName || '—'}</span>
              </div>
              <div className="acct-meta-row">
                <span>Plan</span>
                <span>{PLAN_LABELS[tier] || '—'}</span>
              </div>
              {saved.location && (
                <div className="acct-meta-row">
                  <span>Location</span>
                  <span>{saved.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="acct-card acct-form-card">
            <h3>Profile details</h3>
            <div className="acct-field-grid">
              <label className="acct-field">
                <span>Username</span>
                <input
                  type="text"
                  value={username}
                  readOnly
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </label>
              <label className="acct-field">
                <span>Email</span>
                <input type="email" value={form.email} onChange={handleChange('email')} />
              </label>
              <label className="acct-field">
                <span>Phone number</span>
                <input type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+254 ..." />
              </label>
              <label className="acct-field">
                <span>Location</span>
                <input type="text" value={form.location} onChange={handleChange('location')} placeholder="e.g. Nairobi, Kenya" />
              </label>
            </div>

            <div className="acct-divider" />

            <h3>Business details</h3>
            <div className="acct-field-grid">
              <label className="acct-field acct-field-wide">
                <span>Business name</span>
                <input type="text" value={form.businessName} onChange={handleChange('businessName')} />
              </label>
            </div>

            <div className="acct-divider" />

            <h3>Security</h3>
            <div className="acct-security-row">
              <div>
                <p className="acct-security-title">Password</p>
                <p className="acct-security-sub">Last changed 3 months ago</p>
              </div>
              <button className="acct-btn-secondary">Change password</button>
            </div>
            <div className="acct-security-row">
              <div>
                <p className="acct-security-title">Two-factor authentication</p>
                <p className="acct-security-sub">Not enabled</p>
              </div>
              <button className="acct-btn-secondary">Enable</button>
            </div>

            <div className="acct-divider" />

            <h3>Session</h3>
            <div className="acct-security-row">
              <div>
                <p className="acct-security-title">Sign out</p>
                <p className="acct-security-sub">Sign out of this device. You can sign back in anytime.</p>
              </div>
              <button className="acct-btn-signout" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>

            <div className="acct-divider" />

            <div className="acct-danger-zone">
              <div>
                <p className="acct-security-title">Delete account</p>
                <p className="acct-security-sub">This permanently removes your data and cannot be undone.</p>
              </div>
              <button className="acct-btn-danger">Delete</button>
            </div>
          </div>
        </div>

        {dirty && (
          <div className="acct-save-bar">
            <span>You have unsaved changes</span>
            <div className="acct-save-actions">
              <button
                className="acct-btn-secondary"
                onClick={() => { setForm(saved); setDirty(false) }}
              >
                Discard
              </button>
              <button className="acct-btn-primary" onClick={handleSave}>
                Save changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Account