import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './sidebar'
import usePlan, { api } from '../hooks/usePlan'

// Mirrors plans.py: keys must match PLANS
const TIERS = [
  { key: 'starter', name: 'Starter', price: 'Free', note: '30-day trial',
    perks: ['Dashboard, POS & orders', 'First 100 sales', '30-day history'] },
  { key: 'lite', name: 'Biashara Lite', cur: 'KES', price: '1,299', note: 'per month',
    perks: ['Dashboard, POS & orders', 'Unlimited sales', 'Full history'] },
  { key: 'growth', name: 'Biashara Growth', cur: 'KES', price: '2,500', note: 'per month',
    perks: ['Everything in Lite', 'Stock movement', 'Product performance', 'QR scanning', 'Email reports'] },
  { key: 'pro', name: 'Biashara Pro', cur: 'KES', price: '4,999', note: 'per month',
    perks: ['Everything in Growth', 'Staff accounts', 'Up to 3 branches'] },
  { key: 'multi_branch', name: 'Pro Multi-Branch', cur: 'KES', price: '7,999', note: 'per month',
    perks: ['Everything in Pro', 'Up to 5 branches'] },
]

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : null

const styles = `
.upg-shell { display: flex; min-height: 100vh; background: var(--bg-primary); color: var(--text-main); font-family: inherit; }
.upg-main { flex: 1; padding: 48px 32px; max-width: 1200px; margin: 0 auto; }
.upg-main h1 { margin: 0 0 8px; font-size: var(--fs-xxl); font-weight: 800; letter-spacing: -0.02em; }
.upg-sub { margin: 0 0 24px; font-size: var(--fs-md); color: var(--text-muted); }

.upg-status {
  margin-bottom: 28px; padding: 14px 18px; border-radius: var(--radius-sm);
  background: var(--card-surface); border: 1px solid var(--border-subtle);
  font-size: var(--fs-sm); color: var(--text-muted);
}
.upg-status strong { color: var(--text-main); }
.upg-status.locked { background: var(--emerald-light); border-color: var(--emerald-main); }
.upg-status.expired { background: var(--burgundy-light); border-color: var(--burgundy-rich); }

.upg-error {
  margin-bottom: 20px; padding: 12px 16px; border-radius: var(--radius-sm);
  background: var(--burgundy-light); border: 1px solid var(--burgundy-rich);
  color: var(--burgundy-rich); font-size: var(--fs-sm);
}

.upg-grid { display: grid; gap: 18px; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); }
.upg-card {
  display: flex; flex-direction: column; padding: 26px 22px;
  background: var(--card-surface); border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md); box-shadow: var(--shadow-sm);
}
.upg-card.current { border: 2px solid var(--emerald-main); }
.upg-card h2 { margin: 0 0 6px; font-size: var(--fs-lg); font-weight: 700; }
.upg-tag { min-height: 20px; margin-bottom: 10px; font-size: var(--fs-xs); font-weight: 600; color: var(--emerald-main); }
.upg-price { font-size: var(--fs-price); font-weight: 800; line-height: 1; letter-spacing: -0.02em; }
.upg-cur { margin-right: 6px; font-size: var(--fs-sm); font-weight: 600; color: var(--text-muted); letter-spacing: 0; }
.upg-note { margin: 8px 0 18px; font-size: var(--fs-xs); color: var(--text-faint); }

.upg-card ul { flex: 1; margin: 0 0 22px; padding: 0; list-style: none; }
.upg-card li { position: relative; padding: 6px 0 6px 24px; font-size: var(--fs-sm); color: var(--text-muted); line-height: 1.4; }
.upg-card li::before { content: '✓'; position: absolute; left: 0; top: 6px; color: var(--emerald-main); font-weight: 700; }

.upg-btn {
  width: 100%; padding: 13px 18px; border: 0; border-radius: var(--radius-sm); cursor: pointer;
  background: var(--burgundy-rich); color: #fff;
  font-family: inherit; font-size: var(--fs-btn); font-weight: 600;
  transition: background 0.2s var(--ease);
}
.upg-btn:hover:not(:disabled) { background: var(--burgundy-hover); }
.upg-btn:disabled { background: var(--border-subtle); color: var(--text-faint); cursor: not-allowed; }
.upg-btn.is-current { background: var(--emerald-light); color: var(--emerald-main); }

@media (max-width: 600px) { .upg-main { padding: 32px 16px; } }
`

function Upgrade() {
  const navigate = useNavigate()
  const { plan, loading } = usePlan()
  const [busyKey, setBusyKey] = useState(null)
  const [error, setError] = useState('')

  const businessId = localStorage.getItem('businessId')

  const planKey = plan?.plan // 'starter' | 'lite' | ... | 'expired'
  const onPaid = !!planKey && planKey !== 'starter' && planKey !== 'expired'
  const expired = planKey === 'expired'

  const pick = async (tier) => {
    setError('')
    setBusyKey(tier)
    try {
      // Dev-only endpoint. Swap for the M-Pesa flow later.
      await api.post(`/api/business/${businessId}/select-plan/`, { tier })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not switch plan. Please try again.')
      setBusyKey(null)
    }
  }

  let statusText = null
  if (plan) {
    if (onPaid) {
      statusText = (
        <>
          <strong>You're on {TIERS.find((t) => t.key === planKey)?.name}</strong>
          {plan.paid_until ? `, active until ${fmt(plan.paid_until)}` : ''}. You can pick a new plan once it expires.
        </>
      )
    } else if (expired) {
      statusText = <><strong>Your plan has expired.</strong> Pick a plan to keep recording sales and orders.</>
    } else {
      statusText = (
        <>
          <strong>You're on the Starter trial</strong>
          {plan.trial_ends ? `, ending ${fmt(plan.trial_ends)}` : ''}.
        </>
      )
    }
  }

  const buttonFor = (t) => {
    if (t.key === planKey) return <button className="upg-btn is-current" disabled>Current plan</button>
    if (onPaid) return <button className="upg-btn" disabled>Available after expiry</button>
    if (t.key === 'starter') return <button className="upg-btn" disabled>Trial already started</button>
    return (
      <button className="upg-btn" disabled={busyKey !== null} onClick={() => pick(t.key)}>
        {busyKey === t.key ? 'Applying...' : `Choose ${t.name}`}
      </button>
    )
  }

  return (
    <div className="upg-shell">
      <style>{styles}</style>

      <Sidebar current="upgrade" />

      <main className="upg-main">
        <h1>Upgrade your plan</h1>
        <p className="upg-sub">Unlock the full BiasharaPulse toolkit.</p>

        {!loading && statusText && (
          <div className={`upg-status${onPaid ? ' locked' : ''}${expired ? ' expired' : ''}`}>
            {statusText}
          </div>
        )}

        {error && <div className="upg-error">{error}</div>}

        <div className="upg-grid">
          {TIERS.map((t) => (
            <div key={t.key} className={`upg-card${t.key === planKey ? ' current' : ''}`}>
              <h2>{t.name}</h2>
              <span className="upg-tag">{t.key === planKey ? 'Current plan' : ' '}</span>
              <div className="upg-price">
                {t.cur && <span className="upg-cur">{t.cur}</span>}
                {t.price}
              </div>
              <div className="upg-note">{t.note}</div>
              <ul>
                {t.perks.map((p) => <li key={p}>{p}</li>)}
              </ul>
              {loading ? <button className="upg-btn" disabled>Loading...</button> : buttonFor(t)}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Upgrade