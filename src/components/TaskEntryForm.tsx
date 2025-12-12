"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ITask } from '@/models/Task';
import { toast } from 'sonner';
import GoogleReconnectModal from '@/components/GoogleReconnectModal';

interface TaskEntryFormProps {
  onTaskAdded: (task: ITask) => void;
}

export default function TaskEntryForm({ onTaskAdded }: TaskEntryFormProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>("");
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleReconnectModal, setShowGoogleReconnectModal] = useState(false);

  const formRef = useRef(null);

  useGSAP(() => {
    gsap.from(formRef.current, { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" });
  }, { scope: formRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowGoogleReconnectModal(false);

    if (!session?.user?.id) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    // Check Google Calendar connection status
    const googleStatusResponse = await fetch('/api/google-calendar/status');
    const googleStatusData = await googleStatusResponse.json();

    if (!googleStatusData.isConnected) {
      setShowGoogleReconnectModal(true);
      setLoading(false);
      return;
    }

    await submitTask();
  };

  const handleContinueWithoutConnect = async () => {
    setShowGoogleReconnectModal(false);
    await submitTask(false); // Pass false to indicate not to create Google Calendar event
  };

  const submitTask = async (createGoogleEvent: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const body: any = {
        userId: session!.user!.id,
        title,
        description,
        time,
        priority,
        createGoogleEvent,
      };

      if (dueDate) {
        if (time) {
          const dateString = `${dueDate}T${time}`;
          const localDate = new Date(dateString);
          body.dueDate = localDate.toISOString();
        } else {
          body.dueDate = dueDate;
        }
      } else {
        body.dueDate = undefined;
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create task.");
      }

      const newTask: ITask = await response.json();
      onTaskAdded(newTask);
      setTitle("");
      setDescription("");
      setDueDate(new Date().toISOString().split('T')[0]);
      setTime("");
      setPriority('Medium');

      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });

    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Add New Task</h2>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taskTitle" className="sr-only">Title</label>
          <input
            type="text"
            id="taskTitle"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="taskDescription" className="sr-only">Description</label>
          <textarea
            id="taskDescription"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-300">Due Date (optional)</label>
          <input
            type="date"
            id="dueDate"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-300">Time (optional)</label>
          <input
            type="time"
            id="time"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority</label>
          <select
            id="priority"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors duration-200"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </form>

      <GoogleReconnectModal
        isOpen={showGoogleReconnectModal}
        onClose={() => setShowGoogleReconnectModal(false)}
        onContinueWithoutConnect={handleContinueWithoutConnect}
      />
    </div>
  );
}
