"use client";

import { ITask } from '@/models/Task';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface TaskListProps {
  tasks: ITask[];
  onTaskUpdated: (task: ITask) => void;
  onDeleteClick: (task: ITask) => void;
}

export default function TaskList({ tasks, onTaskUpdated, onDeleteClick }: TaskListProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const listRef = useRef(null);

  useGSAP(() => {
    gsap.from(".task-item", { opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: "power2.out" });
  }, { scope: listRef, dependencies: [tasks] });

  const handleMarkComplete = async (task: ITask) => {
    setLoadingTaskId(task._id.toString());
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted: true }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark task as complete');
      }

      const updatedTask: ITask = await response.json();
      onTaskUpdated(updatedTask);
      toast.success('Task marked as complete and logged!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingTaskId(null);
    }
  };

  return (
    <div ref={listRef} className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4">
      <h2 className="text-2xl font-bold text-white mb-4">Active Tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-gray-400">No active tasks. Time to add some!</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task._id.toString()}
              className="task-item bg-gray-700 p-4 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center shadow-md"
            >
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                {task.description && (
                  <p className="text-gray-300 text-sm mt-1">{task.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-400 mt-2 space-x-3">
                  {task.dueDate && (
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  )}
                  {task.priority && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium
                        ${task.priority === 'High' ? 'bg-red-500 text-white' : ''}
                        ${task.priority === 'Medium' ? 'bg-yellow-500 text-gray-900' : ''}
                        ${task.priority === 'Low' ? 'bg-green-500 text-white' : ''}
                      `}
                    >
                      {task.priority}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 mt-3 md:mt-0">
                <button
                  onClick={() => handleMarkComplete(task)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  disabled={loadingTaskId === task._id.toString()}
                >
                  {loadingTaskId === task._id.toString() ? 'Completing...' : 'Complete'}
                </button>
                <button
                  onClick={() => onDeleteClick(task)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  disabled={loadingTaskId === task._id.toString()}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
