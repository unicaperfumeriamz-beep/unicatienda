import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Lock, Save, ShieldCheck, Gift } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData(prev => ({
      ...prev,
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || ''
    }));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        toast.success('¡Perfil actualizado con éxito!');
        // Update user in localStorage
        const stored = localStorage.getItem('user');
        if (stored) {
          const parsed = JSON.parse(stored);
          const updated = { ...parsed, name: formData.name, phone: formData.phone, address: formData.address };
          localStorage.setItem('user', JSON.stringify(updated));
        }
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        toast.error(res.data.message || 'Error al actualizar perfil');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#170020] via-[#330045] to-[#170020] p-8 text-white relative">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-fuchsia-600 text-zinc-900 flex items-center justify-center font-black text-3xl shadow-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black font-serif">{user.name}</h1>
                {user.role === 'ADMIN' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-fuchsia-600 text-white uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-zinc-300 text-sm mt-1">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/10">
                <Gift size={14} /> Puntos acumulados: {user.points || 0} pts UNICA
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="border-b border-zinc-100 pb-4">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <User size={20} className="text-rose-600" /> Datos Personales
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Actualiza tu información de contacto y entrega</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Nombre completo</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Teléfono / WhatsApp</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="+54 261 1234567"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Dirección de Entrega</label>
              <div className="relative">
                <MapPin size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="Calle, número, ciudad, provincia"
                />
              </div>
            </div>
          </div>

          <div className="border-b border-zinc-100 pb-4 pt-4">
            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-rose-600" /> Cambiar Contraseña
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Si deseas cambiar tu contraseña actual, ingresa la nueva clave a continuación</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Nueva Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">Confirmar Nueva Contraseña</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-lg shadow-rose-900/30 disabled:opacity-50 cursor-pointer"
            >
              <Save size={18} />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
