"use client";

import { ITask } from '@/models/Task';
import { format, isSameDay } from 'date-fns';

interface DashboardTaskListProps {
  tasks: ITask[];
  selectedDate: Date | undefined;
}

export default function DashboardTaskList({ tasks, selectedDate }: DashboardTaskListProps) {
  const getPriorityColorClass = (priority: ITask['priority']) => {
    switch (priority) {
      case 'High':
        return 'text-red-400';
      case 'Medium':
        return 'text-yellow-400';
      case 'Low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredTasks = selectedDate
    ? tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate) && !task.isCompleted)
    : tasks.filter(task => !task.isCompleted).sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 h-full">
      <h2 className="text-2xl font-bold text-white mb-4">
        {selectedDate ? `Tasks for ${format(selectedDate, 'PPP')}` : 'Upcoming Tasks'}
      </h2>
      {filteredTasks.length === 0 ? (
        <p className="text-gray-400">No tasks for this {selectedDate ? 'day' : 'period'}.</p>
      ) : (
        <ul className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredTasks.map(task => (
            <li key={task._id.toString()} className="bg-gray-700 p-3 rounded-md shadow-sm">
              <h3 className="text-lg font-semibold text-white">{task.title}</h3>
              {task.description && (
                <p className="text-gray-300 text-sm mt-1">{task.description}</p>
              )}
              <div className="flex items-center text-sm mt-2">
                {task.dueDate && (
                  <span className="text-gray-400 mr-3">
                    Due: {format(new Date(task.dueDate), 'PPP')}
                  </span>
                )}
                {task.priority && (
                  <span className={`font-medium ${getPriorityColorClass(task.priority)}`}>
                    Priority: {task.priority}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
