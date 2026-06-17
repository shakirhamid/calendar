import React, { useEffect, useRef, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  sendNotification?: boolean;
}

interface NotificationCenterProps {
  enabled: boolean;
  events: CalendarEvent[];
}

export default function NotificationCenter({
  enabled,
  events,
}: NotificationCenterProps) {
  const [openNotification, setOpenNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const notifiedEventIds = useRef<Set<string>>(new Set());
  const checkIntervalMs = 15000;

  useEffect(() => {
    const checkUpcomingEvents = () => {
      const now = new Date();
      const dueEvents = events.filter((event) => {
        if (!event.sendNotification) return false;

        const eventDate = new Date(event.date);
        if (event.time) {
          const [hours, minutes] = event.time.split(':').map(Number);
          eventDate.setHours(hours, minutes, 0, 0);
        }

        const timeDiff = eventDate.getTime() - now.getTime();
        return (
          !notifiedEventIds.current.has(event.id) &&
          timeDiff <= 0 &&
          timeDiff > -checkIntervalMs
        );
      });

      if (dueEvents.length === 0) return;

      const event = dueEvents[0];
      const message = `It is time for ${event.title}${event.time ? ` at ${event.time}` : ''}`;

      notifiedEventIds.current.add(event.id);
      setNotificationMessage(message);
      setOpenNotification(true);

      if (enabled && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Calendar Reminder', {
          body: message,
        });
      }
    };

    checkUpcomingEvents();
    const interval = setInterval(checkUpcomingEvents, checkIntervalMs);

    return () => clearInterval(interval);
  }, [enabled, events]);

  return (
    <Snackbar
      open={openNotification}
      autoHideDuration={6000}
      onClose={() => setOpenNotification(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={() => setOpenNotification(false)}
        severity="info"
        sx={{ width: '100%' }}
      >
        {notificationMessage}
      </Alert>
    </Snackbar>
  );
}
