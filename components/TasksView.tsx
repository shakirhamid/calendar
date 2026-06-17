import React from 'react';
import AgendaView from './AgendaView';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  description?: string;
  color?: string;
  isTask?: boolean;
}

interface TasksViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export default function TasksView(props: TasksViewProps) {
  return <AgendaView {...props} title="Tasks" />;
}
