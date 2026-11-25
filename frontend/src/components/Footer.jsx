import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Acerca de</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-slate-900 transition-colors">ÚNICA Perfumería</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Catálogo y Tendencias</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Edición Nº 50</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Otros Sitios</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Developers</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Mercado Pago</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Envíos</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Ayuda</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Comprar</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Vender</Link></li>
              <li><Link to="/" className="hover:text-slate-900 transition-colors">Resolución de problemas</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Redes sociales</h3>
            <div className="flex gap-4">
              {/* Iconos de redes placeholder */}
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-indigo-600 hover:text-white cursor-pointer transition-colors">X</div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors">f</div>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-pink-600 hover:text-white cursor-pointer transition-colors">ig</div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} ÚNICA Perfumería SRL. Todos los derechos reservados.
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <Link to="/" className="hover:text-slate-900">Términos y Condiciones</Link>
            <Link to="/" className="hover:text-slate-900">Privacidad</Link>
            <Link to="/" className="hover:text-slate-900">Accesibilidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
