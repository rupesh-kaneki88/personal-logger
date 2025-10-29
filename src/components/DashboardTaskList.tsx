"use client";

import { ITask } from '@/models/Task';
import { format, isSameDay } from 'date-fns';
import { CalendarIcon } from '@heroicons/react/24/outline'; // Using an icon for Google events

// Unified type for both tasks and Google Calendar events
export interface UpcomingItem {
  id: string;
  title: string;
  date: Date;
  description?: string;
  priority?: 'High' | 'Medium' | 'Low';
  isCompleted?: boolean;
  source: 'internal' | 'google';
}

interface DashboardTaskListProps {
  items: UpcomingItem[];
  selectedDate: Date | undefined;
  showGoogleEvents: boolean;
}

export default function DashboardTaskList({ items, selectedDate, showGoogleEvents }: DashboardTaskListProps) {
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

  // The list is already sorted by the parent component, so we just filter
  const filteredItems = items.filter(item => {
    if (item.isCompleted) return false;
    if (item.source === 'google' && !showGoogleEvents) return false;
    return true;
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 h-full">
      <h2 className="text-2xl font-bold text-white mb-4">
        Upcoming Tasks/Events
      </h2>
      {filteredItems.length === 0 ? (
        <p className="text-gray-400">No upcoming tasks or events.</p>
      ) : (
        <ul className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
          {filteredItems.map(item => {
            const isSelected = selectedDate && isSameDay(item.date, selectedDate);
            return (
              <li
              key={item.id}
              className={`bg-gray-700 p-3 rounded-md shadow-sm ${isSelected ? 'bg-blue-900' : ''}`}
              tabIndex={0}
              aria-label={`${item.source === 'google' ? 'Google Calendar Event' : 'Task'}: ${item.title}, Due: ${format(item.date, 'PPP')}${item.priority ? ', Priority: ' + item.priority : ''}`}
            >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  {item.source === 'google' && (
                    <CalendarIcon className="h-5 w-5 text-blue-400" title="Google Calendar Event" aria-label="Google Calendar Event" />
                  )}
                </div>
                {item.description && (
                  <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                )}
                <div className="flex items-center text-sm mt-2">
                  <span className="text-gray-400 mr-3">
                    Due: {format(item.date, 'PPP')}
                  </span>
                  {item.source === 'internal' && item.priority && (
                    <span className={`font-medium ${getPriorityColorClass(item.priority)}`}>
                      Priority: {item.priority}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}