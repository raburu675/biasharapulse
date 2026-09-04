import { useState, useMemo } from 'react'
import Sidebar from './sidebar'
import './styles/stockMovement.css'

const initialMovements = [
  {
    id: 'MOV-8801',
    product_name: '59FIFTY Fitted Cap - Black / 7 3/8',
    sku: 'NE-5950-BLK-738',
    movement_type: 'IN',
    reason: 'RESTOCK',
    quantity: 50,
    unit_cost: 1200,
    total_value: 60000,
    reference: 'PO-2026-089',
    user: 'Don Ochieng',
    created_at: '2026-09-04 09:15',
    notes: 'Received batch shipment from supplier'
  },
  {
    id: 'MOV-8802',
    product_name: '9FORTY Adjustable Snapback - Navy',
    sku: 'NE-940-NVY-OS',
    movement_type: 'OUT',
    reason: 'SALE',
    quantity: -12,
    unit_cost: 1000,
    total_value: 12000,
    reference: 'INV-1094',
    user: 'System POS',
    created_at: '2026-09-04 10:02',
    notes: 'In-store retail purchase'
  },
  {
    id: 'MOV-8803',
    product_name: '34 Fitted Custom Patch Emblem',
    sku: 'PATCH-34-GLD',
    movement_type: 'OUT',
    reason: 'DAMAGE',
    quantity: -3,
    unit_cost: 250,
    total_value: 750,
    reference: 'ADJ-004',
    user: 'Don Ochieng',
    created_at: '2026-09-03 16:45',
    notes: 'Damaged adhesive lining during heat press'
  },
  {
    id: 'MOV-8804',
    product_name: '39THIRTY Stretch Fit - Charcoal',
    sku: 'NE-3930-CHR-M',
    movement_type: 'ADJUSTMENT',
    reason: 'AUDIT',
    quantity: 5,
    unit_cost: 1100,
    total_value: 5500,
    reference: 'AUD-2026-Q3',
    user: 'Don Ochieng',
    created_at: '2026-09-01 11:30',
    notes: 'Correction after end-of-month inventory count'
  }
]

const productOptions = [
  { id: 101, name: '59FIFTY Fitted Cap - Black / 7 3/8', sku: 'NE-5950-BLK-738', cost: 1200 },
  { id: 102, name: '9FORTY Adjustable Snapback - Navy', sku: 'NE-940-NVY-OS', cost: 1000 },
  { id: 103, name: '34 Fitted Custom Patch Emblem', sku: 'PATCH-34-GLD', cost: 250 },
  { id: 104, name: '39THIRTY Stretch Fit - Charcoal', sku: 'NE-3930-CHR-M', cost: 1100 }
]

function StockMovement() {
  const [movements, setMovements] = useState(initialMovements)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    product_id: '',
    movement_type: 'IN',
    reason: 'RESTOCK',
    quantity: '',
    unit_cost: '',
    reference: '',
    notes: ''
  })

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const handleProductSelect = (e) => {
    const pId = e.target.value
    const selected = productOptions.find((p) => p.id === Number(pId))
    if (selected) {
      setFormData({
        ...formData,
        product_id: pId,
        unit_cost: selected.cost
      })
    } else {
      setFormData({ ...formData, product_id: pId })
    }
  }

  const handleCreateMovement = (e) => {
    e.preventDefault()
    if (!formData.product_id || !formData.quantity) return

    const selectedProd = productOptions.find((p) => p.id === Number(formData.product_id))
    const rawQty = Number(formData.quantity)
    const isOut = formData.movement_type === 'OUT' || formData.reason === 'DAMAGE'
    const finalQty = isOut ? -Math.abs(rawQty) : Math.abs(rawQty)
    const cost = Number(formData.unit_cost) || 0

    const newEntry = {
      id: `MOV-${Math.floor(1000 + Math.random() * 9000)}`,
      product_name: selectedProd ? selectedProd.name : 'Custom Item',
      sku: selectedProd ? selectedProd.sku : 'CUSTOM-SKU',
      movement_type: formData.movement_type,
      reason: formData.reason,
      quantity: finalQty,
      unit_cost: cost,
      total_value: Math.abs(finalQty) * cost,
      reference: formData.reference || 'MANUAL-ENTRY',
      user: 'Don Ochieng',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      notes: formData.notes || 'N/A'
    }

    setMovements([newEntry, ...movements])
    setIsModalOpen(false)
    setFormData({
      product_id: '',
      movement_type: 'IN',
      reason: 'RESTOCK',
      quantity: '',
      unit_cost: '',
      reference: '',
      notes: ''
    })
  }

  const metrics = useMemo(() => {
    let inflow = 0
    let outflow = 0
    movements.forEach((m) => {
      if (m.quantity > 0) inflow += m.quantity
      else outflow += Math.abs(m.quantity)
    })
    return {
      totalLogs: movements.length,
      inflowUnits: inflow,
      outflowUnits: outflow,
      netChange: inflow - outflow
    }
  }, [movements])

  const filteredMovements = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        m.product_name.toLowerCase().includes(search.toLowerCase()) ||
        m.sku.toLowerCase().includes(search.toLowerCase()) ||
        m.reference.toLowerCase().includes(search.toLowerCase())
      const matchesType = filterType === 'ALL' || m.movement_type === filterType
      return matchesSearch && matchesType
    })
  }, [movements, search, filterType])

  return (
    <div id="stock-movement-root" className="stm-root">
      <div id="stock-movement-shell" className="stm-shell">
        <Sidebar current="stock-movement" />

        <div id="stock-movement-content-wrapper" className="stm-content-wrapper">
          <header id="stock-movement-navbar" className="sticky-navbar">
            <div id="nav-brand-container" className="header-center">
              <h1 id="nav-brand-title">BiasharaPulse</h1>
              <p id="nav-brand-sub" className="header-sub">Live metrics & inventory health</p>
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
                <h1 id="stock-movement-title">Stock Movement Audit</h1>
                <p id="stock-movement-description" className="stm-subtitle">
                  Direct ledger entry for product intake, damages, returns, and physical stock adjustments
                </p>
              </div>
              <div id="stock-movement-btn-group" className="stm-header-actions">
                <button
                  id="btn-open-log-modal"
                  className="btn-action-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  + Log Movement
                </button>
              </div>
            </div>

            <div id="stock-movement-metrics-grid" className="stm-metrics-grid">
              <div id="metric-card-logs" className="stm-metric-card">
                <span id="metric-label-logs" className="stm-metric-label">Total Entries</span>
                <span id="metric-value-logs" className="stm-metric-value">{metrics.totalLogs}</span>
              </div>
              <div id="metric-card-inflow" className="stm-metric-card">
                <span id="metric-label-inflow" className="stm-metric-label">Units Received (In)</span>
                <span id="metric-value-inflow" className="stm-metric-value inflow">+{metrics.inflowUnits}</span>
              </div>
              <div id="metric-card-outflow" className="stm-metric-card">
                <span id="metric-label-outflow" className="stm-metric-label">Units Dispatched (Out)</span>
                <span id="metric-value-outflow" className="stm-metric-value outflow">-{metrics.outflowUnits}</span>
              </div>
              <div id="metric-card-net" className="stm-metric-card">
                <span id="metric-label-net" className="stm-metric-label">Net Inventory Change</span>
                <span id="metric-value-net" className="stm-metric-value net">
                  {metrics.netChange > 0 ? `+${metrics.netChange}` : metrics.netChange}
                </span>
              </div>
            </div>

            <div id="stock-movement-toolbar" className="stm-toolbar">
              <input
                id="search-movement-input"
                className="stm-search"
                placeholder="Search by SKU, product, or reference number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div id="movement-type-filter-group" className="chip-group">
                {['ALL', 'IN', 'OUT', 'ADJUSTMENT'].map((type) => (
                  <button
                    key={type}
                    id={`filter-chip-${type.toLowerCase()}`}
                    className={`type-chip ${filterType === type ? 'active' : ''}`}
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div id="stock-movement-table-wrapper" className="table-container">
              <table id="stock-movement-table" className="stm-table">
                <thead>
                  <tr>
                    <th>Product & SKU</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Total Value</th>
                    <th>Reference</th>
                    <th>Logged By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovements.map((m) => (
                    <tr key={m.id} id={`movement-row-${m.id}`}>
                      <td>
                        <div id={`product-info-${m.id}`} className="prod-cell">
                          <span className="prod-name">{m.product_name}</span>
                          <span className="prod-sku">{m.sku}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          id={`movement-type-badge-${m.id}`}
                          className={`badge-type ${
                            m.movement_type === 'IN'
                              ? 'type-in'
                              : m.movement_type === 'OUT'
                              ? 'type-out'
                              : 'type-adj'
                          }`}
                        >
                          {m.movement_type}
                        </span>
                      </td>
                      <td>
                        <span id={`movement-reason-${m.id}`} className="val-bold">{m.reason}</span>
                      </td>
                      <td>
                        <span
                          id={`movement-qty-${m.id}`}
                          className={`qty-pill ${m.quantity > 0 ? 'pos' : 'neg'}`}
                        >
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td>KES {m.unit_cost.toLocaleString()}</td>
                      <td className="val-bold">KES {m.total_value.toLocaleString()}</td>
                      <td>
                        <span id={`movement-ref-${m.id}`} className="prod-sku">{m.reference}</span>
                      </td>
                      <td>{m.user}</td>
                      <td>
                        <span id={`movement-date-${m.id}`} className="prod-sku">{m.created_at}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMovements.length === 0 && (
                <div id="no-movement-records-found" className="stm-empty">
                  No stock movements recorded matching your criteria.
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {isModalOpen && (
        <div id="modal-log-movement-overlay" className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div id="modal-log-movement-card" className="modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <h2 id="modal-log-movement-title" className="modal-title">Log Stock Movement</h2>
            <p id="modal-log-movement-subtitle" className="modal-subtext">
              Direct entry syncs to your Django product model inventory totals
            </p>

            <form id="form-stock-movement-entry" onSubmit={handleCreateMovement}>
              <div id="form-movement-grid" className="form-grid">
                <div id="group-select-product" className="form-group full">
                  <label id="label-select-product" className="form-label" htmlFor="select-product-id">
                    Select Target Product
                  </label>
                  <select
                    id="select-product-id"
                    className="modal-select"
                    value={formData.product_id}
                    onChange={handleProductSelect}
                    required
                  >
                    <option value="">-- Choose Product --</option>
                    {productOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div id="group-movement-type" className="form-group">
                  <label id="label-movement-type" className="form-label" htmlFor="select-movement-type">
                    Movement Direction
                  </label>
                  <select
                    id="select-movement-type"
                    className="modal-select"
                    value={formData.movement_type}
                    onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                  >
                    <option value="IN">IN (Stock Intake / Restock)</option>
                    <option value="OUT">OUT (Dispatch / Waste)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (Audit Audit Count)</option>
                  </select>
                </div>

                <div id="group-movement-reason" className="form-group">
                  <label id="label-movement-reason" className="form-label" htmlFor="select-movement-reason">
                    Movement Reason
                  </label>
                  <select
                    id="select-movement-reason"
                    className="modal-select"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  >
                    <option value="RESTOCK">Supplier Restock</option>
                    <option value="DAMAGE">Damaged / Expired</option>
                    <option value="RETURN">Customer Return</option>
                    <option value="AUDIT">Manual Reconciliation</option>
                    <option value="SALE">Manual Offline Sale</option>
                  </select>
                </div>

                <div id="group-movement-quantity" className="form-group">
                  <label id="label-movement-quantity" className="form-label" htmlFor="input-movement-quantity">
                    Quantity Impact
                  </label>
                  <input
                    id="input-movement-quantity"
                    type="number"
                    className="modal-input"
                    placeholder="e.g. 25"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                <div id="group-movement-cost" className="form-group">
                  <label id="label-movement-cost" className="form-label" htmlFor="input-movement-cost">
                    Unit Buying Cost (KES)
                  </label>
                  <input
                    id="input-movement-cost"
                    type="number"
                    className="modal-input"
                    placeholder="e.g. 1200"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                  />
                </div>

                <div id="group-movement-reference" className="form-group full">
                  <label id="label-movement-reference" className="form-label" htmlFor="input-movement-reference">
                    Invoice / Reference ID
                  </label>
                  <input
                    id="input-movement-reference"
                    type="text"
                    className="modal-input"
                    placeholder="e.g. PO-9904 or INVOICE-402"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>

                <div id="group-movement-notes" className="form-group full">
                  <label id="label-movement-notes" className="form-label" htmlFor="input-movement-notes">
                    Audit Note / Description
                  </label>
                  <input
                    id="input-movement-notes"
                    type="text"
                    className="modal-input"
                    placeholder="Optional details regarding physical stock condition"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div id="modal-actions-container" className="modal-actions">
                <button
                  id="btn-cancel-movement"
                  type="button"
                  className="modal-btn cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button id="btn-submit-movement" type="submit" className="modal-btn confirm">
                  Commit Stock Movement
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