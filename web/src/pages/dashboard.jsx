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
import './styles/dashboard.css'

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

// Payment Channels Palette (M-Pesa: Green, Cash: Yellow, Card: Blue)
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

const quickLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
  { label: 'POS', href: '/pos', icon: 'pos' },
  { label: 'Stock Movement', href: '/stock-movement', icon: 'sync' },
  { label: 'Orders', href: '/orders', icon: 'orders' },
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

const icons = {
  grid: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  pos: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M2 11h20" /><path d="M7 15h.01" />
    </svg>
  ),
  sync: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  orders: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
}

function Dashboard() {
  const [active] = useState('Dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeMovementTab, setActiveMovementTab] = useState(0)

  const [salesData] = useState(initialSalesData)

  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0)
  const totalExpenses = salesData.reduce((sum, d) => sum + d.expenses, 0)
  const netProfit = totalSales - totalExpenses
  const netMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : '0.0'

  const filteredLogs = stockMovements.filter((log) => {
    if (activeMovementTab === 1) return !log.isAlert
    if (activeMovementTab === 2) return log.isAlert
    return true
  })

  const SidebarContent = () => (
    <>
      <div className="brand">
        <span className="brand-biashara">biashara</span>
        <span className="brand-pulse">pulse</span>
      </div>
      <nav className="side-nav">
        {quickLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={active === link.label ? 'active' : ''}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="nav-icon">{icons[link.icon]}</span>
            {link.label}
          </a>
        ))}
      </nav>
    </>
  )

  return (
    <div className="app-shell">
      {/* Desktop Sidebar */}
      <aside className="sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
      )}
      <aside className={`drawer ${drawerOpen ? 'drawer-open' : ''}`}>
        <SidebarContent />
      </aside>

      <main className="main">
        {/* Header */}
        <header className="main-header">
          <button className="drawer-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div>
            <h1>Executive Dashboard</h1>
            <p className="header-sub">Live metrics & inventory health</p>
          </div>
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
        </header>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search SKU, product, or shelf..."
          />
          <button className="filter-btn" aria-label="Filter options">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>

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

        {/* Quick Workflows */}
        <section className="quick-workflows">
          <h2 className="section-title">Quick Workflows</h2>
          <div className="workflow-row">
            {quickLinks.filter(l => l.label !== 'Dashboard').map((link) => (
              <a key={link.label} href={link.href} className="workflow-btn">
                <span className="workflow-icon">{icons[link.icon]}</span>
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {/* Analytics Grid */}
        <section className="analytics-grid">
          {/* Chart 1: Sales vs Expenses */}
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

          {/* Chart 2: Profit Margin Trend */}
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

          {/* Payment Channels */}
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

          {/* 1st Part After Payment Channels: Category Sales Volume */}
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
          {/* 2nd Part After Payment Channels: Recent Activity */}
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

          {/* 3rd Part After Payment Channels: Stock Audit Logs */}
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