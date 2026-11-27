import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(true);
  const phoneNumber = '5492616098252';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('¡Hola UNICA! Quiero hacer una consulta sobre los productos del catálogo.')}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3 group">
      {/* Tooltip Popup */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2.5 bg-brand-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-brand-400/40 animate-fade-in text-xs max-w-xs relative">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></div>
          <div>
            <p className="font-bold text-brand-100 flex items-center gap-1.5">
              <span>UNICA Perfumería</span>
              <span className="text-[10px] text-brand-300 font-normal">• En línea</span>
            </p>
            <p className="text-zinc-300 text-[11px] mt-0.5">¿Tenés dudas? Escribinos por WhatsApp al 261 609-8252</p>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTooltip(false); }}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            title="Cerrar mensaje"
          >
            <X size={13} />
          </button>
          {/* Arrow */}
          <div className="absolute right-[-6px] bottom-4 w-3 h-3 bg-brand-900 border-t border-r border-brand-400/40 rotate-45"></div>
        </div>
      )}

      {/* Main WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all duration-300 relative border-2 border-white/30 cursor-pointer"
        aria-label="Contactar por WhatsApp al 2616098252"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
        <svg 
          viewBox="0 0 24 24" 
          width="30" 
          height="30" 
          stroke="currentColor" 
          strokeWidth="2" 
          fill="currentColor" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
        </svg>
      </a>
    </div>
  );
}
