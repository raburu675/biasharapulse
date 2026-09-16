import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import Sidebar from './sidebar'
import './styles/stockMovement.css'

const API_BASE = 'https://biasharapulse-production.up.railway.app'
const BUSINESS_ID = 1 // replace with real business id (auth/context)

function StockMovement() {
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([]) // for the "select product" dropdown
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL') // ALL / stock_in / waste_damage
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    product_id: '',
    movement_type: 'stock_in',
    quantity_change: '',
    note: '',
  })

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  // Movements list — supports ?type= filter server-side
  const fetchMovements = useCallback(async (type = 'ALL') => {
    setLoading(true)
    setError(null)
    try {
      const url = type === 'ALL'
        ? `${API_BASE}/api/dashboard/${BUSINESS_ID}/stock-movements/`
        : `${API_BASE}/api/dashboard/${BUSINESS_ID}/stock-movements/?type=${type}`
      const res = await axios.get(url)
      setMovements(res.data.movements)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Product list for the dropdown — reused from pos-summary
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/pos-summary/${BUSINESS_ID}/`)
      setProducts(res.data.products.map((p) => ({ id: p.id, name: p.name, category: p.category })))
    } catch {
      // non-fatal — form still usable, dropdown just stays empty
    }
  }, [])

  useEffect(() => {
    fetchMovements(filterType)
    fetchProducts()
  }, [filterType, fetchMovements, fetchProducts])

  const handleCreateMovement = async (e) => {
    e.preventDefault()
    if (!formData.product_id || !formData.quantity_change) return
    setSubmitting(true)
    try {
      await axios.post(`${API_BASE}/api/dashboard/${BUSINESS_ID}/stock-movements/`, {
        product_id: Number(formData.product_id),
        movement_type: formData.movement_type,
        quantity_change: Number(formData.quantity_change),
        note: formData.note,
      })
      setIsModalOpen(false)
      setFormData({ product_id: '', movement_type: 'stock_in', quantity_change: '', note: '' })
      fetchMovements(filterType) // refresh list with the new entry
    } catch (err) {
      alert(err.response?.data?.error || 'Could not log movement')
    } finally {
      setSubmitting(false)
    }
  }

  const metrics = useMemo(() => {
    let inflow = 0
    let outflow = 0
    movements.forEach((m) => {
      const qty = parseInt(m.qty) || 0
      if (m.qty.startsWith('+')) inflow += qty
      else if (qty < 0) outflow += Math.abs(qty)
    })
    return {
      totalLogs: movements.length,
      inflowUnits: inflow,
      outflowUnits: outflow,
      netChange: inflow - outflow,
    }
  }, [movements])

  const filteredMovements = useMemo(() => {
    return movements.filter((m) =>
      m.item.toLowerCase().includes(search.toLowerCase())
    )
  }, [movements, search])

  return (
    <div id="stock-movement-root" className="stm-root">
      <div id="stock-movement-shell" className="stm-shell">
        <Sidebar current="stock-movement" />

        <div id="stock-movement-content-wrapper" className="stm-content-wrapper">
          <header id="stock-movement-navbar" className="sticky-navbar">
            <div id="nav-brand-container" className="header-center">
              <h1 id="nav-brand-title">BiasharaPulse</h1>
              <p id="nav-brand-sub" className="header-sub">Live metrics &amp; inventory health</p>
            </div>

            <div id="nav-actions-container" className="header-right">
              <div id="live-status-indicator" className="live-badge">
                <span id="live-status-dot" className="live-dot" />
                LIVE
              </div>

              <div id="profile-dropdown-wrapper" className="dropdown-container">
                <button
                  id="user-profile-menu-btn"
                  className="profile-btn"
                  onClick={toggleMenu}
                  aria-label="Toggle Menu"
                  aria-expanded={isMenuOpen}
                >
                  <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>

                <div id="user-profile-dropdown-menu" className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                  <a id="link-sign-in" href="/signin" className="dropdown-item">Sign In</a>
                  <a id="link-sign-up" href="/signup" className="dropdown-item btn-signup">Sign Up</a>
                </div>
              </div>
            </div>
          </header>

          <main id="stock-movement-main-area" className="stm-main">
            <div id="stock-movement-header-row" className="stm-header">
              <div>
                <h1 id="stock-movement-title">Stock Ledger</h1>
                <p id="stock-movement-description" className="stm-subtitle">
                  Every stock-in and write-off, in order, with what triggered it
                </p>
              </div>
              <div id="stock-movement-btn-group" className="stm-header-actions">
                <button id="btn-open-log-modal" className="btn-action-primary" onClick={() => setIsModalOpen(true)}>
                  Log movement
                </button>
              </div>
            </div>

            <div id="stock-movement-metrics-grid" className="stm-metrics-grid">
              <div id="metric-card-logs" className="stm-metric-card">
                <span id="metric-label-logs" className="stm-metric-label">Total entries</span>
                <span id="metric-value-logs" className="stm-metric-value">{metrics.totalLogs}</span>
              </div>
              <div id="metric-card-inflow" className="stm-metric-card">
                <span id="metric-label-inflow" className="stm-metric-label">Received</span>
                <span id="metric-value-inflow" className="stm-metric-value inflow">+{metrics.inflowUnits}</span>
              </div>
              <div id="metric-card-outflow" className="stm-metric-card">
                <span id="metric-label-outflow" className="stm-metric-label">Written off</span>
                <span id="metric-value-outflow" className="stm-metric-value outflow">-{metrics.outflowUnits}</span>
              </div>
              <div id="metric-card-net" className="stm-metric-card">
                <span id="metric-label-net" className="stm-metric-label">Net change</span>
                <span id="metric-value-net" className="stm-metric-value net">
                  {metrics.netChange > 0 ? `+${metrics.netChange}` : metrics.netChange}
                </span>
              </div>
            </div>

            <div id="stock-movement-toolbar" className="stm-toolbar">
              <input
                id="search-movement-input"
                className="stm-search"
                placeholder="Search by product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div id="movement-type-filter-group" className="chip-group">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'stock_in', label: 'Stock in' },
                  { key: 'waste_damage', label: 'Waste / damage' },
                  { key: 'low_stock_alert', label: 'Low stock alerts' },
                ].map((t) => (
                  <button
                    key={t.key}
                    id={`filter-chip-${t.key}`}
                    className={`type-chip ${filterType === t.key ? 'active' : ''}`}
                    onClick={() => setFilterType(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div id="stock-movement-table-wrapper" className="table-container">
              {loading ? (
                <div className="stm-empty">Loading movements...</div>
              ) : error ? (
                <div className="stm-empty">Couldn't load movements: {error}</div>
              ) : (
                <>
                  <table id="stock-movement-table" className="stm-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Stock after</th>
                        <th>Reorder at</th>
                        <th>Logged by</th>
                        <th>When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovements.map((m) => (
                        <tr key={m.id} id={`movement-row-${m.id}`}>
                          <td>
                            <div id={`product-info-${m.id}`} className="prod-cell">
                              <span className="prod-name">{m.item}</span>
                              <span className="prod-sku">{m.category}</span>
                            </div>
                          </td>
                          <td>
                            <span
                              id={`movement-type-badge-${m.id}`}
                              className={`badge-type ${
                                m.type === 'Stock In' ? 'type-in' :
                                m.type === 'Waste / Damage' ? 'type-out' : 'type-adj'
                              }`}
                            >
                              {m.type}
                            </span>
                          </td>
                          <td>
                            <span id={`movement-qty-${m.id}`} className={`qty-pill ${m.qty.startsWith('+') ? 'pos' : 'neg'}`}>
                              {m.qty}
                            </span>
                          </td>
                          <td className="val-bold">{m.currentStock}</td>
                          <td>{m.reorderPoint}</td>
                          <td>{m.user}</td>
                          <td>
                            <span id={`movement-date-${m.id}`} className="prod-sku">
                              {new Date(m.time).toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredMovements.length === 0 && (
                    <div id="no-movement-records-found" className="stm-empty">
                      No stock movements yet — log one, or import products with opening stock.
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <div id="modal-log-movement-overlay" className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div id="modal-log-movement-card" className="modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <h2 id="modal-log-movement-title" className="modal-title">Log stock movement</h2>
            <p id="modal-log-movement-subtitle" className="modal-subtext">
              Updates the product's stock count immediately
            </p>

            <form id="form-stock-movement-entry" onSubmit={handleCreateMovement}>
              <div id="form-movement-grid" className="form-grid">
                <div id="group-select-product" className="form-group full">
                  <label id="label-select-product" className="form-label" htmlFor="select-product-id">
                    Product
                  </label>
                  <select
                    id="select-product-id"
                    className="modal-select"
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    required
                  >
                    <option value="">Choose product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div id="group-movement-type" className="form-group">
                  <label id="label-movement-type" className="form-label" htmlFor="select-movement-type">
                    Movement type
                  </label>
                  <select
                    id="select-movement-type"
                    className="modal-select"
                    value={formData.movement_type}
                    onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                  >
                    <option value="stock_in">Stock in (restock)</option>
                    <option value="waste_damage">Waste / damage</option>
                  </select>
                </div>

                <div id="group-movement-quantity" className="form-group">
                  <label id="label-movement-quantity" className="form-label" htmlFor="input-movement-quantity">
                    Quantity
                  </label>
                  <input
                    id="input-movement-quantity"
                    type="number"
                    min="1"
                    className="modal-input"
                    placeholder="e.g. 25"
                    value={formData.quantity_change}
                    onChange={(e) => setFormData({ ...formData, quantity_change: e.target.value })}
                    required
                  />
                </div>

                <div id="group-movement-notes" className="form-group full">
                  <label id="label-movement-notes" className="form-label" htmlFor="input-movement-notes">
                    Note (optional)
                  </label>
                  <input
                    id="input-movement-notes"
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Received from supplier, batch PO-2044"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
              </div>

              <div id="modal-actions-container" className="modal-actions">
                <button id="btn-cancel-movement" type="button" className="modal-btn cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button id="btn-submit-movement" type="submit" className="modal-btn confirm" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Log movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockMovement