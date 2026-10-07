import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import Sidebar from './sidebar'
import './styles/pos.css'
import LoadingScreen from './LoadingScreen'

// const API_BASE = 'https://biasharapulse-production.up.railway.app'
const API_BASE = 'http://127.0.0.1:8000' // local testing
const BUSINESS_ID = 1 // replace with real business id (auth/context)

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
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('unitsSold')
  const [sortOpen, setSortOpen] = useState(false)
  const [sellItem, setSellItem] = useState(null)
  const [sellQty, setSellQty] = useState(1)
  const [channel, setChannel] = useState('mpesa')
  const [selling, setSelling] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [savingProduct, setSavingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', category: '', cost: '', price: '', stock: '' })
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  // Pulls per-product analytics — cost, margin, sell-through, stock status
  const fetchInventory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/pos-summary/${BUSINESS_ID}/`)
      setInventory(res.data.products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        costPrice: Number(p.cost_price),
        sellingPrice: Number(p.selling_price),
        stockQuantity: p.stock_quantity,
        unitsSold: p.units_sold,
        totalRevenue: Number(p.total_revenue),
        grossProfit: Number(p.gross_profit),
        profitMargin: Number(p.profit_margin),
        sellThroughRate: Number(p.sell_through_rate),
        performanceTier: p.performance_tier,
        stockStatus: p.stock_status,
      })))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const categories = useMemo(() => ['All', ...new Set(inventory.map((i) => i.category))], [inventory])

  const totals = useMemo(() => {
    const totalRevenue = inventory.reduce((s, i) => s + i.totalRevenue, 0)
    const totalProfit = inventory.reduce((s, i) => s + i.grossProfit, 0)
    const avgSellThrough = inventory.length
      ? inventory.reduce((s, i) => s + i.sellThroughRate, 0) / inventory.length
      : 0
    return { totalRevenue, totalProfit, avgSellThrough }
  }, [inventory])

  const topSeller = useMemo(() => inventory.length ? [...inventory].sort((a, b) => b.unitsSold - a.unitsSold)[0] : null, [inventory])
  const mostProfitable = useMemo(() => inventory.length ? [...inventory].sort((a, b) => b.grossProfit - a.grossProfit)[0] : null, [inventory])
  const bestMargin = useMemo(() => inventory.length ? [...inventory].sort((a, b) => b.profitMargin - a.profitMargin)[0] : null, [inventory])

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

  // Posts to create_sale — backend calculates amount and decrements stock
  const confirmSale = async () => {
    if (!sellItem || sellItem.stockQuantity === 0) return
    setSelling(true)
    try {
      await axios.post(`${API_BASE}/create-sale/${BUSINESS_ID}/`, {
        product_id: sellItem.id,
        quantity: sellQty,
        payment_channel: channel,
      })
      setSellItem(null)
      fetchInventory()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not record sale')
    } finally {
      setSelling(false)
    }
  }

  // Posts to create_product — one-off addition outside the bulk import
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.cost || !newProduct.price || !newProduct.stock) return
    setSavingProduct(true)
    try {
      await axios.post(`${API_BASE}/api/products/${BUSINESS_ID}/create/`, {
        name: newProduct.name,
        category: newProduct.category || 'General',
        cost_price: Number(newProduct.cost),
        price: Number(newProduct.price),
        stock_count: Number(newProduct.stock),
      })
      setNewProduct({ name: '', category: '', cost: '', price: '', stock: '' })
      setAddOpen(false)
      fetchInventory()
    } catch (err) {
      alert(err.response?.data?.error || 'Could not add product')
    } finally {
      setSavingProduct(false)
    }
  }

  if (loading) return <LoadingScreen label="Loading products..." />

  return (
    <div className="pos-root">
      <div className="pos-shell">
        <Sidebar current="pos" />

        <div style={{ flex: 1, minWidth: 0 }}>
          <header className="sticky-navbar">
            <div className="header-center">
              <span className="brand-biashara">Biashara</span>
              <span className="brand-pulse">Pulse</span>
            </div>

            <div className="header-right">
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
                  <a href="/signin" className="dropdown-item">Sign In</a>
                  <a href="/signup" className="dropdown-item btn-signup">Sign Up</a>
                </div>
              </div>
            </div>
          </header>

          <main className="pos-main">
            <div className="pos-page-header">
              <div>
                <span className="page-eyebrow">PRODUCT ANALYTICS</span>
                <h1 className="pos-title">Product Performance</h1>
                <p className="pos-subtitle">Cost, margin, and sell-through across your inventory</p>
              </div>

              <button className="insight-filter-btn" aria-label="Filter insights" onClick={() => setSortOpen(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 5h16" />
                  <path d="M7 12h10" />
                  <path d="M10 19h4" />
                </svg>
                <span>Filter</span>
              </button>
            </div>

            {error ? (
              <div className="empty-state">
                <div>
                  <strong>Couldn't load products</strong>
                  <span>{error}</span>
                </div>
              </div>
            ) : (
              <>
                <div className="metrics-card">
                  <div className="metric metric-main">
                    <span className="metric-label">Total Sales</span>
                    <span className="metric-value">KES {totals.totalRevenue.toLocaleString()}</span>
                    <span className="metric-note">Revenue generated</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Gross Profit</span>
                    <span className="metric-value highlight">KES {totals.totalProfit.toLocaleString()}</span>
                    <span className="metric-note">After product costs</span>
                  </div>

                  <div className="metric">
                    <span className="metric-label">Avg Sell-Through</span>
                    <span className="metric-value">{totals.avgSellThrough.toFixed(1)}%</span>
                    <span className="metric-note">Inventory movement</span>
                  </div>
                </div>

                {inventory.length > 0 && (
                  <div className="spotlight-scroll">
                    {topSeller && (
                      <div className="spotlight-card">
                        <div className="spotlight-top">
                          <span className="spotlight-icon">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m3 17 6-6 4 4 8-9" />
                              <path d="M17 6h4v4" />
                            </svg>
                          </span>
                          <span className="spotlight-badge">TOP SELLER</span>
                        </div>
                        <p className="spotlight-name">{topSeller.name}</p>
                        <span className="spotlight-metric">{topSeller.unitsSold} units sold</span>
                      </div>
                    )}

                    {mostProfitable && (
                      <div className="spotlight-card">
                        <div className="spotlight-top">
                          <span className="spotlight-icon">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v20" />
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
                            </svg>
                          </span>
                          <span className="spotlight-badge">MOST PROFITABLE</span>
                        </div>
                        <p className="spotlight-name">{mostProfitable.name}</p>
                        <span className="spotlight-metric">KES {mostProfitable.grossProfit.toLocaleString()}</span>
                      </div>
                    )}

                    {bestMargin && (
                      <div className="spotlight-card">
                        <div className="spotlight-top">
                          <span className="spotlight-icon">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 19V5" />
                              <path d="M4 19h16" />
                              <path d="m7 15 4-5 3 3 5-7" />
                            </svg>
                          </span>
                          <span className="spotlight-badge">BEST MARGIN</span>
                        </div>
                        <p className="spotlight-name">{bestMargin.name}</p>
                        <span className="spotlight-metric">{bestMargin.profitMargin.toFixed(1)}% margin</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="search-row">
                  <div className="search-box">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>

                    <input
                      className="search-input"
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />

                    {search && (
                      <button className="search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                        ×
                      </button>
                    )}
                  </div>

                  <button className="qr-btn" aria-label="Scan product">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8V5a1 1 0 0 1 1-1h3" />
    <path d="M16 4h3a1 1 0 0 1 1 1v3" />
    <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
    <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
    <path d="M7 12h10" />
  </svg>
</button>
                </div>

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

                <div className="product-list-heading">
                  <div>
                    <strong>Products</strong>
                    <span>{filtered.length} showing</span>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <div className="empty-state">
                    <div>
                      <strong>{inventory.length === 0 ? 'No products yet' : 'No matching products'}</strong>
                      <span>
                        {inventory.length === 0
                          ? 'Add a product below or import a spreadsheet.'
                          : 'Try changing your search or category filter.'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="product-grid">
                    {filtered.map((item) => (
                      <div className="product-card" key={item.id}>
                        <div className="product-card-top">
                          <div>
                            <p className="product-name">{item.name}</p>

                            <div className="product-meta-row">
                              <span className="product-category">{item.category}</span>
                              <span className={`tier-badge ${tierClass(item.performanceTier)}`}>
                                {item.performanceTier}
                              </span>
                            </div>
                          </div>

                          <div className="product-card-badges">
                            <span className="margin-badge">{item.profitMargin.toFixed(1)}% Margin</span>
                            <span className={`stock-badge ${stockClass(item.stockStatus)}`}>
                              {item.stockStatus}
                            </span>
                          </div>
                        </div>

                        <div className="product-divider" />

                        <div className="stats-row">
                          <div className="stat">
                            <span className="stat-label">Cost</span>
                            <span className="stat-value">KES {item.costPrice}</span>
                          </div>

                          <div className="stat">
                            <span className="stat-label">Price</span>
                            <span className="stat-value">KES {item.sellingPrice}</span>
                          </div>

                          <div className="stat">
                            <span className="stat-label">In Stock</span>
                            <span className="stat-value">{item.stockQuantity} pcs</span>
                          </div>
                        </div>

                        <div className="stats-row">
                          <div className="stat">
                            <span className="stat-label">Units Sold</span>
                            <span className="stat-value">{item.unitsSold}</span>
                          </div>

                          <div className="stat">
                            <span className="stat-label">Sell-Through</span>
                            <span className="stat-value">{item.sellThroughRate.toFixed(1)}%</span>
                          </div>

                          <div className="stat">
                            <span className="stat-label">Profit</span>
                            <span className="stat-value bold">KES {item.grossProfit.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          className="sell-btn"
                          disabled={item.stockQuantity === 0}
                          onClick={() => openSell(item)}
                        >
                          {item.stockQuantity === 0 ? 'Out of Stock' : 'Record Sale'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <button className="fab" onClick={() => setAddOpen(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Add Product
            </button>
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
              <button className="modal-btn confirm" onClick={confirmSale} disabled={selling}>
                {selling ? 'Recording...' : 'Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
      
{/* Add product modal */}
{addOpen && (
  <div className="modal-overlay" onClick={() => setAddOpen(false)}>
    <div className="modal-card product-entry-modal" onClick={(e) => e.stopPropagation()}>
      <div className="product-entry-header">
        <div className="product-entry-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v18" />
            <path d="M3 12h18" />
            <rect x="4" y="4" width="16" height="16" rx="3" />
          </svg>
        </div>

        <div>
          <p className="modal-title">Add Product</p>
          <p className="product-entry-subtitle">Enter product details manually</p>
        </div>
      </div>

      <div className="product-entry-section">
        <span className="entry-section-label">PRODUCT DETAILS</span>

        <div className="entry-field">
          <label>Product Name</label>
          <input
            className="modal-input"
            placeholder="e.g. Premium T-Shirt"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          />
        </div>

        <div className="entry-field">
          <label>Category</label>
          <input
            className="modal-input"
            placeholder="e.g. Clothing"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
          />
        </div>
      </div>

      <div className="product-entry-section">
        <span className="entry-section-label">PRICING</span>

        <div className="entry-grid">
          <div className="entry-field">
            <label>Cost Price</label>
            <div className="price-input">
              <span>KES</span>
              <input
                type="number"
                placeholder="0"
                value={newProduct.cost}
                onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
              />
            </div>
          </div>

          <div className="entry-field">
            <label>Selling Price</label>
            <div className="price-input">
              <span>KES</span>
              <input
                type="number"
                placeholder="0"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="product-entry-section">
        <span className="entry-section-label">INVENTORY</span>

        <div className="entry-field">
          <label>Opening Stock</label>
          <div className="stock-input">
            <input
              type="number"
              placeholder="0"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
            <span>units</span>
          </div>
        </div>
      </div>

      <div className="entry-info">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </svg>
        <span>You can also scan a product barcode or QR code from the POS screen.</span>
      </div>

      <div className="modal-actions">
        <button className="modal-btn cancel" onClick={() => setAddOpen(false)}>Cancel</button>
        <button className="modal-btn confirm" onClick={addProduct} disabled={savingProduct}>
          {savingProduct ? 'Saving...' : 'Add Product'}
        </button>
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
                onClick={() => {
                  setSort(opt.id)
                  setSortOpen(false)
                }}
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