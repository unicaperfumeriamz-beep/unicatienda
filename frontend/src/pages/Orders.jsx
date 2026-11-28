import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Orders() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchParams] = useSearchParams();

  if (!user) {
    navigate('/login');
    return null;
  }

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function handlePaymentReturn() {
      const paymentStatus = searchParams.get('payment');
      const orderId = searchParams.get('external_reference');
      const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
      const status = searchParams.get('status') || searchParams.get('collection_status');

      if (paymentStatus === 'success') {
        if (orderId) {
          try {
            const res = await api.post('/checkout/confirm-payment', {
              orderId,
              paymentId,
              status: status || 'approved'
            });
            if (res.data.success) {
              if (res.data.pointsAwarded > 0) {
                toast.success('¡Pago completado con éxito! Tu pedido está confirmado.');
              } else {
                toast.success('¡Pago completado con éxito!');
              }
              if (refreshUser) refreshUser();
            }
          } catch (e) {
            console.error('Error confirmando orden:', e);
            toast.success('¡Pago completado!');
          }
        } else {
          toast.success('¡Pago completado con éxito!');
        }
        window.history.replaceState({}, '', '/orders');
      } else if (paymentStatus === 'failure') {
        toast.error('El pago no pudo completarse.');
        window.history.replaceState({}, '', '/orders');
      } else if (paymentStatus === 'pending') {
        toast('El pago se encuentra pendiente de acreditación.', { icon: '⏳' });
        window.history.replaceState({}, '', '/orders');
      }
      fetchOrders();
    }

    handlePaymentReturn();
  }, []);

  const confirmDelete = (id) => {
    setOrderToDelete(id);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      const res = await api.delete(orderToDelete === 'ALL' ? '/orders' : `/orders/${orderToDelete}`);
      if (res.data.success) {
        toast.success(orderToDelete === 'ALL' ? 'Historial borrado' : 'Pedido eliminado del historial');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setOrderToDelete(null);
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-pulse">
      <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
      <div className="space-y-4">
        <div className="h-32 bg-slate-200 rounded-xl"></div>
        <div className="h-32 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-900">Mis Compras</h2>
        {orders.length > 0 && (
          <button onClick={() => confirmDelete('ALL')} className="text-sm font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <Trash2 size={16} /> Limpiar historial
          </button>
        )}
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Aún no has comprado nada</h2>
          <p className="text-slate-500 mb-8">Te invitamos a descubrir miles de productos increíbles.</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            Descubrir productos
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 p-4 border-b border-slate-100 flex flex-wrap justify-between items-center text-sm">
                <div className="flex gap-8">
                  <div>
                    <span className="block text-slate-500 font-semibold mb-1">FECHA DE PEDIDO</span>
                    <span className="font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-semibold mb-1">TOTAL</span>
                    <span className="font-bold text-slate-700">${order.totalAmount.toLocaleString('es-AR')}</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 text-right">
                  <span className="block text-slate-500 font-semibold mb-1">PEDIDO N.°</span>
                  <span className="font-mono text-xs text-slate-700">{order.id}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h3 className={`font-bold text-lg mb-2 ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-slate-800'}`}>
                    {order.status === 'PENDING_PAYMENT' ? 'Pendiente de pago' : 
                     order.status === 'PROCESSING' ? 'Preparando envío' : 
                     order.status}
                  </h3>
                  <p className="text-slate-600 text-sm">
                    El paquete será enviado a: <span className="font-semibold">{order.shippingAddress}</span>
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 w-full md:w-auto">
                  <button onClick={() => toast.success('Tu paquete está en camino. Pronto recibirás un correo con el código de seguimiento.', { icon: '🚚' })} className="w-full bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Rastrear paquete
                  </button>
                  <button onClick={() => setSelectedOrder(order)} className="w-full bg-slate-100 text-blue-600 font-bold px-6 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                    Ver detalle
                  </button>
                  <button onClick={() => confirmDelete(order.id)} className="w-full text-slate-500 font-bold px-6 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                    <Trash2 size={16}/> Ocultar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {orderToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center transform scale-100 animate-slide-up border border-slate-100 relative">
            <button onClick={() => setOrderToDelete(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20}/></button>
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 mt-2">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">¿Estás seguro?</h3>
            <p className="text-slate-500 mb-8 text-sm px-2">
              {orderToDelete === 'ALL' ? 'Se borrará por completo tu historial de compras.' : 'Este pedido desaparecerá de tu historial.'}
            </p>
            <div className="flex gap-3 w-full">
              <button onClick={() => setOrderToDelete(null)} className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleDeleteOrder} className="flex-1 py-3 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors shadow-sm shadow-red-500/20">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles del Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Detalle del Pedido</h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24}/></button>
            </div>
            <div className="p-6">
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Número de orden</span>
                  <span className="font-mono font-bold text-slate-800">{selectedOrder.id.split('-')[0]}...</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Fecha</span>
                  <span className="font-bold text-slate-800">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Estado</span>
                  <span className="font-bold text-blue-600">{selectedOrder.status}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-semibold">Dirección de envío</span>
                  <span className="font-bold text-slate-800">{selectedOrder.shippingAddress}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-slate-500 font-semibold text-lg">Total pagado</span>
                  <span className="font-black text-xl text-slate-900">${selectedOrder.totalAmount.toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2.5 font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
