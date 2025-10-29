"use client";

import { signIn } from 'next-auth/react';
import { useRef, useEffect } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface GoogleReconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithoutConnect: () => void;
  triggerElement?: HTMLElement | null; // New prop
}

export default function GoogleReconnectModal({
  isOpen,
  onClose,
  onContinueWithoutConnect,
  triggerElement,
}: GoogleReconnectModalProps) {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    if (modalContentRef.current) {
      if (isOpen) {
        previouslyFocusedElement.current = triggerElement || document.activeElement as HTMLElement;
        gsap.fromTo(
          modalContentRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, ease: "elastic.out(1, 0.75)", duration: 0.7,
            onComplete: () => {
              modalContentRef.current?.focus();
            }
          }
        );
      } else {
        gsap.to(modalContentRef.current, {
          scale: 0.8,
          opacity: 0,
          ease: "elastic.in(1, 0.75)",
          duration: 0.5,
          onComplete: () => {
            previouslyFocusedElement.current?.focus();
          }
        });
      }
    }
  }, { dependencies: [isOpen], scope: modalContentRef });

  const handleCloseAnimation = () => {
    gsap.to(modalContentRef.current, {
      scale: 0.8,
      opacity: 0,
      ease: "elastic.in(1, 0.75)",
      duration: 0.5,
      onComplete: onClose,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex justify-center items-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-reconnect-modal-title"
      tabIndex={-1} // Make the modal container focusable
      ref={modalContentRef} // Attach ref to the outer div for focus
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 w-full max-w-md mx-4 relative">
        <button
          onClick={handleCloseAnimation}
          className="absolute top-3 right-3 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h3 id="google-reconnect-modal-title" className="text-xl font-bold text-white mb-4">Google Calendar Disconnected</h3>
        <p className="text-gray-300 mb-6">
          Your Google account is not connected or authentication has expired. Connect to Google to reflect tasks on your calendar, or continue without this feature.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => { onContinueWithoutConnect(); handleCloseAnimation(); }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
          >
            Continue Without Connecting
          </button>
          <button
            onClick={() => signIn('google')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
          >
            Connect to Google
          </button>
        </div>
      </div>
    </div>
  );
}
