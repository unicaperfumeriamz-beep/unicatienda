import React, { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import api from './api/client'
import Home from './pages/Home'
import Login from './pages/Login'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Referrals from './pages/Referrals'
import Admin from './pages/Admin'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (!isAdminRoute) {
      api.post('/analytics/visit').catch(() => {});
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-100">
      {!isAdminRoute && <Navbar />}
      <Toaster position="top-right" />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <div className="w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </div>
        </main>

        {!isAdminRoute && <Footer />}
      </div>
  )
}

export default App
