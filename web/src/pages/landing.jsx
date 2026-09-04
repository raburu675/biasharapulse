import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HeroPage from "./heroPage";
import Dashboard from "./dashboard";
import "./styles/landing.css";
import "./styles/splash.css";

function Landing() {
  const [stage, setStage] = useState("splash"); // 'splash' | 'hero' | 'landing' | 'dashboard'
  const [fadeOut, setFadeOut] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      {/* Streamlined Navigation Bar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <a href="#" className="brand">
            <span className="brand-dot"></span>
            BiasharaPulse
          </a>

          {/* Desktop Links */}
          <div className="nav-links-desktop">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#values">Values</a>
            <a href="#developer">Developer</a>
          </div>

          <div className="nav-actions">
            <div className="nav-dropdown-wrapper">
              <button
                className="btn-account-trigger"
                aria-label="Account Menu"
                onClick={() => setAccountOpen(!accountOpen)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Account</span>
              </button>
              {accountOpen && (
                <div className="nav-dropdown">
                  <Link to="/login" onClick={() => setAccountOpen(false)}>Sign in</Link>
                  <Link to="/signup" className="highlight" onClick={() => setAccountOpen(false)}>Create Account</Link>
                </div>
              )}
            </div>

            <button className="cta-nav" onClick={() => setStage("dashboard")}>
              Launch App
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-nav-toggle"
              aria-label="Toggle Navigation"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileNavOpen && (
          <div className="mobile-menu-drawer">
            <a href="#features" onClick={() => setMobileNavOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMobileNavOpen(false)}>Pricing</a>
            <a href="#values" onClick={() => setMobileNavOpen(false)}>Values</a>
            <a href="#developer" onClick={() => setMobileNavOpen(false)}>Developer</a>
            <div className="mobile-drawer-divider"></div>
            <Link to="/login" onClick={() => setMobileNavOpen(false)}>Sign in</Link>
            <Link to="/signup" onClick={() => setMobileNavOpen(false)}>Create Account</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <span className="hero-pill">Engineered for Kenyan SMEs 🇰🇪</span>
        <h1>Run your business, not your spreadsheets</h1>
        <p>
          BiasharaPulse gives retail outlets, distributors, and vendors a unified system to track daily sales, expenses, and
          stock levels in real time.
        </p>
        <div className="hero-cta-group">
          <button className="cta-primary" onClick={() => setStage("dashboard")}>
            Start Free Now
          </button>
          <a href="#pricing" className="cta-secondary">View Pricing</a>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="features-intro">
        <span className="features-tag">What you get</span>
        <h2>Everything your business needs</h2>
        <p>From daily cash flow logs to shelf inventory — track operations without complexity.</p>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-icon">📊</div>
          <h3>Sales & Expense Tracking</h3>
          <p>Instant revenue metrics and daily expense classification without manual calculations.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📦</div>
          <h3>Stock Movement</h3>
          <p>Track incoming inventory batches and automated point-of-sale deductions instantly.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📈</div>
          <h3>Reports & Insights</h3>
          <p>Exportable performance summaries showcasing profit margins and top-performing SKUs.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <h3>Built for Local SMEs</h3>
          <p>Lightweight architecture designed for multi-device performance across standard mobile networks.</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="pricing-header">
          <span className="pricing-tag">Transparent SME Pricing</span>
          <h2>Plans built to fit every stage of your biashara</h2>
          <p>Test free with your first 75 orders. Upgrade seamlessly as your shop scales.</p>
        </div>

        <div className="pricing-grid">
          {/* Starter Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3>Starter</h3>
              <p>For new vendors testing the app without commitment.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">0</span>
                <span className="period">/ 75 orders</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ First 75 Orders Free</li>
                <li>✓ 1 User / 1 Device</li>
                <li>✓ Sales & Expense Logging</li>
                <li>✓ Basic Inventory Tracking</li>
              </ul>
              <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
                Start Free Test
              </button>
            </div>
          </div>

          {/* Growth Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3>Biashara Growth</h3>
              <p>For active single-outlet retail shops needing automated tracking.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">750</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ <strong>Unlimited Orders</strong></li>
                <li>✓ 2 Staff Accounts</li>
                <li>✓ M-Pesa Transaction Tagging</li>
                <li>✓ Low-Stock Threshold Alerts</li>
              </ul>
              <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
                Select Growth
              </button>
            </div>
          </div>

          {/* Plus Plan - Featured */}
          <div className="pricing-card featured">
            <div className="popular-badge">Most Popular</div>
            <div className="pricing-card-header">
              <h3>Biashara Plus</h3>
              <p>For growing retail outlets managing staff and cashiers.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">1,500</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ Everything in Growth</li>
                <li>✓ Up to 5 Staff Accounts</li>
                <li>✓ Cashier Fraud & Edit Logs</li>
                <li>✓ Supplier PO & Profit Reports</li>
              </ul>
              <button className="pricing-btn primary" onClick={() => setStage("dashboard")}>
                Start 14-Day Free Trial
              </button>
            </div>
          </div>

          {/* Pro Multi-Store Plan */}
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3>Pro Multi-Branch</h3>
              <p>For distributors & multi-location operations.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">2,200</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ Everything in Plus</li>
                <li>✓ Up to 3 Shop Branches</li>
                <li>✓ Inter-Branch Stock Transfers</li>
                <li>✓ Priority Phone Support</li>
              </ul>
              <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="values">
        <h2>What shapes BiasharaPulse</h2>
        <div className="value-grid">
          <div className="value">
            <h4>Commitment</h4>
            <p>Engineered with long-term stability in mind based directly on local SME feedback.</p>
          </div>
          <div className="value">
            <h4>Data Sovereignty</h4>
            <p>Your operational records remain strictly confidential, encrypted, and isolated.</p>
          </div>
          <div className="value">
            <h4>Simplicity</h4>
            <p>Purpose-built UI designed for rapid workflow execution with zero training overhead.</p>
          </div>
          <div className="value">
            <h4>Accessibility</h4>
            <p>Our free tier provides a fully functional base system without feature blockades.</p>
          </div>
        </div>
      </section>

      {/* Developer Portal Section */}
      <section id="developer" className="developer-section">
        <div className="dev-portal-content">
          <span className="dev-portal-tag">Developer Portal</span>
          <h2>Empowering Kenya’s Business Ecosystem</h2>
          
          <p className="dev-portal-about">
            BiasharaPulse is built from the ground up to solve real operational bottlenecks faced by businesses across Kenya. Whether you are a solo pop-up vendor recording daily cash transactions, a high-traffic retail outlet managing fast-moving inventory, or a expanding multi-branch distributor coordinating stock across locations—BiasharaPulse delivers real-time visibility into your cash flow, sales trends, and profit margins. By replacing error-prone manual record-keeping with an intuitive, multi-device mobile platform, BiasharaPulse helps local enterprises prevent stock leakages, optimize order cycles, and make confident data-driven decisions that fuel long-term business growth.
          </p>

          <div className="dev-portal-link-box">
            <p>
              Looking for custom software engineering, enterprise platform integration, or web systems? Explore developer capabilities at{" "}
              <a 
                href="https://raburu.co.ke" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="dev-gold-link"
              >
                raburu.co.ke
              </a>.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>© 2026 BiasharaPulse. Engineered for Kenyan Businesses.</div>
      </footer>
    </div>
  );
}

export default Landing;