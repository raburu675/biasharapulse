import { useState, useMemo } from 'react'
import Sidebar from './sidebar'
import './styles/pos.css'

const initialInventory = [
  { id: 1, name: 'New Era 59FIFTY', category: 'Fitted', costPrice: 1800, sellingPrice: 3200, stockQuantity: 34, unitsSold: 58, totalRevenue: 185600, grossProfit: 81200, profitMargin: 43.8, sellThroughRate: 63.0, performanceTier: 'Star Performer', stockStatus: 'In Stock' },
  { id: 2, name: 'New Era 9FORTY', category: 'Adjustable', costPrice: 1200, sellingPrice: 2200, stockQuantity: 18, unitsSold: 41, totalRevenue: 90200, grossProfit: 41000, profitMargin: 45.5, sellThroughRate: 69.0, performanceTier: 'Star Performer', stockStatus: 'Low Stock' },
  { id: 3, name: 'New Era 9FIFTY', category: 'Snapback', costPrice: 1400, sellingPrice: 2600, stockQuantity: 7, unitsSold: 12, totalRevenue: 31200, grossProfit: 14400, profitMargin: 46.2, sellThroughRate: 40.0, performanceTier: 'Steady', stockStatus: 'Low Stock' },
  { id: 4, name: 'New Era Low Profile', category: 'Fitted', costPrice: 1600, sellingPrice: 2900, stockQuantity: 0, unitsSold: 9, totalRevenue: 26100, grossProfit: 11700, profitMargin: 44.8, sellThroughRate: 100.0, performanceTier: 'Slow Mover', stockStatus: 'Out of Stock' },
]

const sortOptions = [
  { id: 'unitsSold', label: 'Highest Units Sold' },
  { id: 'sellThrough', label: 'Highest Sell-Through Rate' },
  { id: 'margin', label: 'Highest Profit Margin' },
  { id: 'revenue', label: 'Highest Revenue' },
  { id: 'stock', label: 'Lowest Stock Quantity' },
]

const tierClass = (tier) => (tier === 'Star Performer' ? 'tier-star' : tier === 'Steady' ? 'tier-steady' : 'tier-slow')
const stockClass = (status) => (status === 'Out of Stock' ? 'stock-out' : status === 'Low Stock' ? 'stock-low' : 'stock-ok')

function Pos() {
  const [inventory, setInventory] = useState(initialInventory)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('unitsSold')
  const [sortOpen, setSortOpen] = useState(false)
  const [sellItem, setSellItem] = useState(null)
  const [sellQty, setSellQty] = useState(1)
  const [channel, setChannel] = useState('mpesa')
  const [addOpen, setAddOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', category: '', cost: '', price: '', stock: '' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  const categories = useMemo(() => ['All', ...new Set(inventory.map((i) => i.category))], [inventory])

  const totals = useMemo(() => {
    const totalRevenue = inventory.reduce((s, i) => s + i.totalRevenue, 0)
    const totalProfit = inventory.reduce((s, i) => s + i.grossProfit, 0)
    const avgSellThrough = inventory.length
      ? inventory.reduce((s, i) => s + i.sellThroughRate, 0) / inventory.length
      : 0
    return { totalRevenue, totalProfit, avgSellThrough }
  }, [inventory])

  const topSeller = useMemo(() => [...inventory].sort((a, b) => b.unitsSold - a.unitsSold)[0], [inventory])
  const mostProfitable = useMemo(() => [...inventory].sort((a, b) => b.grossProfit - a.grossProfit)[0], [inventory])
  const bestMargin = useMemo(() => [...inventory].sort((a, b) => b.profitMargin - a.profitMargin)[0], [inventory])

  const filtered = useMemo(() => {
    let list = inventory.filter(
      (i) => (category === 'All' || i.category === category) && i.name.toLowerCase().includes(search.toLowerCase())
    )
    const sorters = {
      margin: (a, b) => b.profitMargin - a.profitMargin,
      unitsSold: (a, b) => b.unitsSold - a.unitsSold,
      stock: (a, b) => a.stockQuantity - b.stockQuantity,
      sellThrough: (a, b) => b.sellThroughRate - a.sellThroughRate,
      revenue: (a, b) => b.totalRevenue - a.totalRevenue,
    }
    return [...list].sort(sorters[sort])
  }, [inventory, search, category, sort])

  const openSell = (item) => {
    setSellItem(item)
    setSellQty(1)
    setChannel('mpesa')
  }

  const confirmSale = () => {
    if (!sellItem || sellItem.stockQuantity === 0) return
    setInventory(
      inventory.map((i) =>
        i.id === sellItem.id
          ? {
              ...i,
              stockQuantity: i.stockQuantity - sellQty,
              unitsSold: i.unitsSold + sellQty,
              totalRevenue: i.totalRevenue + sellQty * i.sellingPrice,
              grossProfit: i.grossProfit + sellQty * (i.sellingPrice - i.costPrice),
            }
          : i
      )
    )
    setSellItem(null)
  }

  const addProduct = () => {
    if (!newProduct.name || !newProduct.cost || !newProduct.price || !newProduct.stock) return
    setInventory([
      ...inventory,
      {
        id: Date.now(),
        name: newProduct.name,
        category: newProduct.category || 'General',
        costPrice: Number(newProduct.cost),
        sellingPrice: Number(newProduct.price),
        stockQuantity: Number(newProduct.stock),
        unitsSold: 0,
        totalRevenue: 0,
        grossProfit: 0,
        profitMargin: 0,
        sellThroughRate: 0,
        performanceTier: 'Slow Mover',
        stockStatus: 'In Stock',
      },
    ])
    setNewProduct({ name: '', category: '', cost: '', price: '', stock: '' })
    setAddOpen(false)
  }

  return (
    <div className="pos-root">
      <div className="pos-shell">
        <Sidebar current="pos" />

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Sticky Header Navigation */}
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

          <main className="pos-main">
            <div className="pos-page-header">
              <div>
                <h1 className="pos-title">Product Performance</h1>
                <p className="pos-subtitle">Cost, margin, and sell-through by product</p>
              </div>
              <button className="icon-btn" aria-label="Sort" onClick={() => setSortOpen(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="14" y2="12" /><line x1="4" y1="18" x2="9" y2="18" />
                </svg>
              </button>
            </div>

            {/* Metrics */}
            <div className="metrics-card">
              <div className="metric">
                <span className="metric-label">Total Sales</span>
                <span className="metric-value">KES {totals.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Gross Profit</span>
                <span className="metric-value highlight">KES {totals.totalProfit.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Sell-Through</span>
                <span className="metric-value">{totals.avgSellThrough.toFixed(1)}%</span>
              </div>
            </div>

            {/* Spotlight */}
            <div className="spotlight-scroll">
              {topSeller && (
                <div className="spotlight-card">
                  <span className="spotlight-badge">TOP SELLER</span>
                  <p className="spotlight-name">{topSeller.name}</p>
                  <span className="spotlight-metric">{topSeller.unitsSold} units</span>
                </div>
              )}
              {mostProfitable && (
                <div className="spotlight-card">
                  <span className="spotlight-badge">MOST PROFITABLE</span>
                  <p className="spotlight-name">{mostProfitable.name}</p>
                  <span className="spotlight-metric">KES {mostProfitable.grossProfit.toLocaleString()}</span>
                </div>
              )}
              {bestMargin && (
                <div className="spotlight-card">
                  <span className="spotlight-badge">BEST MARGIN</span>
                  <p className="spotlight-name">{bestMargin.name}</p>
                  <span className="spotlight-metric">{bestMargin.profitMargin.toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* Search + QR */}
            <div className="search-row">
              <input
                className="search-input"
                placeholder="Filter products by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="qr-btn" aria-label="Scan">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" /><line x1="14" y1="14" x2="14" y2="21" /><line x1="21" y1="14" x2="21" y2="21" />
                </svg>
              </button>
            </div>

            {/* Category chips */}
            <div className="category-scroll">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`cat-chip ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Product list */}
            {filtered.length === 0 ? (
              <div className="empty-state">No products match your search or filter</div>
            ) : (
              filtered.map((item) => (
                <div className="product-card" key={item.id}>
                  <div className="product-card-top">
                    <div>
                      <p className="product-name">{item.name}</p>
                      <div className="product-meta-row">
                        <span className="product-category">{item.category}</span>
                        <span className={`tier-badge ${tierClass(item.performanceTier)}`}>{item.performanceTier}</span>
                      </div>
                    </div>
                    <div className="product-card-badges">
                      <span className="margin-badge">{item.profitMargin.toFixed(1)}% Margin</span>
                      <span className={`stock-badge ${stockClass(item.stockStatus)}`}>{item.stockStatus}</span>
                    </div>
                  </div>

                  <div className="product-divider" />

                  <div className="stats-row">
                    <div className="stat"><span className="stat-label">Cost</span><span className="stat-value">KES {item.costPrice}</span></div>
                    <div className="stat"><span className="stat-label">Price</span><span className="stat-value">KES {item.sellingPrice}</span></div>
                    <div className="stat"><span className="stat-label">In Stock</span><span className="stat-value">{item.stockQuantity} pcs</span></div>
                  </div>
                  <div className="stats-row">
                    <div className="stat"><span className="stat-label">Units Sold</span><span className="stat-value">{item.unitsSold}</span></div>
                    <div className="stat"><span className="stat-label">Sell-Through</span><span className="stat-value">{item.sellThroughRate.toFixed(1)}%</span></div>
                    <div className="stat"><span className="stat-label">Profit</span><span className="stat-value bold">KES {item.grossProfit.toLocaleString()}</span></div>
                  </div>

                  <button
                    className="sell-btn"
                    disabled={item.stockQuantity === 0}
                    onClick={() => openSell(item)}
                  >
                    {item.stockQuantity === 0 ? 'Out of Stock' : 'Record Sale'}
                  </button>
                </div>
              ))
            )}

            <button className="fab" onClick={() => setAddOpen(true)}>+ Add Product</button>
          </main>
        </div>
      </div>

      {/* Sell modal */}
      {sellItem && (
        <div className="modal-overlay" onClick={() => setSellItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Record Sale — {sellItem.name}</p>
            <p className="modal-subtext">{sellItem.stockQuantity} units in stock</p>

            <p className="field-label">Quantity</p>
            <div className="stepper-row">
              <button className="stepper-btn" onClick={() => setSellQty(Math.max(1, sellQty - 1))} disabled={sellQty <= 1}>−</button>
              <span className="stepper-value">{sellQty}</span>
              <button className="stepper-btn" onClick={() => setSellQty(Math.min(sellItem.stockQuantity, sellQty + 1))} disabled={sellQty >= sellItem.stockQuantity}>+</button>
            </div>

            <p className="field-label">Payment Channel</p>
            <div className="channel-row">
              {['mpesa', 'cash', 'card'].map((c) => (
                <button
                  key={c}
                  className={`channel-chip ${channel === c ? 'active' : ''}`}
                  onClick={() => setChannel(c)}
                >
                  {c === 'mpesa' ? 'M-Pesa' : c === 'cash' ? 'Cash' : 'Card'}
                </button>
              ))}
            </div>

            <p className="modal-total">Total: KES {(sellItem.sellingPrice * sellQty).toLocaleString()}</p>

            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setSellItem(null)}>Cancel</button>
              <button className="modal-btn confirm" onClick={confirmSale}>Confirm Sale</button>
            </div>
          </div>
        </div>
      )}

      {/* Add product modal */}
      {addOpen && (
        <div className="modal-overlay" onClick={() => setAddOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Add Product for Analytics</p>
            <input className="modal-input" placeholder="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            <input className="modal-input" placeholder="Category" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
            <div className="modal-input-row">
              <input className="modal-input" type="number" placeholder="Cost Price (KES)" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} />
              <input className="modal-input" type="number" placeholder="Selling Price (KES)" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
            </div>
            <input className="modal-input" type="number" placeholder="Stock Quantity" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="modal-btn confirm" onClick={addProduct}>Add & Analyze</button>
            </div>
          </div>
        </div>
      )}

      {/* Sort sheet */}
      {sortOpen && (
        <div className="modal-overlay" onClick={() => setSortOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Sort Products By</p>
            {sortOptions.map((opt) => (
              <div
                key={opt.id}
                className={`sort-option ${sort === opt.id ? 'active' : ''}`}
                onClick={() => { setSort(opt.id); setSortOpen(false) }}
              >
                {opt.label}
                {sort === opt.id && '✓'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Pos