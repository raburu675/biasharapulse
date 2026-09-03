import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroPage from "./heroPage";
import Dashboard from "./dashboard"; // Adjust relative path here if needed
import "./styles/landing.css";
import "./styles/splash.css";

function Landing() {
  const [stage, setStage] = useState("splash"); // 'splash' | 'hero' | 'landing' | 'dashboard'
  const [fadeOut, setFadeOut] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 4400);
    const advanceTimer = setTimeout(() => setStage("hero"), 5000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(advanceTimer);
    };
  }, []);

  if (stage === "splash") {
    return (
      <div className={`splash ${fadeOut ? "splash-fade-out" : ""}`}>
        <h1 className="splash-text">BiasharaPulse</h1>
      </div>
    );
  }

  if (stage === "hero") {
    return <HeroPage onGetStarted={() => setStage("landing")} />;
  }

  if (stage === "dashboard") {
    return <Dashboard />;
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-left">
          <a href="#" className="icon-btn" aria-label="Home">
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
              onClick={() => { setAccountOpen(!accountOpen); setMenuOpen(false); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            {accountOpen && (
              <div className="nav-dropdown">
                <Link to="/login" onClick={() => setAccountOpen(false)}>Sign in</Link>
                <Link to="/signup" onClick={() => setAccountOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>

          <div className="nav-dropdown-wrapper">
            <button
              className="icon-btn"
              aria-label="Menu"
              onClick={() => { setMenuOpen(!menuOpen); setAccountOpen(false); }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {menuOpen && (
              <div className="nav-dropdown">
                <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
                <a href="#values" onClick={() => setMenuOpen(false)}>Values</a>
                <a href="#developer" onClick={() => setMenuOpen(false)}>Developer</a>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="hero">
        <h1>Run your business, not your spreadsheets</h1>
        <p>
          BiasharaPulse gives Kenyan SMEs a simple way to track sales, expenses, and
          stock — so you always know where your business stands, without hiring an accountant.
        </p>
        <button className="cta-primary" onClick={() => setStage("dashboard")}>
          Start Free
        </button>
      </section>

      {/* Features Overview */}
      <section className="features-intro">
        <span className="features-tag">What you get</span>
        <h2>Everything your business needs, in one place</h2>
        <p>From daily sales to stock on the shelf — track it all without spreadsheets or guesswork.</p>
      </section>

      <section className="features">
        <div className="feature">
          <h3>Sales & Expense Tracking</h3>
          <p>See your numbers at a glance — no more guessing how the week went.</p>
        </div>
        <div className="feature">
          <h3>Stock Movement</h3>
          <p>Log stock in and out as it happens, so you never run out at the wrong time.</p>
        </div>
        <div className="feature">
          <h3>Reports & Insights</h3>
          <p>Know what's selling, what's not, and where your money's actually going.</p>
        </div>
        <div className="feature">
          <h3>Built for SMEs</h3>
          <p>Built for small & medium enterprises. No bloated features or jargon — just what you need to keep track of sales and stock.</p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="pricing">
        <div className="pricing-header">
          <span className="pricing-tag">Transparent Pricing</span>
          <h2>Simple plans for growing businesses</h2>
          <p>Start for free and upgrade as your shop scales up. No hidden fees.</p>
        </div>

        <div className="pricing-grid">
          {/* Starter Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3>Starter</h3>
              <p>For small shops & solo vendors getting started.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">0</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ Basic Sales & Expense Logging</li>
              <li>✓ Up to 100 Stock Items</li>
              <li>✓ Daily Sales Summary</li>
              <li>✓ Single User Access</li>
            </ul>
            <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
              Get Started Free
            </button>
          </div>

          {/* Growth Plan */}
          <div className="pricing-card featured">
            <div className="popular-badge">Most Popular</div>
            <div className="pricing-card-header">
              <h3>Growth</h3>
              <p>For busy shops needing real-time inventory and insights.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">1,500</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ Unlimited Stock Items & SKUs</li>
              <li>✓ M-Pesa & Payment Channel Tracking</li>
              <li>✓ Low Stock Alerts & Reorder Logs</li>
              <li>✓ Multi-device POS Access</li>
              <li>✓ Exportable Excel & PDF Reports</li>
            </ul>
            <button className="pricing-btn primary" onClick={() => setStage("dashboard")}>
              Start 14-Day Free Trial
            </button>
          </div>

          {/* Custom Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3>Pro Multi-Store</h3>
              <p>For multi-branch outlets and distributor networks.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">3,500</span>
                <span className="period">/month</span>
              </div>
            </div>
            <ul className="pricing-features">
              <li>✓ Everything in Growth</li>
              <li>✓ Multi-Branch Store Management</li>
              <li>✓ Advanced Audit Trail & Staff Roles</li>
              <li>✓ Supplier Order Management</li>
              <li>✓ Priority Developer Support</li>
            </ul>
            <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="values">
        <h2>What shapes BiasharaPulse</h2>
        <div className="value-grid">
          <div className="value">
            <h4>Commitment</h4>
            <p>Built for the long run — features ship because SMEs asked for them, not for show.</p>
          </div>
          <div className="value">
            <h4>Security</h4>
            <p>Your business data stays yours — encrypted, backed up, never sold.</p>
          </div>
          <div className="value">
            <h4>Simplicity</h4>
            <p>If it takes a manual to explain, it doesn't belong in the app.</p>
          </div>
          <div className="value">
            <h4>Accessibility</h4>
            <p>Free tier isn't a trial — it's a real, usable version for real businesses.</p>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      {/* ── UPDATED DEVELOPER PORTAL SECTION ── */}
      <section id="developer" className="developer-section">
                  
          
          <h2>Behind BiasharaPulse</h2>
          
          <p className="developer-lead">
            BiasharaPulse is designed, engineered, and maintained by a single full-stack developer 
            dedicated to empowering local SMEs with high-performance, intuitive software.
          </p>

          {/* Grid Highlights */}
          <div className="dev-highlights">            
            <div className="dev-pill">
              <span className="pill-title">Location</span>
              <span className="pill-desc">Nairobi, Kenya 🇰🇪</span>
            </div>
          </div>

          <div className="developer-cta-box">
            <p className="developer-contact-text">
            Looking for custom software engineering, technical consultancy, or partnership opportunities? Reach out via{' '}
            <a 
              href="https://raburu.co.ke" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="dev-inline-link"
            >
              raburu.co.ke
            </a>
            .
          </p>
          </div>
        
      </section>

      <footer className="landing-footer">
        <div>© 2026 BiasharaPulse. Built for Kenyan SMEs.</div>
      </footer>
    </div>
  );
}

export default Landing;