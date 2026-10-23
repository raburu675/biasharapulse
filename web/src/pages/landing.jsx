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
  six_months: "6-Month Plan",
  annual: "Annual Plan",
};

// Nav links: each name describes the section it scrolls to
const NAV_LINKS = [
  { id: "features", label: "Features", hint: "What you get" },
  { id: "showcase", label: "Product Tour", hint: "Each page, in action" },
  { id: "demo", label: "Demo", hint: "Watch the walkthrough" },
  { id: "pricing", label: "Pricing", hint: "Plans for every stage" },
  { id: "how-it-works", label: "How It Works", hint: "Up and running in four steps" },
  { id: "values", label: "Why Us", hint: "How we beat SME bottlenecks" },
  { id: "reviews", label: "Reviews", hint: "What shop owners say" },
  { id: "faq", label: "FAQ", hint: "Quick answers" },
];

const FOOTER_LINK_IDS = ["features", "showcase", "pricing", "values", "faq"];

// Features: `icon` is a list of SVG path strings, `plan` is the lowest plan that includes it
const FEATURES = [
  {
    icon: ["M3 4h2l2.4 11h10.2a2 2 0 0 0 2-1.5L21 8H6", "M10 20h.01", "M17 20h.01"],
    title: "Point of Sale",
    text: "Ring up sales in seconds at the counter. Every sale updates your stock and your books automatically.",
    points: ["Cash, M-Pesa, and other payments", "Stock deducts on every sale", "Simple enough for new staff"],
    plan: "Every plan",
  },
  {
    icon: ["M21 8 12 3 3 8v8l9 5 9-5V8Z", "M3 8l9 5 9-5", "M12 13v8"],
    title: "Stock Movement",
    text: "Know what came in, what went out, and what is about to run out, before it costs you a sale.",
    points: ["Restocks, write-offs, adjustments", "Low-stock alerts", "QR code product scanning"],
    plan: "Growth and up",
  },
  {
    icon: ["M9 4h6v3H9z", "M7 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1", "M8 12h8", "M8 16h5"],
    title: "Order Tracking",
    text: "Keep every customer order moving from the moment it is placed until it is delivered.",
    points: ["Pending, active, and completed", "Status updates on each order", "No more orders lost in chats"],
    plan: "Every plan",
  },
  {
    icon: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
    title: "Expenses & Profit",
    text: "Log what you spend and see what you actually keep. Revenue, expenses, and margin update live.",
    points: ["Sales and expense logging", "Live profit and margin", "Dashboard of your shop's health"],
    plan: "Every plan",
  },
  {
    icon: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"],
    title: "Product Performance",
    text: "See which products earn their shelf space and which ones tie up your cash.",
    points: ["Best sellers and slow movers", "Cost, margin, and sell-through", "Detailed monthly business reports"],
    plan: "Growth and up",
  },
  {
    icon: ["M3 9l1.5-5h15L21 9", "M3 9v11h18V9", "M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0", "M10 20v-6h4v6"],
    title: "Branches & Team",
    text: "Grow past one counter. Add branches and give your team their own accounts.",
    points: ["Up to 8 shop branches", "Owner and staff accounts", "One view across locations"],
    plan: "Pro and up",
  },
];

// Why Us: the bottlenecks that slow SMEs down, and how BiasharaPulse removes each one
const BOTTLENECKS = [
  {
    icon: ["M4 4h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V4Z", "M8 9h6", "M8 13h4"],
    title: "Sales live in a notebook",
    problem: "Sales are scribbled down during the day and added up at night, with mistakes and missing entries.",
    fix: "Ring up each sale at the counter. The payment method, stock, and totals update instantly.",
  },
  {
    icon: ["M21 8 12 3 3 8v8l9 5 9-5V8Z", "M3 8l9 5 9-5", "M12 13v8"],
    title: "Surprise stock-outs",
    problem: "You find out a product is finished when a customer asks for it.",
    fix: "Low-stock alerts and a stock movement log show what is running out before it costs you a sale.",
  },
  {
    icon: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
    title: "Profit you can't see",
    problem: "Revenue looks healthy, but you can't tell which products actually make money.",
    fix: "See cost, margin, and sell-through for every product, so you stock and price with confidence.",
  },
  {
    icon: ["M9 4h6v3H9z", "M7 5H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1", "M8 12h8", "M8 16h5"],
    title: "Orders lost in chats",
    problem: "Customer orders sit in chat messages and notebooks until someone forgets them.",
    fix: "Every order is tracked in one place, from pending to delivered.",
  },
  {
    icon: ["M3 9l1.5-5h15L21 9", "M3 9v11h18V9", "M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0", "M10 20v-6h4v6"],
    title: "Branches you can't see at once",
    problem: "Each location keeps its own records, so you only get the full picture weeks later.",
    fix: "One view across up to 8 branches, with separate owner and staff accounts.",
  },
  {
    icon: ["M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z", "M7.5 7.5h.01"],
    title: "Tools that cost too much or fit badly",
    problem: "Imported tools are often priced for other markets, built around other payment habits, and heavy on data.",
    fix: "Priced in KES, built around M-Pesa, light on mobile data, and free to start with no lock-in.",
  },
];

// Comparison: "yes" and "no" render as icons, anything else renders as text
const COMPARE_COLS = ["BiasharaPulse", "Notebook & spreadsheets", "Generic POS / ERP"];
const COMPARE_ROWS = [
  { label: "Built around M-Pesa and KES", values: ["yes", "no", "Varies"] },
  { label: "Stock updates on every sale", values: ["yes", "Manual", "Usually"] },
  { label: "Profit and margin per product", values: ["yes", "Manual", "Varies"] },
  { label: "Customer order tracking", values: ["yes", "no", "Varies"] },
  { label: "One view across branches", values: ["yes", "no", "Varies"] },
  { label: "Simple enough for day-one staff", values: ["yes", "yes", "Can be complex"] },
];

const VALUE_PROMISES = ["Free plan to start, no card", "Export your data anytime", "Built and supported in Kenya"];

// SAMPLE CONTENT: replace these with real customer reviews (with permission) before publishing
const REVIEWS = [
  {
    featured: true,
    tag: "Clear margins",
    quote: "I used to guess which products were worth restocking. Now I can see the margin on each one, and I order with confidence.",
    name: "Hardware shop owner",
    meta: "Nairobi",
  },
  {
    tag: "No more stock-outs",
    quote: "The low-stock alerts mean I find out before a customer does. We stopped turning people away at the counter.",
    name: "Mini-mart owner",
    meta: "Nakuru",
  },
  {
    tag: "Orders under control",
    quote: "Orders used to live in chat messages. Now every order has a status and nothing gets forgotten.",
    name: "Online clothing seller",
    meta: "Mombasa",
  },
];

const FAQS = [
  {
    q: "Is BiasharaPulse really free to start?",
    a: "Yes. The Starter plan costs KES 0 and includes the full POS page, order tracking, and sales and expense logging for one branch and one user. You don't need a card to start, and you can upgrade when your shop is ready.",
  },
  {
    q: "Does it work with M-Pesa?",
    a: "Yes. Every sale at the POS records how the customer paid, whether that is cash, M-Pesa, or another method, so your daily totals match what actually came in.",
  },
  {
    q: "Do I need special hardware?",
    a: "No. BiasharaPulse is a web app built to run smoothly on everyday phones and mobile data, so you can start with the device you already use in your shop.",
  },
  {
    q: "How does it keep my stock accurate?",
    a: "Stock deducts automatically on every sale. On Growth and above, the Stock Movement log records restocks, write-offs, and adjustments, and low-stock alerts warn you before a product runs out.",
  },
  {
    q: "Can I run more than one branch?",
    a: "Yes. Biashara Pro supports up to 5 branches and Pro Multi-Branch supports up to 8, both with owner and staff accounts, so you can see every location in one place.",
  },
  {
    q: "Can I change my plan later?",
    a: "You can start free and move up whenever you like. If you already have an active paid plan, you can choose a new one once it expires. There is no lock-in and no surprise renewal.",
  },
  {
    q: "Who owns my data, and can I take it with me?",
    a: "You do. Your sales, products, and reports are yours, and you can export them whenever you like.",
  },
  {
    q: "What do the 6-month and annual plans save?",
    a: "Paying for six months upfront saves 7% on any paid plan. Paying for a full year saves 17%, which works out to two months free.",
  },
];

// Comparison table cell
const CompareCell = ({ v }) => {
  if (v === "yes") {
    return (
      <>
        <span className="cmp-yes" aria-hidden="true">✓</span>
        <span className="sr-only">Yes</span>
      </>
    );
  }
  if (v === "no") {
    return (
      <>
        <span className="cmp-no" aria-hidden="true">—</span>
        <span className="sr-only">No</span>
      </>
    );
  }
  return <span className="cmp-text">{v}</span>;
};

// Renders a list of SVG path strings as one stroked icon
const Icon = ({ paths }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
);

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
  const [activeSection, setActiveSection] = useState(null);
  const mobileScrollRefs = useRef([]);
  const showcaseRef = useRef(null);
  const tabsRef = useRef(null);
  const [activeTour, setActiveTour] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const accountRef = useRef(null);

  // Signed-in user shown in the account menu (null = signed out)
  const [currentUser, setCurrentUser] = useState(readUser);

  // Where the user was heading when we intercepted them
  const [pendingPlan, setPendingPlan] = useState(null);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  // Notice shown to signed-in users (active paid plan, or a failed switch)
  const [planNotice, setPlanNotice] = useState(null);

  const API_BASE =
    import.meta.env.VITE_API_BASE ||
    (import.meta.env.DEV
      ? "http://127.0.0.1:8000"
      : "https://biasharapulse.onrender.com");

  const isSignedIn = () => !!localStorage.getItem("token");

  const closeMobileNav = () => setMobileNavOpen(false);

  // Measure the live nav height so anchors always clear it exactly.
  // Falls back to 48 when the nav hasn't rendered yet.
  const getScrollTop = (el) => {
    const nav = document.querySelector(".landing-nav");
    const navH = nav?.offsetHeight || 48;
    return el.getBoundingClientRect().top + window.pageYOffset - navH - 6;
  };

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
    setMobileNavOpen(false);
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

  const handleStartFree = () => {
    if (isSignedIn()) {
      navigate("/dashboard");
    } else {
      setPendingPlan(null);
      setAuthPromptOpen(true);
    }
  };

  // Smooth-scroll to a product tour chapter, clearing the nav and the sticky tab bar
  const goToTour = (i) => {
    const el = document.getElementById(`tour-${i}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 130;
    window.scrollTo({ top, behavior: "smooth" });
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
    {
      label: "Product Performance",
      desktopSrc: "/screenshots/product-performance-desktop.png",
      mobileSrc: ["/screenshots/product-performance-mobile.png"],
      heading: "See which products actually make you money",
      description:
        "Know your best sellers, your slow movers, and the products with the strongest margins — so you stock smarter and price with confidence.",
      benefits: [
        { icon: "★", text: "Rank products by revenue, profit, and units sold" },
        { icon: "↗", text: "Spot high-margin products worth pushing harder" },
        { icon: "◔", text: "Identify slow movers tying up your cash" },
      ],
      caption: "See cost, margin, and sell-through for every product you stock.",
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

    const go = () => {
      const el = document.getElementById(id);
      if (!el) return;
      window.scrollTo({ top: getScrollTop(el), behavior: "smooth" });
    };
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
      const el = document.getElementById(id);
      if (el) {
        window.scrollTo({ top: getScrollTop(el), behavior: "smooth" });
      }
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

  // Mobile sidebar: lock page scroll while open, close on Escape
  useEffect(() => {
    if (!mobileNavOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (e) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };

    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [mobileNavOpen]);

  // Close the sidebar if the window grows past the sidebar breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) setMobileNavOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Highlight the nav link of the section currently in view
  useEffect(() => {
    if (stage !== "landing" || !("IntersectionObserver" in window)) return;

    const targets = ["top", ...NAV_LINKS.map((l) => l.id)]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id === "top" ? null : entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [stage]);

  // Fade product tour items in as they scroll into view
  useEffect(() => {
    if (stage !== "landing") return;
    const items = showcaseRef.current?.querySelectorAll(".showcase-item");
    if (!items?.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [stage]);

  // Track which product tour chapter is in view
  useEffect(() => {
    if (stage !== "landing" || !("IntersectionObserver" in window)) return;
    const items = showcaseRef.current?.querySelectorAll(".showcase-item");
    if (!items?.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveTour(Number(entry.target.dataset.index));
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [stage]);

  // Keep the active tab centred in the tab bar (matters on phones)
  useEffect(() => {
    const bar = tabsRef.current;
    const btn = bar?.children[activeTour];
    if (!bar || !btn) return;
    bar.scrollTo({ left: btn.offsetLeft - bar.clientWidth / 2 + btn.offsetWidth / 2, behavior: "smooth" });
  }, [activeTour]);

  if (stage === "splash") {
    return (
      <div className={`splash ${fadeOut ? "splash-fade-out" : ""}`}>
        <div className="splash-grid" />

        <div className="splash-ecg-wrap" aria-hidden="true">
          <span className="splash-ring" />
          <span className="splash-ring splash-ring-2" />
          <svg className="splash-ecg" viewBox="0 0 1200 160" preserveAspectRatio="none">
            <defs>
              <linearGradient id="splashEcgGradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1200" y2="0">
                <stop offset="0%" stopColor="#7A0C29" stopOpacity="0" />
                <stop offset="35%" stopColor="#C4173F" />
                <stop offset="52%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#12A056" />
                <stop offset="100%" stopColor="#12A056" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              className="splash-ecg-line"
              pathLength="1"
              d="M0,80 L470,80 L510,80 L540,40 L570,120 L600,8 L630,152 L660,80 L700,80 L1200,80"
            />
          </svg>
        </div>

        <h1 className="splash-text">
          <span className="splash-biashara">Biashara</span>
          <span className="splash-pulse">Pulse</span>
        </h1>
        <p className="splash-tagline">the heart of your business</p>

        <div className="splash-bar"><span /></div>
      </div>
    );
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-container">
          <button
            className="mobile-nav-toggle"
            aria-label="Open navigation menu"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
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
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={activeSection === link.id ? "active" : ""}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="nav-dropdown-wrapper" ref={accountRef}>
            <button
              className="btn-account-trigger"
              aria-label="Account menu"
              aria-expanded={accountOpen}
              onClick={() => {
                setCurrentUser(readUser());
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
                  <Link to="/account" className="account-menu-btn ghost" onClick={() => setAccountOpen(false)}>
                    My account
                  </Link>
                  <button type="button" className="account-menu-btn ghost" onClick={handleLogout}>
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
      </nav>

      <div
        className={`mobile-overlay ${mobileNavOpen ? "open" : ""}`}
        onClick={closeMobileNav}
      />
      <aside
        className={`mobile-sidebar ${mobileNavOpen ? "open" : ""}`}
        aria-hidden={!mobileNavOpen}
        aria-label="Site navigation"
      >
        <div className="sidebar-head">
          <div className="sidebar-brand">
            <span className="sidebar-brand-biashara">Biashara</span>
            <span className="sidebar-brand-pulse">Pulse</span>
          </div>
          <button className="sidebar-close" aria-label="Close menu" onClick={closeMobileNav}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <p className="sidebar-label">Explore</p>
        <div className="sidebar-links">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`sidebar-link ${activeSection === link.id ? "active" : ""}`}
              style={{ "--i": i }}
              onClick={(e) => {
                e.preventDefault();
                closeMobileNav();
                // Wait for the body overflow to reset before measuring
                setTimeout(() => {
                  const el = document.getElementById(link.id);
                  if (el) {
                    window.scrollTo({ top: getScrollTop(el), behavior: "smooth" });
                  }
                }, 60);
              }}
            >
              <span className="sidebar-link-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="sidebar-link-text">
                <strong>{link.label}</strong>
                <small>{link.hint}</small>
              </span>
              <svg className="sidebar-link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          ))}
        </div>

        <div className="sidebar-foot">
          {currentUser ? (
            <>
              <div className="sidebar-user">
                <span>Logged in as</span>
                <strong>{currentUser}</strong>
              </div>
              <Link to="/dashboard" className="account-menu-btn solid" onClick={closeMobileNav}>
                Go to dashboard
              </Link>
              <button type="button" className="account-menu-btn ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="account-menu-btn solid" onClick={closeMobileNav}>
                Create New account
              </Link>
              <Link to="/login" className="account-menu-btn ghost" onClick={closeMobileNav}>
                Sign in
              </Link>
            </>
          )}
          <p className="sidebar-note">Developed for Kenyan SMEs 🇰🇪</p>
        </div>
      </aside>

      <div className="landing-top" id="top">
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
        <h2>Run your whole shop from one screen</h2>
        <p>Sales, stock, orders, expenses, and performance are recorded once and connected everywhere.</p>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <div className="feature-top">
              <div className="feature-icon"><Icon paths={f.icon} /></div>
              <span className="feature-plan">{f.plan}</span>
            </div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
            <ul className="feature-points">
              {f.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section id="showcase" className="showcase">
        <div className="showcase-intro">
          <span className="features-tag">Product tour</span>
          <h2>Built for how you actually run your shop</h2>
          <p>Scroll through the platform and see how each part fits into the way you work.</p>
        </div>

        <div className="tour-tabs-wrap">
          <div className="tour-tabs" ref={tabsRef} role="tablist" aria-label="Product tour chapters">
            {showcaseTabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                role="tab"
                aria-selected={activeTour === i}
                className={`tour-tab ${activeTour === i ? "active" : ""}`}
                onClick={() => goToTour(i)}
              >
                <span className="tour-tab-num">{String(i + 1).padStart(2, "0")}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="showcase-scroll" ref={showcaseRef}>
          {showcaseTabs.map((tab, i) => (
            <article className="showcase-item reveal" key={tab.label} id={`tour-${i}`} data-index={i}>
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
                  <p className="showcase-caption">{tab.caption}</p>
                </div>

                <div className="showcase-frame">
                  <div className="browser">
                    <div className="browser-bar">
                      <span className="browser-dots"><i /><i /><i /></span>
                      <span className="browser-url">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                        BiasharaPulse · {tab.label}
                      </span>
                      <span className="browser-live"><i /> Live</span>
                    </div>
                    <div className="browser-screen">
                      <img
                        src={tab.desktopSrc}
                        alt={`${tab.label} screenshot`}
                        className="showcase-shot showcase-shot-desktop"
                      />
                    </div>
                  </div>

                  <div className={`showcase-mobile-scroll-wrap ${tab.mobileSrc.length > 1 ? "has-more" : ""}`}>
                    <div
                      className="showcase-mobile-shots"
                      style={{ justifyContent: tab.mobileSrc.length > 1 ? "flex-start" : "center" }}
                      ref={(el) => {
                        mobileScrollRefs.current[i] = el;
                        if (el) el.scrollLeft = 0;
                      }}
                    >
                      {tab.mobileSrc.map((src, index) => (
                        <div className="phone" key={src}>
                          <img
                            src={src}
                            alt={`${tab.label} mobile screenshot ${index + 1}`}
                            className="showcase-shot showcase-shot-mobile"
                          />
                        </div>
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
            </article>
          ))}
        </div>
      </section>

      {/* ── PRODUCT VIDEO ── */}
      <section id="demo" className="product-video">
        <div className="product-video-intro">
          <span className="section-eyebrow">WATCH THE DEMO</span>
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

      {/* ── DARK BAND: Pricing ── */}
      <div className="dark-band">
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

          <div className="pricing-discounts">
            <div className="pricing-discounts-header">
              <span className="pricing-tag">Save more</span>
              <h3>Prepay and keep more of your money</h3>
            </div>

            <div className="pricing-discounts-grid">
              <div className="pricing-card discount-card">
                <div className="discount-badge">Save 7%</div>
                <div className="pricing-card-header">
                  <h3>6-Month Plan</h3>
                  <p>Pay for six months upfront and get 7% off any paid plan.</p>
                </div>
                <div className="pricing-card-body">
                  <ul className="pricing-features">
                    <li>✓ 7% discount on any paid tier</li>
                    <li>✓ One payment for six months</li>
                    <li>✓ All plan features included</li>
                    <li>✓ Priority support</li>
                  </ul>
                  <button className="pricing-btn primary" onClick={() => selectPlan("six_months")}>
                    Get 6 months
                  </button>
                </div>
              </div>

              <div className="pricing-card discount-card featured-discount">
                <div className="discount-badge">Best value</div>
                <div className="pricing-card-header">
                  <h3>Annual Plan</h3>
                  <p>Pay for a full year and get 17% off — that's 2 months free.</p>
                </div>
                <div className="pricing-card-body">
                  <ul className="pricing-features">
                    <li>✓ 17% discount on any paid tier</li>
                    <li>✓ 2 months free</li>
                    <li>✓ All plan features included</li>
                    <li>✓ Priority support</li>
                    <li>✓ Lock in today's price for a year</li>
                  </ul>
                  <button className="pricing-btn primary" onClick={() => selectPlan("annual")}>
                    Get annual
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="how-it-works">
        <div className="how-intro">
          <span className="features-tag">How it works</span>
          <h2>From counter sale to clear decision — in one loop</h2>
          <p>
            Every sale, restock, and expense you record feeds the same system.
            BiasharaPulse turns that daily activity into the numbers you need to
            price better, stock smarter, and grow with confidence.
          </p>
        </div>

        <div className="how-steps">
          <div className="how-step">
            <span className="how-step-number">01</span>
            <div>
              <h3>Record the sale</h3>
              <p>
                Ring up a sale at the counter in seconds. Stock deducts itself,
                the payment method is logged, and the transaction is accounted
                for — no notebook, no end-of-day reconciliation.
              </p>
              <span className="how-step-outcome">Every sale captured, automatically</span>
            </div>
          </div>

          <div className="how-step">
            <span className="how-step-number">02</span>
            <div>
              <h3>Keep stock honest</h3>
              <p>
                Restocks, write-offs, and adjustments are recorded as they
                happen. Low-stock alerts surface before a product runs out, so
                you restock on your terms — not in a panic.
              </p>
              <span className="how-step-outcome">Inventory you can trust</span>
            </div>
          </div>

          <div className="how-step">
            <span className="how-step-number">03</span>
            <div>
              <h3>See the real numbers</h3>
              <p>
                Revenue, expenses, profit, and margin update live. Product
                performance shows what actually sells and what ties up your
                cash — by product, by branch, by period.
              </p>
              <span className="how-step-outcome">Insight, not guesswork</span>
            </div>
          </div>

          <div className="how-step">
            <span className="how-step-number">04</span>
            <div>
              <h3>Decide with confidence</h3>
              <p>
                Use margins, sell-through, and trends to set prices, choose what
                to stock, and spot problems early. The dashboard is built for
                decisions, not just record-keeping.
              </p>
              <span className="how-step-outcome">Better calls, backed by data</span>
            </div>
          </div>
        </div>

        <div className="how-proof">
          <div className="how-proof-item">
            <strong>Live</strong>
            <span>Sales &amp; expense tracking</span>
          </div>
          <div className="how-proof-item">
            <strong>Automatic</strong>
            <span>Stock deduction on every sale</span>
          </div>
          <div className="how-proof-item">
            <strong>Per product</strong>
            <span>Margin &amp; sell-through insight</span>
          </div>
          <div className="how-proof-item">
            <strong>Multi-branch</strong>
            <span>One view across locations</span>
          </div>
        </div>

        <button className="how-cta" onClick={handleStartFree}>
          {currentUser ? "Go to Dashboard" : "Start Free Now"}
        </button>
      </section>

      {/* ── DARK BAND: Why us ── */}
      <div className="dark-band">
        <section id="values" className="values">
          <div className="values-head">
            <span className="features-tag">Why BiasharaPulse</span>
            <h2>Shops don't lose money on big mistakes. They lose it in the gaps.</h2>
            <p className="values-subtitle">
              Handwritten sales, surprise stock-outs, profit you can't see. These are
              the bottlenecks that hold Kenyan SMEs back. BiasharaPulse closes each
              one, in a single tool built here.
            </p>
          </div>

          <div className="gap-grid">
            {BOTTLENECKS.map((b, i) => (
              <article className="gap-card" key={b.title}>
                <div className="gap-top">
                  <div className="gap-icon"><Icon paths={b.icon} /></div>
                  <span className="gap-num">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3>{b.title}</h3>
                <div className="gap-block gap-problem">
                  <span className="gap-label">The bottleneck</span>
                  <p>{b.problem}</p>
                </div>
                <div className="gap-block gap-fix">
                  <span className="gap-label">With BiasharaPulse</span>
                  <p>{b.fix}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="compare">
            <div className="compare-head">
              <h3>How we compare</h3>
              <p>
                Notebooks are simple but manual. General-purpose POS and ERP tools
                are powerful but rarely built for how Kenyan shops sell and get paid.
              </p>
            </div>

            <div className="compare-scroll">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col"><span className="sr-only">Feature</span></th>
                    {COMPARE_COLS.map((col, i) => (
                      <th scope="col" key={col} className={i === 0 ? "cmp-us" : ""}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {row.values.map((v, i) => (
                        <td key={i} className={i === 0 ? "cmp-us" : ""}><CompareCell v={v} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="compare-note">
              Compared with typical notebooks and spreadsheets, and with general-purpose
              POS and ERP tools. Features vary by product.
            </p>
          </div>

          <div className="values-cta-panel">
            <div>
              <h3>Close the gaps in your shop this week</h3>
              <ul className="values-promises">
                {VALUE_PROMISES.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <button className="values-cta" onClick={handleStartFree}>
              {currentUser ? "Go to Dashboard" : "Start Free Now"}
            </button>
          </div>
        </section>
      </div>

      {/* ── REVIEWS ── */}
      <section id="reviews" className="reviews">
        <div className="reviews-intro">
          <span className="features-tag">Reviews</span>
          <h2>Shops that stopped guessing</h2>
          <p>What shop owners notice first when their sales, stock, and profit finally sit in one place.</p>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((r) => (
            <figure className="review-card" key={r.name}>
              <div>
                <span className="review-tag">{r.tag}</span>
                <blockquote className="review-quote">{r.quote}</blockquote>
              </div>
              <figcaption className="review-author">
                <span className="review-avatar">{r.name.charAt(0)}</span>
                <span>
                  <strong>{r.name}</strong>
                  <span>{r.meta}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="faq">
        <div className="faq-layout">
          <div className="faq-aside">
            <span className="features-tag">FAQ</span>
            <h2>Questions shop owners ask first</h2>
            <p>Straight answers about pricing, payments, stock, and your data.</p>

            <div className="faq-help">
              <strong>Still deciding?</strong>
              <span>Start on the free plan and try it with your own products.</span>
              <button type="button" className="faq-cta" onClick={handleStartFree}>
                {currentUser ? "Go to Dashboard" : "Start Free Now"}
              </button>
            </div>
          </div>

          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={f.q}>
                <button
                  type="button"
                  className="faq-q"
                  id={`faq-q-${i}`}
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{f.q}</span>
                  <span className="faq-icon" aria-hidden="true" />
                </button>
                <div className="faq-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
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
            {NAV_LINKS.filter((l) => FOOTER_LINK_IDS.includes(l.id)).map((link) => (
              <a key={link.id} href={`#${link.id}`}>{link.label}</a>
            ))}
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

      {/* Auth prompt */}
      {authPromptOpen && !currentUser && (
        <div className="landing-auth-overlay" onClick={() => setAuthPromptOpen(false)}>
          <div className="landing-auth-modal" onClick={(e) => e.stopPropagation()}>
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
              <Link to="/signup" className="landing-auth-btn solid" onClick={() => setAuthPromptOpen(false)}>
                Create New account
              </Link>
              <Link to="/login" className="landing-auth-btn ghost" onClick={() => setAuthPromptOpen(false)}>
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

      {/* Plan notice */}
      {planNotice && (
        <div className="landing-auth-overlay" onClick={() => setPlanNotice(null)}>
          <div className="landing-auth-modal" onClick={(e) => e.stopPropagation()}>
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
              <Link to="/dashboard" className="landing-auth-btn solid" onClick={() => setPlanNotice(null)}>
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