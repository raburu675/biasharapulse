import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

// Keep in sync with API_BASE in your pages (swap to the Railway URL when deploying)
// const API_BASE = 'http://127.0.0.1:8000'
const API_BASE = 'https://biasharapulse.onrender.com'

// ═══════════════════════════════════════════════════════════
//  AXIOS INSTANCE
//  Every page that talks to Django should import { api } from this file
//  and use api.get / api.post instead of axios.get / axios.post.
//  The interceptors below attach the token and handle 401s globally.
// ═══════════════════════════════════════════════════════════

export const api = axios.create({ baseURL: API_BASE })

// ── REQUEST interceptor: attach the auth token if we have one ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

// ── RESPONSE interceptor: bounce to /login on 401 ──
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('businessId')
      localStorage.removeItem('username')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ═══════════════════════════════════════════════════════════
//  usePlan — fetches the business plan so the UI can gate features
// ═══════════════════════════════════════════════════════════

export default function usePlan() {
  // Read businessId from localStorage. No businessId → not signed in.
  const businessId = localStorage.getItem('businessId')

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(!!businessId)
  const [error, setError] = useState(null)

  useEffect(() => {
    // No businessId → nothing to fetch
    if (!businessId) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .get(`/api/business/${businessId}/plan/`)
      .then((res) => {
        if (cancelled) return
        setPlan(res.data)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        // Fail CLOSED — unknown plan means every gated feature stays locked
        setPlan(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [businessId])

  // Safely normalise whatever the backend sent into an array of strings.
  const features = (() => {
    const raw = plan?.features
    if (Array.isArray(raw)) return raw
    if (raw && typeof raw === 'object') {
      return Object.entries(raw).filter(([, v]) => !!v).map(([k]) => k)
    }
    return []
  })()

  // True ONLY if the plan loaded and the feature is explicitly present
  const hasFeature = (feature) => {
    if (!feature) return true            // non-gated item → always visible
    if (loading) return false            // don't flash unlocked during load
    if (!plan) return false              // no plan → locked
    return features.includes(feature)
  }

  // True when trial or paid subscription has ended
  const isExpired = plan?.plan === 'expired'

  return { plan, loading, error, features, hasFeature, isExpired }
}

// ═══════════════════════════════════════════════════════════
//  UpgradeModal — shown when a user clicks a locked feature
// ═══════════════════════════════════════════════════════════

export function UpgradeModal({ item, onClose }) {
  if (!item) return null
  return (
    <div className="sbx-modal-overlay" onClick={onClose}>
      <div className="sbx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-lock">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h3>Upgrade to unlock {item.label}</h3>
        <p>
          {item.label} is included from {item.requires} onwards. Upgrade to start using it.
        </p>
        <div className="sbx-modal-actions">
          <Link
            to="/?view=landing#pricing"
            className="sbx-modal-primary"
            onClick={onClose}
          >
            View pricing
          </Link>
          <button
            type="button"
            className="sbx-modal-secondary"
            onClick={onClose}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  SubscriptionExpiredModal — shown when trial/subscription ended
// ═══════════════════════════════════════════════════════════

export function SubscriptionExpiredModal({ open, plan, onClose }) {
  if (!open) return null

  const trialEnded = plan?.plan === 'expired' && plan?.subscription_tier === 'starter'
  const title = trialEnded ? 'Your free month has ended' : 'Your subscription expired'
  const body = trialEnded
    ? 'Your Starter trial finished. Pick a plan to keep using BiasharaPulse.'
    : 'Renew your plan to regain access to your dashboard.'

  return (
    <div className="sbx-modal-overlay" onClick={onClose}>
      <div className="sbx-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sbx-modal-lock sbx-modal-lock-danger">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="sbx-modal-actions">
          <Link
            to="/?view=landing#pricing"
            className="sbx-modal-primary"
            onClick={onClose}
          >
            Choose a plan
          </Link>
          <button
            type="button"
            className="sbx-modal-secondary"
            onClick={onClose}
          >
            Not right now
          </button>
        </div>
      </div>
    </div>
  )
}