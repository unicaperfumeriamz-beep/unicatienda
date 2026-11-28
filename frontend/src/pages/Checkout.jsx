import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Navigation, Compass, CheckCircle2, ChevronRight, CreditCard, ShieldCheck, Truck, ShoppingBag, ArrowRight, ExternalLink } from 'lucide-react';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = location.state?.couponCode || null;
  
  const [addressForm, setAddressForm] = useState({
    street: '',
    number: '',
    city: 'Godoy Cruz, Mendoza',
    postalCode: '5501',
    notes: '',
    lat: -32.9238,
    lng: -68.8456,
    hasGeo: false,
    accuracy: null,
  });
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartData, setCartData] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  if (!user) {
    navigate('/login');
    return null;
  }

  // Pre-cargar si el usuario ya tiene dirección cargada en el perfil
  useEffect(() => {
    if (user?.address) {
      setAddressForm(prev => ({
        ...prev,
        street: user.address,
      }));
    }
  }, [user]);

  const handleGetLiveLocation = () => {
    if (!('geolocation' in navigator)) {
      setGeoMsg({ type: 'error', text: 'Tu dispositivo o navegador no soporta geolocalización GPS.' });
      return;
    }
    setLocating(true);
    setGeoMsg({ type: 'info', text: 'Detectando satélites y señal GPS en tiempo real...' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setAddressForm(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          hasGeo: true,
          accuracy: Math.round(accuracy)
        }));
        setLocating(false);
        setGeoMsg({
          type: 'success',
          text: `Ubicación GPS precisa fijada (Precisión: ±${Math.round(accuracy)}m).`
        });

        // Intentar autocompletar calle mediante reverse geocoding
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          if (data && data.address) {
            const road = data.address.road || data.address.pedestrian || data.address.neighbourhood || '';
            const houseNumber = data.address.house_number || '';
            const city = data.address.city || data.address.town || data.address.village || data.address.county || 'Mendoza';
            const postcode = data.address.postcode || '';
            setAddressForm(prev => ({
              ...prev,
              street: road || prev.street,
              number: houseNumber || prev.number,
              city: city || prev.city,
              postalCode: postcode || prev.postalCode,
            }));
          }
        } catch (_) {}
      },
      (err) => {
        setLocating(false);
        setGeoMsg({
          type: 'error',
          text: 'No se pudo obtener la señal GPS: ' + (err.message || 'Permiso denegado por el navegador')
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

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
    
    if (!addressForm.street.trim() || !addressForm.number.trim() || !addressForm.city.trim()) {
      setError('Por favor completa los campos obligatorios: Calle, Altura y Localidad.');
      return;
    }

    const shippingPayload = JSON.stringify({
      street: addressForm.street.trim(),
      number: addressForm.number.trim(),
      city: addressForm.city.trim(),
      postalCode: addressForm.postalCode.trim(),
      notes: addressForm.notes.trim(),
      lat: addressForm.lat,
      lng: addressForm.lng,
      hasGeo: addressForm.hasGeo,
      accuracy: addressForm.accuracy,
      fullText: `${addressForm.street.trim()} ${addressForm.number.trim()}, ${addressForm.city.trim()}${addressForm.postalCode ? ` (CP ${addressForm.postalCode.trim()})` : ''}`
    });
    
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/checkout/create-order', { shippingAddress: shippingPayload, couponCode });
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
  const totalUnits = cartData?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  // Regla comercial UNICA: 5+ -> 10% OFF, 10+ -> 20% OFF + Envío Bonificado
  const volumeDiscountPercent = totalUnits >= 10 ? 20 : totalUnits >= 5 ? 10 : 0;
  const shippingBonified = totalUnits >= 10;
  const volumeDiscount = (totalAmount * volumeDiscountPercent) / 100;

  // Apply visual discount if coupon is present (simplified for UI purposes)
  const discountVisual = couponCode ? (totalAmount - volumeDiscount) * 0.1 : 0;
  const finalTotal = Math.max(0, totalAmount - volumeDiscount - discountVisual);

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
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden group transition-all duration-300">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#3b0052] to-fuchsia-600 rounded-l-3xl"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-50 text-fuchsia-800 flex items-center justify-center border border-fuchsia-100">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">¿Dónde quieres recibirlo?</h3>
                    <p className="text-xs text-slate-500">Carga tu dirección exacta y referencias para el despacho.</p>
                  </div>
                </div>

                {/* Botón GPS en tiempo real */}
                <button
                  type="button"
                  onClick={handleGetLiveLocation}
                  disabled={locating}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1d0028] text-amber-300 hover:bg-black transition-all flex items-center gap-2 border border-fuchsia-800/40 cursor-pointer shadow-sm hover:scale-[1.02] disabled:opacity-60 self-start sm:self-auto"
                  title="Fijar ubicación precisa mediante GPS"
                >
                  <Navigation size={14} className={locating ? 'animate-spin text-amber-400' : 'text-amber-300'} />
                  <span>{locating ? 'Detectando GPS...' : 'Ubicación Actual (GPS)'}</span>
                </button>
              </div>

              {/* Mensaje de estado GPS */}
              {geoMsg && (
                <div className={`mb-5 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${geoMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : geoMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                  <Compass size={16} />
                  <span>{geoMsg.text}</span>
                </div>
              )}

              {/* Formulario de Dirección Estructurada */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Calle <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={addressForm.street} 
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} 
                      placeholder="Ej: San Martín, Belgrano, Av. Libertador"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Altura / N° <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={addressForm.number} 
                      onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })} 
                      placeholder="Ej: 1234"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Localidad / Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={addressForm.city} 
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} 
                      placeholder="Ej: Godoy Cruz, Mendoza, CABA, Córdoba"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                      Código Postal
                    </label>
                    <input 
                      type="text" 
                      value={addressForm.postalCode} 
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} 
                      placeholder="Ej: 5501"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Instrucciones para la entrega <span className="text-slate-400 font-normal lowercase">(piso, depto, timbre, referencias)</span>
                  </label>
                  <textarea 
                    value={addressForm.notes} 
                    onChange={(e) => setAddressForm({ ...addressForm, notes: e.target.value })} 
                    placeholder="Ej: Piso 2 Depto B. Portón gris, tocar timbre 'Toloza'. Dejar en recepción si no hay nadie."
                    rows="2"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-500 focus:bg-white outline-none transition-all text-sm font-medium text-slate-900 resize-none"
                  ></textarea>
                </div>

                {/* Mapa Interactivo con Ubicación Precisa */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin size={15} className="text-rose-500" />
                      Punto de Entrega en el Mapa
                      {addressForm.hasGeo && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          GPS Activo
                        </span>
                      )}
                    </span>
                    <a 
                      href={`https://www.google.com/maps?q=${addressForm.lat},${addressForm.lng}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Abrir en Google Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border-2 border-slate-200 relative shadow-inner bg-slate-100">
                    <iframe
                      title="Mapa de Entrega"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight="0"
                      marginWidth="0"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${addressForm.lng - 0.008}%2C${addressForm.lat - 0.005}%2C${addressForm.lng + 0.008}%2C${addressForm.lat + 0.005}&layer=mapnik&marker=${addressForm.lat}%2C${addressForm.lng}`}
                      className="w-full h-full"
                    ></iframe>
                    
                    {/* Tarjeta de Coordenadas flotante */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:right-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 text-xs flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800">
                          {addressForm.street ? `${addressForm.street} ${addressForm.number || ''}` : 'Ubicación seleccionada'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Lat: {addressForm.lat.toFixed(5)} | Lng: {addressForm.lng.toFixed(5)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGetLiveLocation}
                        className="text-[11px] font-bold text-fuchsia-700 hover:text-fuchsia-900 bg-fuchsia-50 hover:bg-fuchsia-100 px-2.5 py-1.5 rounded-lg border border-fuchsia-200 transition-colors cursor-pointer"
                      >
                        Recalcular GPS
                      </button>
                    </div>
                  </div>
                </div>

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
                  <span>Productos ({totalUnits})</span>
                  <span className="font-semibold text-slate-700">${totalAmount.toLocaleString('es-AR')}</span>
                </div>

                {volumeDiscount > 0 && (
                  <div className="flex justify-between text-fuchsia-700 font-bold bg-fuchsia-50 p-2.5 rounded-xl border border-fuchsia-200">
                    <span className="flex items-center gap-1.5 text-xs">
                      <Sparkles size={14} className="text-amber-500" />
                      Descuento por volumen ({volumeDiscountPercent}% OFF)
                    </span>
                    <span>-${volumeDiscount.toLocaleString('es-AR')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-500">
                  <span>Envío</span>
                  {shippingBonified ? (
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={13} /> ¡Bonificado!
                    </span>
                  ) : (
                    <span className="font-semibold text-zinc-700">A coordinar</span>
                  )}
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
