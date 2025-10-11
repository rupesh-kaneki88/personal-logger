"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import TaskEntryForm from '@/components/TaskEntryForm';
import TaskList from '@/components/TaskList';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { ITask } from '@/models/Task';
import { toast } from 'sonner';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function TasksPage() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);

  const pageRef = useRef(null);

  useGSAP(() => {
    gsap.from(pageRef.current, { opacity: 0, y: 50, duration: 0.8, ease: "power3.out" });
  }, { scope: pageRef });

  const fetchTasks = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data: ITask[] = await response.json();
      setTasks(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);

  const handleTaskAdded = (newTask: ITask) => {
    setTasks((prevTasks) => [newTask, ...prevTasks]);
    toast.success('Task added successfully!');
  };

  const handleTaskUpdated = (updatedTask: ITask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
    toast.success('Task updated successfully!');
  };

  const handleDeleteClick = (task: ITask) => {
    setTaskToDelete(task);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`/api/tasks/${taskToDelete._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskToDelete._id));
      toast.success('Task deleted successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setShowDeleteModal(false);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTaskToDelete(null);
  };

  if (loading) return <div className="text-center text-white">Loading tasks...</div>;
  if (error) return <div className="text-center text-red-400">Error: {error}</div>;

  return (
    <div ref={pageRef} className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-8">Your Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <TaskEntryForm onTaskAdded={handleTaskAdded} />
        </div>
        <div className="md:col-span-2">
          <TaskList
            tasks={tasks.filter(task => !task.isCompleted)}
            onTaskUpdated={handleTaskUpdated}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      {showDeleteModal && taskToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message={`Are you sure you want to delete the task: "${taskToDelete.title}"?`}
        />
      )}
    </div>
  );
}
