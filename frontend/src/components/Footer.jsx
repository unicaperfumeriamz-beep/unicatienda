import React from 'react';
import { Link } from 'react-router-dom';
import ShinyText from './react-bits/ShinyText';
import MagnetButton from './react-bits/MagnetButton';
import { Sparkles, ShieldCheck, Heart, User } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#180022] via-[#220030] to-[#14001c] text-zinc-300 border-t border-fuchsia-950/60 mt-auto relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 left-1/4 w-96 h-32 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-32 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Marca e Información */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src="/unica-logo-darkbg.png" alt="UNICA Perfumería" className="h-12 object-contain" />
            </Link>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Esencialmente Bueno. Fragancias de alta gama, perfumería árabe exclusiva, difusores ambientales y aromaterapia natural.
            </p>
            <div className="p-3 rounded-xl bg-white/5 border border-fuchsia-500/20 backdrop-blur-xs">
              <p className="text-[11px] uppercase tracking-wider text-fuchsia-300 font-bold flex items-center gap-1.5">
                <User size={13} className="text-amber-400" /> Roxana Toloza
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Representante Oficial UNICA</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold font-serif tracking-wider">
              <Sparkles size={14} className="text-amber-400" /> Catálogo Oficial Edición Nº 50
            </div>
          </div>

          {/* Categorías Principales */}
          <div>
            <h3 className="font-bold text-white mb-4 text-xs tracking-widest uppercase font-serif text-fuchsia-300">Colecciones</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/?category=perfumes-premium" className="hover:text-fuchsia-300 transition-colors">Perfumes Premium</Link></li>
              <li><Link to="/?category=perfumes-arabes-premium" className="hover:text-fuchsia-300 transition-colors">Alta Perfumería Árabe</Link></li>
              <li><Link to="/?category=fragancias-femeninas" className="hover:text-fuchsia-300 transition-colors">Fragancias Femeninas</Link></li>
              <li><Link to="/?category=fragancias-masculinas" className="hover:text-fuchsia-300 transition-colors">Fragancias Masculinas</Link></li>
              <li><Link to="/?category=difusores-hogar" className="hover:text-fuchsia-300 transition-colors">Difusores & Hogar</Link></li>
              <li><Link to="/?category=oleos-esenciales-sumeria" className="hover:text-fuchsia-300 transition-colors">Óleos Sumeria</Link></li>
            </ul>
          </div>

          {/* Beneficios y Ayuda */}
          <div>
            <h3 className="font-bold text-white mb-4 text-xs tracking-widest uppercase font-serif text-fuchsia-300">Servicios</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/referrals" className="hover:text-fuchsia-300 transition-colors">Programa de Puntos y Referidos</Link></li>
              <li><Link to="/orders" className="hover:text-fuchsia-300 transition-colors">Mis Pedidos</Link></li>
              <li><Link to="/cart" className="hover:text-fuchsia-300 transition-colors">Mi Carrito de Compras</Link></li>
              <li><Link to="/profile" className="hover:text-fuchsia-300 transition-colors">Mi Perfil y Contraseña</Link></li>
              <li className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Pagos protegidos con Mercado Pago</span>
              </li>
            </ul>
          </div>

          {/* Contacto Directo y Redes Sociales */}
          <div>
            <h3 className="font-bold text-white mb-4 text-xs tracking-widest uppercase font-serif text-fuchsia-300">Contacto & Redes</h3>
            <div className="space-y-3.5 text-sm text-zinc-400">
              {/* WhatsApp con FA icon */}
              <a 
                href="https://wa.me/5492616098252?text=Hola%20UNICA%2C%20quisiera%20hacer%20una%20consulta%20sobre%20los%20productos" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 font-bold transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-emerald-900/50">
                  <i className="fa-brands fa-whatsapp text-xl"></i>
                </div>
                <div>
                  <span className="block text-[11px] text-zinc-400 font-normal">WhatsApp Directo</span>
                  <span className="text-sm font-sans tracking-wide text-white">261 609-8252</span>
                </div>
              </a>

              {/* Instagram con FA icon */}
              <a 
                href="https://instagram.com/unica.gc" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-3 p-2 rounded-xl bg-fuchsia-950/30 hover:bg-fuchsia-900/40 border border-fuchsia-500/30 text-fuchsia-300 font-bold transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-fuchsia-950/50">
                  <i className="fa-brands fa-instagram text-lg"></i>
                </div>
                <div>
                  <span className="block text-[11px] text-zinc-400 font-normal">Instagram Oficial</span>
                  <span className="text-sm font-sans tracking-wide text-white">@UNICA.GC</span>
                </div>
              </a>

              {/* Email con FA icon */}
              <a 
                href="mailto:unica.gc.mz@gmail.com" 
                className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform border border-amber-500/30">
                  <i className="fa-solid fa-envelope text-sm"></i>
                </div>
                <div>
                  <span className="block text-[11px] text-zinc-400 font-normal">Correo Electrónico</span>
                  <span className="text-xs break-all text-zinc-200">unica.gc.mz@gmail.com</span>
                </div>
              </a>

              {/* Ubicacion con FA icon */}
              <div className="flex items-center gap-2.5 text-xs text-zinc-400 pt-1 px-2">
                <i className="fa-solid fa-location-dot text-fuchsia-400"></i>
                <span>Godoy Cruz, Mendoza, Argentina</span>
              </div>
            </div>
          </div>

        </div>
        
        <div className="border-t border-fuchsia-950/80 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} UNICA Perfumería • Esencialmente Bueno. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Diseñado con</span>
            <Heart size={13} className="text-fuchsia-500 fill-fuchsia-500" />
            <span>para amantes de la alta perfumería</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
