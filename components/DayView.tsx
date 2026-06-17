import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import { format, isToday } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface CalendarEvent {
  id: string;
  title: string;
  date: string | Date;
  time?: string;
  description?: string;
  color?: string;
}

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onMoveEvent?: (id: string, date: Date, time: string) => void;
  highlightEventId?: string | null;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TIME_LABELS = [
  '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

export default function DayView({
  currentDate,
  events,
  onTimeSlotClick,
  onEditEvent,
  onDeleteEvent,
  onMoveEvent,
  highlightEventId,
}: DayViewProps) {
  const dayEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === currentDate.toDateString();
    })
    .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

  return (
    <Box>
      {/* Day header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          mb: 2,
        }}
      >
        <Typography variant="h6">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
          {isToday(currentDate) && (
            <span style={{ marginLeft: '8px', color: '#1976d2' }}>
              (Today)
            </span>
          )}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onTimeSlotClick(currentDate, 9)}
        >
          + Add Event
        </Button>
      </Box>

      {/* Time slots */}
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {HOURS.map((hour) => {
          const hourEvents = dayEvents.filter(
            (event) => parseInt((event.time || '00:00').split(':')[0], 10) === hour
          );
          const hasEvents = hourEvents.length > 0;

          return (
            <Box
              key={hour}
              sx={{
                display: 'flex',
                minHeight: hasEvents ? '80px' : '44px',
                borderBottom: '1px solid #f0f0f0',
                '&:hover': {
                  backgroundColor: '#f9f9f9',
                },
              }}
            >
              {/* Time label */}
              <Box
                sx={{
                  width: '80px',
                  pt: hasEvents ? 1 : 0.75,
                  pr: 2,
                  textAlign: 'right',
                  minWidth: '80px',
                  bgcolor: '#f5f5f5',
                  borderRight: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                  {TIME_LABELS[hour]}
                </Typography>
              </Box>

              {/* Time slot */}
              <Box
                sx={{
                  flex: 1,
                  p: hasEvents ? 1 : 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(25, 118, 210, 0.05)',
                  },
                }}
                onClick={() => onTimeSlotClick(currentDate, hour)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const eventId = e.dataTransfer.getData('text/plain');
                  if (!eventId || !onMoveEvent) return;
                  onMoveEvent(eventId, currentDate, `${String(hour).padStart(2, '0')}:00`);
                }}
              >
                {hourEvents.map((event) => (
                  <Paper
                    key={event.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', event.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    sx={{
                      p: 1,
                      mb: 1,
                      backgroundColor: event.color || '#1976d2',
                      color: 'white',
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'move',
                      boxShadow: event.id === highlightEventId ? 3 : 'none',
                      border: event.id === highlightEventId ? '2px solid #ffeb3b' : 'none',
                      '&:hover': {
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {event.time} {event.title}
                      </Typography>
                      {event.description && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            opacity: 0.9,
                          }}
                        >
                          {event.description}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEvent(event);
                        }}
                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEvent(event.id);
                        }}
                        sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
