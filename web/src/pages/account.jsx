import { useState } from 'react'
import Sidebar from './sidebar'
import './styles/account.css'

const initialData = {
  name: 'Don Raburu',
  email: 'don@biasharapulse.com',
  phone: '+254 712 345 678',
  businessName: "Don's General Store",
  location: 'Nairobi, Kenya',
}

function Account() {
  const [form, setForm] = useState(initialData)
  const [dirty, setDirty] = useState(false)

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value })
    setDirty(true)
  }

  const handleSave = () => {
    // TODO: persist changes
    setDirty(false)
  }

  const initials = form.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="acct-layout">
      <Sidebar current="account" />

      <div className="acct-page">
        <div className="acct-header">
          <h1>Account</h1>
          <p>Manage your profile, business details, and security.</p>
        </div>

        <div className="acct-grid">
          <div className="acct-card acct-profile-card">
            <div className="acct-avatar">{initials}</div>
            <h2>{form.name}</h2>
            <p className="acct-email">{form.email}</p>
            <span className="acct-badge">Owner</span>

            <div className="acct-meta">
              <div className="acct-meta-row">
                <span>Business</span>
                <span>{form.businessName}</span>
              </div>
              <div className="acct-meta-row">
                <span>Location</span>
                <span>{form.location}</span>
              </div>
            </div>
          </div>

          <div className="acct-card acct-form-card">
            <h3>Profile details</h3>
            <div className="acct-field-grid">
              <label className="acct-field">
                <span>Full name</span>
                <input type="text" value={form.name} onChange={handleChange('name')} />
              </label>
              <label className="acct-field">
                <span>Email</span>
                <input type="email" value={form.email} onChange={handleChange('email')} />
              </label>
              <label className="acct-field">
                <span>Phone number</span>
                <input type="tel" value={form.phone} onChange={handleChange('phone')} />
              </label>
              <label className="acct-field">
                <span>Location</span>
                <input type="text" value={form.location} onChange={handleChange('location')} />
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
              <button className="acct-btn-secondary" onClick={() => { setForm(initialData); setDirty(false) }}>
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