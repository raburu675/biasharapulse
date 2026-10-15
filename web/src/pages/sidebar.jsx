import { useState } from 'react'
import { Link } from 'react-router-dom'
// PLAN: adjust this path to wherever you saved usePlan.js
import usePlan from '../hooks/usePlan'
import './styles/sidebar.css'

const navIcons = {
  home: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),

  account: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),

  dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),

  pos: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M2 11h20" />
      <path d="M7 15h.01" />
    </svg>
  ),

  stock: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),

  orders: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),

  settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),

  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),

  menu: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),

  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),

  // PLAN: padlock shown on locked items
  lock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
}

// PLAN: `feature` must match a name in plans.py; `requires` is the plan that unlocks it (shown in the popup)
const navItems = [
  { key: 'home', label: 'Home', to: '/?view=landing', icon: 'home' },
  { key: 'account', label: 'Account', to: '/account', icon: 'account' },
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { key: 'pos', label: 'POS', to: '/pos', icon: 'pos', feature: 'pos', requires: 'Starter' },
  { key: 'product-performance', label: 'Product performance', to: '/product-performance', icon: 'pos', feature: 'product_performance', requires: 'Biashara Growth' },
  { key: 'stock-movement', label: 'Stock Movement', to: '/stock-movement', icon: 'stock', feature: 'stock_movement', requires: 'Biashara Growth' },
  { key: 'orders', label: 'Orders', to: '/orders', icon: 'orders', feature: 'orders', requires: 'Starter' },
]

function SidebarBody({ current, collapsed, onNavigate, hasFeature, planLoading, onLockedClick }) {
  return (
    <>
      <nav className="sbx-nav">
        {navItems.map((item) => {
          // PLAN: locked once the plan has loaded and lacks this feature
          const locked = !!item.feature && !planLoading && !hasFeature(item.feature)

          // PLAN: locked items open the upgrade popup instead of navigating
          if (locked) {
            return (
              <button
                key={item.key}
                type="button"
                className="sbx-link locked"
                onClick={() => onLockedClick(item)}
              >
                <span className="sbx-icon-slot">
                  {navIcons[item.icon]}
                </span>

                <span className="sbx-label">
                  {item.label}
                </span>

                <span className="sbx-lock">
                  {navIcons.lock}
                </span>
              </button>
            )
          }

          return (
            <Link
              key={item.key}
              to={item.to}
              className={`sbx-link ${current === item.key ? 'active' : ''}`}
              onClick={onNavigate}
            >
              <span className="sbx-icon-slot">
                {navIcons[item.icon]}
              </span>

              <span className="sbx-label">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="sbx-bottom">
        <Link
          to="/settings"
          className={`sbx-link ${current === 'settings' ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <span className="sbx-icon-slot">
            {navIcons.settings}
          </span>

          <span className="sbx-label">
            Settings
          </span>
        </Link>

        {!collapsed && (
          <div className="sbx-footnote">
            BiasharaPulse · Nairobi 🇰🇪
          </div>
        )}
      </div>
    </>
  )
}

function Sidebar({ current }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  // PLAN: the locked item the user tapped (null = popup closed)
  const [upgradeFor, setUpgradeFor] = useState(null)
  // PLAN: fetched once here, passed to both the desktop and mobile bodies
  const { hasFeature, loading: planLoading } = usePlan()

  // PLAN: close the mobile drawer, then show the upgrade popup
  const handleLockedClick = (item) => {
    setMobileOpen(false)
    setUpgradeFor(item)
  }

  return (
    <div className="sbx-root">

      {/* Desktop Sidebar */}
      <aside
        className={`sbx-desktop ${collapsed ? 'collapsed' : ''}`}
      >
        <div className="sbx-top">

          {!collapsed && (
            <div className="sbx-brand">
              <span className="b1">biashara</span>
              <span className="b2">pulse</span>
            </div>
          )}

          <button
            className="sbx-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
          >
            {navIcons.chevron}
          </button>

        </div>

        <SidebarBody
          current={current}
          collapsed={collapsed}
          hasFeature={hasFeature}
          planLoading={planLoading}
          onLockedClick={handleLockedClick}
        />
      </aside>

      {/* Mobile Hamburger */}
      {!mobileOpen && (
        <button
          className="sbx-mobile-toggle"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          {navIcons.menu}
        </button>
      )}

      {/* Mobile Overlay */}
      <div
        className={`sbx-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer */}
      <aside
        className={`sbx-drawer ${mobileOpen ? 'open' : ''}`}
      >

        <div className="sbx-top">

          <div className="sbx-brand">
            <span className="b1">biashara</span>
            <span className="b2">pulse</span>
          </div>

          <button
            className="sbx-drawer-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            {navIcons.close}
          </button>

        </div>

        <SidebarBody
          current={current}
          collapsed={false}
          onNavigate={() => setMobileOpen(false)}
          hasFeature={hasFeature}
          planLoading={planLoading}
          onLockedClick={handleLockedClick}
        />

      </aside>

      {/* PLAN: upgrade popup shown when a locked item is tapped */}
      {upgradeFor && (
        <div className="sbx-modal-overlay" onClick={() => setUpgradeFor(null)}>
          <div className="sbx-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sbx-modal-lock">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </div>

            <h3>Upgrade to unlock {upgradeFor.label}</h3>
            <p>
              {upgradeFor.label} is included from {upgradeFor.requires} onwards. Upgrade to start using it.
            </p>

            <div className="sbx-modal-actions">
              <Link
                to="/?view=landing#pricing"
                className="sbx-modal-primary"
                onClick={() => setUpgradeFor(null)}
              >
                View pricing
              </Link>
              <button
                type="button"
                className="sbx-modal-secondary"
                onClick={() => setUpgradeFor(null)}
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

export default Sidebar