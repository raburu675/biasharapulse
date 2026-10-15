import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from './sidebar'
// Shared axios instance: attaches the token and handles 401s
import usePlan, { api } from '../hooks/usePlan'
import './styles/pos.css'

const CHANNELS = [
  { key: 'mpesa', label: 'M-Pesa' },
  { key: 'cash', label: 'Cash' },
  { key: 'card', label: 'Card' },
]

const SCAN_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code']

function Pos() {
  // Read on every render so it's fresh after login/signup
  const businessId = Number(localStorage.getItem('businessId')) || null

  // PLAN: barcode scanning is a Growth-and-above feature
  const { hasFeature, loading: planLoading } = usePlan()
  const [showScanUpgrade, setShowScanUpgrade] = useState(false)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')

  const [cart, setCart] = useState([]) // [{ product, qty }]
  const [channel, setChannel] = useState('mpesa')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(null) // { items, total } after a sale

  const [scannerOpen, setScannerOpen] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const videoRef = useRef(null)
  const lastScan = useRef({ code: '', at: 0 })
  const handleCodeRef = useRef(() => {})

  const loadProducts = useCallback(async () => {
    try {
      const res = await api.get(`/pos-summary/${businessId}/`)
      setProducts(res.data.products)
      setLoadError('')
    } catch (err) {
      setLoadError(err.response?.data?.error || 'Could not load products')
    } finally {
      setLoading(false)
    }
  }, [businessId])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // ── Cart actions ──
  const addToCart = (p) => {
    if (p.stock_quantity <= 0) return
    setComplete(null)
    setError('')
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === p.id)
      if (existing) {
        return prev.map((l) =>
          l.product.id === p.id ? { ...l, qty: Math.min(l.qty + 1, p.stock_quantity) } : l
        )
      }
      return [...prev, { product: p, qty: 1 }]
    })
  }

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev.map((l) =>
        l.product.id === id
          ? { ...l, qty: Math.max(1, Math.min(l.qty + delta, l.product.stock_quantity)) }
          : l
      )
    )
  }

  const removeLine = (id) => setCart((prev) => prev.filter((l) => l.product.id !== id))

  const clearCart = () => {
    setCart([])
    setError('')
  }

  const total = cart.reduce((sum, l) => sum + Number(l.product.selling_price) * l.qty, 0)
  const itemCount = cart.reduce((sum, l) => sum + l.qty, 0)

  // ── Checkout: one create-sale call per cart line ──
  const checkout = async () => {
    if (cart.length === 0) return
    setSubmitting(true)
    setError('')
    const done = []

    try {
      for (const line of cart) {
        await api.post(`/create-sale/${businessId}/`, {
          product_id: line.product.id,
          quantity: line.qty,
          payment_channel: channel,
        })
        done.push(line.product.id)
      }
      setComplete({ items: itemCount, total })
      setCart([])
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not complete the sale'
      // Lines already recorded must leave the cart so they aren't charged twice
      setCart((prev) => prev.filter((l) => !done.includes(l.product.id)))
      setError(
        done.length > 0
          ? `${msg}. ${done.length} item(s) were already recorded and removed from the cart.`
          : msg
      )
    } finally {
      setSubmitting(false)
      loadProducts() // refresh stock counts
    }
  }

  // ── Barcode handling (camera or a USB/Bluetooth scanner typing into the search box) ──
  const findByCode = (code) =>
    products.find((p) => p.barcode && String(p.barcode) === String(code).trim())

  const handleCode = (code) => {
    const now = Date.now()
    if (lastScan.current.code === code && now - lastScan.current.at < 1500) return
    lastScan.current = { code, at: now }

    const p = findByCode(code)
    if (!p) {
      setScanMsg(`No product matches code ${code}`)
      return
    }
    addToCart(p)
    setScanMsg(`Added ${p.name}`)
  }
  handleCodeRef.current = handleCode

  const handleSearchKey = (e) => {
    if (e.key !== 'Enter') return
    const p = findByCode(query)
    if (p) {
      // PLAN: barcode lookups are part of the scanning feature
      if (!hasFeature('qr_scanning')) {
        setShowScanUpgrade(true)
        return
      }
      addToCart(p)
      setQuery('')
    }
  }

  // Camera scanner lifecycle
  useEffect(() => {
    if (!scannerOpen) return

    let stream = null
    let timer = null
    let active = true

    const start = async () => {
      if (!('BarcodeDetector' in window)) {
        setScanMsg("Camera scanning isn't supported in this browser. Use a USB or Bluetooth scanner in the search box instead.")
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (!active) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        videoRef.current.srcObject = stream
        await videoRef.current.play()

        const detector = new window.BarcodeDetector({ formats: SCAN_FORMATS })
        setScanMsg('Point the camera at a barcode')
        timer = setInterval(async () => {
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes.length > 0) handleCodeRef.current(codes[0].rawValue)
          } catch {
            // ignore frames that fail to decode
          }
        }, 400)
      } catch {
        setScanMsg('Could not access the camera. Check the browser permission.')
      }
    }

    start()

    return () => {
      active = false
      clearInterval(timer)
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [scannerOpen])

  const openScanner = () => {
    if (planLoading) return
    // PLAN: plans below Growth get the upgrade popup instead of the scanner
    if (!hasFeature('qr_scanning')) {
      setShowScanUpgrade(true)
      return
    }
    setScanMsg('')
    setScannerOpen(true)
  }

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase()
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  })

  return (
    <div className="pos-shell">
      <Sidebar current="pos" />

      <main className="pos-main">
        <h1 className="pos-title">Point of Sale</h1>

        <div className="pos-layout">

          {/* Products */}
          <section>
            <div className="pos-search-row">
              <input
                className="pos-search"
                type="text"
                placeholder="Search products or scan a barcode"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKey}
              />
              <button className="pos-scan-btn" onClick={openScanner} aria-label="Scan barcode">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <line x1="7" y1="8" x2="7" y2="16" />
                  <line x1="11" y1="8" x2="11" y2="16" />
                  <line x1="15" y1="8" x2="15" y2="16" />
                  <line x1="18" y1="8" x2="18" y2="16" />
                </svg>
              </button>
            </div>

            {loading ? (
              <p className="pos-empty">Loading products...</p>
            ) : loadError ? (
              <p className="pos-empty">{loadError}</p>
            ) : filtered.length === 0 ? (
              <p className="pos-empty">No products found.</p>
            ) : (
              <div className="pos-grid">
                {filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="pos-product"
                    disabled={p.stock_quantity <= 0}
                    onClick={() => addToCart(p)}
                  >
                    <div className="pos-product-name">{p.name}</div>
                    <div className="pos-product-cat">{p.category}</div>
                    <div className="pos-product-price">KES {Number(p.selling_price).toLocaleString()}</div>
                    <div
                      className={`pos-product-stock ${
                        p.stock_status === 'Out of Stock' ? 'pos-out' : p.stock_status === 'Low Stock' ? 'pos-low' : ''
                      }`}
                    >
                      {p.stock_quantity} in stock
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Cart */}
          <aside className="pos-cart">
            {complete ? (
              <div className="pos-done">
                <div className="pos-done-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>Sale complete</h3>
                <p>
                  {complete.items} item{complete.items === 1 ? '' : 's'} · KES {complete.total.toLocaleString()}
                </p>
                <button className="pos-charge" onClick={() => setComplete(null)}>New sale</button>
              </div>
            ) : (
              <>
                <div className="pos-cart-head">
                  <h2>Cart ({itemCount})</h2>
                  {cart.length > 0 && (
                    <button className="pos-clear" onClick={clearCart}>Clear</button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <p className="pos-cart-empty">Tap a product to add it to the cart.</p>
                ) : (
                  <div className="pos-lines">
                    {cart.map((l) => (
                      <div key={l.product.id} className="pos-line">
                        <div className="pos-line-top">
                          <div>
                            <div className="pos-line-name">{l.product.name}</div>
                            <div className="pos-line-sub">KES {Number(l.product.selling_price).toLocaleString()} each</div>
                          </div>
                          <div className="pos-line-total">
                            KES {(Number(l.product.selling_price) * l.qty).toLocaleString()}
                          </div>
                        </div>
                        <div className="pos-line-bottom">
                          <div className="pos-stepper">
                            <button type="button" disabled={l.qty <= 1} onClick={() => changeQty(l.product.id, -1)}>−</button>
                            <span className="pos-qty">{l.qty}</span>
                            <button
                              type="button"
                              disabled={l.qty >= l.product.stock_quantity}
                              onClick={() => changeQty(l.product.id, 1)}
                            >
                              +
                            </button>
                          </div>
                          <button className="pos-remove" onClick={() => removeLine(l.product.id)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="pos-label">Payment method</span>
                <div className="pos-chips">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      className={`pos-chip ${channel === c.key ? 'active' : ''}`}
                      onClick={() => setChannel(c.key)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="pos-total">
                  <span>Total</span>
                  <strong>KES {total.toLocaleString()}</strong>
                </div>

                {error && <p className="pos-error">{error}</p>}

                <button
                  className="pos-charge"
                  onClick={checkout}
                  disabled={cart.length === 0 || submitting}
                >
                  {submitting ? 'Recording...' : `Charge KES ${total.toLocaleString()}`}
                </button>
              </>
            )}
          </aside>

        </div>
      </main>

      {/* Barcode scanner */}
      {scannerOpen && (
        <div className="pos-scan-overlay" onClick={() => setScannerOpen(false)}>
          <div className="pos-scan-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Scan a barcode</h3>
            <video ref={videoRef} className="pos-scan-video" playsInline muted />
            <p className="pos-scan-msg">{scanMsg}</p>
            <button className="pos-scan-close" onClick={() => setScannerOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* PLAN: shown when a plan below Growth taps the scanner */}
      {showScanUpgrade && (
        <div className="pos-upgrade-overlay" onClick={() => setShowScanUpgrade(false)}>
          <div className="pos-upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pos-upgrade-lock">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>

            <h3>Barcode scanning is a Growth feature</h3>
            <p>
              Scan products with your camera from Biashara Growth onwards. Upgrade to start using it.
            </p>

            <div className="pos-upgrade-actions">
              <Link
                to="/?view=landing#pricing"
                className="pos-upgrade-primary"
                onClick={() => setShowScanUpgrade(false)}
              >
                View pricing
              </Link>
              <button
                type="button"
                className="pos-upgrade-secondary"
                onClick={() => setShowScanUpgrade(false)}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pos