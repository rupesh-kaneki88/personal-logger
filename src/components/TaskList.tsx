"use client";

import { ITask } from '@/models/Task';
import { useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface TaskListProps {
  tasks: ITask[];
  onTaskUpdated: (task: ITask) => void;
  onDeleteClick: (task: ITask, trigger: HTMLElement) => void;
  onEditClick: (task: ITask, trigger: HTMLElement) => void;
  onCompleteClick: (task: ITask, trigger: HTMLElement) => void;
}

export default function TaskList({ tasks, onTaskUpdated, onDeleteClick, onEditClick, onCompleteClick }: TaskListProps) {
  const listRef = useRef(null);

  useGSAP(() => {
    gsap.from(".task-item", { opacity: 0, y: 20, stagger: 0.1, duration: 0.5, ease: "power2.out" });
  }, { scope: listRef, dependencies: [tasks] });

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of today for date-only comparison
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const sortedTasks = [...tasks].sort((a, b) => {

    const aIsNearDue = 
      a.dueDate &&
      new Date(a.dueDate) >= now &&
      new Date(a.dueDate) <= threeDaysFromNow;

    const bIsNearDue =
      b.dueDate &&
      new Date(b.dueDate) >= now &&
      new Date(b.dueDate) <= threeDaysFromNow;

    if (aIsNearDue && !bIsNearDue) return -1;
    if (!aIsNearDue && bIsNearDue) return 1;

    const aIsExpired = a.dueDate && new Date(a.dueDate) < now;
    const bIsExpired = b.dueDate && new Date(b.dueDate) < now;

    if (aIsExpired && !bIsExpired) return -1;
    if (!aIsExpired && bIsExpired) return 1;
    
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    const aPriority = a.priority && a.priority in priorityOrder
      ? priorityOrder[a.priority]
      : 4;

    const bPriority = b.priority && b.priority in priorityOrder
      ? priorityOrder[b.priority]
      : 4;
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return 0;
  });

  return (
    <div ref={listRef} className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4">
      <h2 id="active-tasks-heading" className="text-2xl font-bold text-white mb-4">Active Tasks</h2>
      {sortedTasks.length === 0 ? (
        <p className="text-gray-400">No active tasks. Time to add some!</p>
      ) : (
        <ul className="space-y-3">
          {sortedTasks.map((task) => {
            const isExpired = task.dueDate && new Date(task.dueDate) < now;
            const isNearDue = task.dueDate && new Date(task.dueDate) >= now && new Date(task.dueDate) <= threeDaysFromNow;
            
            return (
              <li
                key={task._id.toString()}
                className={`task-item bg-gray-700 p-4 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center shadow-md relative border ${isExpired ? 'border-red-500' : 'border-transparent'}`}
                tabIndex={0}
                aria-label={`Task: ${task.title}, Description: ${task.description} Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}, Priority: ${task.priority}`}
              >
                {isNearDue && (
                  <div className="absolute top-2 right-2 flex items-center text-orange-400 text-xs font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                    </svg>
                    <span>Heads up</span>
                  </div>
                )}
                {isExpired && (
                  <div className="absolute top-2 right-2 flex items-center text-red-400 text-xs font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Due date passed</span>
                  </div>
                )}
                <div className="flex-grow pr-4 md:pr-28">
                  <h3 className={`text-lg font-semibold ${isExpired ? 'text-red-300' : 'text-white'}`}>{task.title}</h3>
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
                    onClick={(e) => onCompleteClick(task, e.currentTarget as HTMLElement)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Complete
                  </button>
                  <button
                    onClick={(e) => onEditClick(task, e.currentTarget as HTMLElement)}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => onDeleteClick(task, e.currentTarget as HTMLElement)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  );
}
