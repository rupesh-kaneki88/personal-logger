"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface DeleteConfirmationModalProps {
  logTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  logTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const modalContentRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      modalContentRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, ease: "elastic.out(1, 0.75)", duration: 0.7 }
    );
  }, { scope: modalContentRef });

  const handleCancelAnimation = () => {
    gsap.to(modalContentRef.current, {
      scale: 0.8,
      opacity: 0,
      ease: "elastic.in(1, 0.75)",
      duration: 0.5,
      onComplete: onCancel,
    });
  };

  const handleConfirmAnimation = () => {
    gsap.to(modalContentRef.current, {
      scale: 0.8,
      opacity: 0,
      ease: "elastic.in(1, 0.75)",
      duration: 0.5,
      onComplete: onConfirm,
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        ref={modalContentRef}
        className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm border border-gray-700 text-white text-center"
      >
        <h2 className="text-2xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to delete the log entry: <span className="font-semibold">{logTitle}</span>?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCancelAnimation}
            className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAnimation}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
