import { useState, useEffect, useCallback } from 'react'
import LoadingScreen from './LoadingScreen'
import axios from 'axios'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import Sidebar from './sidebar'
import './styles/dashboard.css'

// ── Config ─────────────────────────────────────
const API_BASE = 'https://biasharapulse-production.up.railway.app'
const BUSINESS_ID = 1 // replace with real business id (auth/context)

const PAYMENT_COLORS = { 'M-Pesa': '#16A34A', Cash: '#EAB308', Card: '#2563EB' }
const CATEGORY_COLORS = ['#800A26', '#0F766E', '#B45309', '#067A3B', '#6D28D9', '#DB2777']

const PERIOD_OPTIONS = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

// Formats a period's raw date string into a chart-friendly label,
// depending on the selected granularity
const formatPeriodLabel = (period, dateStr) => {
  const d = new Date(dateStr)
  if (period === 'daily') return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
  if (period === 'weekly') return `Wk ${d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
  return d.toLocaleDateString('en-KE', { month: 'short', year: '2-digit' })
}

function Dashboard() {
  const [activeMovementTab, setActiveMovementTab] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [period, setPeriod] = useState('monthly')

  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showImport, setShowImport] = useState(false)
  const [file, setFile] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [importing, setImporting] = useState(false)

  const fetchSummary = useCallback(async (p) => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/api/dashboard/${BUSINESS_ID}/summary/?period=${p}`)
      setSummary(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSummary(period)
  }, [period, fetchSummary])

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setImportResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${API_BASE}/api/products/${BUSINESS_ID}/import/`, formData)
      setImportResult(res.data)
      fetchSummary(period) // refresh dashboard with the newly imported data
    } catch (err) {
      setImportResult(err.response?.data || { error: err.message })
    } finally {
      setImporting(false)
    }
  }

  const closeImportModal = () => {
    setShowImport(false)
    setFile(null)
    setImportResult(null)
  }

  if (loading) return <LoadingScreen label="Loading your dashboard..." />
  if (error) return <div className="app-shell"><Sidebar current="dashboard" /><main className="main"><p>Error: {error}</p></main></div>

  // ── Reshape API response into what the charts expect ──
  // period_sales / period_expenses / period_margin come from the backend
  // already grouped by whichever granularity was requested
  const periodMap = {}
  summary.period_sales.forEach((r) => {
    const label = formatPeriodLabel(period, r.period)
    periodMap[r.period] = { ...periodMap[r.period], label, sales: r.total }
  })
  summary.period_expenses.forEach((r) => {
    const label = formatPeriodLabel(period, r.period)
    periodMap[r.period] = { ...periodMap[r.period], label, expenses: r.total }
  })
  summary.period_margin.forEach((r) => {
    const label = formatPeriodLabel(period, r.period)
    periodMap[r.period] = { ...periodMap[r.period], label, margin: r.margin }
  })
  // sort by the raw ISO key so chart stays chronological regardless of period type
  const salesData = Object.keys(periodMap).sort().map((key) => periodMap[key])

  const paymentSplit = summary.payment_channel_split.map((p) => ({
    name: p.channel,
    value: p.percent,
    color: PAYMENT_COLORS[p.channel] || '#999',
  }))

  const categoryVolume = summary.category_volume.map((c, i) => ({
    name: c.category,
    volume: c.percent,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  const recentSales = summary.recent_activity.map((s, i) => ({
    id: `TXN-${i}`,
    item: s.product,
    channel: s.payment_channel,
    amount: `KES ${s.amount}`,
    time: new Date(s.created_at).toLocaleString(),
  }))

  return (
    <div className="app-shell">
      <Sidebar current="dashboard" />

      <main className="main">
        {/* Header */}
        <header className="main-header">
          <div className="header-center">
            <h1>BiasharaPulse</h1>
            <p className="header-sub">Live metrics & inventory health</p>
          </div>

          <div className="header-right">
            <div className="live-badge">
              <span className="live-dot" />
              LIVE
            </div>

            <div className="dropdown-container">
              <button
                id="user-menu-btn"
                className="profile-btn"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
                aria-expanded={isMenuOpen}
              >
                <svg
                  className="user-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                <a href="/signin" className="dropdown-item">
                  Sign In
                </a>
                <a href="/signup" className="dropdown-item btn-signup">
                  Sign Up
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search SKU, product, or shelf..."
          />
          <button
            onClick={() => setShowImport(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#15803D",
              color: "#fff",
              fontWeight: 600,
              fontSize: "14px",
              padding: "10px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#166534")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#15803D")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Import files
          </button>
        </div>

        {/* Import modal */}
        {showImport && (
          <div
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}
            onClick={closeImportModal}
          >
            <div
              style={{ backgroundColor: '#fff', padding: 24, borderRadius: 10, width: 360 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0 }}>Import Products</h3>

              <a
                href={`${API_BASE}/api/products/import-template/`}
                style={{ color: '#15803D', fontWeight: 600, textDecoration: 'none' }}
              >
                ⬇ Download Template
              </a>

              <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                Fill in the template, then upload it below.
              </p>

              <input
                type="file"
                accept=".xlsx,.csv"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ marginTop: 12 }}
              />

              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button
                  onClick={handleImport}
                  disabled={!file || importing}
                  style={{
                    backgroundColor: '#15803D', color: '#fff', border: 'none',
                    padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                    opacity: !file || importing ? 0.6 : 1,
                  }}
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={closeImportModal}
                  style={{ backgroundColor: '#eee', border: 'none', padding: '8px 14px', borderRadius: 6, cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>

              {importResult?.error && <p style={{ color: 'red', marginTop: 12 }}>{importResult.error}</p>}
              {importResult?.created !== undefined && (
                <p style={{ marginTop: 12 }}>Created: {importResult.created}, Updated: {importResult.updated}</p>
              )}
              {importResult?.errors?.length > 0 && (
                <ul style={{ color: 'red', fontSize: 13 }}>
                  {importResult.errors.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <section className="hero-banner">
          <div className="hero-banner-top">
            <div>
              <span className="hero-banner-label">NET REVENUE (TOTAL)</span>
              <div className="hero-banner-value">KES {Number(summary.net_revenue).toLocaleString()}</div>
            </div>
            <div className="hero-banner-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
          </div>
          <div className="hero-banner-divider" />
          <div className="hero-mini-grid">
            <div className="hero-mini">
              <span>Expenses</span>
              <strong className="text-purple">KES {Number(summary.expenses).toLocaleString()}</strong>
            </div>
            <div className="hero-mini">
              <span>Net Profit</span>
              <strong className="text-green">KES {Number(summary.net_profit).toLocaleString()}</strong>
            </div>
            <div className="hero-mini">
              <span>Net Margin</span>
              <strong className="text-green">{summary.net_margin}%</strong>
            </div>
            <div className="hero-mini">
              <span>Active Inventory</span>
              <strong className="text-ivory">{summary.active_inventory} Pcs</strong>
            </div>
          </div>
        </section>

        {/* Period toggle — controls both charts below */}
        <div style={{ display: 'flex', gap: 8, margin: '20px 0 4px' }}>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid #E2E8F0',
                background: period === opt.key ? '#15803D' : '#fff',
                color: period === opt.key ? '#fff' : '#333',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Analytics Grid */}
        <section className="analytics-grid">
          <div className="chart-section sales-card">
            <div className="chart-card-header">
              <h2>Sales & Expense Breakdown</h2>
              <p className="chart-sub">By {period.replace('ly', '')} (KES)</p>
            </div>
            {salesData.length === 0 ? (
              <p className="chart-empty">No sales data yet — import products or record a sale to see this chart.</p>
            ) : (
              <>
                <div style={{ height: 180, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart data={salesData}>
                      <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-main)' }} />
                      <Bar dataKey="expenses" fill="var(--color-expenses, #EF4444)" radius={[4, 4, 0, 0]} name="Expenses" />
                      <Bar dataKey="sales" fill="var(--color-sales, #16A34A)" radius={[4, 4, 0, 0]} name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-legend">
                  <span><i className="dot dot-expenses" /> Expenses</span>
                  <span><i className="dot dot-sales" /> Sales</span>
                </div>
              </>
            )}
          </div>

          <div className="chart-section margin-card">
            <div className="chart-card-header">
              <h2>Profit Margin Trend</h2>
              <p className="chart-sub">Percentage (%) shift {period}</p>
            </div>
            {salesData.length === 0 ? (
              <p className="chart-empty">No margin data yet.</p>
            ) : (
              <div style={{ height: 180, width: '100%' }}>
                <ResponsiveContainer>
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--kenya-green, #16A34A)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--kenya-green, #16A34A)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                      tickFormatter={(val) => `${Math.round(val)}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Margin']}
                      contentStyle={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="margin"
                      stroke="var(--kenya-green, #16A34A)"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#marginGrad)"
                      name="Margin (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="chart-section channel-card">
            <div className="chart-card-header">
              <h2>Payment Channels</h2>
              <p className="chart-sub">Volume ratio by tender</p>
            </div>
            {paymentSplit.length === 0 ? (
              <p className="chart-empty">No sales recorded yet.</p>
            ) : (
              <div className="payment-channel-container">
                <div style={{ flex: 1, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentSplit} innerRadius={32} outerRadius={52} paddingAngle={4} dataKey="value">
                        {paymentSplit.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <aside className="payment-legend-aside">
                  {paymentSplit.map((item) => (
                    <div key={item.name} className="legend-item">
                      <span className="legend-swatch" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                      <span className="legend-value">{item.value}%</span>
                    </div>
                  ))}
                </aside>
              </div>
            )}
          </div>

          <div className="chart-section volume-card">
            <div className="chart-card-header">
              <h2>Category Sales Volume</h2>
              <p className="chart-sub">Product velocity mix</p>
            </div>
            {categoryVolume.length === 0 ? (
              <p className="chart-empty">No category data yet — import some products first.</p>
            ) : (
              <div className="category-progress-list">
                {categoryVolume.map((cat) => (
                  <div key={cat.name}>
                    <div className="category-item-header">
                      <span>{cat.name}</span>
                      <span style={{ fontWeight: 700 }}>{cat.volume}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${cat.volume}%`, backgroundColor: cat.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lower Feeds */}
        <section className="activity-grid">
          <div className="chart-section activity-card">
            <div className="chart-card-header">
              <h2>Recent Activity</h2>
              <p className="chart-sub">Real-time sales stream</p>
            </div>
            {recentSales.length === 0 ? (
              <p className="chart-empty">No recent sales.</p>
            ) : (
              <div className="feed-list">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="feed-item">
                    <div>
                      <div className="feed-title">{sale.item}</div>
                      <div className="feed-sub">
                        {sale.id} <span className="feed-badge">{sale.channel}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="feed-val">{sale.amount}</div>
                      <div className="feed-sub">{sale.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Audit Logs — still mock, wire to stock_movements endpoint separately */}
          <div className="chart-section audit-card">
            <div className="chart-card-header">
              <h2>Stock Audit Logs</h2>
              <p className="chart-sub">Inventory mutations & system alerts</p>
            </div>

            <div className="tab-chips">
              {['All Logs', 'Adjustments', 'Reorder Alerts'].map((tabLabel, idx) => (
                <button
                  key={tabLabel}
                  onClick={() => setActiveMovementTab(idx)}
                  className={`tab-chip ${activeMovementTab === idx ? 'active' : ''}`}
                >
                  {tabLabel}
                </button>
              ))}
            </div>

            <div className="feed-list">
              <p className="chart-empty">Wire this to /api/dashboard/{BUSINESS_ID}/stock-movements/ next.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard