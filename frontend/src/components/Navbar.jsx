import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Bell, Tag, Gift } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/products').then(res => {
        if (res.data.success) {
          // Take top 2 products as suggestions
          setSuggestions(res.data.data.slice(0, 2));
        }
      }).catch(err => console.error(err));
    }
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Buscando:', search);
  };

  return (
    <header className="bg-zinc-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/unica-logo.svg" alt="ÚNICA Perfumería" className="h-10 md:h-12 object-contain" />
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative shadow-sm rounded-full overflow-hidden flex border border-zinc-700 bg-zinc-800">
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar productos, marcas y más..." 
                className="w-full py-2.5 pl-5 pr-12 text-zinc-100 bg-transparent outline-none placeholder-zinc-400"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 bg-zinc-700 hover:bg-zinc-600 transition-colors flex items-center justify-center">
                <Search size={20} className="text-zinc-300" />
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6 text-sm">
              <Link to="/" className="font-medium text-zinc-300 hover:text-white transition-colors">Categorías</Link>
              <Link to="/" className="font-medium text-zinc-300 hover:text-white transition-colors">Ofertas</Link>
            </div>

            <div className="h-8 w-px bg-zinc-700"></div>

            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 font-semibold text-zinc-200 hover:text-white transition-colors py-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-zinc-900 flex items-center justify-center shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    {user.name.split(' ')[0]}
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute right-0 top-full w-56 pt-1 hidden group-hover:block z-50">
                    <div className="bg-zinc-800 rounded-xl shadow-xl py-2 border border-zinc-700">
                      <div className="px-4 py-2 border-b border-zinc-700 mb-2">
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-zinc-400 text-xs truncate">{user.email}</p>
                      </div>
                      <div className="px-4 py-2 mb-2 flex items-center gap-2 text-emerald-400 font-black">
                        <Gift size={16} /> {user.points || 0} pts
                      </div>
                      <Link to="/orders" className="block px-4 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">Mis Compras</Link>
                      <Link to="/referrals" className="block px-4 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">Prog. Referidos</Link>
                      {user.role === 'ADMIN' && (
                        <Link to="/admin" className="block px-4 py-2 text-emerald-400 font-bold hover:bg-zinc-700 transition-colors">Panel Admin</Link>
                      )}
                      <div className="mt-2 border-t border-zinc-700 pt-2">
                        <button onClick={logout} className="w-full text-left block px-4 py-2 text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors">Cerrar Sesión</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="font-semibold text-zinc-200 hover:text-white transition-colors flex items-center gap-2">
                  <User size={18} />
                  Ingresa / Regístrate
                </Link>
              )}
              
              {user && (
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-zinc-200 hover:text-emerald-400 transition-colors p-2 bg-zinc-800 rounded-full"
                  >
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full border border-zinc-900 animate-ping"></span>
                    <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full border border-zinc-900"></span>
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl py-2 z-50 border border-zinc-200 animate-fade-in-down overflow-hidden">
                      <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                        <h3 className="font-bold text-zinc-800">Notificaciones</h3>
                        <span className="text-xs text-blue-600 font-bold cursor-pointer hover:underline">Marcar leídas</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {suggestions.length > 0 ? suggestions.map(s => (
                          <div key={s.id} onClick={() => { setShowNotifications(false); navigate(`/product/${s.id}`); }} className="p-4 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-colors flex gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                              <Tag size={20} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-800">Sugerencia para ti</p>
                              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">¡Descubre {s.name} con descuento especial!</p>
                              <p className="text-[10px] text-zinc-400 mt-1">Hace unos instantes</p>
                            </div>
                          </div>
                        )) : (
                          <div className="p-4 text-center text-zinc-500 text-sm">No hay notificaciones nuevas</div>
                        )}
                        
                        <div onClick={() => { setShowNotifications(false); navigate('/'); }} className="p-4 hover:bg-zinc-50 cursor-pointer transition-colors flex gap-3 border-t border-zinc-100">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                            <User size={20} className="text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-800">Bienvenido a ÚNICA Perfumería</p>
                            <p className="text-xs text-zinc-500 mt-1">Completa tu perfil para obtener envíos más rápidos.</p>
                            <p className="text-[10px] text-zinc-400 mt-1">Ayer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link to="/cart" className="relative text-zinc-200 hover:text-emerald-400 transition-colors p-2 bg-zinc-800 rounded-full">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-zinc-900 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-900 shadow-sm animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-zinc-300 p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="w-full relative shadow-sm rounded-full overflow-hidden flex border border-zinc-700 bg-zinc-800">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Estoy buscando..." 
              className="w-full py-2 pl-4 pr-10 text-sm text-zinc-100 bg-transparent outline-none"
            />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-3 bg-zinc-700 flex items-center justify-center">
              <Search size={16} className="text-zinc-300" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-900 border-t border-zinc-800 shadow-xl absolute w-full z-40">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {user ? (
              <>
                <div className="px-3 py-4 border-b border-zinc-800 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-zinc-900 flex items-center justify-center font-bold text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{user.name}</p>
                    <p className="text-sm text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg">Mis Compras</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 font-bold text-emerald-400 hover:bg-zinc-800 rounded-lg">Panel Admin</Link>
                )}
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg">Mi Carrito</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-3 font-medium text-red-400 hover:bg-zinc-800 rounded-lg">Cerrar Sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg">Ingresar o Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
