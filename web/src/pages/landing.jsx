import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./styles/landing.css";
import "./styles/splash.css";
import axios from "axios";
import { api } from "../hooks/usePlan";

// Labels shown in the auth popup when the user picked a plan before signing in
const PLAN_LABELS = {
  starter: "Starter",
  lite: "Biashara Lite",
  growth: "Biashara Growth",
  pro: "Biashara Pro",
  multi_branch: "Pro Multi-Branch",
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })
    : null;

// Signed-in username, or null when signed out
const readUser = () =>
  localStorage.getItem("token") ? localStorage.getItem("username") || "your account" : null;

function Landing() {
  const [searchParams] = useSearchParams();
  const skipToLanding = searchParams.get("view") === "landing";
  const navigate = useNavigate();

  const [stage, setStage] = useState(skipToLanding ? "landing" : "splash");
  const [fadeOut, setFadeOut] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileScrollRefs = useRef([]);
  const accountRef = useRef(null);

  // Signed-in user shown in the account menu (null = signed out)
  const [currentUser, setCurrentUser] = useState(readUser);

  // Where the user was heading when we intercepted them
  const [pendingPlan, setPendingPlan] = useState(null); // 'starter' | 'lite' | ... | null
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  // Notice shown to signed-in users (active paid plan, or a failed switch)
  const [planNotice, setPlanNotice] = useState(null); // { title, body } | null

  const API_BASE = "http://127.0.0.1:8000";
  // const API_BASE = 'https://biasharapulse-production.up.railway.app' // Railway — restore once billing is sorted

  const isSignedIn = () => !!localStorage.getItem("token");

  // Log out: tell the backend (best effort), clear storage, update the menu
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await axios.post(
          `${API_BASE}/api/auth/logout/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );
      }
    } catch {
      /* token may already be expired — still log out locally */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("businessId");
    localStorage.removeItem("username");
    localStorage.removeItem("pendingPlan");
    setCurrentUser(null);
    setAccountOpen(false);
  };

  const showActivePlanNotice = (planKey, paidUntil) => {
    const date = formatDate(paidUntil);
    setPlanNotice({
      title: "You already have a paid plan",
      body: `You're on ${PLAN_LABELS[planKey] || planKey}${
        date ? `, active until ${date}` : ""
      }. You can pick a new plan once your current plan expires.`,
    });
  };

  const selectPlan = async (tier) => {
    if (!isSignedIn()) {
      if (tier) localStorage.setItem("pendingPlan", tier);
      setPendingPlan(tier);
      setAuthPromptOpen(true);
      return;
    }

    const businessId = localStorage.getItem("businessId");
    if (!businessId) {
      localStorage.removeItem("token");
      setCurrentUser(null);
      setAuthPromptOpen(true);
      return;
    }

    try {
      // Check the current plan first — an active paid plan can't be switched
      const { data: current } = await api.get(`/api/business/${businessId}/plan/`);
      if (current.plan !== "starter" && current.plan !== "expired") {
        showActivePlanNotice(current.plan, current.paid_until);
        return;
      }

      await api.post(`/api/business/${businessId}/select-plan/`, { tier });
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data?.code === "plan_active") {
        showActivePlanNotice(data.plan, data.paid_until);
        return;
      }
      setPlanNotice({
        title: "Could not switch plan",
        body: data?.error || "Please try again.",
      });
    }
  };

  // "Start Free Now" hero button — no tier, just route (or prompt) to the dashboard
  const handleStartFree = () => {
    if (isSignedIn()) {
      navigate("/dashboard");
    } else {
      setPendingPlan(null); // no tier to apply
      setAuthPromptOpen(true);
    }
  };

  const showcaseTabs = [
    {
      label: "Dashboard",
      desktopSrc: "/screenshots/dashboard-desktop.png",
      mobileSrc: [
        "/screenshots/dashboard-mobile1.png",
        "/screenshots/dashboard-mobile2.png",
        "/screenshots/dashboard-mobile3.png",
      ],
      heading: "Know exactly how your business is doing",
      description:
        "A clear view of your sales, expenses, profit, and stock health without digging through spreadsheets or doing manual calculations.",
      benefits: [
        { icon: "↗", text: "Track revenue and expenses as they happen" },
        { icon: "◉", text: "See profit, margins, and business performance at a glance" },
        { icon: "▣", text: "Monitor stock levels before products run out" },
      ],
      caption: "Revenue, expenses, margin, and stock health — all in one live view.",
    },
    {
      label: "Point of Sale",
      desktopSrc: "/screenshots/pos-desktop.png",
      mobileSrc: ["/screenshots/pos-mobile.png"],
      heading: "Close sales in seconds, not minutes",
      description:
        "A simple POS built for busy Kenyan shops. Record sales quickly, automatically update stock, and keep every transaction accounted for.",
      benefits: [
        { icon: "⚡", text: "Complete sales quickly with a simple checkout flow" },
        { icon: "KSh", text: "Track cash, M-Pesa, and other payment methods" },
        { icon: "✓", text: "Automatically deduct sold products from stock" },
      ],
      caption: "Cost, margin, and sell-through per product, with one-tap sales.",
    },
    {
      label: "Stock Movement",
      desktopSrc: "/screenshots/stock-desktop.png",
      mobileSrc: ["/screenshots/stock-mobile.png"],
      heading: "Know where every product is going",
      description:
        "Keep your inventory under control by recording stock coming in, going out, being adjusted, or running low.",
      benefits: [
        { icon: "+", text: "Record new stock and incoming inventory" },
        { icon: "↕", text: "Track stock movement and adjustments" },
        { icon: "!", text: "Spot low-stock products before they become a problem" },
      ],
      caption: "Every restock and write-off logged, with low-stock alerts built in.",
    },
    {
      label: "Orders",
      desktopSrc: "/screenshots/orders-desktop.png",
      mobileSrc: ["/screenshots/orders-mobile.png"],
      heading: "Keep every customer order on track",
      description:
        "Manage orders from the moment they are placed until they are completed, so nothing gets forgotten or lost in chats and notebooks.",
      benefits: [
        { icon: "◷", text: "See pending, active, and completed orders" },
        { icon: "✓", text: "Track each order through its status" },
        { icon: "▤", text: "Keep customer orders organized in one place" },
      ],
      caption: "Track customer orders from pending to delivered.",
    },
  ];

  useEffect(() => {
    if (skipToLanding) return;

    const fadeTimer = setTimeout(() => setFadeOut(true), 6200);
    const advanceTimer = setTimeout(() => setStage("landing"), 7000);
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

  // Scroll to the section named in the URL hash (e.g. #pricing from locked links)
  useEffect(() => {
    if (stage !== "landing") return;
    const id = window.location.hash.replace("#", "");
    if (!id) return;

    const go = () => document.getElementById(id)?.scrollIntoView();
    go();
    const retry = setTimeout(go, 300);
    return () => clearTimeout(retry);
  }, [stage]);

  // Smooth-scroll every in-page link (href="#something") to its section
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      e.preventDefault();
      const id = link.getAttribute("href").slice(1);

      if (!id) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Close the account menu on an outside click or Escape
  useEffect(() => {
    if (!accountOpen) return;

    const onOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    const onEscape = (e) => {
      if (e.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [accountOpen]);

  if (stage === "splash") {
    return (
      <div className={`splash ${fadeOut ? "splash-fade-out" : ""}`}>
        <h1 className="splash-text">
          <span className="splash-biashara">Biashara</span>
          <span className="splash-pulse">Pulse</span>
        </h1>
        <p className="splash-tagline">the heart of your business</p>
        <div className="splash-loader">
          <svg viewBox="0 0 150 34" preserveAspectRatio="none">
            <path d="M0,17 L35,17 L45,4 L55,30 L65,17 L150,17" />
          </svg>
        </div>
      </div>
    );
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

          <div className="brand">
            <span className="brand-biashara">Biashara</span>
            <span className="brand-pulse">Pulse</span>
          </div>

          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#showcase">Product</a>
            <a href="#pricing">Pricing</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#values">What we offer</a>
          </div>

          <div className="nav-dropdown-wrapper" ref={accountRef}>
            <button
              className="btn-account-trigger"
              aria-label="Account menu"
              aria-expanded={accountOpen}
              onClick={() => {
                setCurrentUser(readUser()); // re-check in case the session changed
                setAccountOpen(!accountOpen);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            <div className={`account-menu ${accountOpen ? "open" : ""}`}>
              {currentUser ? (
                <>
                  <div className="account-menu-head">
                    <span>Logged in as</span>
                    <strong>{currentUser}</strong>
                  </div>
                  <Link to="/dashboard" className="account-menu-btn solid" onClick={() => setAccountOpen(false)}>
                    Go to dashboard
                  </Link>
                  <br></br>
                  <Link to="/account" className="account-menu-btn ghost" onClick={() => setAccountOpen(false)}>
                    My account
                  </Link>
                  <button
                    type="button"
                    className="account-menu-btn ghost"
                    style={{ width: "100%", cursor: "pointer", fontFamily: "inherit" }}
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <div className="account-menu-head">
                    <strong>Welcome to BiasharaPulse</strong>
                    <span>Sign in to manage your shop, or create a free account.</span>
                  </div>
                  <Link to="/login" className="account-menu-btn ghost" onClick={() => setAccountOpen(false)}>
                    Sign in
                  </Link>
                  <Link to="/signup" className="account-menu-btn solid" onClick={() => setAccountOpen(false)}>
                    Create New account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="mobile-menu-drawer">
            <a href="#features" onClick={() => setMobileNavOpen(false)}>Features</a>
            <a href="#showcase" onClick={() => setMobileNavOpen(false)}>Product</a>
            <a href="#pricing" onClick={() => setMobileNavOpen(false)}>Pricing</a>
            <a href="#how-it-works" onClick={() => setMobileNavOpen(false)}>How It Works</a>
            <a href="#values" onClick={() => setMobileNavOpen(false)}>What we offer</a>
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
          <h1>You know your shop but do you know your numbers?</h1>
          <p>
            POS, inventory, orders, expenses, and profit analytics — in one tool
            built for Kenyan SMEs. Ring up a sale at the counter, track an
            order on the same screen, and see your real business insights.
            BiasharaPulse replaces the notebook, the spreadsheet, and the app you
            never open — with one dashboard you'll actually use.
          </p>
          <div className="hero-cta-group">
            <button className="cta-primary" onClick={handleStartFree}>
              {currentUser ? "Go to Dashboard" : "Start Free Now"}
            </button>
            <a href="#pricing" className="cta-secondary">View Pricing</a>
          </div>
        </section>
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="features-intro">
        <span className="features-tag">What you get</span>
        <h2>Everything your business needs to run smarter</h2>
        <p>Sales, stock, expenses, orders, and performance — brought together in one clear view.</p>
      </section>

      <section className="features">
        <div className="feature">
          <div className="feature-top"><span className="feature-index">01</span><div className="feature-icon">📊</div></div>
          <h3>Sales & Expense Tracking</h3>
          <p>See what is coming in, what is going out, and where your money is going without manual calculations.</p>
          <span className="feature-note">Know your numbers</span>
        </div>
        <div className="feature">
          <div className="feature-top"><span className="feature-index">02</span><div className="feature-icon">📦</div></div>
          <h3>Stock Movement</h3>
          <p>Record incoming stock, sales, adjustments, and low-stock activity so your inventory stays under control.</p>
          <span className="feature-note">Stay ahead of stock</span>
        </div>
        <div className="feature">
          <div className="feature-top"><span className="feature-index">03</span><div className="feature-icon">📈</div></div>
          <h3>Reports & Insights</h3>
          <p>Turn everyday transactions into useful performance information, from profit margins to your best products.</p>
          <span className="feature-note">Understand performance</span>
        </div>
        <div className="feature">
          <div className="feature-top"><span className="feature-index">04</span><div className="feature-icon">⚡</div></div>
          <h3>Built for Local SMEs</h3>
          <p>Simple enough for a busy shop floor and lightweight enough to work smoothly across everyday mobile networks.</p>
          <span className="feature-note">Made for real biashara</span>
        </div>
      </section>

      <section id="showcase" className="showcase">
        <div className="showcase-intro">
          <span className="features-tag">See it in action</span>
          <h2>Built for how you actually run your shop</h2>
          <p>Scroll through the platform and see how each part fits into the way you work.</p>
        </div>

        <div className="showcase-scroll">
          {showcaseTabs.map((tab, i) => (
            <article className="showcase-item" key={tab.label}>
              <div className="showcase-content">
                <div className="showcase-info">
                  <span className="showcase-number">{String(i + 1).padStart(2, "0")} / {tab.label}</span>
                  <h2>{tab.heading}</h2>
                  <p className="showcase-description">{tab.description}</p>
                  <ul className="showcase-benefits">
                    {tab.benefits.map((benefit) => (
                      <li key={benefit.text}>
                        <span className="benefit-icon">{benefit.icon}</span>
                        <span>{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="showcase-frame">
                  <img
                    src={tab.desktopSrc}
                    alt={`${tab.label} screenshot`}
                    className="showcase-shot showcase-shot-desktop"
                  />

                  <div className="showcase-mobile-scroll-wrap">
                    <div
                      className="showcase-mobile-shots"
                      style={{ justifyContent: tab.mobileSrc.length > 1 ? "flex-start" : "center" }}
                      ref={(el) => {
                        mobileScrollRefs.current[i] = el;
                        if (el) el.scrollLeft = 0;
                      }}
                    >
                      {tab.mobileSrc.map((src, index) => (
                        <img
                          key={src}
                          src={src}
                          alt={`${tab.label} mobile screenshot ${index + 1}`}
                          className="showcase-shot showcase-shot-mobile"
                        />
                      ))}
                    </div>

                    {tab.mobileSrc.length > 1 && (
                      <button
                        className="showcase-scroll-btn"
                        aria-label="Scroll to see more screenshots"
                        onClick={() => {
                          const el = mobileScrollRefs.current[i];
                          if (el) el.scrollBy({ left: el.clientWidth * 0.8, behavior: "smooth" });
                        }}
                      >
                        <span>Swipe for more</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <p className="showcase-caption">{tab.caption}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── PRODUCT VIDEO ── */}
      <section className="product-video">
        <div className="product-video-intro">
          <span className="section-eyebrow">SEE IT IN ACTION</span>
          <h2>See how BiasharaPulse Works</h2>
          <p>
            Take a quick walkthrough of BiasharaPulse and see how you can
            manage sales, inventory, expenses and business performance
            from one place.
          </p>
        </div>

        <div className="product-video-wrapper">
          <div className="product-video-player">
            <video controls preload="metadata" poster="/videos/biasharapulse-preview.png">
              <source src="/videos/biasharapulse-demo.mp4" type="video/mp4" />
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
          <p>Test free for the first month. Upgrade seamlessly as your shop scales.</p>
        </div>

        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3>Starter</h3>
              <p>For new vendors testing the app without commitment.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">0</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ First 1 month free </li>
                <li>✓ 1 Branch</li>
                <li>✓ 1 User</li>
                <li>✓ Order Tracking</li>
                <li>✓ Full POS Page</li>
                <li>✓ Sales & Expense Logging</li>
                <li>✓ 30-Day History</li>
              </ul>
              <button className="pricing-btn secondary" onClick={() => selectPlan("starter")}>
                Select starter
              </button>
            </div>
          </div>

          <div className="pricing-card">
            <div className="pricing-card-header">
              <h3>Biashara Lite</h3>
              <p>For small online sellers with light, steady order volume.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">1299</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ <strong>Unlimited Orders</strong></li>
                <li>✓ 1 Branch</li>
                <li>✓ 1 User</li>
                <li>✓ Order Tracking</li>
                <li>✓ Full POS Page</li>
                <li>✓ Sales & Expense Logging</li>
                <li>✓ Unlimited History</li>
              </ul>
              <button className="pricing-btn secondary" onClick={() => selectPlan("lite")}>
                Select Lite
              </button>
            </div>
          </div>

          <div className="pricing-card featured">
            <div className="popular-badge">Most Popular</div>
            <div className="pricing-card-header">
              <h3>Biashara Growth</h3>
              <p>For active retail shops that need faster imports and stock entry log.</p>
              <div className="pricing-amount">
                <span className="currency">KES</span>
                <span className="price">2,499</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ <strong>Everything in lite</strong></li>
                <li>✓ Stock Movement Log</li>
                <li>✓ Full Product performance page</li>
                <li>✓ QR Code Product Scanning</li>
                <li>✓ Get detailed Monthly business reports</li>
              </ul>
              <button className="pricing-btn primary" onClick={() => selectPlan("growth")}>
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
                <span className="price">5,999</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ Everything in Growth</li>
                <li>✓ Upto 5 shop branches</li>
                <li>✓ Owner & Staff Accounts</li>
              </ul>
              <button className="pricing-btn secondary" onClick={() => selectPlan("pro")}>
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
                <span className="price">8,999</span>
                <span className="period">/ month</span>
              </div>
            </div>
            <div className="pricing-card-body">
              <ul className="pricing-features">
                <li>✓ Everything in Pro</li>
                <li>✓ Up to 8 Shop Branches</li>
              </ul>
              <button className="pricing-btn secondary" onClick={() => selectPlan("multi_branch")}>
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-it-works">
        <div className="how-intro">
          <span className="features-tag">How it works</span>
          <h2>A simpler way to stay on top of the business</h2>
          <p>Set it up once, keep your day moving, and let the numbers build themselves around your work.</p>
        </div>

        <div className="how-steps">
          <div className="how-step">
            <span className="how-step-number">01</span>
            <div>
              <h3>Start with your account</h3>
              <p>Create your account and get into your workspace without a long setup process.</p>
            </div>
          </div>
          <div className="how-step">
            <span className="how-step-number">02</span>
            <div>
              <h3>Bring in your products</h3>
              <p>Import your catalog from a spreadsheet or add products as you build your inventory.</p>
            </div>
          </div>
          <div className="how-step">
            <span className="how-step-number">03</span>
            <div>
              <h3>Run your daily operations</h3>
              <p>Sell, receive stock, record expenses, and keep customer orders moving from one place.</p>
            </div>
          </div>
          <div className="how-step">
            <span className="how-step-number">04</span>
            <div>
              <h3>Make decisions with clarity</h3>
              <p>Your dashboard turns those everyday activities into numbers you can actually use.</p>
            </div>
          </div>
        </div>

        <button className="how-cta" onClick={handleStartFree}>
          {currentUser ? "Go to Dashboard" : "Start Free Now"}
        </button>
      </section>

      <section id="values" className="values">
        <h2>Better tools for better business decisions</h2>
        <p className="values-subtitle">
          We believe every business deserves a clearer view of its performance,
          better control of its operations, and the tools to grow with confidence.
        </p>

        <div className="value-grid">
          <div className="value-stamp">
            <span className="stamp-mark">01 / Clarity</span>
            <h3>Know your numbers</h3>
            <p>
              Get a clearer picture of sales, expenses, profit, and business
              performance without piecing together scattered spreadsheets.
            </p>
          </div>

          <div className="value-stamp">
            <span className="stamp-mark">02 / Control</span>
            <h3>Stay ahead of stock</h3>
            <p>
              Track inventory movement, monitor low-stock products, and understand
              what is selling so you can make more informed restocking decisions.
            </p>
          </div>

          <div className="value-stamp">
            <span className="stamp-mark">03 / Accuracy</span>
            <h3>Keep better records</h3>
            <p>
              Bring sales, expenses, orders, and stock activity into one system
              to make everyday record-keeping more consistent and manageable.
            </p>
          </div>

          <div className="value-stamp">
            <span className="stamp-mark">04 / Insight</span>
            <h3>Turn data into direction</h3>
            <p>
              Go beyond recording transactions. Use product performance, margins,
              and sales trends to understand what is working and where to improve.
            </p>
          </div>

          <div className="value-stamp">
            <span className="stamp-mark">05 / Simplicity</span>
            <h3>Built for everyday work</h3>
            <p>
              Manage essential business operations through a practical,
              straightforward interface designed to fit into your daily workflow,
              not complicate it.
            </p>
          </div>

          <div className="value-stamp">
            <span className="stamp-mark">06 / Accessibility</span>
            <h3>Tools within reach</h3>
            <p>
              Start with a free plan and explore the core workflow before
              upgrading as your business needs more capacity and advanced features.
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
            <h5>Developer's portal</h5>
            <a href="https://raburu.co.ke" target="_blank" rel="noopener noreferrer">raburu.co.ke</a>
          </div>

          <div className="footer-col">
            <h5>Legal</h5>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 BiasharaPulse. Developed for Kenyan Businesses 🇰🇪.</span>
        </div>
      </footer>

      {/* Auth prompt — shown when a signed-out user taps a pricing / Start Free button */}
      {authPromptOpen && !currentUser && (
        <div
          className="landing-auth-overlay"
          onClick={() => setAuthPromptOpen(false)}
        >
          <div
            className="landing-auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="landing-auth-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            <h3>
              {pendingPlan
                ? `Almost there — sign in to activate ${PLAN_LABELS[pendingPlan] || pendingPlan}`
                : "Sign in to continue"}
            </h3>
            <p>
              {pendingPlan
                ? "Create an account or sign in, and we'll open your dashboard on the plan you picked."
                : "Create a free account or sign in to open your dashboard."}
            </p>

            <div className="landing-auth-actions">
              <Link
                to="/signup"
                className="landing-auth-btn solid"
                onClick={() => setAuthPromptOpen(false)}
              >
                Create New account
              </Link>
              <Link
                to="/login"
                className="landing-auth-btn ghost"
                onClick={() => setAuthPromptOpen(false)}
              >
                Sign in
              </Link>
            </div>

            <button
              type="button"
              className="landing-auth-cancel"
              onClick={() => setAuthPromptOpen(false)}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Plan notice — shown to signed-in users (active paid plan, or a failed switch) */}
      {planNotice && (
        <div
          className="landing-auth-overlay"
          onClick={() => setPlanNotice(null)}
        >
          <div
            className="landing-auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="landing-auth-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h3>{planNotice.title}</h3>
            <p>{planNotice.body}</p>

            <div className="landing-auth-actions">
              <Link
                to="/dashboard"
                className="landing-auth-btn solid"
                onClick={() => setPlanNotice(null)}
              >
                Go to dashboard
              </Link>
            </div>

            <button
              type="button"
              className="landing-auth-cancel"
              onClick={() => setPlanNotice(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;