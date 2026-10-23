import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './sidebar'
import LoadingScreen from './LoadingScreen'
import { api } from '../hooks/usePlan'
import './styles/productPerfomance.css'

const PERIODS = [7, 30, 90]

const SORTS = [
  { id: 'cover', label: 'Running out first' },
  { id: 'units', label: 'Most units sold' },
  { id: 'revenue', label: 'Highest revenue' },
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

const GROUPS = {
  protect: { label: 'Protect', cls: 'pp-q-protect' },
  reprice: { label: 'Reprice', cls: 'pp-q-reprice' },
  promote: { label: 'Promote', cls: 'pp-q-promote' },
  review: { label: 'Review', cls: 'pp-q-review' },
}

const kes = (n) => `KES ${Math.round(Number(n) || 0).toLocaleString()}`
const pct = (n) => `${(Number(n) || 0).toFixed(1)}%`

const lastSaleText = (days) => {
  if (days === null) return 'Never'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const adviceText = (p, days) => {
  switch (p.insight.code) {
    case 'out_selling': return `Out of stock after selling ${p.unitsPeriod} units in ${days} days. Restock now.`
    case 'critical': return 'Stock covers about a week or less of sales. Reorder now.'
    case 'soon': return 'Stock covers under two weeks of sales. Plan a reorder soon.'
    case 'dead': return `No sales in ${days} days, with ${kes(p.stockValue)} tied up in stock. Consider a discount or stop reordering.`
    case 'reprice': return `Sells well but margin is only ${pct(p.margin)}. Consider raising the price.`
    case 'promote': return `Healthy ${pct(p.margin)} margin but slow sales. Worth promoting.`
    case 'review': return 'Slow sales and a low margin. Review whether to keep stocking it.'
    case 'over': return 'Over two months of stock on hand. Avoid reordering for now.'
    case 'protect': return 'Top performer. Keep it well stocked.'
    default: return 'Stock and sales are balanced. No action needed.'
  }
}

function ProductPerformance() {
  const BUSINESS_ID = Number(localStorage.getItem('businessId')) || null

  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState({ restock: 0, dead: 0, dead_capital: 0, reprice: 0 })
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [locked, setLocked] = useState(false)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('cover')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLocked(false)
    try {
      const res = await api.get(`/api/business/${BUSINESS_ID}/product-performance/?days=${days}`)
      setSummary(res.data.summary)
      setProducts(res.data.products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'General',
        cost: Number(p.cost_price),
        price: Number(p.selling_price),
        stock: p.stock_quantity,
        reorder: p.reorder_point,
        stockStatus: p.stock_status,
        unitsPeriod: p.units_period,
        revenuePeriod: Number(p.revenue_period),
        unitsTotal: p.units_total,
        profit: Number(p.gross_profit),
        margin: Number(p.profit_margin),
        sellThrough: Number(p.sell_through_rate),
        cover: p.days_of_cover === null ? null : Number(p.days_of_cover),
        sinceSale: p.days_since_last_sale,
        unitProfit: Number(p.profit_per_unit),
        stockValue: Number(p.stock_value),
        potential: Number(p.potential_profit),
        share: Number(p.profit_share),
        rank: p.profit_rank,
        group: p.group,
        dead: p.is_dead,
        needsRestock: p.needs_restock,
        insight: p.insight,
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

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const match = {
      all: () => true,
      restock: (p) => p.needsRestock,
      dead: (p) => p.dead,
      protect: (p) => p.group === 'protect',
      reprice: (p) => p.group === 'reprice',
      promote: (p) => p.group === 'promote',
      review: (p) => p.group === 'review',
    }
    const sorters = {
      cover: (a, b) => (a.cover ?? Infinity) - (b.cover ?? Infinity),
      units: (a, b) => b.unitsPeriod - a.unitsPeriod,
      revenue: (a, b) => b.revenuePeriod - a.revenuePeriod,
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

  if (loading && products.length === 0 && !error && !locked) {
    return <LoadingScreen label="Loading product performance..." />
  }

  return (
    <div className="pp-root">
      <div className="pp-shell">
        <Sidebar current="product-performance" />

        <div className="pp-content">
          <header className="pp-nav">
            <span className="header-dot" />
            <span className="header-title">Product Performance</span>
            <span className="header-live"><i /> Live</span>
          </header>

          <main className="pp-main">
            <div className="pp-head">
              <div className="pp-head-title">                
                <h1>Product Performance</h1>
                <p>What to restock, promote, reprice or drop — based on how each product sells.</p>
              </div>

              {!locked && (
                <div className="pp-periods" role="group" aria-label="Period">
                  {PERIODS.map((d) => (
                    <button key={d} className={days === d ? 'active' : ''} onClick={() => setDays(d)}>
                      {d}d
                    </button>
                  ))}
                </div>
              )}
            </div>

            {locked && (
              <div className="pp-state">
                <strong>Product performance is a Growth feature</strong>
                <p>See sales, profit and stock insight for every product from Biashara Growth onwards.</p>
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
                <div className="pp-summary">
                  <button className="pp-tile pp-tile-danger" onClick={() => setFilter('restock')}>
                    <span className="pp-tile-label">Restock needed</span>
                    <span className="pp-tile-value">{summary.restock}</span>
                    <span className="pp-tile-note">Running low or out of stock</span>
                  </button>
                  <button className="pp-tile pp-tile-gold" onClick={() => setFilter('dead')}>
                    <span className="pp-tile-label">Dead stock</span>
                    <span className="pp-tile-value">{summary.dead}</span>
                    <span className="pp-tile-note">No sales in {days} days</span>
                  </button>
                  <button className="pp-tile pp-tile-ink" onClick={() => setFilter('dead')}>
                    <span className="pp-tile-label">Cash tied up</span>
                    <span className="pp-tile-value">{kes(summary.dead_capital)}</span>
                    <span className="pp-tile-note">Dead stock at cost price</span>
                  </button>
                  <button className="pp-tile pp-tile-burgundy" onClick={() => setFilter('reprice')}>
                    <span className="pp-tile-label">Reprice candidates</span>
                    <span className="pp-tile-value">{summary.reprice}</span>
                    <span className="pp-tile-note">High volume, low margin</span>
                  </button>
                </div>

                <div className="pp-toolbar">
                  <div className="pp-search">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                    <input
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
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
                    <button
                      key={f.id}
                      className={`pp-chip ${filter === f.id ? 'active' : ''}`}
                      onClick={() => setFilter(f.id)}
                    >
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
                          <div className="pp-card-title">
                            <h3>{p.name}</h3>
                            <span className="pp-cat">{p.category}</span>
                          </div>
                          <span className={`pp-badge ${GROUPS[p.group].cls}`}>
                            {GROUPS[p.group].label}
                          </span>
                        </div>

                        <div className={`pp-insight pp-tone-${p.insight.tone}`}>
                          {adviceText(p, days)}
                        </div>

                        <div className="pp-row">
                          <span className="pp-row-label">Sales · last {days} days</span>
                          <div className="pp-row-grid">
                            <div><span>Units</span><strong>{p.unitsPeriod}</strong></div>
                            <div><span>Revenue</span><strong>{kes(p.revenuePeriod)}</strong></div>
                            <div><span>Last sale</span><strong>{lastSaleText(p.sinceSale)}</strong></div>
                          </div>
                        </div>

                        <div className="pp-row">
                          <span className="pp-row-label">Pricing</span>
                          <div className="pp-row-grid">
                            <div><span>Price</span><strong>{kes(p.price)}</strong></div>
                            <div><span>Cost</span><strong>{kes(p.cost)}</strong></div>
                            <div><span>Profit/unit</span><strong>{kes(p.unitProfit)}</strong></div>
                            <div><span>Margin</span><strong>{pct(p.margin)}</strong></div>
                          </div>
                        </div>

                        <div className="pp-row">
                          <span className="pp-row-label">Stock</span>
                          <div className="pp-row-grid">
                            <div><span>In stock</span><strong>{p.stock}</strong></div>
                            <div><span>Reorder at</span><strong>{p.reorder}</strong></div>
                            <div><span>Value</span><strong>{kes(p.stockValue)}</strong></div>
                            <div><span>Profit if sold</span><strong>{kes(p.potential)}</strong></div>
                          </div>
                        </div>

                        <div className="pp-foot">
                          <div className="pp-foot-pills">
                            <span className={`pp-pill pp-stock-${p.stockStatus.replace(/\s/g, '').toLowerCase()}`}>
                              {p.stockStatus}
                            </span>
                            <span className="pp-pill pp-rank-pill">
                              #{p.rank} of {products.length} by profit
                            </span>
                            <span className="pp-pill pp-share-pill">
                              {pct(p.share)} of total profit
                            </span>
                          </div>
                          <span className="pp-foot-text">
                            All time: {p.unitsTotal.toLocaleString()} sold · {kes(p.profit)} profit · {pct(p.sellThrough)} sell-through
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <div className="pp-note">
                  <h4 className="pp-note-title">How to read this page</h4>

                  <div className="pp-note-grid">
                    <div>
                      <span className="pp-note-tag pp-note-protect">Protect</span>
                      <p>Sells well and earns a healthy margin. Keep it well stocked — it's carrying your profit.</p>
                    </div>
                    <div>
                      <span className="pp-note-tag pp-note-reprice">Reprice</span>
                      <p>Sells fast but the margin is thin. Consider raising the price or negotiating a better cost.</p>
                    </div>
                    <div>
                      <span className="pp-note-tag pp-note-promote">Promote</span>
                      <p>Healthy margin but moves slowly. Worth pushing with a discount, bundle or a spot on the counter.</p>
                    </div>
                    <div>
                      <span className="pp-note-tag pp-note-review">Review</span>
                      <p>Neither sells fast nor earns much. Consider dropping it, or test a different price point.</p>
                    </div>
                  </div>

                  <div className="pp-note-extra">
                    <span><strong>Share of profit</strong> — what portion of your total profit this product made.</span>
                    <span><strong>Profit if sold out</strong> — the profit you'd earn if every unit currently in stock sold at full price.</span>
                    <span><strong>Stock value</strong> — what the stock on hand is worth at cost price.</span>
                    <span><strong>Days of cover</strong> — how many days the current stock lasts at the recent sales rate.</span>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default ProductPerformance