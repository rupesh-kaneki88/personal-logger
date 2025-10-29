
import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ITask } from '@/models/Task';
import { gsap } from 'gsap';

interface CompleteTaskModalProps {
  task: ITask;
  onClose: () => void;
  onConfirm: (task: ITask, duration?: number, category?: string) => void;
  triggerElement?: HTMLElement | null; // New prop
}

export default function CompleteTaskModal({
  task,
  onClose,
  onConfirm,
  triggerElement,
}: CompleteTaskModalProps) {
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState('None');
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    if (modalRef.current) {
      if (task) { // Modal is opening
        previouslyFocusedElement.current = triggerElement || document.activeElement as HTMLElement;
        gsap.fromTo(
          modalRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, ease: "elastic.out(1, 0.75)", duration: 0.7,
            onComplete: () => {
              modalRef.current?.focus();
            }
          }
        );
      } else { // Modal is closing
        gsap.to(modalRef.current, {
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
  }, { scope: modalRef, dependencies: [task] }); // Depend on 'task' to trigger open/close

  const handleCloseAnimation = (callback: () => void) => {
    gsap.to(modalRef.current, {
      scale: 0.8,
      opacity: 0,
      ease: "elastic.in(1, 0.75)",
      duration: 0.5,
      onComplete: callback,
    });
  };

  const handleConfirm = () => {
    setLoading(true);
    handleCloseAnimation(() => onConfirm(task, duration, category === 'None' ? undefined : category));
  };

  if (!task) return null; // Render only if a task is provided

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-task-modal-title"
      tabIndex={-1} // Make the modal container focusable
      ref={modalRef} // Attach ref to the outer div for focus
    >
      <div className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl border border-gray-700 w-full max-w-sm sm:max-w-md lg:max-w-lg text-white">
        <h2 id="complete-task-modal-title" className="text-2xl font-bold text-white mb-4">Complete Task & Log</h2>
        <p className="text-gray-300 mb-6">You are about to mark the task "{task.title}" as complete and create a log entry for it.</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duration (minutes, optional)</label>
            <input
              type="number"
              id="duration"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700"
              value={duration || ''}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
              placeholder="Enter duration in minutes"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
              id="category"
              className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="None">None</option>
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => handleCloseAnimation(onClose)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging...' : 'Confirm & Log'}
          </button>
        </div>
      </div>
    </div>
  );
}
