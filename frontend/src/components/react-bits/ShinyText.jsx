import React from 'react';

export default function ShinyText({ text, disabled = false, speed = 4, className = '' }) {
  const animationDuration = `${speed}s`;
  return (
    <span
      className={`relative inline-block text-white/90 bg-clip-text font-bold ${className}`}
      style={{
        backgroundImage: 'linear-gradient(120deg, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.3) 80%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animation: disabled ? 'none' : `shine ${animationDuration} linear infinite`,
      }}
    >
      {text}
    </span>
  );
}
