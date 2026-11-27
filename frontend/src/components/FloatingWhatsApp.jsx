import React, { useState } from 'react';
import MagnetButton from './react-bits/MagnetButton';
import ShinyText from './react-bits/ShinyText';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [isExpanded, setIsExpanded] = useState(true);
  const phoneNumber = '5492616098252';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('¡Hola Roxana! Te escribo desde la tienda UNICA Perfumería para consultar por los productos.')}`;
  const instagramUrl = 'https://instagram.com/unica.gc';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none">
      
      {/* Floating Interactive Badge (React-Bits style) */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-fade-in-down items-end">
          
          {/* Quick Instagram Pill */}
          <MagnetButton
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            ariaLabel="Abrir Instagram @UNICA.GC"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-[#4a044e]/95 via-[#831843]/95 to-[#701a75]/95 text-white shadow-xl shadow-fuchsia-950/40 border border-fuchsia-400/40 hover:border-fuchsia-300 transition-all text-xs backdrop-blur-md hover:scale-105 active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
              <i className="fa-brands fa-instagram text-xs"></i>
            </div>
            <span className="font-semibold tracking-wide">@UNICA.GC</span>
            <span className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded-full text-fuchsia-200">Seguinos</span>
          </MagnetButton>

          {/* WhatsApp Helper Card */}
          <div className="flex items-center gap-3 bg-[#180026]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-fuchsia-500/40 text-xs max-w-xs relative animate-pulse-glow">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <i className="fa-brands fa-whatsapp text-lg"></i>
              </div>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#180026] animate-ping"></span>
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#180026]"></span>
            </div>

            <div className="pr-2">
              <p className="font-bold text-white flex items-center gap-1.5 font-serif text-[13px]">
                <ShinyText text="Roxana Toloza" speed={3} />
                <span className="text-[10px] text-emerald-400 font-sans font-medium">• Activa</span>
              </p>
              <p className="text-zinc-300 text-[11px] mt-0.5 leading-snug">
                ¿Consultas por perfumes o envíos? <br/>
                <span className="text-amber-300 font-bold">261 609-8252</span>
              </p>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition self-start cursor-pointer"
              title="Minimizar panel"
            >
              <X size={14} />
            </button>

            {/* Bubble arrow */}
            <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-[#180026] border-r border-b border-fuchsia-500/40 rotate-45"></div>
          </div>
        </div>
      )}

      {/* Main Buttons Cluster */}
      <div className="flex items-center gap-3">
        
        {/* Toggle Expand/Collapse small icon */}
        {!isExpanded && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-9 h-9 rounded-full bg-[#200030] text-fuchsia-300 border border-fuchsia-500/40 hover:bg-fuchsia-900/60 transition flex items-center justify-center text-xs shadow-lg cursor-pointer"
            title="Mostrar opciones de contacto"
          >
            <ChevronUp size={18} />
          </button>
        )}

        {/* WhatsApp Icon Button with Magnet, FA & Ripple Glow */}
        <MagnetButton
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          ariaLabel="Contactar por WhatsApp al 2616098252"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/50 hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-white/30 relative"
        >
          <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-25 animate-ping pointer-events-none"></span>
          <i className="fa-brands fa-whatsapp text-3xl drop-shadow-md"></i>
        </MagnetButton>
      </div>

    </div>
  );
}
