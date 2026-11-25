import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Gift, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { user } = useAuth();
  const { fetchCartCount, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loyaltySettings, setLoyaltySettings] = useState(null);

  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchCart() {
      try {
        const [resCart, resLoyalty] = await Promise.all([
          api.get('/cart'),
          api.get('/admin/loyalty/settings').catch(() => ({ data: { success: false } }))
        ]);
        if (resCart.data.success) {
          setCartData(resCart.data.data);
        }
        if (resLoyalty.data.success) {
          setLoyaltySettings(resLoyalty.data.data);
        }
      } catch (error) {
        console.error('Error fetching cart', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [user]);

  if (loading) return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <div className="h-32 bg-slate-200 rounded-xl"></div>
          <div className="h-32 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="w-full lg:w-96 h-64 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-800">¡Hola! Para sumar a tu carrito, ingresa a tu cuenta</h2>
          <p className="text-slate-500 mb-8">Podrás guardar productos y continuar cuando quieras.</p>
          <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors w-full max-w-xs shadow-lg shadow-blue-600/20">
            Ingresar a mi cuenta
          </button>
        </div>
      </div>
    );
  }

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) setCartData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (id) => {
    setItemToDelete(id);
  };

  const handleRemove = async () => {
    if (!itemToDelete) return;
    try {
      const res = await removeFromCart(itemToDelete);
      if (res?.success === false) throw new Error(res.message);
      toast.success('Producto eliminado del carrito');
      const cartRes = await api.get('/cart');
      if (cartRes.data.success) setCartData(cartRes.data.data);
    } catch (e) {
      toast.error(e.message || 'Error al eliminar el producto');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleUpdateQty = async (id, qty) => {
    if (qty < 1) return;
    await updateQuantity(id, qty);
    const res = await api.get('/cart');
    if (res.data.success) setCartData(res.data.data);
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode) return;
    try {
      const res = await api.post('/cart/coupon', { code: couponCode });
      if (res.data.success) {
        setAppliedCoupon(res.data.data);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || 'Cupón inválido');
      setAppliedCoupon(null);
    }
  };

  const handleRedeemPoints = async () => {
    setRedeemError('');
    try {
      const res = await api.post('/cart/redeem-points');
      if (res.data.success) {
        setAppliedCoupon({
          code: res.data.data.code,
          discountAmount: res.data.data.discountAmount,
          name: 'Gift Card por Puntos'
        });
        // We might want to refresh user points via AuthContext
      }
    } catch (e) {
      setRedeemError(e.response?.data?.message || 'Error al canjear puntos');
    }
  };

  const items = cartData?.items || [];
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercentage) {
      discountAmount = (subtotal * appliedCoupon.discountPercentage) / 100;
    } else if (appliedCoupon.discountAmount) {
      discountAmount = appliedCoupon.discountAmount;
    }
  }
  if (discountAmount > subtotal) discountAmount = subtotal;

  const total = subtotal - discountAmount;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 lg:px-8">
      
      {items.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-slate-500 mb-8">¿No sabes qué comprar? ¡Miles de productos te esperan!</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Descubrir ofertas
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Productos</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {items.map(item => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                    <div className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden border border-slate-200">
                      {item.product?.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-800 line-clamp-2">{item.product?.name || `Producto ID: ${item.productId}`}</h3>
                          <button onClick={() => confirmRemove(item.id)} className="text-sm font-semibold text-red-500 mt-2 hover:text-red-700 hover:underline flex items-center gap-1 transition-colors"><Trash2 size={14}/> Eliminar</button>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-medium text-slate-900">${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="px-3 py-1 text-slate-500 hover:text-blue-600 transition-colors">-</button>
                          <span className="px-3 font-medium text-slate-700">{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="px-3 py-1 text-slate-500 hover:text-blue-600 transition-colors">+</button>
                        </div>
                        <span className="text-sm text-slate-500">Unidades disponibles</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <h3 className="text-lg font-bold mb-6 text-slate-800">Resumen de compra</h3>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Productos ({items.reduce((a,b)=>a+b.quantity, 0)})</span>
                  <span className="font-medium text-slate-800">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Envíos</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{appliedCoupon.name ? appliedCoupon.name : `Cupón ${appliedCoupon.code}`} {appliedCoupon.discountPercentage ? `(${appliedCoupon.discountPercentage}%)` : ''}</span>
                    <span>-${discountAmount.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-6 pt-4 border-t border-slate-100">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Código de descuento" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none uppercase focus:border-blue-500" />
                  <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors">Aplicar</button>
                </form>
                {couponError && <p className="text-red-500 text-xs mt-2 font-bold">{couponError}</p>}
                
                {loyaltySettings && user.points > 0 && !appliedCoupon && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-sm">
                    <p className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><Gift size={16}/> Tienes {user.points} puntos acumulados</p>
                    {user.points >= loyaltySettings.minPointsToRedeem ? (
                      <p className="text-emerald-600 font-bold text-xs">¡Felicidades! Has alcanzado la consigna de {loyaltySettings.minPointsToRedeem} pts. ¡Pronto recibirás tu premio!</p>
                    ) : (
                      <p className="text-emerald-600 mb-3 text-xs">Consigna de la semana: suma {loyaltySettings.minPointsToRedeem} pts para ganar recompensas únicas.</p>
                    )}
                  </div>
                )}

                {appliedCoupon && <p className="text-emerald-500 text-xs mt-2 font-bold flex justify-between items-center"><span>Descuento aplicado con éxito</span> <button type="button" onClick={() => {setAppliedCoupon(null); setCouponCode('');}} className="underline">Quitar</button></p>}
              </div>
              
              <div className="flex justify-between items-center border-t border-slate-100 pt-6 mb-8">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-3xl font-medium text-slate-900">${total.toLocaleString('es-AR')}</span>
              </div>
              
              <button 
                onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Continuar compra
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform scale-100 animate-slide-up border border-slate-100 relative">
            <button onClick={() => setItemToDelete(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Eliminar producto?</h3>
            <p className="text-slate-500 mb-8 text-sm px-2">El producto se quitará de tu carrito de compras.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setItemToDelete(null)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Conservar</button>
              <button onClick={handleRemove} className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-500/20">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
