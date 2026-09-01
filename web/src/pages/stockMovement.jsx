import { useState } from 'react'
import './styles/stockMovement.css'

const initialMovements = [
  { id: 1, product: 'New Era 59FIFTY', type: 'in', quantity: 20, note: 'Restock', date: '2026-08-28' },
  { id: 2, product: 'New Era 9FORTY', type: 'out', quantity: 5, note: 'Sold', date: '2026-08-29' },
]

function StockMovement() {
  const [movements, setMovements] = useState(initialMovements)
  const [form, setForm] = useState({ product: '', type: 'in', quantity: '', note: '' })
  const [editingId, setEditingId] = useState(null)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId) {
      setMovements(movements.map((m) => (m.id === editingId ? { ...m, ...form, quantity: Number(form.quantity) } : m)))
      setEditingId(null)
    } else {
      setMovements([
        { id: Date.now(), ...form, quantity: Number(form.quantity), date: new Date().toISOString().slice(0, 10) },
        ...movements,
      ])
    }
    setForm({ product: '', type: 'in', quantity: '', note: '' })
  }

  const handleEdit = (movement) => {
    setForm({ product: movement.product, type: movement.type, quantity: movement.quantity, note: movement.note })
    setEditingId(movement.id)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">BiasharaPulse</div>
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a className="active" href="/stock-movement">Stock Movement</a>
        </nav>
      </aside>

      <main className="main">
        <header className="main-header">
          <h1>Stock Movement</h1>
        </header>

        <form className="movement-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Product</label>
            <input name="product" value={form.product} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Type</label>
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
            </select>
          </div>
          <div className="field">
            <label>Quantity</label>
            <input name="quantity" type="number" value={form.quantity} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Note</label>
            <input name="note" value={form.note} onChange={handleChange} />
          </div>
          <button className="movement-submit" type="submit">
            {editingId ? 'Update entry' : 'Add entry'}
          </button>
        </form>

        <table className="movement-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Note</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>{m.product}</td>
                <td className={m.type === 'in' ? 'type-in' : 'type-out'}>{m.type === 'in' ? 'In' : 'Out'}</td>
                <td>{m.quantity}</td>
                <td>{m.note}</td>
                <td>{m.date}</td>
                <td><button className="edit-link" onClick={() => handleEdit(m)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  )
}

export default StockMovement