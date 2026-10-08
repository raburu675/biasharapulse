import Sidebar from './sidebar'
import usePlan from '../hooks/usePlan'

const styles = `
.upg-shell {
  display: flex;
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', sans-serif;
}

.upg-main {
  flex: 1;
  padding: 48px 32px;
  max-width: 880px;
  margin: 0 auto;
}

.upg-main h1 {
  font-size: 26px;
  font-weight: 800;
  color: #0b0b0d;
  margin: 0 0 6px;
}

.upg-sub {
  font-size: 14px;
  color: #6b6b73;
  margin: 0 0 32px;
}

.upg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.upg-card {
  border: 1px solid #e5e5ea;
  border-radius: 12px;
  padding: 24px;
}

.upg-card.paid {
  border-color: #C41E3A;
}

.upg-card h2 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #0b0b0d;
}

.upg-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #C41E3A;
  margin-bottom: 14px;
}

.upg-card ul {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
}

.upg-card li {
  font-size: 13px;
  color: #3a3a40;
  padding: 7px 0;
  border-bottom: 1px solid #f0f0f3;
}

.upg-btn {
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: #C41E3A;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  cursor: not-allowed;
  opacity: 0.55;
}

.upg-current {
  font-size: 12px;
  font-weight: 600;
  color: #6b6b73;
  text-align: center;
}
`

function Upgrade() {
  const { plan } = usePlan()
  const onPaid = plan?.plan === 'paid'

  return (
    <div className="upg-shell">
      <style>{styles}</style>

      <Sidebar current="upgrade" />

      <main className="upg-main">
        <h1>Upgrade your plan</h1>
        <p className="upg-sub">Unlock the full BiasharaPulse toolkit.</p>

        <div className="upg-grid">

          <div className="upg-card">
            <h2>Free</h2>
            <span className="upg-tag">{plan && !onPaid ? 'Current plan' : ' '}</span>
            <ul>
              <li>Dashboard</li>
              <li>Stock movement</li>
              <li>Last 30 days of history</li>
              <li>1 user</li>
              <li>Monthly sales limit</li>
            </ul>
          </div>

          <div className="upg-card paid">
            <h2>Paid</h2>
            <span className="upg-tag">{onPaid ? 'Current plan' : 'Recommended'}</span>
            <ul>
              <li>Everything in Free</li>
              <li>POS</li>
              <li>Unlimited history</li>
              <li>Multiple users</li>
              <li>AI insights</li>
              <li>Suppliers, Orders and Receipts</li>
            </ul>
            {onPaid ? (
              <div className="upg-current">You're on the Paid plan</div>
            ) : (
              // Wire this to the M-Pesa STK push once that backend exists
              <button className="upg-btn" disabled>
                Pay with M-Pesa (coming soon)
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default Upgrade