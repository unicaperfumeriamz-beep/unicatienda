import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageCircle, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Marca e Información */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/unica-logo.svg" alt="ÚNICA Perfumería" className="h-10 object-contain" />
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Esencialmente Bueno. Fragancias de alta gama, perfumería árabe exclusiva, difusores ambientales y aromaterapia natural.
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-semibold">
              <Sparkles size={14} /> Edición Oficial Nº 50
            </div>
          </div>

          {/* Categorías Principales */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">Colecciones</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/?category=perfumes-premium" className="hover:text-rose-400 transition-colors">Perfumes Premium</Link></li>
              <li><Link to="/?category=perfumes-arabes-premium" className="hover:text-rose-400 transition-colors">Alta Perfumería Árabe</Link></li>
              <li><Link to="/?category=fragancias-femeninas" className="hover:text-rose-400 transition-colors">Fragancias Femeninas</Link></li>
              <li><Link to="/?category=fragancias-masculinas" className="hover:text-rose-400 transition-colors">Fragancias Masculinas</Link></li>
              <li><Link to="/?category=difusores-hogar" className="hover:text-rose-400 transition-colors">Difusores & Hogar</Link></li>
              <li><Link to="/?category=oleos-esenciales-sumeria" className="hover:text-rose-400 transition-colors">Óleos Sumeria</Link></li>
            </ul>
          </div>

          {/* Beneficios y Ayuda */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">Servicios</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/referrals" className="hover:text-rose-400 transition-colors">Programa de Puntos y Referidos</Link></li>
              <li><Link to="/orders" className="hover:text-rose-400 transition-colors">Seguimiento de Compras</Link></li>
              <li><Link to="/cart" className="hover:text-rose-400 transition-colors">Mi Carrito de Compras</Link></li>
              <li className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Pagos protegidos con Mercado Pago</span>
              </li>
            </ul>
          </div>

          {/* Contacto Directo */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">Atención al Cliente</h3>
            <div className="space-y-3 text-sm text-zinc-400">
              <a 
                href="https://wa.me/?text=Hola%2C%20quisiera%20hacer%20una%20consulta%20sobre%20los%20perfumes%20de%20%C3%9ANICA" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                <MessageCircle size={18} />
                <span>Atención por WhatsApp</span>
              </a>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Mail size={16} className="text-rose-400" />
                <a href="mailto:unica.perfumeria.mz@gmail.com" className="hover:underline">unica.perfumeria.mz@gmail.com</a>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <MapPin size={16} className="text-rose-400" />
                <span>Mendoza, Argentina</span>
              </div>
            </div>
          </div>

        </div>
        
        <div className="border-t border-zinc-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} ÚNICA Perfumería. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Hecho con</span>
            <Heart size={13} className="text-rose-500 fill-rose-500" />
            <span>para amantes de la perfumería</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
