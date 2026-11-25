import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Plus, CheckCircle2, ChevronRight, CreditCard, ShieldCheck, Truck, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = location.state?.couponCode || null;
  
  const [selectedAddress, setSelectedAddress] = useState(user?.address ? 'saved' : 'new');
  const [newAddress, setNewAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartData, setCartData] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await api.get('/cart');
        if (res.data.success) {
          setCartData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching cart', err);
      } finally {
        setLoadingCart(false);
      }
    }
    fetchCart();
  }, []);

  const handleCheckout = async (e) => {
    e.preventDefault();
    const finalAddress = selectedAddress === 'saved' ? user.address : newAddress;
    
    if (!finalAddress || finalAddress.trim() === '') {
      setError('Por favor, ingresa o selecciona una dirección de envío para continuar.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/checkout/create-order', { shippingAddress: finalAddress, couponCode });
      if (res.data.success) {
        const { initPoint } = res.data.data;
        if (initPoint && initPoint !== 'dummy') {
          window.location.href = initPoint;
        } else {
          // Fallback if MP fails or dummy is returned
          navigate('/orders', { state: { successMsg: "¡Orden creada! El pago se simuló exitosamente." } });
        }
      } else {
        setError(res.data.message || 'Error al procesar la orden');
      }
    } catch (err) {
      setError('Ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo más tarde.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cartData ? cartData.totalAmount : 0;
  // Apply visual discount if coupon is present (simplified for UI purposes)
  const discountVisual = couponCode ? totalAmount * 0.1 : 0; // Just a visual mock of 10% if there's a coupon passed
  const finalTotal = totalAmount - discountVisual;

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans selection:bg-blue-100">
      
      <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        {/* Stepper Premium */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-slate-400 mb-10 overflow-x-auto pb-2 custom-scrollbar">
          <span className="flex items-center gap-2 cursor-pointer hover:text-slate-600 transition-colors" onClick={() => navigate('/cart')}>
            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">1</span>
            Carrito
          </span>
          <ChevronRight size={16} />
          <span className="flex items-center gap-2 text-blue-600">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">2</span>
            Entrega y Pago
          </span>
          <ChevronRight size={16} />
          <span className="flex items-center gap-2 opacity-50">
            <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">3</span>
            Confirmación
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 tracking-tight">Finaliza tu compra</h1>
        
        {error && (
          <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100 flex items-center gap-3 animate-fade-in shadow-sm">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Form Details */}
          <div className="flex-1 space-y-8">
            
            {/* Delivery Section */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl"></div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">¿Dónde quieres recibirlo?</h3>
              </div>
              
              <div className="space-y-4 pl-0 sm:pl-12">
                {user?.address && (
                  <label className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 ${selectedAddress === 'saved' ? 'border-blue-500 bg-blue-50/30 shadow-md shadow-blue-500/10 scale-[1.01]' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress === 'saved' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                          {selectedAddress === 'saved' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${selectedAddress === 'saved' ? 'text-blue-900' : 'text-slate-700'}`}>Enviar a mi domicilio</span>
                          {selectedAddress === 'saved' && <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">Seleccionado</span>}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{user.address}</p>
                        <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                          Recibe: {user.name}
                        </p>
                      </div>
                    </div>
                  </label>
                )}

                <label className={`block border-2 rounded-2xl p-5 cursor-pointer transition-all duration-300 ${selectedAddress === 'new' ? 'border-blue-500 bg-blue-50/30 shadow-md shadow-blue-500/10 scale-[1.01]' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress === 'new' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                        {selectedAddress === 'new' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold ${selectedAddress === 'new' ? 'text-blue-900' : 'text-slate-700'}`}>Elegir domicilio alternativo</span>
                      </div>
                      <p className="text-sm text-slate-500">Ingresa una nueva dirección para este envío.</p>
                      
                      <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${selectedAddress === 'new' ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="min-h-0">
                          <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input 
                              type="text" 
                              value={newAddress} 
                              onChange={(e) => setNewAddress(e.target.value)} 
                              placeholder="Ej: Av. Libertador 1234, CABA"
                              className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 font-medium placeholder:font-normal"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#009ee3] rounded-l-3xl"></div>
               
               <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#009ee3]/10 text-[#009ee3] flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">¿Cómo quieres pagar?</h3>
              </div>

              <div className="pl-0 sm:pl-12">
                <div className="bg-[#f5f9ff] border-2 border-[#009ee3]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#009ee3]/5 rounded-full blur-3xl pointer-events-none"></div>
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <img src="https://logotipoz.com/wp-content/uploads/2021/10/mercado-pago-logo-png-transparente.png" alt="Mercado Pago" className="w-12 object-contain" onError={(e) => {e.target.style.display='none';}}/>
                    <div>
                      <p className="font-bold text-slate-900">Mercado Pago</p>
                      <p className="text-sm text-slate-600 font-medium">Tarjetas, saldo en cuenta o efectivo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg relative z-10">
                    <CheckCircle2 size={16} /> Seleccionado
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-6 text-sm text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <ShieldCheck className="text-emerald-500 flex-shrink-0" size={24} />
                  <p><span className="font-bold text-slate-700">Compra protegida.</span> Recibe el producto que esperabas o te devolvemos tu dinero.</p>
                </div>
              </div>
            </div>

          </div>
          
          {/* Right Column: Order Summary Sticky */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white p-8 rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 lg:sticky lg:top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-blue-600" /> Resumen de compra
              </h3>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                {cartData?.items?.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{item.product.name}</p>
                      <p className="text-slate-500 text-xs">Cant: {item.quantity}</p>
                    </div>
                    <div className="font-black text-slate-900">
                      ${(item.product.price * item.quantity).toLocaleString('es-AR')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3">
                <div className="flex justify-between text-slate-500">
                  <span>Productos ({cartData?.items?.length || 0})</span>
                  <span className="font-semibold text-slate-700">${totalAmount.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Envío</span>
                  <span className="font-bold text-emerald-500">¡Gratis!</span>
                </div>
                {discountVisual > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Cupón de descuento</span>
                    <span>-${discountVisual.toLocaleString('es-AR')}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 mt-6 pt-6">
                <div className="flex justify-between items-end mb-8">
                  <span className="text-lg font-bold text-slate-800">Total a pagar</span>
                  <span className="text-3xl font-black text-slate-900">${finalTotal.toLocaleString('es-AR')}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={loading || !cartData || cartData.items.length === 0}
                  className="w-full bg-[#009ee3] hover:bg-[#008cc9] text-white font-black text-lg px-8 py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-[#009ee3] flex justify-center items-center gap-2 shadow-xl shadow-[#009ee3]/20 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Confirmar y Pagar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
