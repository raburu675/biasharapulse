import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import './styles/dashboard.css'

/*Wire real sales/expenses data into salesData from your dashboard_summary endpoint once you're 
ready — right now it's static placeholder data so you can see the layout. */
const salesData = [
  { day: 'Mon', sales: 12400, expenses: 6200 },
  { day: 'Tue', sales: 15800, expenses: 7100 },
  { day: 'Wed', sales: 11200, expenses: 5800 },
  { day: 'Thu', sales: 18600, expenses: 8400 },
  { day: 'Fri', sales: 21300, expenses: 9200 },
  { day: 'Sat', sales: 26100, expenses: 10500 },
  { day: 'Sun', sales: 19700, expenses: 8900 },
]

function Dashboard() {
  const [active] = useState('dashboard')

  const totalSales = salesData.reduce((sum, d) => sum + d.sales, 0)
  const totalExpenses = salesData.reduce((sum, d) => sum + d.expenses, 0)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">BiasharaPulse</div>
        <nav>
          <a className={active === 'dashboard' ? 'active' : ''} href="/dashboard">Dashboard</a>
          <a className={active === 'stock' ? 'active' : ''} href="/stock-movement">Stock Movement</a>          
        </nav>
      </aside>

      <main className="main">
        <header className="main-header">
          <h1>Dashboard</h1>
        </header>

        <section className="stat-row">
          <div className="stat">
            <span className="stat-label">Sales this week</span>
            <span className="stat-value">KES {totalSales.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Expenses this week</span>
            <span className="stat-value">KES {totalExpenses.toLocaleString()}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Net</span>
            <span className="stat-value accent">KES {(totalSales - totalExpenses).toLocaleString()}</span>
          </div>
        </section>

        <section className="chart-section">
          <h2>Sales vs Expenses</h2>
          <LineChart width={640} height={320} data={salesData}>
            <CartesianGrid stroke="#eeeeee" vertical={false} />
            <XAxis dataKey="day" stroke="#999999" tickLine={false} axisLine={{ stroke: '#eeeeee' }} />
            <YAxis stroke="#999999" tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ border: '1px solid #eeeeee', borderRadius: 0 }} />
            <Line type="monotone" dataKey="sales" stroke="#C41E3A" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="expenses" stroke="#999999" strokeWidth={2} dot={false} />
          </LineChart>
        </section>
      </main>
    </div>
  )
}

export default Dashboard