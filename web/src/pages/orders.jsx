import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import Sidebar from './sidebar'
import './styles/orders.css'

const API_BASE = 'https://biasharapulse-production.up.railway.app'
const BUSINESS_ID = 1 // replace with real business id (auth/context)

// Adjust these if your Order model's STATUS_CHOICES differ
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const statusClass = (s) => {
  if (s === 'delivered') return 'st-delivered'
  if (s === 'pending' || s === 'processing' || s === 'shipped') return 'st-pending'
  return 'st-cancelled'
}

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newOrder, setNewOrder] = useState({
    customer_name: '', customer_phone: '', shipping_address: '',
    items: '', total_amount: '', payment_method: 'cash',
  })

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/api/orders/${BUSINESS_ID}/`)
      setOrders(res.data.orders)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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

  const filtered = useMemo(() => {
    return orders.filter(
      (o) =>
        (status === 'All' || o.status === status) &&
        (o.order_number.toLowerCase().includes(search.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(search.toLowerCase()))
    )
  }, [orders, search, status])

  // Free-text "items summary" -> one OrderItem with quantity 1.
  // For multiple distinct items, this form would need to become a repeatable
  // row list instead of one text field — keeping it simple for now.
  const handleCreateOrder = async () => {
    if (!newOrder.customer_name || !newOrder.items || !newOrder.total_amount) return
    setSaving(true)
    try {
      await axios.post(`${API_BASE}/api/orders/${BUSINESS_ID}/create/`, {
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        shipping_address: newOrder.shipping_address,
        total_amount: Number(newOrder.total_amount),
        payment_method: newOrder.payment_method,
        source: 'manual',
        items: [{ name: newOrder.items, quantity: 1 }],
      })
      setNewOrder({ customer_name: '', customer_phone: '', shipping_address: '', items: '', total_amount: '', payment_method: 'cash' })
      setIsAddOpen(false)
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not create order')
    } finally {
      setSaving(false)
    }
  }

  // Advancing to 'delivered' triggers SaleRecord creation server-side (per your model) —
  // so this button is also effectively "mark as sold"
  const advanceStatus = async (order, newStatus) => {
    try {
      await axios.patch(`${API_BASE}/api/orders/${BUSINESS_ID}/${order.id}/status/`, { status: newStatus })
      fetchOrders()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update status')
    }
  }

  return (
    <div className="ord-root">
      <div className="ord-shell">
        <Sidebar current="orders" />

        <div className="ord-content-wrapper">
          <header className="sticky-navbar">
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

          <main className="ord-main">
            <div className="ord-header">
              <div>
                <h1>Orders</h1>
                <p className="ord-subtitle">Customer orders — track fulfillment status</p>
              </div>
              <button className="new-order-btn" onClick={() => setIsAddOpen(true)}>
                + New Order
              </button>
            </div>

            {loading ? (
              <div className="ord-empty">Loading orders...</div>
            ) : error ? (
              <div className="ord-empty">Couldn't load orders: {error}</div>
            ) : (
              <>
                <div className="ord-metrics-grid">
                  <div className="ord-metric-card">
                    <span className="ord-metric-label">Pending Orders</span>
                    <span className="ord-metric-value highlight">{metrics.pendingCount}</span>
                  </div>
                  <div className="ord-metric-card">
                    <span className="ord-metric-label">Pending Value</span>
                    <span className="ord-metric-value">KES {metrics.pendingValue.toLocaleString()}</span>
                  </div>
                  <div className="ord-metric-card">
                    <span className="ord-metric-label">Delivered</span>
                    <span className="ord-metric-value">
                      {metrics.deliveredCount} / {metrics.totalOrders}
                    </span>
                  </div>
                </div>

                <div className="ord-toolbar">
                  <input
                    className="ord-search"
                    placeholder="Search by order number or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="chip-group">
                    {['All', ...STATUS_OPTIONS].map((s) => (
                      <button
                        key={s}
                        className={`status-chip ${status === s ? 'active' : ''}`}
                        onClick={() => setStatus(s)}
                      >
                        {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ord-list">
                  {filtered.map((o) => (
                    <div key={o.id} className="ord-card">
                      <div className="ord-card-head">
                        <div className="ord-id-wrap">
                          <span className="ord-id">{o.order_number}</span>
                          <span className="supplier-tag">{o.customer_name}</span>
                        </div>
                        <span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span>
                      </div>

                      <div className="ord-card-body">
                        <div className="ord-body-item">
                          <span className="ord-item-title">
                            {o.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                          </span>
                          <span className="ord-item-sub">Placed: {new Date(o.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="ord-body-item">
                          <span className="ord-item-sub">Courier</span>
                          <span className="ord-val">{o.courier || '—'}</span>
                        </div>
                        <div className="ord-body-item">
                          <span className="ord-item-sub">Total Value</span>
                          <span className="ord-val total">KES {Number(o.total_amount).toLocaleString()}</span>
                        </div>
                        <div className="ord-body-item" style={{ textAlign: 'right' }}>
                          {o.status !== 'delivered' && o.status !== 'cancelled' && (
                            <select
                              className="ord-action-btn"
                              value=""
                              onChange={(e) => e.target.value && advanceStatus(o, e.target.value)}
                            >
                              <option value="">Update status →</option>
                              {STATUS_OPTIONS.filter((s) => s !== o.status).map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filtered.length === 0 && (
                    <div className="ord-empty">No orders match your search criteria.</div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Create Order</p>
            <p className="modal-subtext">Record a customer order manually</p>

            <input
              className="modal-input"
              placeholder="Customer Name"
              value={newOrder.customer_name}
              onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
            />
            <input
              className="modal-input"
              placeholder="Customer Phone"
              value={newOrder.customer_phone}
              onChange={(e) => setNewOrder({ ...newOrder, customer_phone: e.target.value })}
            />
            <input
              className="modal-input"
              placeholder="Shipping Address"
              value={newOrder.shipping_address}
              onChange={(e) => setNewOrder({ ...newOrder, shipping_address: e.target.value })}
            />
            <input
              className="modal-input"
              placeholder="Items Summary (e.g. 2x Fitted Cap)"
              value={newOrder.items}
              onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
            />
            <div className="modal-input-row">
              <input
                className="modal-input"
                type="number"
                placeholder="Total (KES)"
                value={newOrder.total_amount}
                onChange={(e) => setNewOrder({ ...newOrder, total_amount: e.target.value })}
              />
              <select
                className="modal-input"
                value={newOrder.payment_method}
                onChange={(e) => setNewOrder({ ...newOrder, payment_method: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa</option>
                <option value="card">Card</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setIsAddOpen(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={handleCreateOrder} disabled={saving}>
                {saving ? 'Saving...' : 'Submit Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders