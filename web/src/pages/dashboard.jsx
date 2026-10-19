import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
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
import LoadingScreen from './LoadingScreen'
import usePlan, { SubscriptionExpiredModal } from '../hooks/usePlan'
import { api } from '../hooks/usePlan'
import './styles/dashboard.css'


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

const formatPeriodLabel = (period, dateStr) => {
  const d = new Date(dateStr)
  if (period === 'daily') return d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })
  if (period === 'weekly') return `Wk ${d.toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}`
  return d.toLocaleDateString('en-KE', { month: 'short', year: '2-digit' })
}

const getMovementColor = (m) => {
  if (m.type === 'Low Stock Alert') return BRAND.amber
  if (m.currentStock === 0) return BRAND.red
  return BRAND.green
}

function Dashboard() {
  const BUSINESS_ID = Number(localStorage.getItem('businessId')) || null

  const [activeMovementTab, setActiveMovementTab] = useState(0)
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

  const { hasFeature, loading: planLoading, isExpired, plan } = usePlan()
  const stockLocked = !planLoading && !hasFeature('stock_movement')

  const [expiredOpen, setExpiredOpen] = useState(false)
  useEffect(() => {
    if (!planLoading && isExpired) setExpiredOpen(true)
  }, [planLoading, isExpired])

  const [minLoadDone, setMinLoadDone] = useState(
    () => sessionStorage.getItem('dashboardSplashSeen') === '1'
  )

  useEffect(() => {
    if (minLoadDone) return
    const timer = setTimeout(() => {
      sessionStorage.setItem('dashboardSplashSeen', '1')
      setMinLoadDone(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [minLoadDone])

  const fetchSummary = useCallback(async (p) => {
    if (!BUSINESS_ID) return
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/dashboard/${BUSINESS_ID}/summary/?period=${p}`)
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

  const fetchMovements = useCallback(async () => {
    if (!BUSINESS_ID) return
    setMovementsLoading(true)
    setMovementsError(null)
    try {
      const res = await api.get(`/api/dashboard/${BUSINESS_ID}/stock-movements/`)
      setMovements(res.data.movements)
    } catch (err) {
      setMovementsError(err.message)
    } finally {
      setMovementsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (planLoading || stockLocked) return
    fetchMovements()
  }, [fetchMovements, planLoading, stockLocked])

  const handleImport = async () => {
    if (!file || !BUSINESS_ID) return
    setImporting(true)
    setImportResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await api.post(`/api/products/${BUSINESS_ID}/import/`, formData)
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

  if (!minLoadDone || (loading && !summary)) return <LoadingScreen label="Loading dashboard..." />

  if (loading) return <div className="app-shell"><Sidebar current="dashboard" /><main className="main"><p>Loading dashboard...</p></main></div>
  if (error) return <div className="app-shell"><Sidebar current="dashboard" /><main className="main"><p>Error: {error}</p></main></div>
  if (!summary) return <div className="app-shell"><Sidebar current="dashboard" /><main className="main"><p>No data yet.</p></main></div>

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
        <header className="main-header">
          <span className="header-dot" />
          <span className="header-title">Dashboard Overview</span>
        </header>

        <section className="products-cta">
          <div className="products-cta-text">
            <h3>Add your products</h3>
            <p>Import your product list to get started with inventory tracking.</p>
          </div>

          <button className="import-btn" onClick={() => setShowImport(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 16V4" />
              <path d="m7 9 5-5 5 5" />
              <path d="M5 20h14" />
            </svg>
            Import Products
          </button>
        </section>

        {showImport && (
          <div className="import-modal-overlay" onClick={closeImportModal}>
            <div className="import-modal" onClick={(e) => e.stopPropagation()}>

              <div className="import-modal-header">
                <div className="import-modal-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                </div>

                <div>
                  <h3 className="import-modal-title">Import Products</h3>
                  <p className="import-modal-subtitle">
                    Add multiple products to your inventory at once.
                  </p>
                </div>

                <button className="import-modal-close" onClick={closeImportModal}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="import-template-row">
                <div>
                  <strong>Don't have the template?</strong>
                  <span>Use our ready-made spreadsheet.</span>
                </div>

                <a
                  href={`http://127.0.0.1:8000/api/products/import-template/`}
                  className="import-template-link"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                  Download Template
                </a>
              </div>

              <div
                className={`import-dropzone ${file ? 'has-file' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add('dragging')
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove('dragging')
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove('dragging')
                  const droppedFile = e.dataTransfer.files[0]
                  if (
                    droppedFile &&
                    (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.csv'))
                  ) {
                    setFile(droppedFile)
                  }
                }}
                onClick={() => document.getElementById('product-import-file').click()}
              >
                {!file ? (
                  <>
                    <div className="import-upload-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 16V4" />
                        <path d="m7 9 5-5 5 5" />
                        <path d="M5 20h14" />
                      </svg>
                    </div>
                    <strong>Drop your file here</strong>
                    <span>or <b>browse from your computer</b></span>
                    <small>XLSX or CSV · Maximum file size 10MB</small>
                  </>
                ) : (
                  <div className="import-selected-file">
                    <div className="import-file-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M8 13h8" />
                        <path d="M8 17h6" />
                      </svg>
                    </div>
                    <div className="import-file-info">
                      <strong>{file.name}</strong>
                      <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button
                      type="button"
                      className="import-remove-file"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <input
                  id="product-import-file"
                  type="file"
                  accept=".xlsx,.csv"
                  hidden
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="import-info-row">
                <div className="import-info-item">
                  <span className="import-info-number">01</span>
                  <div>
                    <strong>Download</strong>
                    <small>Use the template</small>
                  </div>
                </div>
                <div className="import-info-line"></div>
                <div className="import-info-item">
                  <span className="import-info-number">02</span>
                  <div>
                    <strong>Fill in</strong>
                    <small>Add your products</small>
                  </div>
                </div>
                <div className="import-info-line"></div>
                <div className="import-info-item">
                  <span className="import-info-number">03</span>
                  <div>
                    <strong>Upload</strong>
                    <small>Upload your data</small>
                  </div>
                </div>
              </div>

              <div className="import-modal-actions">
                <button
                  onClick={handleImport}
                  disabled={!file || importing}
                  className="import-btn-confirm"
                >
                  {importing ? (
                    <>
                      <span className="import-spinner"></span>
                      Importing...
                    </>
                  ) : (
                    <>
                      Upload Products
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>

                <button onClick={closeImportModal} className="import-btn-cancel">
                  Cancel
                </button>
              </div>

              {importResult?.error && (
                <p className="import-error">{importResult.error}</p>
              )}
              {importResult?.created !== undefined && (
                <p className="import-success">
                  Created: {importResult.created}, Updated: {importResult.updated}
                </p>
              )}
              {importResult?.errors?.length > 0 && (
                <ul className="import-error-list">
                  {importResult.errors.map((e, i) => (
                    <li key={i}>Row {e.row}: {e.error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <section className="hero-banner">
          <div className="hero-banner-top">
            <div>
              <span className="hero-banner-label">NET REVENUE (TOTAL)</span>
              <div className="hero-banner-value">KES {Number(summary.net_revenue).toLocaleString()}</div>
            </div>
            <div className="hero-banner-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21V3z" />
                <line x1="8" y1="8" x2="16" y2="8" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="8" y1="16" x2="13" y2="16" />
              </svg>
            </div>
          </div>

          <div className="hero-banner-divider" />
          <div className="hero-mini-grid">
            <div className="hero-mini">
              <span>Expenses</span>
              <strong>KES {Number(summary.expenses).toLocaleString()}</strong>
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

        <div className="period-toggle">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={`period-btn ${period === opt.key ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

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
                <div className="chart-body">
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
              <div className="chart-body">
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
                <div style={{ flex: 1, height: 180 }}>
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
                      <span style={{ flex: 1 }}>{item.name}</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: PAYMENT_COLORS[sale.channel] || BRAND.amber,
                      }} />
                      <div style={{ minWidth: 0 }}>
                        <div className="feed-title">{sale.item}</div>
                        <div className="feed-sub">
                          {sale.id} <span className="feed-badge">{PAYMENT_LABELS[sale.channel] || sale.channel}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="feed-val" style={{ color: PAYMENT_COLORS[sale.channel] || BRAND.amber }}>{sale.amount}</div>
                      <div className="feed-sub">{sale.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="chart-section audit-card"
            style={stockLocked ? {
              position: 'relative',
              overflow: 'hidden',
              border: '1.5px solid #d4af37',
              boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.12)',
            } : undefined}
          >
            <div className="chart-card-header">
              <h2>Stock Audit Logs</h2>
              <p className="chart-sub">Inventory Movement, Every row comes from StockMovement page — a restock, a waste/damage write-off, or a system-generated low-stock warning.</p>
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

            {stockLocked ? (
              <div className="feed-list">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="feed-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, backgroundColor: BRAND.line }} />
                      <div>
                        <div style={{ width: 130, height: 10, borderRadius: 4, background: BRAND.line, marginBottom: 6 }} />
                        <div style={{ width: 80, height: 8, borderRadius: 4, background: BRAND.line }} />
                      </div>
                    </div>
                    <div style={{ width: 60, height: 10, borderRadius: 4, background: BRAND.line }} />
                  </div>
                ))}
              </div>
            ) : movementsLoading ? (
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                            backgroundColor: getMovementColor(m),
                          }} />
                          <div style={{ minWidth: 0 }}>
                            <div className="feed-title">{m.type}: {m.item}</div>
                            <div className="feed-sub">
                              By {m.user} <span className="feed-badge">{m.category}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="feed-val" style={{ color: getMovementColor(m) }}>{m.qty}</div>
                          <div className="feed-sub">{new Date(m.time).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()
            )}

            {stockLocked && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid #d4af37',
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#b8941f" strokeWidth="2.2">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.ink }}>
                  Stock Audit Logs is included from Biashara Growth
                </span>
                <Link
                  to="/?view=landing#pricing"
                  style={{ fontSize: 11.5, fontWeight: 700, color: '#9a7b1a', textDecoration: 'none' }}
                >
                  View pricing →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <SubscriptionExpiredModal
        open={expiredOpen}
        plan={plan}
        onClose={() => setExpiredOpen(false)}
      />
    </div>
  )
}

export default Dashboard