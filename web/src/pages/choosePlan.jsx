import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { api } from '../hooks/usePlan'
import './styles/choosePlan.css'

// Mirrors plans.py — keys must match PLANS
const TIERS = [
  {
    key: 'starter',
    name: 'Starter',
    price: 'Free',
    note: '30-day trial, no payment needed',
    perks: ['Dashboard, POS & orders', 'First 100 sales', '30-day history'],
    cta: 'Start free trial',
    recommended: true,
  },
  {
    key: 'lite',
    name: 'Biashara Lite',
    cur: 'KES',
    price: '1,299',
    note: 'per month',
    perks: ['Dashboard, POS & orders', 'Unlimited sales', 'Full history'],
    cta: 'Choose Lite',
  },
  {
    key: 'growth',
    name: 'Biashara Growth',
    cur: 'KES',
    price: '2,500',
    note: 'per month',
    perks: ['Everything in Lite', 'Stock movement', 'Product performance', 'QR scanning', 'Email reports'],
    cta: 'Choose Growth',
    popular: true,
  },
  {
    key: 'pro',
    name: 'Biashara Pro',
    cur: 'KES',
    price: '4,999',
    note: 'per month',
    perks: ['Everything in Growth', 'Staff accounts', 'Up to 3 branches'],
    cta: 'Choose Pro',
  },
  {
    key: 'multi_branch',
    name: 'Pro Multi-Branch',
    cur: 'KES',
    price: '7,999',
    note: 'per month',
    perks: ['Everything in Pro', 'Up to 5 branches'],
    cta: 'Choose Multi-Branch',
  },
]

const SPLASH_MS = 3000

function ChoosePlan() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('splash') // 'splash' | 'plans'
  const [busyKey, setBusyKey] = useState(null)
  const [error, setError] = useState('')

  const token = localStorage.getItem('token')
  const businessId = localStorage.getItem('businessId')
  const username = localStorage.getItem('username')

  // Auto-advance from the splash
  useEffect(() => {
    if (stage !== 'splash') return
    const t = setTimeout(() => setStage('plans'), SPLASH_MS)
    return () => clearTimeout(t)
  }, [stage])

  // Not signed in → nothing to choose
  if (!token || !businessId) return <Navigate to="/login" replace />

  const pick = async (tier) => {
    setError('')

    // Starter trial is already active from signup — just continue
    if (tier === 'starter') {
      navigate('/dashboard')
      return
    }

    setBusyKey(tier)
    try {
      // Dev-only endpoint. Swap for the M-Pesa flow later.
      await api.post(`/api/business/${businessId}/select-plan/`, { tier })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not switch plan. Is the backend running?')
      setBusyKey(null)
    }
  }

  // ── Stage 1: welcome splash ──
  if (stage === 'splash') {
    return (
      <div className="cp-splash">
        <div className="cp-splash-inner">
          <div className="cp-brand">
            <span className="cp-brand-sm">Biashara</span>
            <span className="cp-brand-lg">Pulse</span>
          </div>
          <h1 className="cp-splash-title">
            Welcome{username ? `, ${username}` : ''}
          </h1>
          <p className="cp-splash-sub">
            Your account is ready. Your 30-day free trial has started.
          </p>
          <button type="button" className="cp-btn cp-splash-btn" onClick={() => setStage('plans')}>
            Continue
          </button>
          <div className="cp-splash-bar" aria-hidden="true">
            <span style={{ animationDuration: `${SPLASH_MS}ms` }} />
          </div>
        </div>
      </div>
    )
  }

  // ── Stage 2: plan picker ──
  return (
    <div className="cp-shell">
      <div className="cp-head">
        <div className="cp-brand cp-brand-small">
          <span className="cp-brand-sm">Biashara</span>
          <span className="cp-brand-lg">Pulse</span>
        </div>
        <h2>Choose your plan</h2>
        <p>Start free and explore everything. You can upgrade any time.</p>
      </div>

      {error && <div className="cp-error">{error}</div>}

      <div className="cp-grid">
        {TIERS.map((t) => (
          <div
            key={t.key}
            className={`cp-card${t.recommended ? ' cp-start' : ''}${t.popular ? ' cp-popular' : ''}`}
          >
            {t.recommended && <span className="cp-badge cp-badge-start">Recommended</span>}
            {t.popular && <span className="cp-badge cp-badge-popular">Most popular</span>}
            <h3>{t.name}</h3>
            <div className="cp-price">
              {t.cur && <span className="cp-cur">{t.cur}</span>}
              {t.price}
            </div>
            <div className="cp-note">{t.note}</div>
            <ul>
              {t.perks.map((p) => <li key={p}>{p}</li>)}
            </ul>
            <button
              type="button"
              className={t.recommended ? 'cp-btn cp-btn-start' : 'cp-btn cp-btn-ghost'}
              disabled={busyKey !== null}
              onClick={() => pick(t.key)}
            >
              {busyKey === t.key ? 'Applying...' : t.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="cp-skip">
        <button type="button" onClick={() => navigate('/dashboard')} disabled={busyKey !== null}>
          Skip for now
        </button>
      </div>
    </div>
  )
}

export default ChoosePlan