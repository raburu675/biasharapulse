import { useState } from 'react'
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

// ── Initial Mock Data ─────────────────────────────────────
const initialSalesData = [
  { month: 'Jan', sales: 124000, expenses: 62000, margin: 50.0 },
  { month: 'Feb', sales: 158000, expenses: 71000, margin: 55.0 },
  { month: 'Mar', sales: 112000, expenses: 58000, margin: 48.2 },
  { month: 'Apr', sales: 186000, expenses: 84000, margin: 54.8 },
  { month: 'May', sales: 213000, expenses: 92000, margin: 56.8 },
  { month: 'Jun', sales: 261000, expenses: 105000, margin: 59.7 },
  { month: 'Jul', sales: 197000, expenses: 89000, margin: 54.8 },
]

const paymentSplit = [
  { name: 'M-Pesa', value: 62, color: '#16A34A' },
  { name: 'Cash', value: 23, color: '#EAB308' },
  { name: 'Card', value: 15, color: '#2563EB' },
]

const categoryVolume = [
  { name: 'Beverages', volume: 42, color: '#800A26' },
  { name: 'Snacks & Edibles', volume: 28, color: '#0F766E' },
  { name: 'Household', volume: 18, color: '#B45309' },
  { name: 'Toiletries', volume: 12, color: '#067A3B' },
]

const recentSales = [
  { id: 'TXN-8821', item: 'White Bread 800g (x2)', channel: 'M-Pesa', amount: 'KES 240', time: '2m ago' },
  { id: 'TXN-8820', item: 'Fresh Milk 1L', channel: 'Cash', amount: 'KES 110', time: '14m ago' },
  { id: 'TXN-8819', item: 'Refined Sugar 2kg', channel: 'Card', amount: 'KES 310', time: '41m ago' },
  { id: 'TXN-8818', item: 'Cooking Oil 3L', channel: 'M-Pesa', amount: 'KES 890', time: '1h ago' },
]

const stockMovements = [
  { id: 1, type: 'Stock In', item: '24x Soda Cans 300ml', user: 'Sam K.', time: '10m ago', qty: '+24', isAlert: false },
  { id: 2, type: 'Low Stock Alert', item: 'Maize Flour 2kg', user: 'System', time: '30m ago', qty: '4 left', isAlert: true },
  { id: 3, type: 'Waste / Damage', item: 'Yogurt Strawberry 250ml', user: 'Mercy N.', time: '2h ago', qty: '-2', isAlert: false },
]

function Dashboard() {
  const [activeMovementTab, setActiveMovementTab] = useState(0)
  const [salesData] = useState(initialSalesData)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // ── Import modal state ─────────────────────────────────────
  const [showImport, setShowImport] = useState(false) // modal open/closed
  const [file, setFile] = useState(null)               // selected spreadsheet
  const [importResult, setImportResult] = useState(null) // response after upload
  const [importing, setImporting] = useState(false)      // loading state

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  // Uploads the selected file to the Django import endpoint
  const handleImport = async () => {
    if (!file) return
    setImporting(true)
    setImportResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`${API_BASE}/api/products/${BUSINESS_ID}/import/`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setImportResult(data)
      // Note: dashboard mock data above stays as-is; wire real fetches
      // to your products/sales endpoints separately to reflect new data.
    } catch (err) {
      setImportResult({ error: err.message })
    } finally {
      setImporting(false)
    }
  }

  const closeImportModal = () => {
    setShowImport(false)
    setFile(null)
    setImportResult(null)
  }

  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0)
  const totalExpenses = salesData.reduce((sum, d) => sum + d.expenses, 0)
  const netProfit = totalSales - totalExpenses
  const netMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0.0'

  const filteredLogs = stockMovements.filter((log) => {
    if (activeMovementTab === 1) return !log.isAlert
    if (activeMovementTab === 2) return log.isAlert
    return true
  })

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
              <div className="hero-banner-value">KES {totalSales.toLocaleString()}</div>
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
              <strong className="text-purple">KES {totalExpenses.toLocaleString()}</strong>
            </div>
            <div className="hero-mini">
              <span>Net Profit</span>
              <strong className="text-green">KES {netProfit.toLocaleString()}</strong>
            </div>
            <div className="hero-mini">
              <span>Net Margin</span>
              <strong className="text-green">{netMargin}%</strong>
            </div>
            <div className="hero-mini">
              <span>Active Inventory</span>
              <strong className="text-ivory">1,420 Pcs</strong>
            </div>
          </div>
        </section>

        {/* Analytics Grid */}
        <section className="analytics-grid">
          <div className="chart-section sales-card">
            <div className="chart-card-header">
              <h2>Sales & Expense Breakdown</h2>
              <p className="chart-sub">By month (KES)</p>
            </div>
            <div style={{ height: 180, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={salesData}>
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-surface)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: 'var(--text-main)' }} />
                  <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} name="Expenses" />
                  <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              <span><i className="dot dot-expenses" /> Expenses</span>
              <span><i className="dot dot-sales" /> Sales</span>
            </div>
          </div>

          <div className="chart-section margin-card">
            <div className="chart-card-header">
              <h2>Profit Margin Trend</h2>
              <p className="chart-sub">Percentage (%) shift month-over-month</p>
            </div>
            <div style={{ height: 180, width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--kenya-green)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--kenya-green)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} />
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
                    stroke="var(--kenya-green)"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#marginGrad)"
                    name="Margin (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-section channel-card">
            <div className="chart-card-header">
              <h2>Payment Channels</h2>
              <p className="chart-sub">Volume ratio by tender</p>
            </div>
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
          </div>

          <div className="chart-section volume-card">
            <div className="chart-card-header">
              <h2>Category Sales Volume</h2>
              <p className="chart-sub">Product velocity mix</p>
            </div>
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
          </div>
        </section>

        {/* Lower Feeds */}
        <section className="activity-grid">
          <div className="chart-section activity-card">
            <div className="chart-card-header">
              <h2>Recent Activity</h2>
              <p className="chart-sub">Real-time sales stream</p>
            </div>
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
          </div>

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
              {filteredLogs.map((log) => (
                <div key={log.id} className="feed-item">
                  <div>
                    <div className={`feed-title ${log.isAlert ? 'alert' : ''}`}>
                      {log.type}: {log.item}
                    </div>
                    <div className="feed-sub">By {log.user} • {log.time}</div>
                  </div>
                  <div className={`feed-val ${log.isAlert ? 'alert' : 'cyan'}`}>
                    {log.qty}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard