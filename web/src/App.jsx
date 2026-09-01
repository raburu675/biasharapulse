import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing'
import Login from './pages/login'
import Signup from './pages/signup'
import Dashboard from './pages/dashboard'
import StockMovement from './pages/stockMovement'
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
      </Routes>
    </BrowserRouter>
  )
}

export default App