import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Users, Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle, 
  X, Edit, Trash2, Plus, Minus, LogOut, ArrowLeft, Wand2, Download, 
  Gift, Layers, Eye, MousePointerClick, Activity, Percent, ArrowUpRight, 
  CheckCircle2, Clock, BarChart3, Flame, ExternalLink, RefreshCw, ShoppingCart, Info,
  Menu, Tag, BookOpen, Upload, FileText, Sparkles
} from 'lucide-react';
import html2canvas from 'html2canvas';
import ImageUploader from '../components/ImageUploader';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chartTab, setChartTab] = useState('traffic'); // 'traffic' | 'revenue' | 'orders'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [loyaltySettings, setLoyaltySettings] = useState(null);

  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, type: null });
  const [formData, setFormData] = useState({});

  // Catálogo Mensual (Libro UNICA)
  const [catalogStatus, setCatalogStatus] = useState(null);
  const [syncingCatalog, setSyncingCatalog] = useState(false);
  const [catalogModal, setCatalogModal] = useState({ isOpen: false, edition: '', rawJson: '', fileLoading: false });

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const res = await api.get('/admin/metrics');
        if (res.data.success) setMetrics(res.data.data);
      } else if (activeTab === 'products') {
        const res = await api.get('/admin/products');
        if (res.data.success) setProducts(res.data.data);
      } else if (activeTab === 'categories') {
        const res = await api.get('/admin/categories');
        if (res.data.success) setCategories(res.data.data);
      } else if (activeTab === 'orders') {
        const res = await api.get('/admin/orders');
        if (res.data.success) setOrdersList(res.data.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        if (res.data.success) setUsersList(res.data.data);
      } else if (activeTab === 'offers') {
        const res = await api.get('/admin/banners');
        if (res.data.success) setBanners(res.data.data);
      } else if (activeTab === 'coupons') {
        const res = await api.get('/admin/coupons');
        if (res.data.success) setCoupons(res.data.data);
      } else if (activeTab === 'loyalty' || activeTab === 'referrals') {
        const res = await api.get('/admin/loyalty/settings');
        if (res.data.success) setLoyaltySettings(res.data.data);
        const resUsers = await api.get('/admin/users'); // We need users for their points
        if (resUsers.data.success) setUsersList(resUsers.data.data);
      } else if (activeTab === 'catalog') {
        const res = await api.get('/admin/catalog/status');
        if (res.data.success) setCatalogStatus(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, type) => {
    setDeleteModal({ isOpen: true, id, type });
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/admin/${deleteModal.type}/${deleteModal.id}`);
      setDeleteModal({ isOpen: false, id: null, type: null });
      fetchData();
      toast.success('Eliminado correctamente');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, newPaymentStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus, paymentStatus: newPaymentStatus });
      toast.success('Estado del pedido actualizado');
      fetchData();
    } catch (e) {
      toast.error('Error al actualizar pedido');
    }
  };

  const handleOpenModal = async (type, data = null) => {
    setFormData(data || {});
    setModal({ isOpen: true, type, data });
    if (type === 'product' && categories.length === 0) {
      try {
        const res = await api.get('/admin/categories');
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        console.error('Error fetching categories for product modal', err);
      }
    }
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, type: '', data: null });
    setFormData({});
  };

  const handleGenerateCode = () => {
    const chars = '0123456789ABCDEF';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData({ ...formData, code });
  };

  const handleDownloadCoupon = async (couponId) => {
    const el = document.getElementById(`coupon-card-${couponId}`);
    if (!el) return;
    try {
      const canvas = await html2canvas(el, { backgroundColor: null });
      const link = document.createElement('a');
      link.download = `cupon-${couponId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (e) {
      console.error(e);
      toast.error('Error al descargar la imagen');
    }
  };

  const handleDownloadReport = async () => {
    const el = document.getElementById('admin-dashboard-container');
    if (!el) return;
    try {
      toast.loading('Generando reporte visual...', { id: 'report' });
      const canvas = await html2canvas(el, { backgroundColor: '#f4f4f5', scale: 2 });
      const link = document.createElement('a');
      link.download = `reporte-analitica-unica-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Reporte descargado con éxito', { id: 'report' });
    } catch (e) {
      console.error(e);
      toast.error('Error al exportar reporte', { id: 'report' });
    }
  };

  const handleSyncCatalogDefaults = async () => {
    if (!window.confirm('¿Deseas sincronizar todos los productos oficiales del Libro UNICA 50? Esto garantizará que todos los productos, categorías y precios estén actualizados.')) return;
    try {
      setSyncingCatalog(true);
      toast.loading('Sincronizando catálogo con el libro oficial...', { id: 'sync-cat' });
      const res = await api.post('/admin/catalog/sync-defaults');
      if (res.data.success) {
        toast.success(res.data.message || 'Catálogo sincronizado exitosamente', { id: 'sync-cat' });
        fetchData();
      } else {
        toast.error(res.data.message || 'Error al sincronizar', { id: 'sync-cat' });
      }
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || err.message), { id: 'sync-cat' });
    } finally {
      setSyncingCatalog(false);
    }
  };

  const handleClearCatalog = async () => {
    if (!window.confirm('¿Estás seguro de que deseas vaciar por completo el catálogo? Se borrarán los productos actuales para dejar la tienda lista para el nuevo libro.')) return;
    try {
      setSyncingCatalog(true);
      toast.loading('Vaciando catálogo...', { id: 'clear-cat' });
      const res = await api.post('/admin/catalog/clear', { clearCategories: false });
      if (res.data.success) {
        toast.success(res.data.message || 'Catálogo limpiado con éxito', { id: 'clear-cat' });
        fetchData();
      } else {
        toast.error(res.data.message || 'Error al vaciar catálogo', { id: 'clear-cat' });
      }
    } catch (err) {
      toast.error('Error: ' + (err.response?.data?.message || err.message), { id: 'clear-cat' });
    } finally {
      setSyncingCatalog(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Por favor selecciona un archivo PDF (.pdf)');
      return;
    }
    try {
      setSyncingCatalog(true);
      toast.loading(`Subiendo y procesando libro PDF "${file.name}"...`, { id: 'upload-pdf' });
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result.split(',')[1];
          const res = await api.post('/admin/catalog/upload-pdf', {
            pdfBase64: base64,
            filename: file.name,
            edition: catalogModal.edition || file.name.replace(/\.[^/.]+$/, "")
          });
          if (res.data.success) {
            toast.success(res.data.message || '¡Libro PDF cargado y procesado exitosamente!', { id: 'upload-pdf' });
            setCatalogModal({ isOpen: false, edition: '', rawJson: '', fileLoading: false });
            fetchData();
          } else {
            toast.error(res.data.message || 'Error procesando PDF', { id: 'upload-pdf' });
          }
        } catch (postErr) {
          toast.error('Error al procesar PDF: ' + (postErr.response?.data?.message || postErr.message), { id: 'upload-pdf' });
        } finally {
          setSyncingCatalog(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Error al leer el archivo PDF');
      setSyncingCatalog(false);
    }
  };

  const handleImportCatalogSubmit = async (e) => {
    e.preventDefault();
    if (!catalogModal.rawJson.trim()) {
      toast.error('Por favor ingresa o carga los datos del catálogo en formato JSON');
      return;
    }
    try {
      setSyncingCatalog(true);
      toast.loading('Procesando e importando catálogo...', { id: 'import-cat' });
      const parsed = JSON.parse(catalogModal.rawJson);
      const payload = {
        edition: catalogModal.edition || parsed.edition || 'Nueva Edición',
        categories: parsed.categories || [],
        products: parsed.products || (Array.isArray(parsed) ? parsed : [])
      };
      const res = await api.post('/admin/catalog/import', payload);
      if (res.data.success) {
        toast.success(res.data.message || '¡Catálogo importado exitosamente!', { id: 'import-cat' });
        setCatalogModal({ isOpen: false, edition: '', rawJson: '', fileLoading: false });
        fetchData();
      } else {
        toast.error(res.data.message || 'Error en importación', { id: 'import-cat' });
      }
    } catch (err) {
      toast.error('Error al parsear o importar JSON: ' + (err.response?.data?.message || err.message), { id: 'import-cat' });
    } finally {
      setSyncingCatalog(false);
    }
  };

  const handleFileUploadCatalog = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        setCatalogModal(prev => ({ ...prev, rawJson: text }));
        toast.success(`Archivo "${file.name}" cargado`);
      } catch (err) {
        toast.error('Error leyendo archivo');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCatalog = async () => {
    try {
      toast.loading('Exportando catálogo...', { id: 'export-cat' });
      const res = await api.get('/admin/products');
      const catsRes = await api.get('/admin/categories');
      if (res.data.success) {
        const dataToExport = {
          edition: catalogStatus?.activeEdition || 'UNICA Perfumería',
          exportDate: new Date().toISOString(),
          categories: catsRes.data.data || [],
          products: res.data.data || []
        };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `catalogo-unica-perfumeria-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Catálogo exportado exitosamente', { id: 'export-cat' });
      }
    } catch (err) {
      toast.error('Error al exportar catálogo', { id: 'export-cat' });
    }
  };

  const handleSaveLoyalty = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/loyalty/settings/${loyaltySettings.id}`, loyaltySettings);
      toast.success('Ajustes guardados');
    } catch (e) {
      toast.error('Error al guardar ajustes');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'name' && (!formData.id || !formData.slug)) {
      const autoSlug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, name: value, slug: autoSlug }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = !!formData.id;
      if (modal.type === 'category') {
        if (isEdit) await api.put(`/admin/categories/${formData.id}`, formData);
        else await api.post('/admin/categories', formData);
      } else if (modal.type === 'product') {
        if (isEdit) await api.put(`/admin/products/${formData.id}`, formData);
        else await api.post('/admin/products', formData);
      } else if (modal.type === 'banner') {
        if (isEdit) await api.put(`/admin/banners/${formData.id}`, formData);
        else await api.post('/admin/banners', formData);
      } else if (modal.type === 'coupon') {
        if (isEdit) await api.put(`/admin/coupons/${formData.id}`, formData);
        else await api.post('/admin/coupons', formData);
      }
      toast.success('Guardado correctamente');
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error('Error al guardar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleModifyUserPoints = async (e) => {
    e.preventDefault();
    const amount = parseInt(formData.pointsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Cantidad inválida');
      return;
    }

    try {
      await api.post(`/admin/loyalty/users/${formData.userId}/points`, { action: formData.action, amount });
      fetchData(); // Refresh users list
      handleCloseModal();
      toast.success('Puntos modificados con éxito');
    } catch (error) {
      toast.error('Error al modificar puntos: ' + (error.response?.data?.message || error.message));
    }
  };

  const openPointsModal = (userId, action) => {
    setFormData({ userId, action, pointsAmount: '' });
    setModal({ isOpen: true, type: 'points', data: null });
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md border border-zinc-200">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 mb-2">Acceso Denegado</h2>
          <p className="text-zinc-500 mb-8">Esta área es exclusiva para administradores.</p>
          <button onClick={() => navigate('/')} className="w-full bg-zinc-900 text-white font-bold py-3 rounded-xl hover:bg-zinc-800 transition-colors">Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-h-screen w-full bg-zinc-100 font-sans overflow-hidden">
      {/* Sidebar Admin (Desktop Fijo - No afectado por el scroll de analíticas) */}
      <aside className="bg-zinc-900 text-zinc-300 flex-col hidden md:flex shrink-0 h-screen w-20 hover:w-64 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap group z-40 shadow-2xl relative select-none">
        <div className="h-20 flex items-center px-6 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="min-w-[2rem] h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-900 font-bold text-xl">A</div>
            <span className="text-xl font-black text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">Admin<span className="text-emerald-500">Panel</span></span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><TrendingUp size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'products' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><Package size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Productos</span>
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'categories' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><Layers size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Categorías</span>
          </button>
          <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'catalog' ? 'bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20' : 'hover:bg-zinc-800 hover:text-rose-300 text-rose-400'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><BookOpen size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Libro / Catálogo</span>
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><ShoppingBag size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Pedidos</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'users' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><Users size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Clientes</span>
          </button>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold text-zinc-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">Marketing</p>
          </div>
          
          <button onClick={() => setActiveTab('offers')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'offers' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Ofertas / Banners</span>
          </button>
          
          <button onClick={() => setActiveTab('coupons')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'coupons' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
            </div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Cupones</span>
          </button>
          
          <button onClick={() => setActiveTab('loyalty')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'loyalty' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><Gift size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Programa de Puntos</span>
          </button>
          <button onClick={() => setActiveTab('referrals')} className={`w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium transition-colors ${activeTab === 'referrals' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
            <div className="min-w-[1.5rem] flex justify-center"><Users size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Programa Referidos</span>
          </button>
        </nav>

        {/* User Session Bottom */}
        <div className="border-t border-zinc-800 p-3 space-y-2 shrink-0 bg-zinc-900">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium text-rose-400 hover:bg-zinc-800 hover:text-rose-300 transition-colors">
            <div className="min-w-[1.5rem] flex justify-center"><ArrowLeft size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Volver a UNICA</span>
          </button>
          
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-4 px-3 py-3 rounded-lg font-medium text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors">
            <div className="min-w-[1.5rem] flex justify-center"><LogOut size={24} /></div>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-wide">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Area de Contenido con Scroll Aislado */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header Superior Móvil (Visible solo en dispositivos < md) */}
        <div className="md:hidden flex items-center justify-between bg-zinc-900 text-white px-4 py-3 shrink-0 shadow-md z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-900 font-bold text-lg">A</div>
            <span className="font-black text-lg tracking-tight">Admin<span className="text-emerald-500">Panel</span></span>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="p-2 text-zinc-300 hover:text-white bg-zinc-800 rounded-lg focus:outline-none transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Drawer Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
            <div className="w-72 bg-zinc-900 text-zinc-300 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-zinc-900 font-bold text-lg">A</div>
                  <span className="font-black text-lg text-white">Admin<span className="text-emerald-500">Panel</span></span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-zinc-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <TrendingUp size={18} /> <span>Dashboard</span>
                </button>
                <button onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'products' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <Package size={18} /> <span>Productos</span>
                </button>
                <button onClick={() => { setActiveTab('categories'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'categories' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <Layers size={18} /> <span>Categorías</span>
                </button>
                <button onClick={() => { setActiveTab('catalog'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'catalog' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400 hover:bg-zinc-800'}`}>
                  <BookOpen size={18} /> <span>Libro / Catálogo</span>
                </button>
                <button onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'orders' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <ShoppingBag size={18} /> <span>Pedidos</span>
                </button>
                <button onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'users' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <Users size={18} /> <span>Clientes</span>
                </button>

                <div className="pt-3 pb-1 px-3">
                  <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Marketing</p>
                </div>

                <button onClick={() => { setActiveTab('offers'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'offers' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <Layers size={18} /> <span>Ofertas / Banners</span>
                </button>
                <button onClick={() => { setActiveTab('coupons'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'coupons' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <Tag size={18} /> <span>Cupones</span>
                </button>
                <button onClick={() => { setActiveTab('loyalty'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'loyalty' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <Gift size={18} /> <span>Programa de Puntos</span>
                </button>
                <button onClick={() => { setActiveTab('referrals'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'referrals' ? 'bg-emerald-500 text-zinc-900 font-bold' : 'hover:bg-zinc-800 hover:text-white'}`}>
                  <Users size={18} /> <span>Programa Referidos</span>
                </button>
              </nav>

              <div className="border-t border-zinc-800 p-3 space-y-2 shrink-0 bg-zinc-900">
                <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-rose-400 hover:bg-zinc-800">
                  <ArrowLeft size={18} /> <span>Volver a UNICA</span>
                </button>
                <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-red-400 hover:bg-zinc-800">
                  <LogOut size={18} /> <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* Main Content (Unico contenedor con scroll vertical) */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 md:p-8 w-full min-w-0">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {!loading && activeTab === 'dashboard' && (
          <div id="admin-dashboard-container" className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Analítica y Negocio</h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    En Vivo
                  </span>
                </div>
                <p className="text-zinc-500 text-sm">Estadísticas en tiempo real, tráfico de visitantes y visualizaciones de productos.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={fetchData} 
                  className="p-2.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 bg-white rounded-xl border border-zinc-200 transition-colors shadow-xs"
                  title="Actualizar datos"
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={handleDownloadReport}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2 text-sm"
                >
                  <Download size={18} /> Descargar Reporte
                </button>
              </div>
            </div>

            {/* Banner de Estado Comercial */}
            {Number(metrics?.orders || 0) === 0 && (
              <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-900 text-base flex items-center gap-2">
                      Monitoreo Inicial Activo: Aún sin ventas registradas ($0.00)
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">En Operación</span>
                    </h4>
                    <p className="text-zinc-600 text-sm mt-0.5 max-w-3xl">
                      ¡Tu tienda está lista y rastreando visitantes! A continuación verás exactamente el tráfico diario, las visualizaciones por producto y qué artículos despiertan mayor curiosidad. Usa esta información para planear ofertas y lograr tus primeras compras.
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab('products')} 
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                >
                  Ir al Catálogo <ArrowUpRight size={14} />
                </button>
              </div>
            )}

            {/* 8 Tarjetas KPI Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Ingresos */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-emerald-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ingresos Netos</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <DollarSign size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">
                  ${Number(metrics?.revenue || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className="font-semibold text-emerald-600">Ventas aprobadas</span>
                </div>
              </div>

              {/* Pedidos */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pedidos Concretados</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">{metrics?.orders || 0}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>{metrics?.pendingOrders || 0} pendientes de pago</span>
                </div>
              </div>

              {/* Visitas a la Web */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Visitas a la Web</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <MousePointerClick size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">{metrics?.totalVisits || 0}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                  <span>Tráfico de visitantes</span>
                </div>
              </div>

              {/* Vistas de Productos */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-cyan-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Vistas de Producto</span>
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                    <Eye size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">{metrics?.totalProductViews || 0}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-600 font-semibold">
                  <span>Interés en el catálogo</span>
                </div>
              </div>

              {/* Tasa de Conversión */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-amber-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tasa de Conversión</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Percent size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">{metrics?.conversionRate || '0.0%'}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>Compras / Visitas totales</span>
                </div>
              </div>

              {/* Ticket Promedio */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-pink-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Ticket Promedio</span>
                  <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">
                  ${Number(metrics?.averageTicket || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>Monto medio por pedido</span>
                </div>
              </div>

              {/* Clientes Registrados */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-violet-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Clientes Registrados</span>
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-violet-600">
                    <Users size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">{metrics?.users || 0}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>Cuentas de usuario</span>
                </div>
              </div>

              {/* Productos en Catálogo */}
              <div className="bg-white p-5 rounded-2xl shadow-xs border border-zinc-200 hover:border-emerald-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Productos en Tienda</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Package size={18} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black text-zinc-900">{metrics?.products || 0}</p>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span>Artículos publicados</span>
                </div>
              </div>
            </div>

            {/* Gráfico Principal Interactivo (Últimos 7 Días) */}
            <div className="bg-white p-6 rounded-2xl shadow-xs border border-zinc-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                    <Activity size={20} className="text-emerald-600" />
                    Rendimiento y Evolución (Últimos 7 Días)
                  </h3>
                  <p className="text-xs text-zinc-500">Rastreo de actividad en la plataforma día por día.</p>
                </div>
                {/* Selector de tipo de gráfico */}
                <div className="flex items-center bg-zinc-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setChartTab('traffic')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      chartTab === 'traffic' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Tráfico (Visitas y Vistas)
                  </button>
                  <button
                    onClick={() => setChartTab('revenue')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      chartTab === 'revenue' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Ingresos ($)
                  </button>
                  <button
                    onClick={() => setChartTab('orders')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      chartTab === 'orders' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    Pedidos
                  </button>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {chartTab === 'traffic' ? (
                    <AreaChart data={metrics?.trafficHistory || []}>
                      <defs>
                        <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorVistas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val, name) => [val, name === 'visitas' ? 'Visitas Web' : 'Vistas de Producto']}
                      />
                      <Legend verticalAlign="top" height={36} formatter={(val) => val === 'visitas' ? 'Visitas a la Web' : 'Vistas de Producto'} />
                      <Area type="monotone" dataKey="visitas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitas)" />
                      <Area type="monotone" dataKey="vistas" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorVistas)" />
                    </AreaChart>
                  ) : chartTab === 'revenue' ? (
                    <AreaChart data={metrics?.trafficHistory || []}>
                      <defs>
                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val) => [`$${Number(val).toLocaleString('es-AR')}`, 'Ingresos']}
                      />
                      <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={metrics?.trafficHistory || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(val) => [val, 'Pedidos Aprobados']}
                      />
                      <Bar dataKey="pedidos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Embudo de Conversión y Distribución de Categorías */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Embudo de Conversión */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-zinc-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">Embudo de Conversión</h3>
                      <p className="text-xs text-zinc-500">Recorrido del usuario desde que entra hasta la compra.</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                      {metrics?.conversionRate || '0.0%'} Conv.
                    </span>
                  </div>

                  <div className="space-y-4 my-4">
                    {(metrics?.funnel || []).map((step, idx) => {
                      const maxVal = Math.max(...(metrics?.funnel || []).map(s => s.count), 1);
                      const pct = Math.round((step.count / maxVal) * 100);
                      const colors = ['bg-indigo-500', 'bg-cyan-500', 'bg-amber-500', 'bg-emerald-500'];
                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-zinc-700 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-500">
                                {idx + 1}
                              </span>
                              {step.step}
                            </span>
                            <span className="font-bold text-zinc-900 font-mono">
                              {step.count} <span className="text-zinc-400 font-normal">({step.label})</span>
                            </span>
                          </div>
                          <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-500`}
                              style={{ width: `${Math.max(pct, step.count > 0 ? 4 : 0)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs text-zinc-500 flex items-center gap-2 mt-4">
                  <Info size={16} className="text-zinc-400 shrink-0" />
                  <span>Para elevar la conversión final, asegúrate de mantener fotos atractivas y precios competitivos.</span>
                </div>
              </div>

              {/* Distribución por Categorías */}
              <div className="bg-white p-6 rounded-2xl shadow-xs border border-zinc-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-1">Catálogo por Categoría</h3>
                  <p className="text-xs text-zinc-500 mb-4">Proporción de productos y movimiento por rubro.</p>
                  
                  {(!metrics?.categoryDistribution || metrics.categoryDistribution.length === 0) ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                      <ShoppingBag size={40} className="text-zinc-300 mb-2" />
                      <p className="font-bold text-zinc-600 text-sm">Sin categorías creadas</p>
                      <p className="text-xs mt-1 max-w-xs">Crea categorías y asigna productos para ver la gráfica de distribución.</p>
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={metrics.categoryDistribution} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={55} 
                            outerRadius={85} 
                            paddingAngle={4} 
                            dataKey="value"
                            nameKey="name"
                          >
                            {metrics.categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                            formatter={(val, name, entry) => [`${val} productos (${entry.payload.views || 0} vistas)`, entry.payload.name]}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {metrics?.categoryDistribution && metrics.categoryDistribution.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-zinc-100 text-xs">
                    {metrics.categoryDistribution.slice(0, 4).map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg">
                        <span className="font-medium text-zinc-700 truncate">{c.name}</span>
                        <span className="text-zinc-500 font-mono">{c.views || 0} vistas</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Visualizaciones por Producto (MÁS VISTOS) y MÁS VENDIDOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Visualizaciones por Producto */}
              <div className="bg-white rounded-2xl shadow-xs border border-zinc-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <Flame size={18} className="text-amber-500" />
                      Productos con Más Visualizaciones
                    </h3>
                    <p className="text-xs text-zinc-500">Mide con precisión qué artículos generan más interés en tu tienda.</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    Interés Real
                  </span>
                </div>

                <div className="p-4 flex-1">
                  {(!metrics?.topProductsByViews || metrics.topProductsByViews.length === 0) ? (
                    <div className="py-12 text-center text-zinc-400">
                      <Eye size={36} className="mx-auto text-zinc-300 mb-2" />
                      <p className="font-bold text-zinc-700 text-sm">Aún no hay vistas registradas</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                        A medida que los usuarios naveguen y hagan clic en tus productos, aparecerán aquí ordenados por popularidad.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metrics.topProductsByViews.map((p, idx) => {
                        return (
                          <div key={p.id} className="p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-colors flex items-center justify-between gap-3 bg-white">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-extrabold shrink-0 ${
                                idx === 0 ? 'bg-amber-100 text-amber-800' :
                                idx === 1 ? 'bg-zinc-200 text-zinc-800' :
                                idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-zinc-100 text-zinc-600'
                              }`}>
                                #{idx + 1}
                              </span>
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.name} className="w-11 h-11 rounded-lg object-contain bg-zinc-50 border border-zinc-100 p-0.5 shrink-0" />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">Sin foto</div>
                              )}
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-zinc-900 truncate">{p.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-500">
                                  <span className="text-emerald-600 font-bold">${Number(p.price).toLocaleString('es-AR')}</span>
                                  <span>•</span>
                                  <span className="truncate">{p.categoryName}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="flex items-center justify-end gap-1.5 text-blue-600 font-bold text-sm">
                                <Eye size={15} /> {p.views} vistas
                              </div>
                              <div className="text-[11px] text-zinc-400 mt-0.5">
                                {p.salesCount} vendidos • {p.conversionRate} conv.
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Productos Más Vendidos */}
              <div className="bg-white rounded-2xl shadow-xs border border-zinc-200 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                      <ShoppingBag size={18} className="text-emerald-600" />
                      Productos Más Vendidos (Bestsellers)
                    </h3>
                    <p className="text-xs text-zinc-500">Artículos con mayor cantidad de unidades compradas.</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    Ventas
                  </span>
                </div>

                <div className="p-4 flex-1">
                  {(!metrics?.topProductsBySales || metrics.topProductsBySales.filter(p => p.salesCount > 0).length === 0) ? (
                    <div className="py-12 text-center text-zinc-400">
                      <ShoppingBag size={36} className="mx-auto text-zinc-300 mb-2" />
                      <p className="font-bold text-zinc-700 text-sm">Sin ventas concretadas todavía</p>
                      <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                        En cuanto un cliente complete su primera compra, verás aquí el ranking en tiempo real de los artículos más vendidos y la recaudación que generan.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metrics.topProductsBySales.filter(p => p.salesCount > 0).map((p, idx) => (
                        <div key={p.id} className="p-3 rounded-xl border border-zinc-100 flex items-center justify-between gap-3 bg-white">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-extrabold shrink-0">
                              #{idx + 1}
                            </span>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt={p.name} className="w-11 h-11 rounded-lg object-contain bg-zinc-50 border border-zinc-100 p-0.5 shrink-0" />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-400 shrink-0">Sin foto</div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-zinc-900 truncate">{p.name}</h4>
                              <span className="text-xs text-zinc-500">${Number(p.price).toLocaleString('es-AR')}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-black text-emerald-600 text-sm">
                              {p.salesCount} unidades
                            </div>
                            <div className="text-[11px] text-zinc-400 mt-0.5">
                              ${Number(p.revenue).toLocaleString('es-AR')} facturado
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50">
              <h3 className="text-xl font-bold text-zinc-800">Catálogo de Productos</h3>
              <button onClick={() => handleOpenModal('product')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Plus size={18}/> Nuevo Producto
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Imagen</th>
                    <th className="p-4 font-bold">Producto</th>
                    <th className="p-4 font-bold">Precio</th>
                    <th className="p-4 font-bold">Stock</th>
                    <th className="p-4 font-bold">Métricas Web</th>
                    <th className="p-4 font-bold">Puntos</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-10 text-center text-zinc-500">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="w-12 h-12 text-zinc-300 mb-2" />
                          <p className="font-bold text-zinc-700">No hay productos en el catálogo</p>
                          <p className="text-xs text-zinc-400 mt-1">Presiona "Nuevo Producto" para agregar el primero con foto desde tu ordenador o cámara.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {products.map(p => {
                    const catObj = categories.find(c => c.id === p.categoryId);
                    return (
                      <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="p-4">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-14 h-14 rounded-xl object-contain bg-white border border-zinc-200 p-1 shadow-xs" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 text-[11px] font-medium">Sin foto</div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-zinc-800 text-base">{p.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {catObj && (
                              <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                                {catObj.name}
                              </span>
                            )}
                            <span className="text-xs text-zinc-400 font-mono">{p.slug}</span>
                          </div>
                        </td>
                        <td className="p-4 text-emerald-600 font-bold text-base">${Number(p.price).toLocaleString('es-AR')}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${p.stock > 5 ? 'bg-emerald-50 text-emerald-700' : p.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                            {p.stock} un.
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                              <Eye size={13} /> {p.views || 0} vistas
                            </span>
                            <span className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                              <ShoppingBag size={13} className="text-emerald-500" /> {p.salesCount || 0} ventas
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {p.points > 0 ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <Gift size={13} /> +{p.points} pts
                            </span>
                          ) : (
                            <span className="text-xs text-zinc-400">0 pts</span>
                          )}
                        </td>
                        <td className="p-4 flex justify-end gap-2 pt-6">
                          <button onClick={() => handleOpenModal('product', p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar"><Edit size={18}/></button>
                          <button onClick={() => confirmDelete(p.id, 'products')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50">
              <h3 className="text-xl font-bold text-zinc-800">Categorías</h3>
              <button onClick={() => handleOpenModal('category')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Plus size={18}/> Nueva Categoría
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Nombre</th>
                    <th className="p-4 font-bold">Slug</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {categories.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-zinc-500">No hay categorías. Crea una.</td></tr>}
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4 font-bold text-zinc-800">{c.name}</td>
                      <td className="p-4 text-zinc-500">{c.slug}</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleOpenModal('category', c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                        <button onClick={() => confirmDelete(c.id, 'categories')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Gestión de Pedidos y Compras</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Controla pedidos pagados, cancelados y compras pendientes de la tienda.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-zinc-200 text-zinc-700 rounded-lg">
                {ordersList.length} pedidos registrados
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[850px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">ID / Fecha</th>
                    <th className="p-4 font-bold">Cliente</th>
                    <th className="p-4 font-bold">Productos</th>
                    <th className="p-4 font-bold">Total</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {ordersList.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-zinc-500">
                        <ShoppingBag className="w-12 h-12 text-zinc-300 mx-auto mb-2" />
                        <p className="font-bold text-zinc-700">No hay pedidos registrados</p>
                        <p className="text-xs text-zinc-400 mt-1">Los pedidos de tus clientes aparecerán aquí automáticamente.</p>
                      </td>
                    </tr>
                  )}
                  {ordersList.map(ord => (
                    <tr key={ord.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-xs font-bold text-zinc-700">#{ord.id.slice(0, 8)}</span>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-900">{ord.userName}</div>
                        <div className="text-xs text-zinc-500">{ord.userEmail}</div>
                        {ord.shippingAddress && <div className="text-[11px] text-zinc-400 truncate max-w-xs">{ord.shippingAddress}</div>}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 max-w-xs">
                          {ord.items?.map((it, idx) => (
                            <div key={idx} className="text-xs text-zinc-700 flex items-center gap-1.5">
                              <span className="font-bold text-zinc-900">{it.quantity}x</span>
                              <span className="truncate">{it.productName}</span>
                              <span className="text-zinc-400 font-mono">(${Number(it.price).toLocaleString('es-AR')})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-black text-emerald-600 text-base">
                        ${Number(ord.totalAmount).toLocaleString('es-AR')}
                      </td>
                      <td className="p-4">
                        {ord.paymentStatus === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Aprobado
                          </span>
                        ) : ord.paymentStatus === 'CANCELLED' || ord.status === 'CANCELLED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                            Cancelado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {ord.paymentStatus !== 'APPROVED' && (
                            <>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'APPROVED', 'APPROVED')}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors"
                                title="Marcar como Aprobado"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, 'CANCELLED', 'CANCELLED')}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-colors"
                                title="Marcar como Cancelado"
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => confirmDelete(ord.id, 'orders')}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar Pedido"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-200 bg-zinc-50">
              <h3 className="text-xl font-bold text-zinc-800">Directorio de Clientes</h3>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Cliente</th>
                    <th className="p-4 font-bold">Contacto</th>
                    <th className="p-4 font-bold">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4 font-bold text-zinc-800">{u.name}</td>
                      <td className="p-4 text-zinc-500"><div>{u.email}</div><div className="text-xs">{u.phone || 'N/A'}</div></td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'offers' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50">
              <h3 className="text-xl font-bold text-zinc-800">Generador de Ofertas (Banners)</h3>
              <button onClick={() => handleOpenModal('banner')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Plus size={18}/> Nuevo Banner
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Título</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {banners.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-zinc-500">No hay banners. Crea uno.</td></tr>}
                  {banners.map(b => (
                    <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4 font-bold text-zinc-800">{b.title}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${b.active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{b.active ? 'Activo' : 'Inactivo'}</span></td>
                      <td className="p-4 flex justify-end gap-2">
                        <button onClick={() => handleOpenModal('banner', b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                        <button onClick={() => confirmDelete(b.id, 'banners')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'coupons' && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50">
              <div>
                <h3 className="text-xl font-bold text-zinc-800">Códigos de Descuento</h3>
                <p className="text-sm text-zinc-500 mt-1">Crea cupones para fechas especiales como Black Friday o Navidad.</p>
              </div>
              <button onClick={() => handleOpenModal('coupon')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Plus size={18}/> Nuevo Cupón
              </button>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Campaña / Código</th>
                    <th className="p-4 font-bold">Descuento</th>
                    <th className="p-4 font-bold">Vigencia</th>
                    <th className="p-4 font-bold">Estado</th>
                    <th className="p-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {coupons.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-zinc-500">No hay cupones. Crea uno.</td></tr>}
                  {coupons.map(c => (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-zinc-800">{c.name}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest">{c.code}</div>
                        <div id={`coupon-card-${c.id}`} className="mt-2 inline-block bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl shadow-md w-48 relative overflow-hidden">
                          <div className="absolute -right-4 -top-4 w-12 h-12 bg-white/20 rounded-full"></div>
                          <div className="absolute -left-2 -bottom-2 w-8 h-8 bg-white/20 rounded-full"></div>
                          <div className="relative z-10 text-center">
                            <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">{c.name}</span>
                            <span className="block text-xl font-black tracking-widest my-1">{c.code}</span>
                            <span className="block text-sm font-semibold">{c.discountPercentage}% OFF</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-emerald-600">{c.discountPercentage}% OFF</td>
                      <td className="p-4 text-zinc-500">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Sin límite'}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded-md text-xs font-bold ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{c.active ? 'Activo' : 'Inactivo'}</span></td>
                      <td className="p-4 flex flex-col justify-end gap-2 items-end">
                        <div className="flex gap-2">
                          <button onClick={() => handleDownloadCoupon(c.id)} title="Descargar Tarjetita" className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Download size={18}/></button>
                          <button onClick={() => handleOpenModal('coupon', c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18}/></button>
                          <button onClick={() => confirmDelete(c.id, 'coupons')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'loyalty' && loyaltySettings && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden p-6 max-w-4xl">
            <h3 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2"><Gift className="text-emerald-500"/> Programa de Puntos</h3>
            
            <form onSubmit={handleSaveLoyalty} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 bg-zinc-50 p-6 rounded-xl border border-zinc-100">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Consigna de la semana (Puntos Objetivo)</label>
                <input type="number" value={loyaltySettings.minPointsToRedeem} onChange={(e) => setLoyaltySettings({...loyaltySettings, minPointsToRedeem: e.target.value})} className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                <p className="text-xs text-zinc-500 mt-1">Ej: 1000 pts para ganar un código de descuento</p>
              </div>
              <div className="flex justify-end items-end">
                <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-colors">Guardar Consigna</button>
              </div>
            </form>

            <h4 className="text-lg font-bold text-zinc-800 mb-4">Ranking de Clientes</h4>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Usuario</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Gastado</th>
                    <th className="p-4 font-bold">Referidos</th>
                    <th className="p-4 font-bold text-right">Puntos Acumulados</th>
                    <th className="p-4 font-bold text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {usersList.filter(u => u.role === 'CLIENT').sort((a,b) => (b.totalSpent||0) - (a.totalSpent||0)).map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50">
                      <td className="p-4 font-bold text-zinc-800">{u.name}</td>
                      <td className="p-4 text-zinc-500">{u.email}</td>
                      <td className="p-4 font-bold text-slate-700">${(u.totalSpent || 0).toFixed(2)}</td>
                      <td className="p-4 text-zinc-600 font-bold">{u.referralsCount || 0} usuarios</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-4">
                          <span className="font-black text-emerald-600 text-lg">{u.points || 0} pts</span>
                          <div className="flex gap-2">
                            <button onClick={() => openPointsModal(u.id, 'add')} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition" title="Sumar puntos"><Plus size={16}/></button>
                            <button onClick={() => openPointsModal(u.id, 'deduct')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition" title="Restar puntos"><Minus size={16}/></button>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <a href={`mailto:${u.email}?subject=Novedades de UNICA Perfumería&body=Hola ${u.name}, tenemos novedades exclusivas para ti en UNICA Perfumería...`} className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition">Contactar</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'referrals' && loyaltySettings && (
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-zinc-800 flex items-center gap-2"><Users className="text-blue-500"/> Programa de Referidos</h3>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-zinc-700">Estado global del programa:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={!!loyaltySettings.isReferralProgramActive} onChange={async (e) => {
                    const isActive = e.target.checked;
                    setLoyaltySettings({...loyaltySettings, isReferralProgramActive: isActive});
                    try { 
                      const res = await api.put(`/admin/loyalty/settings/${loyaltySettings.id}`, { isReferralProgramActive: isActive }); 
                      if (!res.data.success) throw new Error('Error backend');
                      toast.success('Estado del programa actualizado');
                    } catch(err) { 
                      toast.error('Error al actualizar: ' + err.message); 
                      setLoyaltySettings({...loyaltySettings, isReferralProgramActive: !isActive}); // rollback
                    }
                  }} />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <h4 className="text-lg font-bold text-zinc-800 mb-4">Métricas de Referidos</h4>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-100 text-zinc-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold">Referidor</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold text-center">Cantidad Referidos</th>
                    <th className="p-4 font-bold text-center">Código</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-sm">
                  {usersList.filter(u => u.role === 'CLIENT' && u.referralsCount > 0).sort((a,b) => (b.referralsCount||0) - (a.referralsCount||0)).map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50">
                      <td className="p-4 font-bold text-zinc-800">{u.name}</td>
                      <td className="p-4 text-zinc-500">{u.email}</td>
                      <td className="p-4 text-center text-zinc-600 font-bold">{u.referralsCount || 0}</td>
                      <td className="p-4 text-center font-mono text-zinc-500">{u.referralCode}</td>
                    </tr>
                  ))}
                  {usersList.filter(u => u.role === 'CLIENT' && u.referralsCount > 0).length === 0 && (
                    <tr><td colSpan="4" className="p-4 text-center text-zinc-500">Nadie ha referido a nadie aún.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* TAB CATALOGO / LIBRO MENSUAL */}
        {!loading && activeTab === 'catalog' && (
          <div className="space-y-6 max-w-6xl">
            {/* Header / Banner Promocional del Libro */}
            <div className="bg-gradient-to-r from-zinc-900 via-rose-950 to-zinc-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-rose-900/40">
              <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-3 border border-rose-500/30">
                    <Sparkles size={14} /> Gestión de Catálogo Mensual
                  </div>
                  <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                    {catalogStatus?.activeEdition || 'UNICA Perfumería - Edición Nº 50'}
                  </h2>
                  <p className="text-zinc-300 max-w-xl text-sm leading-relaxed">
                    Control centralizado de fragancias, cosméticos y aromatizadores del libro UNICA. Actualiza precios de lista, promociones y lanzamientos mes a mes.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleSyncCatalogDefaults}
                    disabled={syncingCatalog}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-white text-zinc-900 hover:bg-zinc-100 transition shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw size={18} className={syncingCatalog ? 'animate-spin' : ''} />
                    <span>Sincronizar Libro Oficial</span>
                  </button>

                  <button
                    onClick={() => setCatalogModal({ isOpen: true, edition: 'UNICA Edición Nº 51', rawJson: '', fileLoading: false })}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition shadow-lg shadow-rose-900/50 cursor-pointer"
                  >
                    <Upload size={18} />
                    <span>Subir Libro (PDF)</span>
                  </button>

                  <button
                    onClick={handleClearCatalog}
                    disabled={syncingCatalog}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-700/60 transition shadow-lg disabled:opacity-50 cursor-pointer"
                    title="Vaciar catálogo completo antes de cargar un nuevo libro"
                  >
                    <Trash2 size={18} className="text-red-400" />
                    <span>Vaciar Catálogo</span>
                  </button>

                  <button
                    onClick={handleExportCatalog}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition border border-zinc-700 cursor-pointer"
                    title="Exportar respaldo JSON"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>

              {/* Métricas del Catálogo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Productos Activos</span>
                  <p className="text-2xl font-black text-white mt-1">{catalogStatus?.totalProducts || 199}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Categorías</span>
                  <p className="text-2xl font-black text-rose-300 mt-1">{catalogStatus?.categoriesCount || 8}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Páginas del Libro</span>
                  <p className="text-2xl font-black text-amber-300 mt-1">86 págs</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Estado Base Datos</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">Sincronizado</p>
                </div>
              </div>
            </div>

            {/* Categorías y Distribución de Productos */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Categorías del Catálogo UNICA</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Productos organizados según las líneas oficiales del libro</p>
                </div>
                <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                  <span>Ver todos los productos</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {catalogStatus?.categories?.map((cat) => (
                  <div 
                    key={cat.id} 
                    onClick={() => setActiveTab('products')}
                    className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50/70 hover:bg-rose-50/40 hover:border-rose-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                        <BookOpen size={20} />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                        {cat.productCount} prods
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900 text-base group-hover:text-rose-600 transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 font-mono">{cat.slug}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Guía Explicativa del Proceso Mes a Mes */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/60 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <Info size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-amber-950 text-base">¿Cómo funciona la carga de productos mes a mes?</h4>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Cada mes se publica una nueva edición del libro (ej. UNICA 51, 52...). Para actualizar los productos en la tienda tienes dos opciones:
                </p>
                <ul className="text-xs text-amber-900/80 space-y-1.5 list-disc list-inside pt-1">
                  <li><strong>Automático:</strong> Clic en <em>"Cargar Nueva Edición"</em> y sube el archivo JSON o pega los datos. El sistema actualizará automáticamente los precios de lista, ofertas y creará los nuevos perfumes o artículos sin perder el historial de pedidos.</li>
                  <li><strong>Manual:</strong> Puedes editar cualquier producto individualmente con sus fotos, notas olfativas y stock desde la pestaña <strong>Productos</strong>.</li>
                  <li><strong>Sincronizar oficial:</strong> Si necesitas restablecer todos los 199 productos iniciales del catálogo UNICA 50, usa el botón <em>"Sincronizar Libro Oficial"</em>.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Global Form Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 bg-zinc-50">
              <h3 className="text-xl font-bold text-zinc-900">
                {modal.type === 'points' ? 'Modificar Puntos' : formData.id ? 'Editar' : 'Nuevo'} {modal.type === 'category' ? 'Categoría' : modal.type === 'product' ? 'Producto' : modal.type === 'banner' ? 'Banner' : modal.type === 'points' ? '' : 'Cupón'}
              </h3>
              <button onClick={handleCloseModal} className="text-zinc-400 hover:text-zinc-600 transition-colors"><X size={24}/></button>
            </div>
            <div className="p-6">
              <form onSubmit={modal.type === 'points' ? handleModifyUserPoints : handleSubmit} className="space-y-4">
                {modal.type === 'category' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Nombre</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Slug (URL)</label>
                      <input type="text" name="slug" value={formData.slug || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="ej-smartphones" />
                    </div>
                  </>
                )}

                {modal.type === 'product' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Nombre del producto</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ej. Remera Oversize Vintage" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Descripción</label>
                      <textarea name="description" value={formData.description || ''} onChange={handleFormChange} className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" rows="2" placeholder="Detalles, características, materiales..."></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Slug (URL)</label>
                        <input type="text" name="slug" value={formData.slug || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm" placeholder="remera-oversize" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Categoría</label>
                        <select name="categoryId" value={formData.categoryId || ''} onChange={handleFormChange} className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                          <option value="">Selecciona categoría...</option>
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Componente para subir desde ordenador o tomar fotos con la cámara */}
                    <ImageUploader 
                      value={formData.imageUrl || ''} 
                      onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
                      label="Foto del Producto (Desde tu ordenador o cámara)" 
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Precio ($ ARS)</label>
                        <input type="number" step="0.01" name="price" value={formData.price || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Stock</label>
                        <input type="number" name="stock" value={formData.stock || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="10" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Pts Otorga</label>
                        <input type="number" name="points" value={formData.points || 0} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                  </>
                )}

                {modal.type === 'banner' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Título</label>
                      <input type="text" name="title" value={formData.title || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Subtítulo</label>
                      <input type="text" name="subtitle" value={formData.subtitle || ''} onChange={handleFormChange} className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Texto del Botón</label>
                      <input type="text" name="buttonText" value={formData.buttonText || ''} onChange={handleFormChange} className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    <ImageUploader 
                      value={formData.imageUrl || ''} 
                      onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))} 
                      label="Imagen del Banner" 
                    />
                  </>
                )}

                {modal.type === 'coupon' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Nombre de la Campaña (Ej. Navidad)</label>
                      <input type="text" name="name" value={formData.name || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Código Hexadecimal</label>
                      <div className="flex gap-2">
                        <input type="text" name="code" value={formData.code || ''} onChange={handleFormChange} required className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono tracking-widest" placeholder="Ej. A1B2C3D4" />
                        {!formData.id && (
                          <button type="button" onClick={handleGenerateCode} title="Generar código" className="bg-emerald-100 text-emerald-600 p-3 rounded-xl hover:bg-emerald-200 transition-colors flex items-center justify-center">
                            <Wand2 size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">Asignar a un usuario específico (Opcional)</label>
                      <input type="email" name="targetUserEmail" value={formData.targetUserEmail || ''} onChange={handleFormChange} className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="correo@cliente.com" />
                      <p className="text-xs text-zinc-500 mt-1">Si lo dejas vacío, el cupón es para el público general.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Descuento (%)</label>
                        <input type="number" name="discountPercentage" value={formData.discountPercentage || ''} onChange={handleFormChange} required min="1" max="100" className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-zinc-700 mb-1">Fecha límite (Opcional)</label>
                        <input type="date" name="expiresAt" value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''} onChange={handleFormChange} className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </div>
                    </div>
                    {formData.id && (
                      <div className="flex items-center gap-2 mt-4">
                        <input type="checkbox" id="active" name="active" checked={formData.active ?? true} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded" />
                        <label htmlFor="active" className="text-sm font-semibold text-zinc-700">Cupón Activo</label>
                      </div>
                    )}
                  </>
                )}

                {modal.type === 'points' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-zinc-700 mb-1">
                        Cantidad de puntos a {formData.action === 'add' ? 'sumar' : 'restar'}
                      </label>
                      <input 
                        type="number" 
                        name="pointsAmount" 
                        value={formData.pointsAmount || ''} 
                        onChange={handleFormChange} 
                        required 
                        min="1" 
                        className="w-full px-4 py-2 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" 
                        placeholder="Ej: 500"
                      />
                    </div>
                  </>
                )}
                
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">Cancelar</button>
                  <button type="submit" className="px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm">{modal.type === 'points' ? 'Aplicar' : 'Guardar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Global Delete Confirm Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform scale-100 animate-slide-up border border-zinc-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">¿Estás seguro?</h3>
            <p className="text-zinc-500 mb-6">Esta acción no se puede deshacer. El registro se eliminará permanentemente.</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setDeleteModal({isOpen: false, id: null, type: null})} className="flex-1 py-3 font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-3 font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Carga de Catálogo Mensual */}
      {catalogModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden transform scale-100 animate-slide-up border border-zinc-100">
            <div className="flex justify-between items-center p-6 border-b border-zinc-100 bg-rose-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Cargar Nueva Edición del Libro</h3>
                  <p className="text-xs text-zinc-500">Actualiza productos, precios y promociones mes a mes</p>
                </div>
              </div>
              <button onClick={() => setCatalogModal({ isOpen: false, edition: '', rawJson: '', fileLoading: false })} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={22}/>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Nombre de la Edición</label>
                <input
                  type="text"
                  value={catalogModal.edition}
                  onChange={(e) => setCatalogModal(prev => ({ ...prev, edition: e.target.value }))}
                  placeholder="Ej: UNICA Perfumería - Edición Nº 51"
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              {/* OPCION 1: SUBIR LIBRO EN PDF */}
              <div className="bg-rose-50/60 border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl p-6 text-center transition relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  disabled={syncingCatalog}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
                />
                <div className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-rose-900/20">
                  <FileText size={24} />
                </div>
                <h4 className="font-bold text-zinc-900 text-base">Subir Libro en PDF (.pdf)</h4>
                <p className="text-xs text-zinc-600 mt-1 max-w-sm mx-auto">
                  Arrastra o selecciona el archivo PDF del nuevo catálogo (ej. <em>UNICA51.pdf</em>). El sistema lo procesará y sincronizará los productos automáticamente.
                </p>
                <span className="inline-block mt-3 px-4 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-lg shadow-sm">
                  {syncingCatalog ? 'Procesando PDF...' : 'Seleccionar PDF del Libro'}
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-zinc-400 font-bold uppercase tracking-wider">O importar datos JSON</span>
                </div>
              </div>

              <form onSubmit={handleImportCatalogSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">Cargar Archivo JSON (.json)</label>
                  <div className="border border-zinc-200 hover:border-zinc-300 rounded-xl p-3 text-center cursor-pointer transition bg-zinc-50 relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUploadCatalog}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload size={18} className="mx-auto text-zinc-400 mb-1" />
                    <p className="text-xs font-semibold text-zinc-700">Seleccionar archivo JSON de productos</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-1.5">O pegar JSON directamente</label>
                  <textarea
                    value={catalogModal.rawJson}
                    onChange={(e) => setCatalogModal(prev => ({ ...prev, rawJson: e.target.value }))}
                    rows={4}
                    placeholder={`{\n  "edition": "UNICA Edición Nº 51",\n  "products": [\n    { "name": "Perfume...", "price": 24999 }\n  ]\n}`}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setCatalogModal({ isOpen: false, edition: '', rawJson: '', fileLoading: false })}
                    className="px-5 py-2.5 font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors text-sm cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={syncingCatalog || !catalogModal.rawJson.trim()}
                    className="px-6 py-2.5 font-bold text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-sm disabled:opacity-50 cursor-pointer"
                  >
                    {syncingCatalog ? 'Importando...' : 'Importar JSON'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
