import { useState } from 'react'

const products = [
  { id: 1, name: 'New Era 59FIFTY', category: 'Fitted', stock: 34 },
  { id: 2, name: 'New Era 9FORTY', category: 'Adjustable', stock: 18 },
  { id: 3, name: 'New Era 9FIFTY', category: 'Snapback', stock: 7 },
  { id: 4, name: 'New Era Low Profile', category: 'Fitted', stock: 22 },
]

const reasonsIn = ['Restock from Supplier', 'Customer Return', 'Stock Correction']
const reasonsOut = ['Damage/Waste', 'Theft/Loss', 'Internal Use', 'Return to Supplier', 'Stock Correction']

const initialMovements = [
  { id: 1, product: 'New Era 59FIFTY', type: 'in', quantity: 20, reason: 'Restock from Supplier', note: '', date: '2026-08-28' },
  { id: 2, product: 'New Era 9FORTY', type: 'out', quantity: 5, reason: 'Return to Supplier', note: 'Sold', date: '2026-08-29' },
]

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.sm-root {
  --black-rich: #0b0b0c;
  --burgundy: #7a1230;
  --burgundy-hover: #931a3c;
  --white: #ffffff;
  --off-white: #faf9f8;
  --border: #e7e4e2;
  --text-main: #17161a;
  --text-muted: #7a7674;
}
.sm-root *, .sm-root *::before, .sm-root *::after { box-sizing: border-box; }

.sm-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--white);
  font-family: 'Inter', sans-serif;
  color: var(--text-main);
}

.sm-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 28px;
  background: var(--white);
  border-bottom: 1px solid var(--border);
}

.sm-nav .brand { font-size: 15px; font-weight: 800; color: var(--black-rich); }

.sm-nav .nav-left, .sm-nav .nav-right { display: flex; align-items: center; gap: 10px; }

.sm-nav .icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid var(--border);
  background: var(--white);
  color: var(--black-rich);
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.sm-nav .icon-btn:hover { background: var(--off-white); border-color: var(--black-rich); }

.sm-nav .nav-dropdown-wrapper { position: relative; }

.sm-nav .nav-dropdown {
  position: absolute;
  top: 44px;
  right: 0;
  min-width: 150px;
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(11, 11, 12, 0.08);
}

.sm-nav .nav-dropdown a {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-main);
  text-decoration: none;
  padding: 9px 10px;
  border-radius: 6px;
  transition: background 0.15s ease;
}

.sm-nav .nav-dropdown a:hover { background: rgba(122, 18, 48, 0.08); color: var(--burgundy); }

.main { max-width: 720px; margin: 0 auto; padding: 36px 24px; }

.main-header { margin-bottom: 24px; }

.main-header h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; }

.subtitle { margin: 0; font-size: 13px; color: var(--text-muted); }

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 10px;
}

/* Type toggle */
.type-toggle {
  display: flex;
  gap: 5px;
  padding: 5px;
  background: var(--off-white);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 22px;
}

.type-toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.type-toggle-btn.active-in {
  background: rgba(11, 11, 12, 0.08);
  border-color: var(--black-rich);
  color: var(--black-rich);
  font-weight: 800;
}

.type-toggle-btn.active-out {
  background: rgba(122, 18, 48, 0.1);
  border-color: var(--burgundy);
  color: var(--burgundy);
  font-weight: 800;
}

/* Search */
.search-input {
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
  margin-bottom: 12px;
}

.search-input:focus { border-color: var(--black-rich); }

/* Chip row */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.chip {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--white);
  font-family: 'Inter', sans-serif;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.chip.selected-in {
  border-color: var(--black-rich);
  background: rgba(11, 11, 12, 0.06);
  color: var(--black-rich);
  font-weight: 700;
}

.chip.selected-out {
  border-color: var(--burgundy);
  background: rgba(122, 18, 48, 0.08);
  color: var(--burgundy);
  font-weight: 700;
}

.empty-note { font-size: 12px; color: var(--text-muted); margin: 0 0 14px; }

/* Selected product card */
.product-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--off-white);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 22px;
}

.product-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--white);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.product-info-name { font-size: 12.5px; font-weight: 700; margin: 0; }
.product-info-meta { font-size: 10.5px; color: var(--text-muted); margin: 3px 0 0; }

/* Quantity stepper */
.qty-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--off-white);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 8px 10px;
  margin-bottom: 6px;
}

.qty-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--white);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  color: var(--text-main);
}

.qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.qty-value { font-size: 18px; font-weight: 800; }

.qty-hint { font-size: 10.5px; color: var(--text-muted); margin: 0 0 22px; }

/* Note */
.note-input {
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  outline: none;
  resize: vertical;
  min-height: 70px;
  margin-bottom: 22px;
}

.note-input:focus { border-color: var(--black-rich); }

/* Submit button */
.log-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: var(--white);
  cursor: pointer;
  margin-bottom: 32px;
  transition: opacity 0.15s ease;
}

.log-btn.type-in-btn { background: var(--black-rich); }
.log-btn.type-out-btn { background: var(--burgundy); }
.log-btn:disabled { background: var(--border); color: var(--text-muted); cursor: not-allowed; }

/* Recent movements */
.filter-row { display: flex; gap: 8px; margin-bottom: 14px; }

.filter-chip {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--white);
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
}

.filter-chip.active { background: var(--burgundy); border-color: var(--burgundy); color: var(--white); }

.movement-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 8px;
}

.movement-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.movement-icon.in { background: rgba(11, 11, 12, 0.08); }
.movement-icon.out { background: rgba(122, 18, 48, 0.1); }

.movement-name { font-size: 11.5px; font-weight: 700; margin: 0; }
.movement-meta { font-size: 9.5px; color: var(--text-muted); margin: 2px 0 0; }

.movement-qty {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 10.5px;
  font-weight: 800;
  flex-shrink: 0;
}

.movement-qty.in { background: rgba(11, 11, 12, 0.1); color: var(--black-rich); }
.movement-qty.out { background: rgba(122, 18, 48, 0.12); color: var(--burgundy); }

.edit-link {
  background: none;
  border: none;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: var(--burgundy);
  cursor: pointer;
  flex-shrink: 0;
}

.edit-link:hover { text-decoration: underline; }

.empty-row { text-align: center; padding: 24px; color: var(--text-muted); font-size: 12px; }

@media (max-width: 720px) {
  .sm-nav { padding: 12px 16px; }
  .main { padding: 24px 16px; }
}
`

function StockMovement() {
  const [movements, setMovements] = useState(initialMovements)
  const [type, setType] = useState('in')
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [reason, setReason] = useState(null)
  const [note, setNote] = useState('')
  const [filter, setFilter] = useState('All')
  const [accountOpen, setAccountOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const reasons = type === 'in' ? reasonsIn : reasonsOut

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectType = (t) => {
    setType(t)
    setReason(null)
    setQuantity(1)
  }

  const selectProduct = (p) => {
    setSelectedProduct(p)
    setQuantity(1)
  }

  const incrementQty = () => {
    if (type === 'out') {
      if (selectedProduct && quantity < selectedProduct.stock) setQuantity(quantity + 1)
    } else {
      setQuantity(quantity + 1)
    }
  }

  const decrementQty = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const canLog =
    selectedProduct &&
    reason &&
    (type === 'in' || quantity <= selectedProduct.stock)

  const handleLog = (e) => {
    e.preventDefault()
    if (!canLog) return
    setMovements([
      {
        id: Date.now(),
        product: selectedProduct.name,
        type,
        quantity,
        reason,
        note,
        date: new Date().toISOString().slice(0, 10),
      },
      ...movements,
    ])
    setQuantity(1)
    setReason(null)
    setNote('')
  }

  const filteredMovements = movements.filter((m) => {
    if (filter === 'All') return true
    return filter === 'Stock In' ? m.type === 'in' : m.type === 'out'
  })

  return (
    <div className="sm-root">
      <style>{styles}</style>
      <div className="sm-shell">
        <nav className="sm-nav">
          <div className="nav-left">
            <a href="/dashboard" className="icon-btn" aria-label="Home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </a>
          </div>

          <div className="brand">BiasharaPulse</div>

          <div className="nav-right">
            <div className="nav-dropdown-wrapper">
              <button
                className="icon-btn"
                aria-label="Account"
                onClick={() => { setAccountOpen(!accountOpen); setMenuOpen(false) }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>
              {accountOpen && (
                <div className="nav-dropdown">
                  <a href="/profile" onClick={() => setAccountOpen(false)}>Profile</a>
                  <a href="/logout" onClick={() => setAccountOpen(false)}>Log out</a>
                </div>
              )}
            </div>

            <div className="nav-dropdown-wrapper">
              <button
                className="icon-btn"
                aria-label="Menu"
                onClick={() => { setMenuOpen(!menuOpen); setAccountOpen(false) }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              {menuOpen && (
                <div className="nav-dropdown">
                  <a href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</a>
                  <a href="/stock-movement" onClick={() => setMenuOpen(false)}>Stock Movement</a>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="main">
          <header className="main-header">
            <h1>Stock Movement</h1>
            <p className="subtitle">Log deliveries, returns, damage, and corrections</p>
          </header>

          <form onSubmit={handleLog}>
            {/* Stock In / Stock Out toggle */}
            <div className="type-toggle">
              <button
                type="button"
                className={`type-toggle-btn ${type === 'in' ? 'active-in' : ''}`}
                onClick={() => selectType('in')}
              >
                ↓ Stock In
              </button>
              <button
                type="button"
                className={`type-toggle-btn ${type === 'out' ? 'active-out' : ''}`}
                onClick={() => selectType('out')}
              >
                ↑ Stock Out
              </button>
            </div>

            {/* Product */}
            <p className="section-label">Product</p>
            <input
              className="search-input"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredProducts.length === 0 ? (
              <p className="empty-note">No products found</p>
            ) : (
              <div className="chip-row">
                {filteredProducts.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className={`chip ${
                      selectedProduct?.id === p.id ? (type === 'in' ? 'selected-in' : 'selected-out') : ''
                    }`}
                    onClick={() => selectProduct(p)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}

            {selectedProduct && (
              <div className="product-card">
                <div className="product-icon">📦</div>
                <div>
                  <p className="product-info-name">{selectedProduct.name}</p>
                  <p className="product-info-meta">{selectedProduct.category} • {selectedProduct.stock} in stock</p>
                </div>
              </div>
            )}

            {/* Quantity */}
            <p className="section-label">Quantity</p>
            <div className="qty-row">
              <button type="button" className="qty-btn" onClick={decrementQty} disabled={quantity <= 1}>−</button>
              <span className="qty-value">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={incrementQty}
                disabled={type === 'out' && selectedProduct && quantity >= selectedProduct.stock}
              >
                +
              </button>
            </div>
            {type === 'out' && selectedProduct && (
              <p className="qty-hint">{selectedProduct.stock} currently in stock</p>
            )}
            {!(type === 'out' && selectedProduct) && <div style={{ marginBottom: 22 }} />}

            {/* Reason */}
            <p className="section-label">{type === 'in' ? 'Reason for stock in' : 'Reason for stock out'}</p>
            <div className="chip-row" style={{ marginBottom: 22 }}>
              {reasons.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`chip ${reason === r ? (type === 'in' ? 'selected-in' : 'selected-out') : ''}`}
                  onClick={() => setReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Note */}
            <p className="section-label">Note (optional)</p>
            <textarea
              className="note-input"
              placeholder={
                type === 'in'
                  ? 'e.g. Delivered by New Era distributor, invoice #1042'
                  : 'e.g. Water damage from storage leak'
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <button
              type="submit"
              className={`log-btn ${type === 'in' ? 'type-in-btn' : 'type-out-btn'}`}
              disabled={!canLog}
            >
              {type === 'in' ? '↓ Log Stock In' : '↑ Log Stock Out'}
            </button>
          </form>

          {/* Recent movements */}
          <p className="section-label">Recent Movements</p>
          <div className="filter-row">
            {['All', 'Stock In', 'Stock Out'].map((f) => (
              <button
                type="button"
                key={f}
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredMovements.length === 0 ? (
            <p className="empty-row">No movements yet</p>
          ) : (
            filteredMovements.map((m) => (
              <div className="movement-row" key={m.id}>
                <div className={`movement-icon ${m.type}`}>{m.type === 'in' ? '↓' : '↑'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="movement-name">{m.product}</p>
                  <p className="movement-meta">{m.reason} • {m.date}</p>
                </div>
                <div className={`movement-qty ${m.type}`}>{m.type === 'in' ? '+' : '-'}{m.quantity}</div>
              </div>
            ))
          )}
        </main>
      </div>
    </div>
  )
}

export default StockMovement