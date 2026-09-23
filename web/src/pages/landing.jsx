import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HeroPage from "./heroPage";
import Dashboard from "./dashboard";
import "./styles/landing.css";
import "./styles/splash.css";


function Landing() {
  const [searchParams] = useSearchParams();
  const skipToLanding = searchParams.get("view") === "landing";

  const [stage, setStage] = useState(skipToLanding ? "landing" : "splash");
  const [fadeOut, setFadeOut] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeShowcase, setActiveShowcase] = useState(0)

const showcaseTabs = [
  {
    label: 'Dashboard',
    desktopSrc: '/screenshots/dashboard-desktop.png',
    mobileSrc: [
      '/screenshots/dashboard-mobile1.png',
      '/screenshots/dashboard-mobile2.png',
      '/screenshots/dashboard-mobile3.png',
    ],
    heading: 'Know exactly how your business is doing', 
    description: 'A clear view of your sales, expenses, profit, and stock health without digging through spreadsheets or doing manual calculations.', benefits: [ { icon: '↗', text: 'Track revenue and expenses as they happen' }, { icon: '◉', text: 'See profit, margins, and business performance at a glance' }, { icon: '▣', text: 'Monitor stock levels before products run out' }, ],
    caption: 'Revenue, expenses, margin, and stock health — all in one live view.',
  },

  {
    label: 'Point of Sale',
    desktopSrc: '/screenshots/pos-desktop.png',
    mobileSrc: [
      '/screenshots/pos-mobile.png',
    ],
    heading: 'Close sales in seconds, not minutes', 
    description: 'A simple POS built for busy Kenyan shops. Record sales quickly, automatically update stock, and keep every transaction accounted for.', benefits: [ { icon: '⚡', text: 'Complete sales quickly with a simple checkout flow' }, { icon: 'KSh', text: 'Track cash, M-Pesa, and other payment methods' }, { icon: '✓', text: 'Automatically deduct sold products from stock' }, ],
    caption: 'Cost, margin, and sell-through per product, with one-tap sales.',
  },

  {
    label: 'Stock Movement',
    desktopSrc: '/screenshots/stock-desktop.png',
    mobileSrc: [
      '/screenshots/stock-mobile.png',
    ],
    heading: 'Know where every product is going', 
    description: 'Keep your inventory under control by recording stock coming in, going out, being adjusted, or running low.', benefits: [ { icon: '+', text: 'Record new stock and incoming inventory' }, { icon: '↕', text: 'Track stock movement and adjustments' }, { icon: '!', text: 'Spot low-stock products before they become a problem' }, ],
    caption: 'Every restock and write-off logged, with low-stock alerts built in.',
  },

  {
    label: 'Orders',
    desktopSrc: '/screenshots/orders-desktop.png',
    mobileSrc: [
      '/screenshots/orders-mobile.png',
    ],
    heading: 'Keep every customer order on track', 
    description: 'Manage orders from the moment they are placed until they are completed, so nothing gets forgotten or lost in chats and notebooks.', benefits: [ { icon: '◷', text: 'See pending, active, and completed orders' }, { icon: '✓', text: 'Track each order through its status' }, { icon: '▤', text: 'Keep customer orders organized in one place' }, ],
    caption: 'Track customer orders from pending to delivered.',
  },
];
  useEffect(() => {
    if (skipToLanding) return;

    const fadeTimer = setTimeout(() => setFadeOut(true), 6200);
    const advanceTimer = setTimeout(() => setStage("hero"), 7000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(advanceTimer);
    };
  }, [skipToLanding]);

  useEffect(() => {
  if (skipToLanding) {
    setStage("landing");
  }
}, [skipToLanding]);

  if (stage === "splash") {
    return (
      <div className={`splash ${fadeOut ? "splash-fade-out" : ""}`}>
        <h1 className="splash-text">
          <span className="splash-biashara">Biashara</span>
          <span className="splash-pulse">Pulse</span>
        </h1>
        <div className="splash-loader">
          <svg viewBox="0 0 150 34" preserveAspectRatio="none">
            <path d="M0,17 L35,17 L45,4 L55,30 L65,17 L150,17" />
          </svg>
        </div>
      </div>
    );
  }

  if (stage === "hero") {
    return (
      <div className="stage-fade-in">
        <HeroPage onGetStarted={() => setStage("landing")} />
      </div>
    );
  }

  if (stage === "dashboard") {
    return <Dashboard />;
  }


  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-container">
          <button
            className="mobile-nav-toggle"
            aria-label="Toggle Navigation"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <a href="#" className="brand">
            <span className="brand-biashara">Biashara</span>
            <span className="brand-pulse">Pulse</span>
          </a>

          <div className="nav-dropdown-wrapper">
            <button
              className="btn-account-trigger"
              aria-label="Account Menu"
              onClick={() => setAccountOpen(!accountOpen)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
            {accountOpen && (
              <div className="nav-dropdown">
                <Link to="/login" onClick={() => setAccountOpen(false)}>Sign in</Link>
                <Link to="/signup" className="highlight" onClick={() => setAccountOpen(false)}>Create Account</Link>
              </div>
            )}
          </div>
        </div>

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

      <div className="landing-top">
        <svg className="landing-wave-bg" viewBox="0 0 1440 600" preserveAspectRatio="none">
          <defs>
            <linearGradient id="landingGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0A0A0A" />
              <stop offset="70%" stopColor="#141414" />
              <stop offset="100%" stopColor="#4A000A" />
            </linearGradient>
          </defs>
          <path
            d="M0,0 L0,560 C504,520 1008,620 1440,565 L1440,0 Z"
            fill="url(#landingGradient)"
          />
        </svg>

        <section className="hero">
          <span className="hero-pill">Developed for Kenyan SMEs 🇰🇪</span>
          <h1>Run your business, not your spreadsheets</h1>
          <p>
            Stop wasting time digging through spreadsheets, receipts, and scattered records just to figure out how your business is doing. BiasharaPulse brings your sales, expenses, inventory, and daily operations together in one simple platform. See what’s selling, know what’s running low, track where your money is going, and stay on top of your business in real time
          </p>
          <div className="hero-cta-group">
            <button className="cta-primary" onClick={() => setStage("dashboard")}>
              Start Free Now
            </button>
            <a href="#pricing" className="cta-secondary">View Pricing</a>
          </div>
        </section>
      </div>

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
          <p>Exportable performance summaries showcasing profit margins and top-performing products.</p>
        </div>
        <div className="feature">
          <div className="feature-icon">⚡</div>
          <h3>Built for Local SMEs</h3>
          <p>Lightweight architecture designed for multi-device performance across standard mobile networks.</p>
        </div>
      </section>

<section id="showcase" className="showcase">
  <div className="showcase-intro">
    <span className="features-tag">See it in action</span>
    <h2>Built for how you actually run your shop</h2>
    <p>View real snapshots from biasharaPulse.</p>
  </div>

  <div className="showcase-tabs">
    {showcaseTabs.map((tab, i) => (
      <button
        key={tab.label}
        className={`showcase-tab ${activeShowcase === i ? 'active' : ''}`}
        onClick={() => setActiveShowcase(i)}
      >
        {tab.label}
      </button>
    ))}
  </div>

  <div className="showcase-content">
    <div className="showcase-info">
      <span className="showcase-number">
        {String(activeShowcase + 1).padStart(2, '0')} / {showcaseTabs[activeShowcase].label}
      </span>

      <h2>{showcaseTabs[activeShowcase].heading}</h2>

      <p className="showcase-description">
        {showcaseTabs[activeShowcase].description}
      </p>

      <ul className="showcase-benefits">
        {showcaseTabs[activeShowcase].benefits.map((benefit) => (
          <li key={benefit.text}>
            <span className="benefit-icon">{benefit.icon}</span>
            <span>{benefit.text}</span>
          </li>
        ))}
      </ul>
    </div>

    <div className="showcase-frame">
      <img
        src={showcaseTabs[activeShowcase].desktopSrc}
        alt={`${showcaseTabs[activeShowcase].label} screenshot`}
        className="showcase-shot showcase-shot-desktop"
      />

      <div className="showcase-mobile-shots">
        {showcaseTabs[activeShowcase].mobileSrc.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`${showcaseTabs[activeShowcase].label} mobile screenshot ${index + 1}`}
            className="showcase-shot showcase-shot-mobile"
          />
        ))}
      </div>
    </div>
  </div>

  <p className="showcase-caption">
    {showcaseTabs[activeShowcase].caption}
  </p>
</section>

{/* ── PRODUCT VIDEO ── */}
<section className="product-video">
  <div className="product-video-intro">
    <span className="section-eyebrow">SEE IT IN ACTION</span>

    <h2>
      See how BiasharaPulse
      <span> works in your business.</span>
    </h2>

    <p>
      Take a quick walkthrough of BiasharaPulse and see how you can
      manage sales, inventory, expenses and business performance
      from one place.
    </p>
  </div>

  <div className="product-video-wrapper">
    <div className="product-video-player">
      <video
        controls
        preload="metadata"
        poster="/videos/biasharapulse-preview.png"
      >
        <source
          src="/videos/biasharapulse-demo.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>

    <div className="product-video-meta">
      <div>
        <span className="video-dot"></span>
        BiasharaPulse walkthrough
      </div>

      <span>2–3 min</span>
    </div>
  </div>
</section>

  {/* pricing */}
  <section id="pricing" className="pricing">
  <div className="pricing-header">
    <span className="pricing-tag">Transparent SME Pricing</span>
    <h2>Plans built to fit every stage of your biashara</h2>
    <p>Test free with your first 75 orders. Upgrade seamlessly as your shop scales.</p>
  </div>

  <div className="pricing-grid">
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
          <li>✓ Order Tracking</li>
          <li>✓ Stock Movement Log</li>
          <li>✓ Sales & Expense Logging</li>
          <li>✓ 1 User / 1 Device</li>
          <li>✓ 30-Day History</li>
        </ul>
        <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
          Start Free Test
        </button>
      </div>
    </div>

    <div className="pricing-card">
      <div className="pricing-card-header">
        <h3>Biashara Lite</h3>
        <p>For small online sellers with light, steady order volume.</p>
        <div className="pricing-amount">
          <span className="currency">KES</span>
          <span className="price">1499</span>
          <span className="period">/ month</span>
        </div>
      </div>
      <div className="pricing-card-body">
        <ul className="pricing-features">
          <li>✓ Up to 70 Orders / Month</li>
          <li>✓ Order Tracking</li>
          <li>✓ Stock Movement Log</li>
          <li>✓ Sales & Expense Logging</li>
          <li>✓ Bulk Spreadsheet Import</li>
          <li>✓ Unlimited History</li>
        </ul>
        <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
          Select Lite
        </button>
      </div>
    </div>

    <div className="pricing-card featured">
      <div className="popular-badge">Most Popular</div>
      <div className="pricing-card-header">
        <h3>Biashara Growth</h3>
        <p>For active retail shops that need imports and faster stock entry.</p>
        <div className="pricing-amount">
          <span className="currency">KES</span>
          <span className="price">2,500</span>
          <span className="period">/ month</span>
        </div>
      </div>
      <div className="pricing-card-body">
        <ul className="pricing-features">
          <li>✓ <strong>Unlimited Orders</strong></li>
          <li>✓ Everything in Lite</li> 
          <li>✓ Full POS Page</li>         
          <li>✓ QR Code Product Scanning</li>
          <li>✓ Get detailed business reports generated to your email</li>          
        </ul>
        <button className="pricing-btn primary" onClick={() => setStage("dashboard")}>
          Start free 14 day trial
        </button>
      </div>
    </div>

    <div className="pricing-card">      
      <div className="pricing-card-header">
        <h3>Biashara Pro</h3>
        <p>For shops that need full product performance insight and a team.</p>
        <div className="pricing-amount">
          <span className="currency">KES</span>
          <span className="price">4,999</span>
          <span className="period">/ month</span>
        </div>
      </div>
      <div className="pricing-card-body">
        <ul className="pricing-features">
          <li>✓ Everything in Growth</li>    
          <li>✓ Upto 3 shop branches</li>                
          <li>✓ Owner & Staff Accounts</li>          
        </ul>
        <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
          Start Pro
        </button>
      </div>
    </div>

    <div className="pricing-card">
      <div className="pricing-card-header">
        <h3>Pro Multi-Branch</h3>
        <p>For businesses running multiple locations with a team.</p>
        <div className="pricing-amount">
          <span className="currency">KES</span>
          <span className="price">7,999</span>
          <span className="period">/ month</span>
        </div>
      </div>
      <div className="pricing-card-body">
        <ul className="pricing-features">
          <li>✓ Everything in Pro</li>
          <li>✓ Up to 5 Shop Branches</li>
        </ul>
        <button className="pricing-btn secondary" onClick={() => setStage("dashboard")}>
          Upgrade to Pro
        </button>
      </div>
    </div>
  </div>
</section>

{/* ── HOW IT WORKS ── */}
<section id="how-it-works" className="how-it-works">
  <div className="how-intro">
    <span className="features-tag">How it works</span>
    <h2>Live in minutes, not days</h2>
    <p>No setup calls, no training sessions — open it and start running your shop.</p>
  </div>

  <div className="how-steps">
    <div className="how-step">
      <span className="how-step-number">1</span>
      <h3>Create your account</h3>
      <p>Sign up free — no card required, no sales call.</p>
    </div>

    <div className="how-step">
      <span className="how-step-number">2</span>
      <h3>Add your products</h3>
      <p>Import your whole catalog from a spreadsheet, or add items one by one as you go.</p>
    </div>

    <div className="how-step">
      <span className="how-step-number">3</span>
      <h3>Sell and track</h3>
      <p>Record sales at the counter, log stock movements, and manage customer orders — all in one place.</p>
    </div>

    <div className="how-step">
      <span className="how-step-number">4</span>
      <h3>See it on your dashboard</h3>
      <p>Revenue, margin, and stock health update automatically — no spreadsheets to reconcile.</p>
    </div>
  </div>

  <button className="how-cta" onClick={() => setStage("dashboard")}>
    Start Free Now
  </button>
</section>

      <section id="values" className="values">
        <h2>Built around how you actually run your shop</h2>
        <div className="value-grid">
          <div className="value-stamp">
            <span className="stamp-mark">Built with operators</span>
            <p>We shape every feature around what Kenyan shop owners tell us they need, not what looks good in a demo.</p>
          </div>
          <div className="value-stamp">
            <span className="stamp-mark">Your records, your business</span>
            <p>Every transaction stays encrypted and walled off — nobody outside your shop ever sees your numbers.</p>
          </div>
          <div className="value-stamp">
            <span className="stamp-mark">No manual required</span>
            <p>Open it and start selling. The interface explains itself, so there's no training day.</p>
          </div>
          <div className="value-stamp">
            <span className="stamp-mark">A real free tier</span>
            <p>The free version does actual work — it's not a stripped demo waiting behind a paywall.</p>
          </div>
        </div>
      </section>

      <section id="developer" className="developer-section">
        <div className="dev-portal-content">
          <div className="dev-mark">R</div>
          <div className="dev-portal-body">
            <h2>Developers Portal</h2>
            <p className="dev-portal-about">
              BiasharaPulse grew out of one real problem: shop owners tracking stock and cash by hand, with no
              visibility until something went missing. It now runs sales, inventory, and reporting for pop-up
              vendors, single outlets, and multi-branch distributors alike — replacing guesswork with numbers
              you can actually check.
            </p>
            <p className="dev-portal-contact">
              Need something similar for your own business — a mobile app, a web platform, or both working
              together? <br />Reach out @{" "}
              <a href="https://raburu.co.ke" target="_blank" rel="noopener noreferrer" className="dev-link">
                raburu.co.ke
              </a>.
            </p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <span className="footer-logo-biashara">Biashara</span>
              <span className="footer-logo-pulse">Pulse</span>
            </a>
            <p className="footer-tagline">
              Sales, stock, and cash flow in one place — built for Kenyan SMEs.
            </p>
            <div className="footer-socials">
              <a href="#" aria-label="X / Twitter" className="footer-social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.9 2H22l-7.6 8.7L23.3 22h-7l-5.5-7.2L4.5 22H1.4l8.1-9.3L1 2h7.2l5 6.6L18.9 2Zm-1.2 18h1.7L7.4 4H5.6l12.1 16Z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="footer-social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="footer-social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.05-1.86-3.05-1.87 0-2.15 1.46-2.15 2.96V21h-4V9Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Product</h5>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#values">Values</a>
          </div>

          <div className="footer-col">
            <h5>Company</h5>
            <a href="#developer">Developer</a>
            <a href="https://raburu.co.ke" target="_blank" rel="noopener noreferrer">About the builder</a>
            <a href="#">Contact</a>
          </div>

          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Terms of service</a>
            <a href="#">Privacy policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 BiasharaPulse. Engineered for Kenyan Businesses.</span>
          <span className="footer-madein">Made in Nairobi 🇰🇪</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;