"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface EditLogModalProps {
  log: {
    _id: string;
    title: string;
    content: string;
    category?: string;
    duration?: number;
    timestamp: string;
  };
  onClose: () => void;
  onSave: (updatedLog: any) => void;
}

export default function EditLogModal({ log, onClose, onSave }: EditLogModalProps) {
  const modalContentRef = useRef(null);
  const [title, setTitle] = useState(log.title);
  const [content, setContent] = useState(log.content);
  const [category, setCategory] = useState(log.category || "None");
  const [duration, setDuration] = useState<number | undefined>(log.duration);
  const [date, setDate] = useState<string>(
    log.timestamp ? new Date(log.timestamp).toISOString().split("T")[0] : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useGSAP(() => {
    gsap.fromTo(
      modalContentRef.current,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, ease: "elastic.out(1, 0.75)", duration: 0.7 }
    );
  }, { scope: modalContentRef });

  useEffect(() => {
    setTitle(log.title);
    setContent(log.content);
    setCategory(log.category || "None");
    setDuration(log.duration);
    setDate(log.timestamp ? new Date(log.timestamp).toISOString().split("T")[0] : "");
  }, [log]);

  const handleCloseAnimation = () => {
    gsap.to(modalContentRef.current, {
      scale: 0.8,
      opacity: 0,
      ease: "elastic.in(1, 0.75)",
      duration: 0.5,
      onComplete: onClose, // Call original onClose after animation
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!title.trim()) {
      setError("Title cannot be empty.");
      setLoading(false);
      return;
    }
    if (!content.trim()) {
      setError("Content cannot be empty.");
      setLoading(false);
      return;
    }

    const loadingToast = toast.loading("Saving changes...");
    try {
      const updatedLog = {
        _id: log._id,
        title,
        content,
        category: category === "None" ? undefined : category,
        duration,
        timestamp: date
          ? new Date(
              new Date(date).setHours(
                new Date(log.timestamp).getHours(),
                new Date(log.timestamp).getMinutes(),
                new Date(log.timestamp).getSeconds()
              )
            )
          : undefined,
      };
      await onSave(updatedLog); // Await onSave as it will now handle the API call
      toast.success("Log updated successfully!", { id: loadingToast });
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to update log.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div
        ref={modalContentRef}
        className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg border border-gray-700 text-white"
      >
        <h2 className="text-2xl font-bold mb-4">Edit Log Entry</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              id="edit-title"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium text-gray-300">Content</label>
            <textarea
              id="edit-content"
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-300">Date</label>
            <input
              type="date"
              id="edit-date"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-300">Category</label>
            <select
              id="edit-category"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="None">None</option>
              <option value="Technical">Technical</option>
              <option value="Non-Technical">Non-Technical</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit-duration" className="block text-sm font-medium text-gray-300">Duration (minutes)</label>
            <input
              type="number"
              id="edit-duration"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={duration || ""}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              min="0"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseAnimation}
              className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}