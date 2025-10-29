
"use client";

import { useRef } from 'react';

interface SlidingToggleButtonProps {
  isToggled: boolean;
  onToggle: () => void;
  label: string;
}

export default function SlidingToggleButton({ isToggled, onToggle, label }: SlidingToggleButtonProps) {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-white font-medium">{label}</span>
      <button
        onClick={onToggle}
        aria-pressed={isToggled}
        aria-label={label}
        className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${isToggled ? 'bg-indigo-600' : 'bg-gray-600'}`}>
        <div
          className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${isToggled ? 'translate-x-6' : 'translate-x-0'}`}>
        </div>
      </button>
    </div>
  );
}
