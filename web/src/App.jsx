import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Landing from './pages/landing'
import Login from './pages/login'
import Signup from './pages/signup'
import ChoosePlan from './pages/choosePlan'
import Dashboard from './pages/dashboard'
import StockMovement from './pages/stockMovement'
import Pos from './pages/pos'
import Orders from './pages/orders'
import Account from './pages/account'
import Upgrade from './pages/upgrade'
import ProductPerformance from './pages/productPerformance'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import './App.css'

// Re-keys on every route change so the fade replays
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-fade">
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/choose-plan" element={<ChoosePlan />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock-movement" element={<StockMovement />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/product-performance" element={<ProductPerformance />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/account" element={<Account />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App