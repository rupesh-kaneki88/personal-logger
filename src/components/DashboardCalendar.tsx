"use client";

import { Calendar, CalendarCell, CalendarGrid, CalendarGridHeader, CalendarHeaderCell, CalendarGridBody, Button, Heading } from 'react-aria-components';
import { I18nProvider, useLocale } from 'react-aria';
import { isSameDay } from 'date-fns';
import { getLocalTimeZone, CalendarDate } from '@internationalized/date';
import { ITask } from '@/models/Task';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardCalendarProps {
  tasks: ITask[];
  onDayClick: (date: Date | undefined) => void;
  selectedDate: Date | undefined;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string; date: string };
  end: { dateTime: string; date: string };
}

export default function DashboardCalendar({ tasks, onDayClick, selectedDate }: DashboardCalendarProps) {
  const { locale } = useLocale();
  const { data: session } = useSession();
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);

  useEffect(() => {
    const fetchGoogleEvents = async () => {
      if (session?.accessToken) {
        try {
          const res = await fetch('/api/google-calendar/events');
          if (res.ok) {
            const data = await res.json();
            setGoogleEvents(data);
          } else {
            console.error('Failed to fetch Google Calendar events');
          }
        } catch (error) {
          console.error('Error fetching Google Calendar events:', error);
        }
      }
    };

    fetchGoogleEvents();
  }, [session?.accessToken, selectedDate]); // Refetch when session or selectedDate changes

  const getTaskColorClass = (priority: ITask['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <I18nProvider locale={locale}>
      <Calendar
        aria-label="Tasks calendar"
        value={selectedDate ? new CalendarDate(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate()) : undefined}
        onChange={(date) => onDayClick(date ? date.toDate(getLocalTimeZone()) : undefined)}
        className="bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-700 text-white"
      >
        <header className="flex justify-between items-center mb-4">
          <Button slot="previous">
            <ChevronLeftIcon className="h-6 w-6" />
          </Button>
          <Heading className="text-xl font-medium" />
          <Button slot="next">
            <ChevronRightIcon className="h-6 w-6" />
          </Button>
        </header>
        <CalendarGrid className="w-full border-separate border-spacing-1">
          <CalendarGridHeader>
            {(day) => (
              <CalendarHeaderCell className="text-center font-medium text-gray-400">{day}</CalendarHeaderCell>
            )}
          </CalendarGridHeader>
          <CalendarGridBody>
            {(date) => {
              const dayTasks = tasks.filter(
                (task) => task.dueDate && isSameDay(new Date(task.dueDate), date.toDate(getLocalTimeZone())) && !task.isCompleted
              );
              const dayGoogleEvents = googleEvents.filter(
                (event) =>
                  (event.start.date && isSameDay(new Date(event.start.date), date.toDate(getLocalTimeZone())))
              );
              return (
                <CalendarCell
                  date={date}
                  className="relative flex flex-col items-center justify-center h-14 w-14 rounded-md cursor-pointer hover:bg-gray-700 data-[selected]:bg-blue-600 data-[disabled]:text-gray-500"
                >
                  <div>{date.day}</div>
                  <div className="flex flex-wrap justify-center mt-1">
                    {dayTasks.map((task, index) => (
                      <div
                        key={`${task?._id?.toString() || index}`}
                        className={`w-2 h-2 rounded-full mx-0.5 ${getTaskColorClass(task.priority)}`}
                        title={task.title}
                      />
                    ))}
                    {dayGoogleEvents.map((event, index) => (
                      <div
                        key={event.id || `google-event-${index}`}
                        className="w-2 h-2 rounded-full mx-0.5 bg-blue-400"
                        title={event.summary}
                      />
                    ))}
                  </div>
                </CalendarCell>
              );
            }}
          </CalendarGridBody>
        </CalendarGrid>
      </Calendar>
    </I18nProvider>
  );
}