import { Link } from 'react-router-dom'
import './styles/landing.css'

function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="brand">BiasharaPulse</div>
        <div className="nav-links">
          <a href="#pricing">Pricing</a>
          <a href="#values">Values</a>
          <a href="#developer">Developer</a>
          <Link to="/login" className="nav-login">Log in</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Run your business, not your spreadsheets</h1>
        <p>
          BiasharaPulse gives Kenyan SMEs a simple way to track sales, expenses, and
          stock — so you always know where your business stands, without hiring an accountant.
        </p>
        <Link to="/dashboard" className="cta-primary">Start Free</Link>
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
          <h3>Built for SMEs</h3>
          <p>No bloated features, no jargon — just what a small business actually needs.</p>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <h2>Simple pricing</h2>
        <p className="pricing-sub">Start free. Upgrade when your business is ready to grow.</p>

        <div className="pricing-cards">
          <div className="price-card">
            <h3>Free</h3>
            <div className="price">KES 0<span>/month</span></div>
            <ul>
              <li>Dashboard overview</li>
              <li>Stock movement tracking</li>
              <li>Last 30 days history</li>
              <li>1 user</li>
              <li>Up to 50 orders/month</li>
            </ul>
            <Link to="/signup" className="price-cta secondary">Get started</Link>
          </div>

          <div className="price-card featured">
            <div className="badge">Most popular</div>
            <h3>Paid</h3>
            <div className="price">KES 599<span>/month</span></div>
            <ul>
              <li>Everything in Free</li>
              <li>Full POS (mobile app)</li>
              <li>Unlimited history & exports</li>
              <li>Multi-user access</li>
              <li>AI-powered insights</li>
              <li>Suppliers, Orders & Receipts</li>
              <li>Upto 200 orders a month</li>
            </ul>
            <Link to="/signup" className="price-cta primary">Upgrade</Link>
          </div>

          <div className="price-card featured">            
            <h3>Paid</h3>
            <div className="price">KES 999<span>/month</span></div>
            <ul>              
              <li>Full POS (mobile app)</li>
              <li>Unlimited history & exports</li>
              <li>Multi-user access</li>
              <li>AI-powered insights</li>
              <li>Suppliers, Orders & Receipts</li>
              <li>Upto 500 orders a month</li>
            </ul>
            <Link to="/signup" className="price-cta primary">Upgrade</Link>
        </div>  
        </div>              
      </section>

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

      <section id="developer" className="developer">
        <h2>Developer Portal</h2>
        <p>
          BiasharaPulse is built and maintained by a single developer — Don, a full-stack
          developer based in Nairobi. This page will grow into a portal with API docs,
          release notes, and integration guides as the platform opens up to partners.
        </p>
      </section>

      <footer className="landing-footer">
        <div>© 2026 BiasharaPulse. Built for Kenyan SMEs.</div>
      </footer>
    </div>
  )
}

export default Landing