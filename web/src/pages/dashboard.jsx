import { useState, useEffect, useCallback } from 'react'
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

// ── Brand color system — matches landing.css tokens ─────────────────────
const BRAND = {
  burgundy: '#7A0C29',
  burgundyHover: '#5C0A20',
  green: '#0F7A44',
  greenHover: '#0B5E35',
  amber: '#D97706',
  blue: '#1E3A8A',
  red: '#B91C1C',
  ink: '#14110F',
  inkSoft: '#6B6560',
  line: '#E7E5E2',
  surface: '#FFFFFF',
}

const PAYMENT_COLORS = { mpesa: BRAND.green, cash: BRAND.amber, card: BRAND.blue }
const PAYMENT_LABELS = { mpesa: 'M-Pesa', cash: 'Cash', card: 'Card' }
const CATEGORY_COLORS = [BRAND.burgundy, BRAND.green, BRAND.amber, BRAND.blue, '#6D28D9', '#DB2777']

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

// Stock movement rows: amber for a low-stock alert, red if it left the
// product at zero, green for a normal, healthy stock-in/waste-damage entry
const getMovementColor = (m) => {
  if (m.type === 'Low Stock Alert') return BRAND.amber
  if (m.currentStock === 0) return BRAND.red
  return BRAND.green
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

  const [movements, setMovements] = useState([])
  const [movementsLoading, setMovementsLoading] = useState(true)
  const [movementsError, setMovementsError] = useState(null)

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

  // Pulls the recent stock movement log — same endpoint the Stock Movement
  // page uses. Fetched once; the 3 tab chips filter client-side below.
  const fetchMovements = useCallback(async () => {
    setMovementsLoading(true)
    setMovementsError(null)
    try {
      const res = await axios.get(`${API_BASE}/api/dashboard/${BUSINESS_ID}/stock-movements/`)
      setMovements(res.data.movements)
    } catch (err) {
      setMovementsError(err.message)
    } finally {
      setMovementsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

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
      fetchSummary(period)
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

  if (loading) return <div className="app-shell"><Sidebar current="dashboard" /><main className="main"><p>Loading dashboard...</p></main></div>
  if (error) return <div className="app-shell"><Sidebar current="dashboard" /><main className="main"><p>Error: {error}</p></main></div>

  // ── Reshape API response into what the charts expect ──
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
  const salesData = Object.keys(periodMap).sort().map((key) => periodMap[key])

  const paymentSplit = summary.payment_channel_split.map((p) => ({
    name: PAYMENT_LABELS[p.channel] || p.channel,
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
              <span className="brand-biashara">Biashara</span>
              <span className="brand-pulse">Pulse</span>                                     
          </div>

          <div className="header-right">        
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

        {/* Toolbar — replaces the old unused search bar. Import is the only
            real action here, so it gets full visual weight instead of
            competing with a search field that did nothing. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '4px 0 20px',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: BRAND.ink, letterSpacing: '-0.01em', margin: 0 }}>
              Overview
            </h2>
            <p style={{ fontSize: 10.5, color: BRAND.inkSoft, margin: '2px 0 0' }}>
              Snapshot of sales, stock, and cash flow
            </p>
          </div>

          <button
            onClick={() => setShowImport(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              backgroundColor: '#2D030D',
              color: '#fff',
              fontWeight: 600,
              fontSize: 10.5,
              padding: '8px 17px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 16px -4px rgba(122, 12, 41, 0.4)',
              transition: 'background-color 0.18s ease, transform 0.18s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = BRAND.burgundy; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#2D030D';e.currentTarget.style.transform = 'translateY(0)';}}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            Import Products
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
              style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, width: 360 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginTop: 0, fontSize: 16, fontWeight: 700, color: BRAND.ink }}>Import Products</h3>

              <a
                href={`${API_BASE}/api/products/import-template/`}
                style={{ color: BRAND.green, fontWeight: 600, textDecoration: 'none', fontSize: 13.5 }}
              >
                ⬇ Download Template
              </a>

              <p style={{ fontSize: 13, color: BRAND.inkSoft, marginTop: 8 }}>
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
                    backgroundColor: BRAND.burgundy, color: '#fff', border: 'none',
                    padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    opacity: !file || importing ? 0.6 : 1,
                  }}
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
                <button
                  onClick={closeImportModal}
                  style={{ backgroundColor: '#F3F1EE', border: `1px solid ${BRAND.line}`, padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
                >
                  Cancel
                </button>
              </div>

              {importResult?.error && <p style={{ color: BRAND.red, marginTop: 12, fontSize: 13 }}>{importResult.error}</p>}
              {importResult?.created !== undefined && (
                <p style={{ marginTop: 12, fontSize: 13 }}>Created: {importResult.created}, Updated: {importResult.updated}</p>
              )}
              {importResult?.errors?.length > 0 && (
                <ul style={{ color: BRAND.red, fontSize: 12.5 }}>
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
              <strong className="">KES {Number(summary.expenses).toLocaleString()}</strong>
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

        {/* Period toggle */}
        <div style={{ display: 'flex', gap: 8, margin: '20px 0 4px' }}>
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setPeriod(opt.key)}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              border: `1px solid ${period === opt.key ? '#2D030D' : BRAND.line}`,
              background: period === opt.key ? '#2D030D' : '#fff',
              color: period === opt.key ? '#fff' : BRAND.ink,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
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
                      <XAxis dataKey="label" stroke={BRAND.inkSoft} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: `1px solid ${BRAND.line}`, borderRadius: 8 }} />
                      <Bar dataKey="expenses" fill="#000" radius={[4, 4, 0, 0]} name="Expenses" />
                      <Bar dataKey="sales" fill="#008B55" radius={[4, 4, 0, 0]} name="Sales" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-legend">
                  <span><i className="dot" style={{ backgroundColor: "#000" }} /> Expenses</span>
                  <span><i className="dot" style={{ backgroundColor: "#008B55" }} /> Sales</span>
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
                        <stop offset="5%" stopColor={BRAND.green} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={BRAND.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" stroke={BRAND.inkSoft} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis
                      stroke={BRAND.inkSoft}
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                      tickFormatter={(val) => `${Math.round(val)}%`}
                    />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Margin']}
                      contentStyle={{ backgroundColor: '#fff', border: `1px solid ${BRAND.line}`, borderRadius: 8 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="margin"
                      stroke={BRAND.green}
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
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: `1px solid ${BRAND.line}`, borderRadius: 8 }} />
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
              <h2>Recent Sales Activity</h2>
              <p className="chart-sub">Real-time sales stream, whether it happened through the POS "Record Sale" button or an order marked "delivered." It answers: "what did I sell recently"</p>
            </div>
            {recentSales.length === 0 ? (
              <p className="chart-empty">No recent sales.</p>
            ) : (
              <div className="feed-list">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="feed-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: PAYMENT_COLORS[sale.channel] || BRAND.amber,
                      }} />
                      <div>
                        <div className="feed-title">{sale.item}</div>
                        <div className="feed-sub">
                          {sale.id} <span className="feed-badge">{PAYMENT_LABELS[sale.channel] || sale.channel}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="feed-val" style={{ color: PAYMENT_COLORS[sale.channel] || BRAND.amber }}>{sale.amount}</div>
                      <div className="feed-sub">{sale.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Audit Logs — wired to /stock-movements/, colored by severity */}
          <div className="chart-section audit-card">
            <div className="chart-card-header">
              <h2>Stock Audit Logs</h2>
              <p className="chart-sub">Inventory Movement,Every row comes from StockMovement page — a restock, a waste/damage write-off, or a system-generated low-stock warning.</p>
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

            {movementsLoading ? (
              <p className="chart-empty">Loading movements...</p>
            ) : movementsError ? (
              <p className="chart-empty">Couldn't load movements: {movementsError}</p>
            ) : (
              (() => {
                const filtered = movements.filter((m) => {
                  if (activeMovementTab === 1) return m.type !== 'Low Stock Alert'
                  if (activeMovementTab === 2) return m.type === 'Low Stock Alert'
                  return true
                }).slice(0, 5)

                return filtered.length === 0 ? (
                  <p className="chart-empty">No stock movements yet.</p>
                ) : (
                  <div className="feed-list">
                    {filtered.map((m) => (
                      <div key={m.id} className="feed-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            backgroundColor: getMovementColor(m),
                          }} />
                          <div>
                            <div className="feed-title">{m.type}: {m.item}</div>
                            <div className="feed-sub">
                              By {m.user} <span className="feed-badge">{m.category}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="feed-val" style={{ color: getMovementColor(m) }}>{m.qty}</div>
                          <div className="feed-sub">{new Date(m.time).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard