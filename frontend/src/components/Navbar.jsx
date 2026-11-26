import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Bell, Tag, Gift, Settings, CheckCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifications(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data || []);
        const unread = (res.data.data || []).filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestPushNotification = async () => {
    if (!('Notification' in window)) {
      toast.error('Este navegador no soporta notificaciones push');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('¡Notificaciones activadas con éxito!');
        new Notification('ÚNICA Perfumería', {
          body: '¡Gracias por activar las notificaciones! Te avisaremos de nuevos catálogos y promociones exclusivas.',
          icon: '/unica-logo.svg'
        });
        await api.post('/notifications/subscribe', { token: 'browser-' + Date.now(), platform: 'web' }).catch(() => {});
      } else {
        toast.error('Permiso de notificaciones no concedido');
      }
    } catch (err) {
      console.error('Push error:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}#catalogo`);
    } else {
      navigate('/#catalogo');
    }
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
                placeholder="Buscar perfumes, difusores, líneas de catálogo..." 
                className="w-full py-2.5 pl-5 pr-12 text-zinc-100 bg-transparent outline-none placeholder-zinc-400 text-sm"
              />
              <button type="submit" className="absolute right-0 top-0 bottom-0 px-4 bg-zinc-700 hover:bg-zinc-600 transition-colors flex items-center justify-center cursor-pointer">
                <Search size={20} className="text-zinc-300" />
              </button>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-6 text-sm">
              <a href="/#catalogo" className="font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer">Categorías</a>
              <Link to="/?ofertas=true#catalogo" className="font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer">Ofertas</Link>
            </div>

            <div className="h-8 w-px bg-zinc-700"></div>

            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 font-semibold text-zinc-200 hover:text-white transition-colors py-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center shadow-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{user.name.split(' ')[0]}</span>
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute right-0 top-full w-60 pt-1 hidden group-hover:block z-50">
                    <div className="bg-zinc-800 rounded-2xl shadow-xl py-2 border border-zinc-700">
                      <div className="px-4 py-2 border-b border-zinc-700 mb-2">
                        <p className="text-white font-bold">{user.name}</p>
                        <p className="text-zinc-400 text-xs truncate">{user.email}</p>
                      </div>
                      <div className="px-4 py-2 mb-2 flex items-center gap-2 text-amber-400 font-black text-xs">
                        <Gift size={16} /> {user.points || 0} pts ÚNICA
                      </div>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">
                        <Settings size={16} />
                        <span>Mi Perfil / Contraseña</span>
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">Mis Compras</Link>
                      <Link to="/referrals" className="block px-4 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">Prog. Referidos</Link>
                      {user.role === 'ADMIN' && (
                        <Link to="/admin" className="block px-4 py-2 text-rose-400 font-bold hover:bg-zinc-700 transition-colors">Panel Admin</Link>
                      )}
                      <div className="mt-2 border-t border-zinc-700 pt-2">
                        <button onClick={logout} className="w-full text-left block px-4 py-2 text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors cursor-pointer">Cerrar Sesión</button>
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
                    className="relative text-zinc-200 hover:text-rose-400 transition-colors p-2 bg-zinc-800 rounded-full cursor-pointer"
                    title="Notificaciones"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-rose-500 w-2.5 h-2.5 rounded-full border border-zinc-900 animate-pulse"></span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl py-2 z-50 border border-zinc-200 animate-fade-in-down overflow-hidden text-zinc-900">
                      <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                        <h3 className="font-bold text-sm text-zinc-800">Notificaciones</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead} 
                            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck size={14} /> Marcar leídas
                          </button>
                        )}
                      </div>
                      
                      <div className="p-2 border-b border-zinc-100 bg-rose-50/50 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-600 font-medium">Recibe ofertas y libros al instante</span>
                        <button
                          onClick={handleRequestPushNotification}
                          className="px-2 py-1 text-[11px] bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition"
                        >
                          Activar Push
                        </button>
                      </div>

                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              className={`p-3 border-b border-zinc-50 hover:bg-zinc-50 transition-colors flex gap-3 ${!n.isRead ? 'bg-amber-50/40' : ''}`}
                            >
                              <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                <Tag size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-bold text-zinc-800">{n.title}</p>
                                <p className="text-xs text-zinc-500 mt-0.5">{n.message}</p>
                                <p className="text-[10px] text-zinc-400 mt-1">
                                  {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Reciente'}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-zinc-400 text-xs">
                            No tienes notificaciones por el momento
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Link to="/cart" className="relative text-zinc-200 hover:text-rose-400 transition-colors p-2 bg-zinc-800 rounded-full">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-900 shadow-sm animate-pulse">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className="relative text-zinc-200 p-2 bg-zinc-800 rounded-full">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-zinc-900">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-zinc-300 p-2 cursor-pointer">
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
              placeholder="Buscar perfumes, líneas..." 
              className="w-full py-2 pl-4 pr-10 text-sm text-zinc-100 bg-transparent outline-none placeholder-zinc-400"
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
            <a href="/#catalogo" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg">Categorías</a>
            <Link to="/?ofertas=true#catalogo" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 font-bold text-amber-400 hover:bg-zinc-800 rounded-lg">Ofertas Especiales</Link>

            {user ? (
              <>
                <div className="px-3 py-4 border-t border-b border-zinc-800 flex items-center gap-3 my-2">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base">{user.name}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                  </div>
                </div>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg">Mi Perfil / Contraseña</Link>
                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg">Mis Compras</Link>
                <Link to="/referrals" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 font-medium text-zinc-300 hover:bg-zinc-800 rounded-lg">Prog. Referidos</Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2.5 font-bold text-rose-400 hover:bg-zinc-800 rounded-lg">Panel Admin</Link>
                )}
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2.5 font-medium text-red-400 hover:bg-zinc-800 rounded-lg">Cerrar Sesión</button>
              </>
            ) : (
              <div className="pt-2 border-t border-zinc-800">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 font-bold text-rose-400 hover:bg-zinc-800 rounded-lg">Ingresar o Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
