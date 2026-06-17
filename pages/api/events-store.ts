export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  color?: string;
  sendNotification?: boolean;
  isTask?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const seedTimestamp = '2026-06-05T09:00:00.000Z';

export const seedEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    date: '2026-06-05T09:00:00.000Z',
    time: '10:00',
    description: 'Weekly sync',
    color: '#1976d2',
    sendNotification: false,
    isTask: false,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: '2',
    title: 'Finish report',
    date: '2026-06-05T11:00:00.000Z',
    time: '14:00',
    description: 'Submit quarterly task report',
    color: '#ff9800',
    sendNotification: true,
    isTask: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];
