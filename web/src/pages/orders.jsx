import { useState, useMemo } from 'react'
import Sidebar from './sidebar'
import './styles/orders.css'

const initialOrders = [
  { id: 'ORD-1042', supplier: 'New Era Distributor', items: '40 caps (mixed SKUs)', quantity: 40, total: 72000, status: 'Pending', date: '2026-09-01', estimatedDelivery: '2026-09-05' },
  { id: 'ORD-1041', supplier: 'New Era Distributor', items: '20x 59FIFTY', quantity: 20, total: 36000, status: 'Delivered', date: '2026-08-27', estimatedDelivery: '2026-08-27' },
  { id: 'ORD-1040', supplier: 'Local Embroidery Co.', items: 'Custom patch batch (100)', quantity: 100, total: 15000, status: 'Delivered', date: '2026-08-20', estimatedDelivery: '2026-08-22' },
  { id: 'ORD-1039', supplier: 'New Era Distributor', items: '15x 9FORTY', quantity: 15, total: 18000, status: 'Cancelled', date: '2026-08-14', estimatedDelivery: '—' },
]

const statusClass = (s) => (s === 'Delivered' ? 'st-delivered' : s === 'Pending' ? 'st-pending' : 'st-cancelled')

function Orders() {
  const [orders, setOrders] = useState(initialOrders)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({ supplier: '', items: '', total: '', date: '' })

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const metrics = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'Pending')
    const totalPendingVal = pending.reduce((acc, o) => acc + o.total, 0)
    const deliveredCount = orders.filter((o) => o.status === 'Delivered').length
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
        (o.id.toLowerCase().includes(search.toLowerCase()) ||
          o.supplier.toLowerCase().includes(search.toLowerCase()) ||
          o.items.toLowerCase().includes(search.toLowerCase()))
    )
  }, [orders, search, status])

  const handleCreateOrder = () => {
    if (!newOrder.supplier || !newOrder.items || !newOrder.total) return
    const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const createdDate = newOrder.date || new Date().toISOString().split('T')[0]
    setOrders([
      {
        id,
        supplier: newOrder.supplier,
        items: newOrder.items,
        quantity: 1,
        total: Number(newOrder.total),
        status: 'Pending',
        date: createdDate,
        estimatedDelivery: 'Pending Dispatch',
      },
      ...orders,
    ])
    setNewOrder({ supplier: '', items: '', total: '', date: '' })
    setIsAddOpen(false)
  }

  return (
    <div className="ord-root">
      <div className="ord-shell">
        <Sidebar current="orders" />

        <div className="ord-content-wrapper">
          {/* Sticky Top Header Navigation */}
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
                <h1>Orders Management</h1>
                <p className="ord-subtitle">Track supplier restocks and procurement requests</p>
              </div>
              <button className="new-order-btn" onClick={() => setIsAddOpen(true)}>
                + New Restock Order
              </button>
            </div>

            {/* Metrics Cards Grid */}
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
                <span className="ord-metric-label">Fulfilled Batches</span>
                <span className="ord-metric-value">
                  {metrics.deliveredCount} / {metrics.totalOrders}
                </span>
              </div>
            </div>

            {/* Search and Filters Toolbar */}
            <div className="ord-toolbar">
              <input
                className="ord-search"
                placeholder="Search by order ID, supplier, or items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="chip-group">
                {['All', 'Pending', 'Delivered', 'Cancelled'].map((s) => (
                  <button
                    key={s}
                    className={`status-chip ${status === s ? 'active' : ''}`}
                    onClick={() => setStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List Container */}
            <div className="ord-list">
              {filtered.map((o) => (
                <div key={o.id} className="ord-card">
                  <div className="ord-card-head">
                    <div className="ord-id-wrap">
                      <span className="ord-id">{o.id}</span>
                      <span className="supplier-tag">{o.supplier}</span>
                    </div>
                    <span className={`status-badge ${statusClass(o.status)}`}>{o.status}</span>
                  </div>

                  <div className="ord-card-body">
                    <div className="ord-body-item">
                      <span className="ord-item-title">{o.items}</span>
                      <span className="ord-item-sub">Placed: {o.date}</span>
                    </div>
                    <div className="ord-body-item">
                      <span className="ord-item-sub">Estimated Arrival</span>
                      <span className="ord-val">{o.estimatedDelivery}</span>
                    </div>
                    <div className="ord-body-item">
                      <span className="ord-item-sub">Total Value</span>
                      <span className="ord-val total">KES {o.total.toLocaleString()}</span>
                    </div>
                    <div className="ord-body-item" style={{ textAlign: 'right' }}>
                      <button className="ord-action-btn">View Details →</button>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="ord-empty">No supplier orders match your search criteria.</div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* New Order Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Create Supplier Order</p>
            <p className="modal-subtext">Issue a new restock request to your vendor</p>

            <input
              className="modal-input"
              placeholder="Supplier Name (e.g. New Era Distributor)"
              value={newOrder.supplier}
              onChange={(e) => setNewOrder({ ...newOrder, supplier: e.target.value })}
            />
            <input
              className="modal-input"
              placeholder="Items Summary (e.g. 30x Snapback Caps)"
              value={newOrder.items}
              onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
            />
            <div className="modal-input-row">
              <input
                className="modal-input"
                type="number"
                placeholder="Total Cost (KES)"
                value={newOrder.total}
                onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })}
              />
              <input
                className="modal-input"
                type="date"
                value={newOrder.date}
                onChange={(e) => setNewOrder({ ...newOrder, date: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setIsAddOpen(false)}>
                Cancel
              </button>
              <button className="modal-btn confirm" onClick={handleCreateOrder}>
                Submit Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders