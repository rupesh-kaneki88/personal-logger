"use client";

import { useEffect, useRef } from 'react';

export default function LoadingPage() {
  const pPathRef = useRef<SVGPathElement>(null);
  const lPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (pPathRef.current && lPathRef.current) {
      const pPath = pPathRef.current;
      const lPath = lPathRef.current;
      const pLength = pPath.getTotalLength();
      const lLength = lPath.getTotalLength();

      pPath.style.setProperty('--length', `${pLength}`);
      lPath.style.setProperty('--length', `${lLength}`);

      pPath.style.strokeDasharray = `${pLength}`;
      pPath.style.strokeDashoffset = `${pLength}`;
      lPath.style.strokeDasharray = `${lLength}`;
      lPath.style.strokeDashoffset = `${lLength}`;

      pPath.style.animation = 'draw 2s ease-in-out infinite';
      lPath.style.animation = 'draw 2s ease-in-out 0.5s infinite';
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <style jsx>{`
        @keyframes draw {
          0% {
            stroke-dashoffset: var(--length);
          }
          50% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: var(--length);
          }
        }
      `}</style>
      <svg
        width="200"
        height="100"
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pPathRef}
          d="M 40 80 L 40 20 L 70 20 C 90 20 90 40 70 40 L 40 40"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
        <path
          ref={lPathRef}
          d="M 110 20 L 110 80 L 160 80"
          stroke="white"
          strokeWidth="5"
          fill="none"
        />
      </svg>
    </div>
  );
}