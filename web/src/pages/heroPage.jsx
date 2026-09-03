import './styles/hero.css'

function HeroPage({ onGetStarted }) {
  return (
    <div className="hero-intro">
      <div className="hero-intro-header">
        <svg
          className="hero-wave-bg"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A0A0A" />
              <stop offset="70%" stopColor="#141414" />
              <stop offset="100%" stopColor="#4A000A" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L0,560 C504,520 1008,620 1440,565 L1440,0 Z"
            fill="url(#heroGradient)"
          />
        </svg>

        <div className="hero-intro-content">
          <nav className="hero-topnav">
            <button className="icon-btn" aria-label="Home">
              {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg> */}
            </button>
            <div className="hero-logo">
              <span className="logo-biashara">biashara</span>
              <span className="logo-pulse">pulse</span>
            </div>
            <button className="icon-btn" aria-label="Menu">
              {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg> */}
            </button>
          </nav>

          <div className="hero-headline-block">
            <span className="hero-tag">Smart Inventory Management</span>
            <h1 className="hero-headline">
              Managing your business<br />just got easier
            </h1>
          </div>
        </div>
      </div>

      <div className="hero-intro-body">
        <div className="hero-card">
          <p className="hero-card-desc">
            From stock counts to sales, everything about your business lives in one place.
            Know what's moving, what's running low, and what needs your attention — before
            it becomes a problem.
          </p>

          <div className="hero-badges">
            <div className="hero-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8V21H3V8" /><path d="M1 3h22v5H1z" /><path d="M10 12h4" />
              </svg>
              <span>Live Stock</span>
            </div>
            <div className="hero-badge">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Real Analytics</span>
            </div>
          </div>
        </div>

        <button className="hero-get-started" onClick={onGetStarted}>
          Get Started
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default HeroPage