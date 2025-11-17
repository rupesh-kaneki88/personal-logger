"use client";

import { useState, useCallback } from 'react';
import { Calendar, momentLocalizer, View, NavigateAction, HeaderProps } from 'react-big-calendar';
import moment from 'moment';
import { ITask } from '@/models/Task';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '@/css/TaskWeekView.css';

function CustomDateHeader({ date }: HeaderProps) {
  const dayNum = moment(date).format('D'); // e.g., 17
  const dayAbbr = moment(date).format('ddd'); // e.g., Mon

  return (
    <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{dayNum}</div>
      <div style={{ fontSize: '0.8rem' }}>{dayAbbr}</div>
    </div>
  );
}


const localizer = momentLocalizer(moment);

interface TaskWeekViewProps {
  tasks: ITask[];
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource: ITask;
}

export default function TaskWeekView({ tasks }: TaskWeekViewProps) {
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(new Date());

  const events: CalendarEvent[] = tasks
    .filter(task => !task.isCompleted)
    .map(task => {
      const startDate = new Date(task.dueDate || task.createdAt);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      return {
        title: task.title,
        start: startDate,
        end: endDate,
        resource: task,
      };
    });

  const handleNavigate = useCallback((newDate: Date, view: View, action: NavigateAction) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    const priority = event.resource.priority;
    
    let backgroundColor = '#1e5f3a';
    let borderLeftColor = '#4caf50';
    
    if (priority === 'High') {
      backgroundColor = '#5f1e1e';
      borderLeftColor = '#ea4335';
    } else if (priority === 'Medium') {
      backgroundColor = '#5f4a1e';
      borderLeftColor = '#fbbc04';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.95,
        color: 'white',
        border: 'none',
        borderLeft: `2px solid ${borderLeftColor}`,
        padding: '2px 6px',
        fontSize: '0.75rem',
      },
    };
  };

  return (
    <div className="calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        views={['week', 'day', 'agenda']}
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        step={60}
        timeslots={1}
        showMultiDayTimes
        tooltipAccessor={(event: CalendarEvent) => 
          `${event.title}\nPriority: ${event.resource.priority}`
        }
        components={{
          header: CustomDateHeader,
        }}
      />
    </div>
  );
}