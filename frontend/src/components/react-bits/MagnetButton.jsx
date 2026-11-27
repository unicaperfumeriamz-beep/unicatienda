import React, { useRef, useState } from 'react';

export default function MagnetButton({ 
  children, 
  className = '', 
  onClick, 
  href, 
  target, 
  rel, 
  ariaLabel 
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.28;
    const y = (clientY - (top + height / 2)) * 0.28;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      ref={ref}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      aria-label={ariaLabel}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
      className={`relative inline-flex items-center justify-center cursor-pointer transition-shadow ${className}`}
    >
      {children}
    </Component>
  );
}
