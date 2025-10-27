'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function AnimatedButton({ children, onClick, className }: AnimatedButtonProps) {
  const fillRef = useRef<HTMLSpanElement>(null);

  const setTransformOrigin = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    gsap.set(fillRef.current, { transformOrigin: `${x}px ${y}px` });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTransformOrigin(e);
    gsap.to(fillRef.current, { scale: 1.5, duration: 0.5, ease: 'power3.out' });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTransformOrigin(e);
    gsap.to(fillRef.current, { scale: 0, duration: 0.5, ease: 'power3.in' });
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={setTransformOrigin} // This makes the effect follow the mouse
      className={`relative overflow-hidden bg-transparent border border-white text-white font-bold py-3 px-8 rounded-md shadow-lg transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <span
        ref={fillRef}
        className="absolute inset-0 z-0 bg-blue-600 rounded-full"
        style={{ scale: 0 }} // Initially scaled to 0
      ></span>
    </button>
  );
}
