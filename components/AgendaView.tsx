import React from 'react';
import { Box, Chip, IconButton, Paper, Typography } from '@mui/material';
import { format, isSameDay, parseISO } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  description?: string;
  color?: string;
  isTask?: boolean;
}

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  title?: string;
}

function toDate(eventDate: Date | string) {
  return typeof eventDate === 'string' ? parseISO(eventDate) : eventDate;
}

export default function AgendaView({
  currentDate,
  events,
  onEditEvent,
  onDeleteEvent,
  title = 'Agenda',
}: AgendaViewProps) {
  const filteredEvents = events.filter((event) => isSameDay(toDate(event.date), currentDate));

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const aDate = toDate(a.date).getTime();
    const bDate = toDate(b.date).getTime();
    const aTime = a.time ? parseInt(a.time.replace(':', ''), 10) : 0;
    const bTime = b.time ? parseInt(b.time.replace(':', ''), 10) : 0;
    return aDate !== bDate ? aDate - bDate : aTime - bTime;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing items for {format(currentDate, 'EEEE, MMMM d, yyyy')}.
      </Typography>

      {sortedEvents.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <Typography>No items scheduled for this day.</Typography>
        </Paper>
      ) : (
        sortedEvents.map((event) => {
          const eventDate = toDate(event.date);
          const isToday = isSameDay(eventDate, currentDate);

          return (
            <Paper
              key={event.id}
              sx={{
                p: 2,
                mb: 2,
                borderLeft: `4px solid ${event.color || '#1976d2'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, minWidth: 0 }}>
                    {event.title}
                  </Typography>
                  <Chip
                    label={event.isTask ? 'Task' : 'Event'}
                    size="small"
                    color={event.isTask ? 'primary' : 'default'}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#5f6368', mb: 1 }}>
                  {format(eventDate, 'EEE, MMM d')}
                  {event.time ? ` - ${event.time}` : ' - All day'}
                  {isToday ? ' - Today' : ''}
                </Typography>
                {event.description && (
                  <Typography variant="body2" sx={{ color: '#3c4043' }}>
                    {event.description}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                <IconButton size="small" onClick={() => onEditEvent(event)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteEvent(event.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          );
        })
      )}
    </Box>
  );
}
