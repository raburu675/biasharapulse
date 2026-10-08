import { useState, useEffect } from 'react'
import axios from 'axios'

// Keep in sync with API_BASE in your pages (swap to the Railway URL when deploying)
const API_BASE = 'http://127.0.0.1:8000'

// Fetches the business plan (features, limits, usage) so the UI can lock pages
export default function usePlan() {
  // Temporary fallback to 1, same placeholder the dashboard uses until real auth exists
  const businessId = localStorage.getItem('businessId') || 1
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/business/${businessId}/plan/`)
      .then((res) => setPlan(res.data))
      .catch(() => setPlan(null))
      .finally(() => setLoading(false))
  }, [businessId])

  // True only if the plan loaded and includes this feature
  const hasFeature = (feature) => !!plan && plan.features.includes(feature)

  return { plan, loading, hasFeature }
}