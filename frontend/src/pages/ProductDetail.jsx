import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, CheckCircle2, AlertCircle, X, ShieldCheck, Truck, ArrowLeft, Tag, Star, Gift } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [modal, setModal] = useState({ show: false, message: '', isSuccess: true });
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);

  useEffect(() => {
    async function fetchProductData() {
      try {
        const [prodRes, commRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get(`/products/${id}/comments`)
        ]);
        if (prodRes.data.success) {
          setProduct(prodRes.data.data);
        }
        if (commRes.data.success) {
          setComments(commRes.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProductData();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setModal({ show: true, message: 'Debes iniciar sesión para comprar', isSuccess: false });
      return;
    }
    const res = await addToCart(product.id, quantity);
    setModal({ show: true, message: res.message, isSuccess: res.success });
    setTimeout(() => {
      setModal({ show: false, message: '', isSuccess: true });
    }, 3000);
  };

  const handleVerifyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await api.post('/cart/coupon', { code: couponCode });
      if (res.data.success) {
        setCouponMsg({ success: true, text: `¡Cupón válido! Te da ${res.data.data.discountPercentage}% OFF en el carrito.` });
      }
    } catch (e) {
      setCouponMsg({ success: false, text: e.response?.data?.message || 'Cupón inválido' });
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setModal({ show: true, message: 'Debes iniciar sesión para comentar', isSuccess: false });
      return;
    }
    try {
      const res = await api.post(`/products/${id}/comments`, { text: newComment, rating: 5 });
      if (res.data.success) {
        setNewComment('');
        const commRes = await api.get(`/products/${id}/comments`);
        setComments(commRes.data.data);
      }
    } catch (error) {
      setModal({ show: true, message: 'Error al publicar comentario', isSuccess: false });
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4 animate-pulse flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3 h-96 bg-zinc-200 rounded-2xl"></div>
        <div className="w-full md:w-1/3 space-y-4">
          <div className="h-8 bg-zinc-200 rounded w-3/4"></div>
          <div className="h-12 bg-zinc-200 rounded w-1/2"></div>
          <div className="h-32 bg-zinc-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-2xl font-bold text-zinc-500">Producto no encontrado</div>;
  }

  return (
    <div className="bg-zinc-100 min-h-screen py-10">
      {modal.show && (
        <div className="fixed top-24 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${modal.isSuccess ? 'bg-zinc-900 border-zinc-800' : 'bg-red-50 border-red-100'}`}>
            {modal.isSuccess ? <CheckCircle2 className="text-emerald-500" size={24} /> : <AlertCircle className="text-red-500" size={24} />}
            <span className={`font-bold ${modal.isSuccess ? 'text-white' : 'text-red-700'}`}>{modal.message}</span>
            <button onClick={() => setModal({show: false})} className={`ml-4 ${modal.isSuccess ? 'text-zinc-400 hover:text-white' : 'text-red-400 hover:text-red-700'}`}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 font-medium mb-6 hover:underline">
          <ArrowLeft size={16} /> Volver al listado
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-[60%] p-8 flex items-center justify-center bg-zinc-50 border-r border-zinc-100 relative overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-auto object-contain max-h-[500px] hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-64 h-64 md:w-96 md:h-96 bg-zinc-200 rounded-2xl flex items-center justify-center text-zinc-400 shadow-inner">
                <span className="font-bold text-xl uppercase tracking-widest opacity-50">{product.name}</span>
              </div>
            )}
          </div>

          {/* Panel de Compra */}
          <div className="w-full md:w-[40%] p-8 flex flex-col">
            <div className="flex items-center justify-between text-sm text-zinc-500 mb-2">
              <span className="font-serif tracking-wider font-semibold text-fuchsia-900">Original UNICA • Edición 50</span>
              {product.sku && (
                <span className="font-mono text-xs bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-200/60 px-2 py-0.5 rounded font-bold">
                  CÓD: {product.sku}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-serif text-zinc-900 mb-4">{product.name}</h1>
            
            <div className="mb-6">
              {product.promotionalPrice && product.promotionalPrice < product.price ? (
                <div>
                  <span className="text-4xl font-black text-fuchsia-950 font-serif">${Number(product.promotionalPrice).toLocaleString('es-AR')}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base text-zinc-400 line-through font-semibold">${Number(product.price).toLocaleString('es-AR')}</span>
                    <span className="text-xs bg-fuchsia-100 text-fuchsia-800 font-black px-2.5 py-0.5 rounded-full">
                      ¡Precio Promocional!
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-4xl font-black text-zinc-900 font-serif">${Number(product.price).toLocaleString('es-AR')}</span>
              )}
              
              <span className="text-sm font-medium text-emerald-600 block mt-2">en hasta 12x sin interés con Mercado Pago</span>
              {product.points > 0 && (
                <div className="mt-2 bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-2">
                  <Gift size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-amber-800">Sumas {product.points} puntos UNICA</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-zinc-700 text-sm font-semibold mb-1">
              <Truck size={20} className="text-fuchsia-600" /> Envíos a todo el país
            </div>
            <div className="text-zinc-500 text-xs mb-8">Coordinamos el envío directamente a tu domicilio o sucursal</div>

            {product.stock > 0 ? (
              <div className="mb-8 space-y-4">
                <div className="font-semibold text-zinc-900">Cantidad:</div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-zinc-50">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 hover:bg-zinc-200 transition-colors font-bold text-fuchsia-800 cursor-pointer">-</button>
                    <span className="px-4 py-2 font-bold bg-white min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-4 py-2 hover:bg-zinc-200 transition-colors font-bold text-fuchsia-800 cursor-pointer">+</button>
                  </div>
                  <span className="text-sm text-zinc-500">({product.stock} disponibles)</span>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-600 font-bold p-4 rounded-xl mb-8 border border-red-100 flex items-center gap-2">
                <AlertCircle size={20}/> ¡Producto sin stock!
              </div>
            )}

            <div className="mt-auto space-y-3">
              <button 
                onClick={async () => { await handleAddToCart(); navigate('/checkout'); }}
                disabled={product.stock === 0}
                className="w-full bg-[#1b0026] text-white font-bold py-4 rounded-xl hover:bg-fuchsia-800 transition-colors disabled:bg-zinc-300 shadow-lg shadow-fuchsia-950/20 cursor-pointer"
              >
                Comprar ahora
              </button>
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-200 font-bold py-3.5 rounded-xl hover:bg-fuchsia-100 transition-colors disabled:bg-zinc-100 disabled:text-zinc-400 cursor-pointer"
              >
                Agregar al carrito
              </button>
              <a
                href={`https://wa.me/5492616098252?text=${encodeURIComponent(`Hola Roxana, quiero consultar por "${product.name}" (Cód: ${product.sku || ''}) de la Edición 50.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300/80 font-bold py-3 rounded-xl hover:bg-emerald-100 transition-colors cursor-pointer text-sm"
              >
                <i className="fa-brands fa-whatsapp text-lg text-emerald-600"></i>
                <span>Consultar con Roxana por WhatsApp</span>
              </a>
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-6">
              <div className="text-sm font-semibold text-zinc-800 flex items-center gap-2 mb-2"><Tag size={16} className="text-emerald-500" /> ¿Tenés un cupón de descuento?</div>
              <div className="flex gap-2">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Ingresar código" className="flex-1 px-3 py-2 border border-zinc-300 rounded-lg text-sm uppercase outline-none focus:border-blue-500" />
                <button onClick={handleVerifyCoupon} className="px-4 py-2 bg-zinc-800 text-white font-bold rounded-lg text-sm hover:bg-zinc-900 transition-colors">Verificar</button>
              </div>
              {couponMsg && (
                <p className={`text-xs font-bold mt-2 ${couponMsg.success ? 'text-emerald-600' : 'text-red-500'}`}>{couponMsg.text}</p>
              )}
            </div>

            <div className="mt-6 space-y-4 text-sm text-zinc-500 border-t border-zinc-100 pt-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="text-zinc-400 shrink-0" />
                <p><span className="text-blue-600">Compra Protegida</span>, recibe el producto que esperabas o te devolvemos tu dinero.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción detallada */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Descripción</h2>
          <p className="text-zinc-600 whitespace-pre-wrap leading-relaxed text-lg">
            {product.description || "Este producto no tiene una descripción detallada por el momento."}
          </p>
        </div>

        {/* Opiniones / Comentarios */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-4">Opiniones sobre el producto</h2>
          
          <div className="space-y-6 mb-8">
            {comments.length === 0 ? (
              <p className="text-zinc-500">Aún no hay opiniones. ¡Sé el primero en dejar la tuya!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="border-b border-zinc-100 pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-emerald-500">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < c.rating ? "currentColor" : "none"} />)}
                    </div>
                    <span className="font-bold text-zinc-800 text-sm">{c.userName}</span>
                    <span className="text-xs text-zinc-400">• {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-zinc-600">{c.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmitComment} className="mt-8 bg-zinc-50 p-6 rounded-xl border border-zinc-200">
            <h3 className="font-bold text-zinc-800 mb-4">Dejar un comentario</h3>
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escribe tu opinión sobre el producto..." 
              className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-4 min-h-[100px]"
              required
            ></textarea>
            <button type="submit" className="bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Publicar opinión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
