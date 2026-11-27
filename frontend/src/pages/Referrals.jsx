import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Share2, Users, Gift, Trophy, Star, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';

export default function Referrals() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProgramActive, setIsProgramActive] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const statusRes = await api.get('/auth/referrals/status');
        if (statusRes.data.success && statusRes.data.data.isActive) {
          setIsProgramActive(true);
          const res = await api.get('/auth/referrals');
          if (res.data.success) {
            setReferrals(res.data.data);
          }
        } else {
          setIsProgramActive(false);
        }
      } catch (error) {
        console.error('Error fetching referrals', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReferrals();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/login?ref=${user.referralCode || ''}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
      <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!isProgramActive) {
    return (
      <div className="min-h-[80vh] bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-12 text-center rounded-3xl shadow-xl max-w-lg w-full border border-slate-100">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Gift size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">Programa en Pausa</h2>
          <p className="text-slate-500 mb-8 text-lg">Nuestro programa de referidos se encuentra en mantenimiento. Estamos preparando recompensas increíbles. ¡Vuelve pronto!</p>
          <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors">
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  const milestones = [
    { target: 1, reward: '500 Puntos', icon: <Star className="w-6 h-6 text-yellow-400" /> },
    { target: 5, reward: 'VIP - 3000 Pts', icon: <Trophy className="w-6 h-6 text-orange-400" /> },
    { target: 10, reward: 'Elite - Cupón 50%', icon: <Gift className="w-6 h-6 text-purple-400" /> }
  ];

  const currentLevel = referrals.length;
  let progress = 0;
  if (currentLevel < 1) progress = 0;
  else if (currentLevel < 5) progress = 33;
  else if (currentLevel < 10) progress = 66;
  else progress = 100;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Hero Section */}
      <div className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-400 font-semibold text-sm mb-8 backdrop-blur-md border border-white/10">
            <SparklesIcon className="w-4 h-4" />
            Nivel actual: {currentLevel < 5 ? 'Iniciado' : currentLevel < 10 ? 'VIP' : 'Elite'}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            Gana recomensas <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">ilimitadas</span>
          </h1>
          <p className="mt-4 text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Invita a tus amigos a unirse a UNICA Perfumería. Ellos obtienen las mejores fragancias exclusivas y tú acumulas puntos para canjear por productos reales.
          </p>

          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 p-2 pl-6 rounded-full flex items-center justify-between shadow-2xl transition-all hover:bg-white/15">
            <span className="text-white font-mono text-lg truncate pr-4 opacity-90 select-all">
              {`${window.location.origin}/login?ref=${user.referralCode || ''}`}
            </span>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${copied ? 'bg-emerald-500 text-zinc-900' : 'bg-white text-zinc-900 hover:bg-zinc-100'}`}
            >
              {copied ? <><CheckCircle2 size={20} /> Copiado</> : <><Copy size={20} /> Copiar enlace</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <Share2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">1. Comparte</h3>
            <p className="text-slate-500">Envía tu enlace personal a tus amigos, familiares o en tus redes sociales.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">2. Se registran</h3>
            <p className="text-slate-500">Tus amigos crean una cuenta nueva utilizando tu enlace de invitación único.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transform hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Gift size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">3. Ganas premios</h3>
            <p className="text-slate-500">Recibes 500 puntos instantáneos en tu cuenta que equivalen a dinero real.</p>
          </div>
        </div>

        {/* Milestones & Progress */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 mb-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Tu Camino de Recompensas</h2>
              <p className="text-slate-500">Desbloquea niveles exclusivos mientras invitas a más personas.</p>
            </div>
            <div className="text-right">
              <span className="block text-5xl font-black text-indigo-600">{referrals.length}</span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Referidos Totales</span>
            </div>
          </div>

          <div className="relative pt-8 pb-4">
            <div className="absolute top-1/2 left-0 w-full h-3 bg-slate-100 rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full -translate-y-1/2 transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
            
            <div className="relative flex justify-between">
              {milestones.map((m, idx) => {
                const isAchieved = referrals.length >= m.target;
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 transition-colors duration-500 ${isAchieved ? 'bg-white border-indigo-500' : 'bg-slate-50 border-slate-200'}`}>
                      {isAchieved ? <CheckCircle2 className="w-6 h-6 text-indigo-500" /> : m.icon}
                    </div>
                    <div className="text-center mt-4">
                      <p className="font-bold text-slate-800">{m.target} {m.target === 1 ? 'Amigo' : 'Amigos'}</p>
                      <p className={`text-sm font-semibold ${isAchieved ? 'text-indigo-600' : 'text-slate-400'}`}>{m.reward}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Referrals List */}
        {referrals.length > 0 && (
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-6">Amigos que se unieron</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {referrals.map((r, i) => (
                <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                    {r.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{r.name}</p>
                    <p className="text-xs text-slate-500 font-medium">Se unió el {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3v3" />
      <path d="M18.36 5.64l-2.12 2.12" />
      <path d="M21 12h-3" />
      <path d="M18.36 18.36l-2.12-2.12" />
      <path d="M12 21v-3" />
      <path d="M5.64 18.36l2.12-2.12" />
      <path d="M3 12h3" />
      <path d="M5.64 5.64l2.12 2.12" />
    </svg>
  );
}
