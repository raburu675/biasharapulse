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
            <button className="icon-btn" aria-label="Home" />
            <div className="hero-logo">
              <span className="logo-biashara">biashara</span>
              <span className="logo-pulse">pulse</span>
            </div>
            <button className="icon-btn" aria-label="Menu" />
          </nav>

          <div className="hero-headline-block">
            <span className="hero-tag">Inventory Management system + POS </span>
            <h1 className="hero-headline">
               Struggling with stockouts, missing sales records or not knowing what's actually making you money?
            </h1>
          </div>
        </div>
      </div>

      <div className="hero-intro-body">        
        <p className="hero-card-desc">
          From stock counts to sales, everything about your business lives in one place.
          Know what's moving, what's running low, and what needs your attention — before
          it becomes a problem.
        </p>
        <button className="hero-get-started" onClick={onGetStarted}>
          Get Started
          <svg width="12" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default HeroPage