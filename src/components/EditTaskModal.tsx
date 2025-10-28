"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ITask } from "@/models/Task";

interface EditTaskModalProps {
  task: ITask;
  onClose: () => void;
  onSave: (updatedTask: ITask) => void;
  createGoogleEvent?: boolean;
}

export default function EditTaskModal({ task, onClose, onSave, createGoogleEvent }: EditTaskModalProps) {
  const modalContentRef = useRef(null);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
  );
  const [time, setTime] = useState<string>(task.time || "");
  const [priority, setPriority] = useState(task.priority || "Medium");
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
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
    setPriority(task.priority || "Medium");
  }, [task]);

  const handleCloseAnimation = () => {
    gsap.to(modalContentRef.current, {
      scale: 0.8,
      opacity: 0,
      ease: "elastic.in(1, 0.75)",
      duration: 0.5,
      onComplete: onClose,
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

    const loadingToast = toast.loading("Saving changes...");
    try {
      const updatedTask = {
        ...task,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        time,
        priority,
        createGoogleEvent,
      };
      await onSave(updatedTask as unknown as ITask);
      toast.success("Task updated successfully!", { id: loadingToast });
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to update task.", { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div
        ref={modalContentRef}
        className="bg-gray-800 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg border border-gray-700 text-white"
      >
        <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
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
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              id="edit-description"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div>
            <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-300">Due Date</label>
            <input
              type="date"
              id="edit-dueDate"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-time" className="block text-sm font-medium text-gray-300">Time</label>
            <input
              type="time"
              id="edit-time"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-300">Priority</label>
            <select
              id="edit-priority"
              className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-700 text-white"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "Low" | "Medium" | "High")}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
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
