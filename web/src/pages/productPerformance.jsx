import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from './sidebar'
import LoadingScreen from './LoadingScreen'
// Shared axios instance: sends the token and handles 401s
import { api } from '../hooks/usePlan'
import './styles/productPerfomance.css' // the only stylesheet for this page

const PERIODS = [7, 30, 90]

const SORTS = [
  { id: 'cover', label: 'Least stock cover' },
  { id: 'velocity', label: 'Fastest selling' },
  { id: 'dead', label: 'Longest without a sale' },
  { id: 'margin', label: 'Highest margin' },
  { id: 'profit', label: 'Highest profit' },
  { id: 'name', label: 'Name (A–Z)' },
]

const FILTERS = [
  { id: 'all', label: 'All products' },
  { id: 'restock', label: 'Restock' },
  { id: 'dead', label: 'Dead stock' },
  { id: 'protect', label: 'Protect' },
  { id: 'reprice', label: 'Reprice' },
  { id: 'promote', label: 'Promote' },
  { id: 'review', label: 'Review' },
]

// Margin vs volume groups
const QUAD = {
  protect: { label: 'Protect', cls: 'pp-q-protect' },
  reprice: { label: 'Reprice', cls: 'pp-q-reprice' },
  promote: { label: 'Promote', cls: 'pp-q-promote' },
  review: { label: 'Review', cls: 'pp-q-review' },
}

const kes = (n) => `KES ${Math.round(Number(n) || 0).toLocaleString()}`
const pct = (n) => `${(Number(n) || 0).toFixed(1)}%`

const median = (arr) => {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

const lastSaleText = (days) => {
  if (days === null) return 'Never'
  if (days === 0) return 'Today'
  return `${days}d ago`
}

function ProductPerformance() {
  const navigate = useNavigate()
  // Read on every render so it's fresh after login/signup
  const BUSINESS_ID = Number(localStorage.getItem('businessId')) || null
  const username = localStorage.getItem('username')

  const [rows, setRows] = useState([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locked, setLocked] = useState(false) // plan below Growth

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('cover')

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the account menu on an outside click
  useEffect(() => {
    if (!menuOpen) return
    const onOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [menuOpen])

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout/')
    } catch {
      /* token may already be expired, still log out locally */
    }
    localStorage.removeItem('token')
    localStorage.removeItem('businessId')
    localStorage.removeItem('username')
    navigate('/login')
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLocked(false)
    try {
      const res = await api.get(`/api/business/${BUSINESS_ID}/product-performance/?days=${days}`)
      setRows(res.data.products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        cost: Number(p.cost_price),
        price: Number(p.selling_price),
        stock: p.stock_quantity,
        stockStatus: p.stock_status,
        unitsPeriod: p.units_period,
        unitsTotal: p.units_total,
        profit: Number(p.gross_profit),
        margin: Number(p.profit_margin),
        sellThrough: Number(p.sell_through_rate),
        velocity: Number(p.velocity),
        cover: p.days_of_cover === null ? null : Number(p.days_of_cover),
        sinceSale: p.days_since_last_sale,
      })))
    } catch (err) {
      if (err.response?.data?.code === 'upgrade_required') setLocked(true)
      else setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [BUSINESS_ID, days])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Add insights to every product: stock state, margin/volume group, advice
  const products = useMemo(() => {
    const volMedian = median(rows.filter((r) => r.unitsPeriod > 0).map((r) => r.unitsPeriod))
    const marginMedian = median(rows.map((r) => r.margin))

    return rows.map((r) => {
      const selling = r.unitsPeriod > 0
      const dead = r.stock > 0 && !selling
      const tied = r.stock * r.cost

      let stockState = 'ok'
      if (r.stock <= 0) stockState = 'out'
      else if (!selling) stockState = 'idle'
      else if (r.cover <= 7) stockState = 'critical'
      else if (r.cover <= 14) stockState = 'soon'
      else if (r.cover > 60) stockState = 'over'

      const highVol = selling && r.unitsPeriod >= volMedian
      const highMargin = r.margin >= marginMedian
      const quad = highVol ? (highMargin ? 'protect' : 'reprice') : (highMargin ? 'promote' : 'review')

      const needsRestock = (stockState === 'out' && selling) || stockState === 'critical' || stockState === 'soon'

      // One clear piece of advice per product, most urgent first
      let insight = { tone: 'info', text: 'Stock and sales are balanced. No action needed.' }
      if (stockState === 'out' && selling) {
        insight = { tone: 'danger', text: `Out of stock while selling ${r.velocity}/day. Restock now.` }
      } else if (stockState === 'critical') {
        insight = { tone: 'danger', text: `About ${r.cover} days of stock left at the current pace. Reorder now.` }
      } else if (stockState === 'soon') {
        insight = { tone: 'warn', text: `About ${r.cover} days of stock left. Plan a reorder soon.` }
      } else if (dead) {
        insight = {
          tone: 'warn',
          text: `No sales in ${days} days, with ${kes(tied)} tied up in stock. Consider a discount or stop reordering.`,
        }
      } else if (quad === 'reprice') {
        insight = { tone: 'warn', text: `Sells well but margin is only ${pct(r.margin)}. Consider raising the price.` }
      } else if (quad === 'promote') {
        insight = { tone: 'info', text: `Healthy ${pct(r.margin)} margin but slow sales. Worth promoting.` }
      } else if (quad === 'review') {
        insight = { tone: 'info', text: 'Slow sales and a low margin. Review whether to keep stocking it.' }
      } else if (stockState === 'over') {
        insight = { tone: 'info', text: `${r.cover} days of stock on hand. Avoid reordering for now.` }
      } else if (quad === 'protect') {
        insight = { tone: 'good', text: 'Top performer. Keep it well stocked.' }
      }

      return { ...r, dead, tied, stockState, quad, needsRestock, insight }
    })
  }, [rows, days])

  // Headline counts that double as shortcuts to filters
  const summary = useMemo(() => {
    const dead = products.filter((p) => p.dead)
    return {
      restock: products.filter((p) => p.needsRestock).length,
      dead: dead.length,
      deadCapital: dead.reduce((s, p) => s + p.tied, 0),
      reprice: products.filter((p) => p.quad === 'reprice').length,
    }
  }, [products])

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const match = {
      all: () => true,
      restock: (p) => p.needsRestock,
      dead: (p) => p.dead,
      protect: (p) => p.quad === 'protect',
      reprice: (p) => p.quad === 'reprice',
      promote: (p) => p.quad === 'promote',
      review: (p) => p.quad === 'review',
    }
    const sorters = {
      cover: (a, b) => (a.cover ?? Infinity) - (b.cover ?? Infinity),
      velocity: (a, b) => b.velocity - a.velocity,
      dead: (a, b) => (b.sinceSale ?? 9999) - (a.sinceSale ?? 9999),
      margin: (a, b) => b.margin - a.margin,
      profit: (a, b) => b.profit - a.profit,
      name: (a, b) => a.name.localeCompare(b.name),
    }
    return products
      .filter((p) => (category === 'All' || p.category === category) && match[filter](p) && (!q || p.name.toLowerCase().includes(q)))
      .sort(sorters[sort])
  }, [products, search, category, filter, sort])

  const filtersActive = search || category !== 'All' || filter !== 'all'
  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setFilter('all')
  }

  // Full screen loader only on the first load, not when switching period
  if (loading && rows.length === 0 && !error && !locked) {
    return <LoadingScreen label="Loading product performance..." />
  }

  return (
    <div className="pp-root">
      <div className="pp-shell">
        <Sidebar current="product-performance" />

        <div className="pp-content">
          {/* Top bar */}
          <header className="pp-nav">
            <div className="pp-nav-brand">
              <span className="pp-brand-1">Biashara</span>
              <span className="pp-brand-2">Pulse</span>
            </div>

            <div className="pp-menu-wrap" ref={menuRef}>
              <button
                className="pp-avatar"
                onClick={() => setMenuOpen((p) => !p)}
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              <div className={`pp-menu ${menuOpen ? 'open' : ''}`}>
                <div className="pp-menu-head">
                  <span>Logged in as</span>
                  <strong>{username || 'your account'}</strong>
                </div>
                <Link to="/dashboard" className="pp-menu-item" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link to="/account" className="pp-menu-item" onClick={() => setMenuOpen(false)}>My account</Link>
                <button type="button" className="pp-menu-item" onClick={handleLogout}>Log out</button>
              </div>
            </div>
          </header>

          <main className="pp-main">
            {/* Page header */}
            <div className="pp-head">
              <div>
                <span className="pp-eyebrow">Product analytics</span>
                <h1>Product Performance</h1>
                <p>What to restock, promote, reprice or drop, based on how each product sells.</p>
              </div>

              {!locked && (
                <div className="pp-periods" role="group" aria-label="Period">
                  {PERIODS.map((d) => (
                    <button key={d} className={days === d ? 'active' : ''} onClick={() => setDays(d)}>
                      {d} days
                    </button>
                  ))}
                </div>
              )}
            </div>

            {locked && (
              <div className="pp-state">
                <strong>Product performance is a Growth feature</strong>
                <p>See velocity, stock cover and dead stock for every product from Biashara Growth onwards.</p>
                <Link to="/?view=landing#pricing" className="pp-btn">View pricing</Link>
              </div>
            )}

            {error && (
              <div className="pp-state">
                <strong>Couldn't load products</strong>
                <p>{error}</p>
                <button className="pp-btn" onClick={fetchData}>Try again</button>
              </div>
            )}

            {!locked && !error && products.length === 0 && (
              <div className="pp-state">
                <strong>No products yet</strong>
                <p>Import a spreadsheet or add products, then record sales to see performance here.</p>
              </div>
            )}

            {!locked && !error && products.length > 0 && (
              <>
                {/* Action summary: each tile filters the list */}
                <div className="pp-summary">
                  <button className="pp-tile" onClick={() => setFilter('restock')}>
                    <span className="pp-tile-label">Restock needed</span>
                    <span className="pp-tile-value">{summary.restock}</span>
                    <span className="pp-tile-note">Under 14 days of cover or out of stock</span>
                  </button>
                  <button className="pp-tile" onClick={() => setFilter('dead')}>
                    <span className="pp-tile-label">Dead stock</span>
                    <span className="pp-tile-value">{summary.dead}</span>
                    <span className="pp-tile-note">No sales in {days} days</span>
                  </button>
                  <button className="pp-tile" onClick={() => setFilter('dead')}>
                    <span className="pp-tile-label">Cash tied in dead stock</span>
                    <span className="pp-tile-value">{kes(summary.deadCapital)}</span>
                    <span className="pp-tile-note">At cost price</span>
                  </button>
                  <button className="pp-tile" onClick={() => setFilter('reprice')}>
                    <span className="pp-tile-label">Reprice candidates</span>
                    <span className="pp-tile-value">{summary.reprice}</span>
                    <span className="pp-tile-note">High volume, low margin</span>
                  </button>
                </div>

                {/* Search, category and sort */}
                <div className="pp-toolbar">
                  <div className="pp-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                    <input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>

                  <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
                    {categories.map((c) => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
                  </select>

                  <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                    {SORTS.map((s) => <option key={s.id} value={s.id}>Sort: {s.label}</option>)}
                  </select>
                </div>

                <div className="pp-chips">
                  {FILTERS.map((f) => (
                    <button key={f.id} className={`pp-chip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="pp-count">
                  <span>Showing <strong>{visible.length}</strong> of {products.length} products</span>
                  {filtersActive && <button onClick={clearFilters}>Clear filters</button>}
                </div>

                {visible.length === 0 ? (
                  <div className="pp-state">
                    <strong>No matching products</strong>
                    <p>Try changing your search or filters.</p>
                  </div>
                ) : (
                  <div className="pp-list">
                    {visible.map((p) => (
                      <article className="pp-card" key={p.id}>
                        <div className="pp-card-head">
                          <div>
                            <h3>{p.name}</h3>
                            <span className="pp-cat">{p.category}</span>
                          </div>
                          <span className={`pp-badge ${QUAD[p.quad].cls}`}>{QUAD[p.quad].label}</span>
                        </div>

                        {/* The one thing to do about this product */}
                        <div className={`pp-insight pp-tone-${p.insight.tone}`}>{p.insight.text}</div>

                        <span className="pp-label">Velocity and cover · last {days} days</span>
                        <div className="pp-stats">
                          <div><span>Units sold</span><strong>{p.unitsPeriod.toLocaleString()}</strong></div>
                          <div><span>Per day</span><strong>{p.velocity}</strong></div>
                          <div><span>Days of cover</span><strong>{p.cover === null ? '—' : `${p.cover}d`}</strong></div>
                          <div><span>Last sale</span><strong>{lastSaleText(p.sinceSale)}</strong></div>
                        </div>

                        <span className="pp-label">Pricing and stock</span>
                        <div className="pp-stats">
                          <div><span>Price</span><strong>{kes(p.price)}</strong></div>
                          <div><span>Cost</span><strong>{kes(p.cost)}</strong></div>
                          <div><span>Margin</span><strong>{pct(p.margin)}</strong></div>
                          <div><span>In stock</span><strong>{p.stock} pcs</strong></div>
                        </div>

                        <div className="pp-foot">
                          <span className={`pp-pill pp-stock-${p.stockStatus.replace(/\s/g, '').toLowerCase()}`}>
                            {p.stockStatus}
                          </span>
                          <span className="pp-foot-text">
                            All time: {p.unitsTotal.toLocaleString()} sold · {kes(p.profit)} profit · {pct(p.sellThrough)} sell-through
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <p className="pp-note">
                  Groups compare each product with your median: <strong>Protect</strong> sells well with a good margin,
                  <strong> Reprice</strong> sells well but earns little, <strong>Promote</strong> earns well but sells slowly,
                  <strong> Review</strong> does neither. Days of cover is stock on hand divided by units sold per day.
                </p>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ProductPerformance