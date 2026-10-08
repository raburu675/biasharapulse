import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing'
import Login from './pages/login'
import Signup from './pages/signup'
import Dashboard from './pages/dashboard'
import StockMovement from './pages/stockMovement'
import Pos from './pages/pos'
import Orders from './pages/orders'
import Account from './pages/account'
import Upgrade from './pages/upgrade'
import ProductPerformance from './pages/productPerformance'
import './App.css'

function App() {
  return (
    <BrowserRouter>
       <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock-movement" element={<StockMovement />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/product-performance" element={<ProductPerformance/>} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/account" element={<Account />} />
        <Route path="/upgrade" element={<Upgrade />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App