import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Gift, 
  LayoutGrid, 
  List, 
  Search, 
  Sparkles, 
  ShoppingCart, 
  Truck, 
  Check, 
  Tag, 
  SlidersHorizontal,
  PackageOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferred_view_mode') || 'grid');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [modal, setModal] = useState({ show: false, message: '', isSuccess: true });

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlOfertas = searchParams.get('ofertas') === 'true';

  useEffect(() => {
    if (urlSearch) setSearchQuery(urlSearch);
    if (urlCategory) setSelectedCategory(urlCategory);
    if (urlOfertas) setSortBy('promo');
  }, [urlSearch, urlCategory, urlOfertas]);

  useEffect(() => {
    if (window.location.hash === '#catalogo') {
      setTimeout(() => {
        const el = document.getElementById('catalogo');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [loading]);

  const toggleViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('preferred_view_mode', mode);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, bannerRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/banners'),
          api.get('/categories')
        ]);

        if (prodRes.data.success) {
          setProducts(prodRes.data.data);
        }
        if (bannerRes.data.success) {
          setBanners(bannerRes.data.data);
        }
        if (catRes.data.success) {
          setCategories(catRes.data.data);
        }
      } catch (error) {
        console.error('Error fetching home data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAddToCart = async (productId, e) => {
    if (e) e.stopPropagation();
    if (!user) {
      setModal({ show: true, message: 'Debes iniciar sesión para agregar al carrito', isSuccess: false });
      return;
    }
    const res = await addToCart(productId, 1);
    setModal({ show: true, message: res.message, isSuccess: res.success });
    setTimeout(() => {
      setModal({ show: false, message: '', isSuccess: true });
    }, 3000);
  };

  const handleBannerClick = (banner) => {
    if (!banner) return;
    const link = banner.buttonLink || '';
    
    // Si apunta directamente a un producto existente
    if (link && link.startsWith('/product/')) {
      navigate(link);
      return;
    }

    // Si el banner corresponde al lanzamiento de Born in Roma
    if (banner.title?.toLowerCase().includes('roma') || banner.buttonText?.toLowerCase().includes('lanzamiento')) {
      const prod = products.find(p => p.sku === 'MBRUPP' || p.name.toLowerCase().includes('born in roma'));
      if (prod) {
        navigate(`/product/${prod.id}`);
        return;
      }
    }

    // Si el banner corresponde a la línea Árabe / Torino
    if (banner.title?.toLowerCase().includes('torino') || banner.buttonText?.toLowerCase().includes('árabe') || banner.buttonText?.toLowerCase().includes('arabe')) {
      const prod = products.find(p => p.sku === 'UT024' || p.name.toLowerCase().includes('torino'));
      if (prod) {
        navigate(`/product/${prod.id}`);
        return;
      }
    }

    // Si es enlace al catálogo o no tiene producto, hacer scroll suave a la grilla
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#catalogo');
    }
  };

  // Filtrado y ordenamiento de productos
  const filteredProducts = products.filter(product => {
    const activeCatObj = categories.find(c => c.id === selectedCategory || c.slug === selectedCategory);
    const activeCatId = activeCatObj ? activeCatObj.id : selectedCategory;
    const matchesCategory = selectedCategory === 'all' || product.categoryId === activeCatId;
    const matchesSearch = !searchQuery.trim() || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOffers = !urlOfertas || (product.promotionalPrice && product.promotionalPrice < product.price);
    return matchesCategory && matchesSearch && matchesOffers;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'points-desc') return (b.points || 0) - (a.points || 0);
    if (sortBy === 'promo') return (b.promotionalPrice ? 1 : 0) - (a.promotionalPrice ? 1 : 0);
    return 0;
  });

  // Reset de página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, sortBy, urlOfertas]);

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const el = document.getElementById('catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getPaginationPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="w-full relative bg-slate-50 min-h-screen pb-24 font-sans selection:bg-blue-100">
      {/* Toast Notificación */}
      {modal.show && (
        <div className="fixed top-24 right-4 z-50 animate-fade-in-down">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${modal.isSuccess ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {modal.isSuccess ? <CheckCircle2 className="text-emerald-400" size={24} /> : <AlertCircle className="text-red-500" size={24} />}
            <span className="font-bold text-sm">{modal.message}</span>
            <button onClick={() => setModal({ show: false })} className="ml-3 text-zinc-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Hero Banner Principal */}
      {banners.length > 0 ? (
        <div className="w-full bg-gradient-to-r from-[#170020] via-[#330045] to-[#170020] text-white py-16 px-4 sm:px-6 lg:px-8 shadow-inner border-b border-fuchsia-900/50 relative overflow-hidden">
          {/* Subtle neon glowing backdrops matching the flyer */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="md:w-1/2 space-y-5 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 text-fuchsia-300 font-bold text-xs uppercase tracking-wider backdrop-blur-xs border border-fuchsia-500/30">
                <Sparkles size={14} className="text-amber-400" /> UNICA Perfumería • Edición Nº 50
              </span>
              <h1 className="text-4xl md:text-6xl font-black font-serif leading-tight tracking-tight text-white">{banners[0].title}</h1>
              {banners[0].subtitle && <p className="text-lg text-fuchsia-100/90 max-w-lg leading-relaxed font-sans">{banners[0].subtitle}</p>}
              {banners[0].buttonText && (
                <div>
                  <button 
                    onClick={() => handleBannerClick(banners[0])} 
                    className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 px-8 py-3.5 rounded-2xl font-black transition-all shadow-xl shadow-amber-500/20 transform hover:-translate-y-0.5 cursor-pointer font-sans"
                  >
                    {banners[0].buttonText}
                  </button>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 flex justify-center md:justify-end">
              <div 
                onClick={() => handleBannerClick(banners[0])} 
                className="w-full max-w-md h-80 bg-white/10 backdrop-blur-md rounded-3xl border border-fuchsia-500/30 shadow-2xl flex items-center justify-center overflow-hidden p-2 cursor-pointer hover:scale-105 transition-transform"
                title={banners[0].title}
              >
                {banners[0].imageUrl ? (
                  <img src={banners[0].imageUrl} alt={banners[0].title} className="w-full h-full object-contain rounded-2xl" />
                ) : (
                  <span className="text-white/60 font-bold text-xl">Lanzamiento Exclusivo</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-gradient-to-r from-[#170020] via-[#330045] to-[#170020] text-white py-14 px-4 sm:px-6 lg:px-8 shadow-md border-b border-fuchsia-900/50">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-4 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-bold text-xs uppercase tracking-wider backdrop-blur-xs border border-fuchsia-500/30">
                <Sparkles size={14} className="text-amber-400" /> Catálogo Oficial UNICA
              </span>
              <h1 className="text-4xl md:text-5xl font-black font-serif tracking-tight">Esencialmente Bueno, <br/><span className="text-amber-400">Fragancias Exclusivas</span></h1>
              <p className="text-fuchsia-100/90 max-w-lg text-base">Descubrí las colecciones Premium, Árabe, Difusores y Aromaterapia Sumeria de la Edición Nº 50.</p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/10 border border-fuchsia-500/30 backdrop-blur-md p-6 rounded-3xl text-center shadow-xl max-w-xs">
                <Sparkles className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                <p className="font-bold text-lg font-serif text-white">Promo por Cantidad</p>
                <div className="text-xs text-fuchsia-200 mt-2 space-y-1">
                  <p><strong className="text-amber-300 font-bold">5+ unidades:</strong> 10% de DESCUENTO</p>
                  <p><strong className="text-emerald-300 font-bold">10+ unidades:</strong> 20% OFF + Envío Bonificado</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Catálogo de Productos y Filtros */}
      <div id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 scroll-mt-24">
        
        {/* Filtros de Categorías Dinámicas */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Categorías disponibles
              </h2>
              {selectedCategory !== 'all' && (
                <button 
                  onClick={() => setSelectedCategory('all')} 
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Restablecer filtro
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#250133] text-white shadow-md shadow-fuchsia-950/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Todas las categorías ({products.length})
              </button>
              {categories.map(cat => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#3b0052] text-white shadow-md shadow-fuchsia-900/30'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-fuchsia-900 text-fuchsia-200' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Barra de Herramientas y Selector de Visualización (Lista vs Cuadrícula) */}
        <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Buscador Rápido */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o detalle..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            
            {/* Selector de Orden */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold hidden sm:inline">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="default">Más relevantes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
              </select>
            </div>

            {/* Toggle de Agudeza Visual: Cuadrícula vs Lista */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => toggleViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista en Cuadrícula"
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">Cuadrícula</span>
              </button>
              
              <button
                type="button"
                onClick={() => toggleViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Vista en Lista (Mejor lectura y detalles)"
              >
                <List size={16} />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>

          </div>
        </div>

        {/* Indicador de resultados */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-semibold text-slate-500">
            Mostrando <span className="text-slate-900 font-bold">{filteredProducts.length > 0 ? `${startIndex + 1} - ${endIndex}` : '0'}</span> de <span className="text-slate-900 font-bold">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'producto' : 'productos'}
          </p>
          {totalPages > 1 && (
            <span className="text-xs font-bold text-fuchsia-950 bg-fuchsia-100/80 px-3 py-1 rounded-full border border-fuchsia-200">
              Página {currentPage} de {totalPages}
            </span>
          )}
        </div>

        {/* Contenedor de Productos */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-100 animate-pulse">
                <div className="bg-slate-200 h-44 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2 mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl text-center shadow-xs border border-slate-200 max-w-xl mx-auto my-8">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <PackageOpen size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">No se encontraron productos</h3>
            <p className="text-slate-500 text-sm mb-6">
              {products.length === 0 
                ? 'El catálogo se encuentra limpio y listo desde cero. Puedes comenzar creando productos en el Panel de Administrador.'
                : 'No hay productos que coincidan con la búsqueda o el filtro de categoría seleccionado.'}
            </p>
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => navigate('/admin')}
                className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
              >
                Ir al Panel Admin para crear productos
              </button>
            )}
            {products.length > 0 && selectedCategory !== 'all' && (
              <button 
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* ======================================================== */
          /* MODO CUADRÍCULA (GRID VIEW)                               */
          /* ======================================================== */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pb-12">
            {paginatedProducts.map(product => {
              const catObj = categories.find(c => c.id === product.categoryId);
              return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-xs border border-slate-200 hover:shadow-xl hover:border-fuchsia-400 transition-all duration-300 group flex flex-col overflow-hidden relative cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Badges superiores */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                    {product.stock <= 5 && product.stock > 0 ? (
                      <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        ¡Últimos {product.stock}!
                      </span>
                    ) : product.stock === 0 ? (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        Agotado
                      </span>
                    ) : (
                      <span></span>
                    )}

                    <span className="bg-[#170020]/90 text-amber-300 border border-fuchsia-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ml-auto">
                      5+ un: 10% OFF
                    </span>
                  </div>

                  {/* Imagen del producto */}
                  <div className="h-52 bg-slate-50/50 p-4 flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400?text=Sin+Foto';
                        }}
                      />
                    ) : (
                      <div className="w-28 h-28 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold text-center p-2">
                        {product.name}
                      </div>
                    )}
                  </div>
                  
                  {/* Información */}
                  <div className="p-4 flex flex-col flex-1">
                    {catObj && (
                      <span className="text-[11px] font-bold text-fuchsia-800 uppercase tracking-wider mb-1 line-clamp-1">
                        {catObj.name}
                      </span>
                    )}

                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug min-h-[38px] group-hover:text-fuchsia-700 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto pt-4">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {product.promotionalPrice && product.promotionalPrice < product.price ? (
                          <>
                            <span className="text-xl sm:text-2xl font-black text-fuchsia-950 font-serif tracking-tight">
                              ${Number(product.promotionalPrice).toLocaleString('es-AR')}
                            </span>
                            <span className="text-xs text-slate-400 line-through font-semibold">
                              ${Number(product.price).toLocaleString('es-AR')}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-black text-slate-900 tracking-tight font-serif">
                            ${Number(product.price).toLocaleString('es-AR')}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-[11px] text-zinc-500 font-bold mt-1 flex items-center gap-1">
                        <Truck size={12} className="text-fuchsia-600" /> Envíos a todo el país
                      </p>
                    </div>
                  </div>

                  {/* Botón flotante al hover */}
                  <div className="p-3 pt-0">
                    <button 
                      onClick={(e) => handleAddToCart(product.id, e)}
                      disabled={product.stock === 0}
                      className="w-full bg-[#1f002b] text-white py-2.5 rounded-xl font-bold text-xs hover:bg-fuchsia-700 transition-colors disabled:bg-slate-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <ShoppingCart size={14} />
                      {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================================================== */
          /* MODO LISTA (LIST VIEW) - MÁXIMA AGUDEZA VISUAL           */
          /* ======================================================== */
          <div className="flex flex-col gap-4 pb-12">
            {paginatedProducts.map(product => {
              const catObj = categories.find(c => c.id === product.categoryId);
              return (
                <div 
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col md:flex-row items-center gap-6 cursor-pointer group"
                >
                  {/* Imagen grande en vista lista */}
                  <div className="w-full md:w-56 h-52 bg-slate-50 rounded-2xl p-4 flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-slate-100">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400?text=Sin+Foto';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm text-center">
                        Sin Imagen
                      </div>
                    )}

                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                        ¡Últimos {product.stock}!
                      </span>
                    )}
                  </div>

                  {/* Detalles centrales (Agudeza Visual: jerarquía clara) */}
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      {catObj && (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                          {catObj.name}
                        </span>
                      )}
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200 flex items-center gap-1">
                        <Sparkles size={13} className="text-amber-500" /> 5+ un: 10% OFF | 10+ un: 20% OFF + Envío Bonificado
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {product.description && (
                      <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-bold text-slate-500 pt-2">
                      <span className="flex items-center gap-1.5 text-zinc-500">
                        <Truck size={15} className="text-rose-500" /> Envíos a todo el país
                      </span>
                      <span>•</span>
                      <span className={product.stock > 0 ? 'text-slate-600' : 'text-red-500'}>
                        {product.stock > 0 ? `Stock disponible: ${product.stock} unidades` : 'Sin stock disponible'}
                      </span>
                    </div>
                  </div>

                  {/* Panel Derecho: Precio y Acción rápida */}
                  <div className="w-full md:w-64 flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 font-semibold block">
                        {product.promotionalPrice && product.promotionalPrice < product.price ? 'Precio promocional' : 'Precio final'}
                      </span>
                      {product.promotionalPrice && product.promotionalPrice < product.price ? (
                        <div>
                          <span className="text-2xl md:text-3xl font-black text-rose-600 tracking-tight">
                            ${Number(product.promotionalPrice).toLocaleString('es-AR')}
                          </span>
                          <span className="text-xs text-slate-400 line-through font-semibold block">
                            Lista: ${Number(product.price).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                          ${Number(product.price).toLocaleString('es-AR')}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-600 block">en 1 pago</span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(product.id, e)}
                      disabled={product.stock === 0}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md shadow-blue-500/20 disabled:bg-slate-300 flex items-center gap-2 cursor-pointer text-sm whitespace-nowrap"
                    >
                      <ShoppingCart size={16} />
                      {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginación - 20 productos por página */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium text-center sm:text-left">
              Página <strong className="text-slate-800 font-bold">{currentPage}</strong> de <strong className="text-slate-800 font-bold">{totalPages}</strong> (Mostrando {startIndex + 1} a {endIndex} de {filteredProducts.length} productos)
            </span>
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {getPaginationPages().map((page, idx) => (
                typeof page === 'number' ? (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#3b0052] text-white shadow-md shadow-fuchsia-950/30 font-black'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-100 bg-white'
                    }`}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={idx} className="px-1 text-slate-400 font-bold text-xs select-none">
                    ...
                  </span>
                )
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all cursor-pointer"
                title="Página siguiente"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
