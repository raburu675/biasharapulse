import { useState } from 'react'
import { Link } from 'react-router-dom'

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
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  pos: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M2 11h20" /><path d="M7 15h.01" />
    </svg>
  ),
  stock: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  orders: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
}

const navItems = [
  { key: 'home', label: 'Home', to: '/?view=landing', icon: 'home' },
  { key: 'account', label: 'Account', to: '/account', icon: 'account' },
  { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { key: 'pos', label: 'POS', to: '/pos', icon: 'pos' },
  { key: 'stock-movement', label: 'Stock Movement', to: '/stock-movement', icon: 'stock' },
  { key: 'orders', label: 'Orders', to: '/orders', icon: 'orders' },
]

const styles = `
.sbx-root {
  --black-rich: #0b0b0d;
  --charcoal: #17171a;
  --burgundy: #7a1230;
  --burgundy-bright: #b3234f;
  --kenya-green: #0a6847;
  --off-white: #f5f3f1;
  --border-dim: rgba(255, 255, 255, 0.08);
  --text-dim: rgba(245, 243, 241, 0.5);
}

.sbx-desktop {
  width: 232px;
  flex-shrink: 0;
  background: linear-gradient(180deg, var(--black-rich) 0%, var(--charcoal) 100%);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: width 0.2s ease;
  font-family: 'Inter', sans-serif;
}

.sbx-desktop.collapsed { width: 76px; }

.sbx-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 18px 18px;
}

.sbx-brand {
  font-size: 15px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
}
.sbx-brand .b1 { color: var(--burgundy-bright); }
.sbx-brand .b2 { color: var(--kenya-green); }

.sbx-collapse-btn {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  border: 1px solid var(--border-dim);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease, background 0.15s ease;
}
.sbx-collapse-btn:hover { background: rgba(255, 255, 255, 0.08); color: var(--off-white); }
.sbx-desktop.collapsed .sbx-collapse-btn { transform: rotate(180deg); }

.sbx-nav {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 12px;
  flex: 1;
}

.sbx-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--text-dim);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  transition: background 0.15s ease, color 0.15s ease;
}

.sbx-link:hover { color: var(--off-white); background: rgba(255, 255, 255, 0.05); }

.sbx-link.active {
  color: var(--off-white);
  background: linear-gradient(90deg, rgba(122, 18, 48, 0.35), rgba(122, 18, 48, 0.08));
}

.sbx-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--burgundy-bright), var(--kenya-green));
}

.sbx-icon-slot {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease;
}
.sbx-link.active .sbx-icon-slot { background: rgba(255, 255, 255, 0.1); }

.sbx-label { opacity: 1; transition: opacity 0.15s ease; }
.sbx-desktop.collapsed .sbx-label { opacity: 0; width: 0; }

.sbx-bottom {
  padding: 10px 12px 18px;
  border-top: 1px solid var(--border-dim);
}

.sbx-footnote {
  padding: 10px 12px 0;
  font-size: 10px;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
}
.sbx-desktop.collapsed .sbx-footnote { display: none; }

/* Mobile */
.sbx-mobile-toggle {
  display: none;
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 200;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #FFFFFF;
  color: var(--black-rich);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.sbx-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 250;
}

@media (max-width: 860px) {
  .sbx-desktop { display: none; }
  .sbx-mobile-toggle { display: flex; }
  .sbx-overlay.open { display: block; }

  .sbx-drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    z-index: 280;
    background: linear-gradient(180deg, var(--black-rich) 0%, var(--charcoal) 100%);
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  .sbx-drawer.open { transform: translateX(0); }
}

@media (min-width: 861px) {
  .sbx-drawer { display: none; }
}

.sbx-drawer-close {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--border-dim);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.sbx-drawer-close:hover { background: rgba(255, 255, 255, 0.08); color: var(--off-white); }
`

function SidebarBody({ current, collapsed, onNavigate }) {
  return (
    <>
      <nav className="sbx-nav">
        {navItems.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`sbx-link ${current === item.key ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <span className="sbx-icon-slot">{navIcons[item.icon]}</span>
            <span className="sbx-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sbx-bottom">
        <Link
          to="/settings"
          className={`sbx-link ${current === 'settings' ? 'active' : ''}`}
          onClick={onNavigate}
        >
          <span className="sbx-icon-slot">{navIcons.settings}</span>
          <span className="sbx-label">Settings</span>
        </Link>
        {!collapsed && (
          <div className="sbx-footnote">BiasharaPulse · Nairobi 🇰🇪</div>
        )}
      </div>
    </>
  )
}

function Sidebar({ current }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="sbx-root">
      <style>{styles}</style>

      {/* Desktop rail */}
      <aside className={`sbx-desktop ${collapsed ? 'collapsed' : ''}`}>
        <div className="sbx-top">
          {!collapsed && (
            <div className="sbx-brand">
              <span className="b1">biashara</span><span className="b2">pulse</span>
            </div>
          )}
          <button className="sbx-collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {navIcons.chevron}
          </button>
        </div>
        <SidebarBody current={current} collapsed={collapsed} />
      </aside>

      {/* Mobile toggle + drawer */}
      {!mobileOpen && (
        <button className="sbx-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          {navIcons.menu}
        </button>
      )}
      <div className={`sbx-overlay ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sbx-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="sbx-top">
          <div className="sbx-brand">
            <span className="b1">biashara</span><span className="b2">pulse</span>
          </div>
          <button className="sbx-drawer-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            {navIcons.close}
          </button>
        </div>
        <SidebarBody current={current} collapsed={false} onNavigate={() => setMobileOpen(false)} />
      </aside>
    </div>
  )
}

export default Sidebar