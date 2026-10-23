import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import Sidebar from './sidebar'
import './styles/orders.css'
import LoadingScreen from './LoadingScreen'
import { api } from '../hooks/usePlan'

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_META = {
  pending:    { label: 'Pending',    cls: 'st-pending',    dot: '#D97706' },
  processing: { label: 'Processing', cls: 'st-processing', dot: '#2563EB' },
  shipped:    { label: 'Shipped',    cls: 'st-shipped',    dot: '#7C3AED' },
  delivered:  { label: 'Delivered',  cls: 'st-delivered',  dot: '#059669' },
  cancelled:  { label: 'Cancelled',  cls: 'st-cancelled',  dot: '#9CA3AF' },
}

const statusMeta = (s) => STATUS_META[s] || STATUS_META.pending

function Orders() {
  const BUSINESS_ID = Number(localStorage.getItem('businessId')) || null

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [openStatusId, setOpenStatusId] = useState(null)
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 })

  const triggerRefs = useRef({})

  const [newOrder, setNewOrder] = useState({
    customer_name: '', customer_phone: '', shipping_address: '',
    product_id: '', quantity: 1, payment_method: 'cash',
  })

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get(`/api/orders/${BUSINESS_ID}/`)
      setOrders(res.data.orders)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [BUSINESS_ID])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get(`/pos-summary/${BUSINESS_ID}/`)
      setProducts(res.data.products.map((p) => ({ id: p.id, name: p.name, price: p.selling_price })))
    } catch {}
  }, [BUSINESS_ID])

  useEffect(() => {
    fetchOrders()
    fetchProducts()
  }, [fetchOrders, fetchProducts])

  useEffect(() => {
    if (!openStatusId) return
    const close = () => setOpenStatusId(null)
    document.addEventListener('click', close)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('click', close)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [openStatusId])

  const metrics = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending')
    const totalPendingVal = pending.reduce((acc, o) => acc + Number(o.total_amount), 0)
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length
    return {
      pendingCount: pending.length,
      pendingValue: totalPendingVal,
      deliveredCount,
      totalOrders: orders.length,
    }
  }, [orders])

  const statusCounts = useMemo(() => {
    const map = { All: orders.length }
    STATUS_OPTIONS.forEach((s) => { map[s] = 0 })
    orders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1 })
    return map
  }, [orders])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter(
      (o) =>
        (status === 'All' || o.status === status) &&
        (!q ||
          o.order_number.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q))
    )
  }, [orders, search, status])

  const selectedProduct = products.find((p) => p.id === Number(newOrder.product_id))
  const previewTotal = selectedProduct ? selectedProduct.price * Number(newOrder.quantity || 0) : 0

  const handleCreateOrder = async () => {
    if (!newOrder.customer_name || !newOrder.product_id || !newOrder.quantity) return
    setSaving(true)
    try {
      await api.post(`/api/orders/${BUSINESS_ID}/create/`, {
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        shipping_address: newOrder.shipping_address,
        payment_method: newOrder.payment_method,
        source: 'website',
        items: [{ product_id: Number(newOrder.product_id), quantity: Number(newOrder.quantity) }],
      })
      setNewOrder({ customer_name: '', customer_phone: '', shipping_address: '', product_id: '', quantity: 1, payment_method: 'cash' })
      setIsAddOpen(false)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not create order')
    } finally {
      setSaving(false)
    }
  }

  const advanceStatus = async (order, newStatus) => {
    setOpenStatusId(null)
    try {
      await api.patch(`/api/orders/${BUSINESS_ID}/${order.id}/status/`, { status: newStatus })
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update status')
    }
  }

  const openMenu = (order, e) => {
    e.stopPropagation()
    if (openStatusId === order.id) {
      setOpenStatusId(null)
      return
    }
    const trigger = triggerRefs.current[order.id]
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()

    // Compute position: below the trigger, right-aligned.
    // Flip up if there isn't enough room below.
    const MENU_WIDTH = 180
    const MENU_HEIGHT = 220

    let top = rect.bottom + 6
    if (top + MENU_HEIGHT > window.innerHeight) {
      top = rect.top - MENU_HEIGHT - 6
    }

    let left = rect.right - MENU_WIDTH
    if (left < 8) left = 8
    if (left + MENU_WIDTH > window.innerWidth - 8) {
      left = window.innerWidth - MENU_WIDTH - 8
    }

    setMenuPos({ top, left })
    setOpenStatusId(order.id)
  }

  if (loading) return <LoadingScreen label="Loading orders..." />

  return (
    <div className="ord-root">
      <div className="ord-shell">
        <Sidebar current="orders" />

        <div className="ord-content-wrapper">
          <header className="ord-navbar">
            <span className="header-dot" />
            <span className="header-title">Orders</span>
            <span className="header-live"><i /> Live</span>
          </header>

          <main className="ord-main">
            <div className="ord-header">
              <div>
                <h1>Orders</h1>
                <p className="ord-subtitle">Track fulfillment from placement to delivery</p>
              </div>
              <button className="new-order-btn" onClick={() => setIsAddOpen(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Order
              </button>
            </div>

            {error ? (
              <div className="ord-empty">
                <p>Couldn't load orders</p>
                <span>{error}</span>
                <button className="ord-retry" onClick={fetchOrders}>Retry</button>
              </div>
            ) : (
              <>
                <div className="ord-metrics-grid">
                  <div className="ord-metric-card">
                    <div className="ord-metric-icon ord-icon-warn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="ord-metric-body">
                      <span className="ord-metric-label">Pending Orders</span>
                      <span className="ord-metric-value">{metrics.pendingCount}</span>
                    </div>
                  </div>

                  <div className="ord-metric-card">
                    <div className="ord-metric-icon ord-icon-brand">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <div className="ord-metric-body">
                      <span className="ord-metric-label">Pending Value</span>
                      <span className="ord-metric-value">KES {metrics.pendingValue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="ord-metric-card">
                    <div className="ord-metric-icon ord-icon-success">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <div className="ord-metric-body">
                      <span className="ord-metric-label">Delivered</span>
                      <span className="ord-metric-value">
                        {metrics.deliveredCount}
                        <span className="ord-metric-sub">/ {metrics.totalOrders}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ord-toolbar">
                  <div className="ord-search-wrap">
                    <svg className="ord-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      className="ord-search"
                      placeholder="Search order number or customer..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="chip-group">
                    {['All', ...STATUS_OPTIONS].map((s) => (
                      <button
                        key={s}
                        className={`status-chip ${status === s ? 'active' : ''}`}
                        onClick={() => setStatus(s)}
                      >
                        {s === 'All' ? 'All' : statusMeta(s).label}
                        <span className="chip-count">{statusCounts[s] || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ord-result-count">
                  {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
                  {status !== 'All' && <span> · {statusMeta(status).label}</span>}
                </div>

                <div className="ord-list">
                  {filtered.map((o) => {
                    const meta = statusMeta(o.status)
                    const canUpdate = o.status !== 'delivered' && o.status !== 'cancelled'
                    const isMenuOpen = openStatusId === o.id
                    return (
                      <article key={o.id} className={`ord-card ord-card-${o.status}`}>
                        <div className="ord-card-inner">
                          <header className="ord-card-head">
                            <div className="ord-id-wrap">
                              <span className="ord-id">#{o.order_number.replace(/^#/, '')}</span>
                              <span className={`status-badge ${meta.cls}`}>
                                <span className="status-dot" style={{ background: meta.dot }} />
                                {meta.label}
                              </span>
                            </div>

                            <div className="ord-card-meta">
                              <span className="ord-card-date">
                                {new Date(o.created_at).toLocaleDateString(undefined, {
                                  month: 'short', day: 'numeric', year: 'numeric',
                                })}
                              </span>
                            </div>
                          </header>

                          <div className="ord-card-grid">
                            <div className="ord-cell ord-cell-customer">
                              <span className="ord-cell-label">Customer</span>
                              <span className="ord-cell-value">{o.customer_name}</span>
                            </div>

                            <div className="ord-cell ord-cell-items">
                              <span className="ord-cell-label">Items</span>
                              <div className="ord-item-chips">
                                {o.items.map((i, idx) => (
                                  <span key={idx} className="ord-item-chip">
                                    <strong>{i.qty}×</strong> {i.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="ord-cell">
                              <span className="ord-cell-label">Courier</span>
                              <span className="ord-cell-value muted">{o.courier || '—'}</span>
                            </div>

                            <div className="ord-cell ord-cell-total">
                              <span className="ord-cell-label">Total</span>
                              <span className="ord-cell-value total">
                                KES {Number(o.total_amount).toLocaleString()}
                              </span>
                            </div>

                            <div className="ord-cell ord-cell-actions">
                              {canUpdate && (
                                <button
                                  ref={(el) => { triggerRefs.current[o.id] = el }}
                                  className="ord-status-trigger"
                                  onClick={(e) => openMenu(o, e)}
                                  aria-expanded={isMenuOpen}
                                >
                                  Update
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}

                  {filtered.length === 0 && (
                    <div className="ord-empty">
                      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" />
                        <path d="M9 12h6M9 16h4" />
                      </svg>
                      <p>No orders match your filters</p>
                      <span>Try adjusting your search or status filter</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Status dropdown — rendered via portal so nothing clips it */}
      {openStatusId && (() => {
        const order = orders.find((o) => o.id === openStatusId)
        if (!order) return null
        return createPortal(
          <div
            className="ord-status-menu"
            style={{ top: menuPos.top, left: menuPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
              <button
                key={s}
                className="ord-status-option"
                onClick={() => advanceStatus(order, s)}
              >
                <span className="status-dot" style={{ background: statusMeta(s).dot }} />
                {statusMeta(s).label}
              </button>
            ))}
          </div>,
          document.body
        )
      })()}

      {isAddOpen && (
        <div className="ord-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="ord-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ord-modal-head">
              <h3>New Order</h3>
              <button className="ord-modal-close" onClick={() => setIsAddOpen(false)} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="ord-modal-sub">Record a customer order</p>

            <label className="ord-field">
              <span className="ord-field-label">Customer name</span>
              <input
                className="ord-input"
                placeholder="e.g. Jane Mwangi"
                value={newOrder.customer_name}
                onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
              />
            </label>

            <div className="ord-field-row">
              <label className="ord-field">
                <span className="ord-field-label">Phone</span>
                <input
                  className="ord-input"
                  placeholder="07XX XXX XXX"
                  value={newOrder.customer_phone}
                  onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
                />
              </label>
              <label className="ord-field">
                <span className="ord-field-label">Payment</span>
                <select
                  className="ord-input"
                  value={newOrder.payment_method}
                  onChange={(e) => setNewOrder({ ...newOrder, payment_method: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Card</option>
                </select>
              </label>
            </div>

            <label className="ord-field">
              <span className="ord-field-label">Shipping address</span>
              <input
                className="ord-input"
                placeholder="Street, city"
                value={newOrder.shipping_address}
                onChange={(e) => setNewOrder({ ...newOrder, shipping_address: e.target.value })}
              />
            </label>

            <label className="ord-field">
              <span className="ord-field-label">Product</span>
              <select
                className="ord-input"
                value={newOrder.product_id}
                onChange={(e) => setNewOrder({ ...newOrder, product_id: e.target.value })}
              >
                <option value="">Choose product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — KES {Number(p.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </label>

            <label className="ord-field">
              <span className="ord-field-label">Quantity</span>
              <input
                className="ord-input"
                type="number"
                min="1"
                value={newOrder.quantity}
                onChange={(e) => setNewOrder({ ...newOrder, quantity: e.target.value })}
              />
            </label>

            {selectedProduct && (
              <div className="ord-preview-total">
                <span>Order total</span>
                <strong>KES {previewTotal.toLocaleString()}</strong>
              </div>
            )}

            <div className="ord-modal-actions">
              <button className="ord-btn ord-btn-ghost" onClick={() => setIsAddOpen(false)}>
                Cancel
              </button>
              <button
                className="ord-btn ord-btn-primary"
                onClick={handleCreateOrder}
                disabled={saving || !newOrder.customer_name || !newOrder.product_id}
              >
                {saving ? 'Saving…' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders