import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Sparkles, Trash2, X, Truck, CheckCircle2 } from 'lucide-react';
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
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchCart() {
      try {
        const resCart = await api.get('/cart');
        if (resCart.data.success) {
          setCartData(resCart.data.data);
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

  const items = cartData?.items || [];
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalUnits = items.reduce((acc, item) => acc + item.quantity, 0);

  // Regla comercial UNICA Perfumería:
  // >= 5 productos: 10% OFF
  // >= 10 productos: 20% OFF + Envío Bonificado
  const volumeDiscountPercent = totalUnits >= 10 ? 20 : totalUnits >= 5 ? 10 : 0;
  const shippingBonified = totalUnits >= 10;
  const volumeDiscountAmount = (subtotal * volumeDiscountPercent) / 100;

  let couponDiscountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercentage) {
      couponDiscountAmount = ((subtotal - volumeDiscountAmount) * appliedCoupon.discountPercentage) / 100;
    } else if (appliedCoupon.discountAmount) {
      couponDiscountAmount = appliedCoupon.discountAmount;
    }
  }
  if (couponDiscountAmount > (subtotal - volumeDiscountAmount)) {
    couponDiscountAmount = Math.max(0, subtotal - volumeDiscountAmount);
  }

  const total = Math.max(0, subtotal - volumeDiscountAmount - couponDiscountAmount);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 lg:px-8">
      
      {items.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
          <p className="text-slate-500 mb-8">Descubrí las exclusivas fragancias y creaciones de la Edición Nº 50.</p>
          <button onClick={() => navigate('/#catalogo')} className="bg-gradient-to-r from-[#701a75] to-[#a21caf] text-white px-8 py-3 rounded-xl font-bold hover:opacity-95 transition-all shadow-md">
            Ver Catálogo Oficial
          </button>
        </div>
      ) : (
        <div>
          {/* Banner Promocional de Descuento por Volumen y Envío Bonificado */}
          <div className="mb-8 p-5 rounded-2xl bg-gradient-to-r from-[#170020] via-[#2d003d] to-[#170020] text-white border border-fuchsia-500/40 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Promoción Oficial por Cantidad</span>
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-white">
                  {totalUnits >= 10 ? (
                    <span className="text-emerald-400">🎉 ¡Máximo beneficio! Tenés 20% OFF en toda tu compra y Envío Bonificado</span>
                  ) : totalUnits >= 5 ? (
                    <span>¡Tenés 10% OFF activado! Agregá <span className="text-amber-300 font-black">{10 - totalUnits}</span> más para <span className="text-emerald-400">20% OFF y Envío Bonificado</span></span>
                  ) : (
                    <span>Agregá <span className="text-amber-300 font-black">{5 - totalUnits}</span> {5 - totalUnits === 1 ? 'producto' : 'productos'} más para desbloquear <span className="text-amber-300 font-bold">10% de DESCUENTO</span></span>
                  )}
                </h4>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-fuchsia-200">
                  Llevás: <span className="text-white text-sm font-black">{totalUnits}</span> {totalUnits === 1 ? 'unidad' : 'unidades'}
                </div>
                {shippingBonified && (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Truck size={14} /> Envío Bonificado
                  </div>
                )}
              </div>
            </div>

            {/* Barra de Progreso hacia 5 y 10 unidades */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex justify-between text-[11px] font-semibold text-zinc-300 mb-1.5">
                <span className={totalUnits >= 5 ? "text-amber-300 font-bold" : "text-zinc-400"}>5 productos (10% OFF)</span>
                <span className={totalUnits >= 10 ? "text-emerald-300 font-bold" : "text-zinc-400"}>10 productos (20% OFF + Envío Bonificado)</span>
              </div>
              <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, (totalUnits / 10) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Productos en tu carrito</h2>
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
                            <button onClick={() => handleUpdateQty(item.id, item.quantity - 1)} className="px-3 py-1 text-slate-500 hover:text-fuchsia-700 transition-colors font-bold">-</button>
                            <span className="px-3 font-medium text-slate-700">{item.quantity}</span>
                            <button onClick={() => handleUpdateQty(item.id, item.quantity + 1)} className="px-3 py-1 text-slate-500 hover:text-fuchsia-700 transition-colors font-bold">+</button>
                          </div>
                          <span className="text-sm text-slate-500">Unidades</span>
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
                    <span className="text-slate-600">Productos ({totalUnits})</span>
                    <span className="font-medium text-slate-800">${subtotal.toLocaleString('es-AR')}</span>
                  </div>

                  {volumeDiscountAmount > 0 && (
                    <div className="flex justify-between text-fuchsia-800 font-bold bg-fuchsia-50 px-3 py-2.5 rounded-xl border border-fuchsia-200">
                      <span className="flex items-center gap-1.5 text-xs">
                        <Sparkles size={14} className="text-amber-500" />
                        Descuento por volumen ({volumeDiscountPercent}%)
                      </span>
                      <span>-${volumeDiscountAmount.toLocaleString('es-AR')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Envío</span>
                    {shippingBonified ? (
                      <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600" /> ¡Bonificado!
                      </span>
                    ) : (
                      <span className="text-zinc-600 font-medium">A coordinar</span>
                    )}
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>{appliedCoupon.name ? appliedCoupon.name : `Cupón ${appliedCoupon.code}`}</span>
                      <span>-${couponDiscountAmount.toLocaleString('es-AR')}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-6 pt-4 border-t border-slate-100">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Código de descuento" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none uppercase focus:border-fuchsia-500" />
                    <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-900 transition-colors">Aplicar</button>
                  </form>
                  {couponError && <p className="text-red-500 text-xs mt-2 font-bold">{couponError}</p>}
                  {appliedCoupon && <p className="text-emerald-500 text-xs mt-2 font-bold flex justify-between items-center"><span>Descuento aplicado con éxito</span> <button type="button" onClick={() => {setAppliedCoupon(null); setCouponCode('');}} className="underline">Quitar</button></p>}
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-100 pt-6 mb-8">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="text-3xl font-black text-slate-900">${total.toLocaleString('es-AR')}</span>
                </div>
                
                <button 
                  onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
                  className="w-full bg-gradient-to-r from-[#701a75] via-[#a21caf] to-[#d946ef] text-white font-bold py-4 rounded-xl hover:opacity-95 transition-all shadow-lg shadow-fuchsia-950/40 cursor-pointer text-center block"
                >
                  Continuar compra
                </button>
              </div>
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
