import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Phone, MapPin, Gift, KeyRound, ArrowLeft } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const referralCode = searchParams.get('ref') || '';

  // Mode: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState(referralCode ? 'register' : 'login');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '', 
    address: '', 
    referralCode: referralCode || '' 
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(formData.email, formData.password);
        if (res.success) {
          toast.success('¡Bienvenido a UNICA Perfumería!');
          navigate('/');
        } else {
          setError(res.message || 'Error al iniciar sesión');
        }
      } else if (mode === 'register') {
        const res = await register(
          formData.name, 
          formData.email, 
          formData.password, 
          formData.phone, 
          formData.address, 
          formData.referralCode?.trim() || referralCode
        );
        if (res.success) {
          setMode('login');
          setSuccessMsg('Registro exitoso. Ahora puedes iniciar sesión con tu cuenta.');
          toast.success('Cuenta creada exitosamente');
        } else {
          setError(res.message || 'Error al registrarse');
        }
      } else if (mode === 'forgot') {
        if (!formData.email.trim()) {
          setError('Ingresa tu correo electrónico');
          return;
        }
        if (!formData.password || formData.password.length < 6) {
          setError('La nueva contraseña debe tener al menos 6 caracteres');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }

        const res = await api.post('/auth/reset-password', {
          email: formData.email.trim(),
          newPassword: formData.password
        });

        if (res.data.success) {
          setSuccessMsg('¡Contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.');
          toast.success('Contraseña restablecida correctamente');
          setMode('login');
        } else {
          setError(res.data.message || 'Error al restablecer la contraseña');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block mb-4">
          <img src="/unica-logo-trans.png" alt="UNICA Perfumería" className="h-16 mx-auto object-contain" />
        </Link>
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight font-serif">
          {mode === 'login' && '¡Hola! Ingresa a tu cuenta'}
          {mode === 'register' && 'Crea tu cuenta en UNICA'}
          {mode === 'forgot' && 'Recuperar Contraseña'}
        </h2>
        <p className="text-xs text-zinc-500 mt-1">
          {mode === 'login' && 'Accede a tus pedidos, catálogo y promociones exclusivas'}
          {mode === 'register' && 'Únete para comprar fragancias con descuentos por cantidad'}
          {mode === 'forgot' && 'Ingresa tu correo y elige tu nueva clave de acceso'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-zinc-200/50 sm:rounded-3xl sm:px-10 border border-zinc-100">
          
          {error && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-100">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">Nombre completo</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required
                      className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Ej. Juan Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">Teléfono</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="+54 261 1234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">Dirección de entrega</label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Calle, número, localidad"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1 flex items-center justify-between">
                    <span>Código de referido</span>
                    <span className="text-[11px] text-zinc-400 font-normal">Opcional</span>
                  </label>
                  <div className="relative">
                    <Gift size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                    <input 
                      type="text" 
                      name="referralCode" 
                      value={formData.referralCode} 
                      onChange={handleChange} 
                      className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm font-mono uppercase focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Ej. 9034441C"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field for all modes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                  {mode === 'forgot' ? 'Nueva Contraseña' : 'Contraseña'}
                </label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }}
                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'forgot' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3.5 text-zinc-400" />
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required
                    className="block w-full pl-10 pr-3 py-2.5 border border-zinc-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg shadow-rose-900/20 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 focus:outline-none transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Procesando...' : (
                  mode === 'login' ? 'Ingresar a mi cuenta' :
                  mode === 'register' ? 'Registrarme' : 'Restablecer Contraseña'
                )}
              </button>
            </div>
          </form>

          {mode === 'forgot' ? (
            <div className="mt-6 text-center">
              <button 
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                <ArrowLeft size={14} /> Volver a Iniciar Sesión
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-zinc-400 uppercase font-bold tracking-wider">
                    {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <button 
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccessMsg(''); }} 
                  className="w-full flex justify-center py-2.5 px-4 border border-zinc-300 rounded-xl text-sm font-bold text-zinc-700 bg-white hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  {mode === 'login' ? 'Crear una cuenta nueva' : 'Ya tengo cuenta, iniciar sesión'}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
