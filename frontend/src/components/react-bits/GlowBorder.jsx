import React from 'react';

export default function GlowBorder({ children, className = '', glowColor = 'from-fuchsia-500 via-purple-500 to-amber-400' }) {
  return (
    <div className={`relative p-[1.5px] rounded-3xl overflow-hidden group ${className}`}>
      {/* Animated gradient ring */}
      <div 
        className={`absolute inset-[-100%] bg-gradient-to-r ${glowColor} opacity-70 group-hover:opacity-100 transition-opacity blur-xs`}
        style={{ animation: 'rotateBorder 6s linear infinite' }}
      />
      {/* Inner content */}
      <div className="relative bg-[#180024] rounded-[22px] w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
