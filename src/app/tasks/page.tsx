"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import TaskEntryForm from '@/components/TaskEntryForm';
import TaskList from '@/components/TaskList';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import CompleteTaskModal from '@/components/CompleteTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import { ITask } from '@/models/Task';
import { toast } from 'sonner';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import LoadingPage from '@/components/LoadingPage';

export default function TasksPage() {
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<ITask | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<ITask | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ITask | null>(null);
  const [googleConnected, setGoogleConnected] = useState(true); // Assume connected until checked

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
      const checkGoogleConnection = async () => {
        const response = await fetch('/api/google-calendar/status');
        const data = await response.json();
        setGoogleConnected(data.isConnected);
      };
      checkGoogleConnection();
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ createGoogleEvent: googleConnected }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete task');
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

  const handleCompleteClick = (task: ITask) => {
    setTaskToComplete(task);
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = async (task: ITask, duration?: number, category?: string) => {
    if (!task) return;
    try {
      const response = await fetch(`/api/tasks/${task._id}/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ duration, category }),
      });
      if (!response.ok) {
        throw new Error('Failed to complete and log task');
      }
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== task._id));
      toast.success('Task completed and logged successfully!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setShowCompleteModal(false);
      setTaskToComplete(null);
    }
  };

  const handleCancelComplete = () => {
    setShowCompleteModal(false);
    setTaskToComplete(null);
  };

  const handleEditClick = (task: ITask) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };

  const handleSaveEditedTask = async (updatedTask: ITask) => {
    try {
      const response = await fetch(`/api/tasks/${updatedTask._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...updatedTask, createGoogleEvent: googleConnected }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }
      const newTask: ITask = await response.json();
      handleTaskUpdated(newTask);
      setShowEditModal(false);
      setTaskToEdit(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setTaskToEdit(null);
  };

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }
  if (error) return <div className="text-center text-red-400">Error: {error}</div>;

  return (
    <div ref={pageRef} className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center text-white mb-8">Your Tasks</h1>
      {!googleConnected && (
        <div className="bg-gray-800 border-l-4 border-yellow-500 text-yellow-600 p-4 mb-4" role="alert">
          <p className="font-bold">Google Calendar Disconnected</p>
          <p>Your Google account is not connected or authentication has expired. Google Calendar features will not work until you reconnect.</p>
          <button
            onClick={() => signIn('google')}
            className="mt-2 px-4 py-2 bg-transparent border cursor-pointer hover:text-gray-400 rounded-md text-white font-semibold transition-colors duration-200"
          >
            Reconnect to Google
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <TaskEntryForm onTaskAdded={handleTaskAdded} />
        </div>
        <div className="md:col-span-2">
          <TaskList
            tasks={tasks.filter(task => !task.isCompleted)}
            onTaskUpdated={handleTaskUpdated}
            onDeleteClick={handleDeleteClick}
            onCompleteClick={handleCompleteClick}
            onEditClick={handleEditClick}
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

      {showCompleteModal && taskToComplete && (
        <CompleteTaskModal
          task={taskToComplete}
          onClose={handleCancelComplete}
          onConfirm={handleConfirmComplete}
        />
      )}

      {showEditModal && taskToEdit && (
        <EditTaskModal
          task={taskToEdit}
          onClose={handleCloseEditModal}
          onSave={handleSaveEditedTask}
          createGoogleEvent={googleConnected}
        />
      )}
    </div>
  );
}
