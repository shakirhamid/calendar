import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import {
  startOfWeek,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
} from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  description?: string;
  color?: string;
}

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onTimeSlotClick: (date: Date, hour: number) => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (id: string) => void;
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

export default function WeekView({
  currentDate,
  events,
  onTimeSlotClick,
  onEditEvent,
  onDeleteEvent,
  onMoveEvent,
  highlightEventId,
}: WeekViewProps) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      const eventHour = event.time ? parseInt(event.time.split(':')[0], 10) : 10;

      return isSameDay(eventDate, date) && eventHour === hour;
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      {/* Week Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '60px repeat(7, 1fr)',
          borderBottom: '1px solid #e0e0e0',
          position: 'sticky',
          top: 0,
          backgroundColor: '#fff',
          zIndex: 10,
        }}
      >
        <Box sx={{ p: 1 }} /> {/* Empty corner */}
        {daysInWeek.map((day) => {
          const todayCheck = isToday(day);
          return (
            <Box
              key={day.toString()}
              sx={{
                p: 1.5,
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                backgroundColor: todayCheck ? '#e8f0fe' : '#fff',
              }}
            >
              <Typography variant="body2" sx={{ color: '#5f6368', fontSize: '0.875rem' }}>
                {format(day, 'EEE')}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: todayCheck ? '#1967d2' : '#3c4043',
                }}
              >
                {format(day, 'd')}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Time Slots Grid */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Time Column */}
        <Box
          sx={{
            width: '60px',
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#f9faf9',
          }}
        >
          {HOURS.map((hour) => (
            <Box
              key={hour}
              sx={{
                height: '60px',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                pt: 0.5,
              }}
            >
              <Typography variant="caption" sx={{ color: '#5f6368', fontSize: '0.75rem' }}>
                {TIME_LABELS[hour]}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Days Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(7, 1fr)`,
            flex: 1,
          }}
        >
          {daysInWeek.map((day) => (
            <Box
              key={day.toString()}
              sx={{
                borderRight: '1px solid #e0e0e0',
              }}
            >
              {HOURS.map((hour) => {
                const slotEvents = getEventsForTimeSlot(day, hour);

                return (
                  <Box
                    key={`${day}-${hour}`}
                    onClick={() => onTimeSlotClick(day, hour)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const eventId = e.dataTransfer.getData('text/plain');
                      if (!eventId || !onMoveEvent) return;
                      onMoveEvent(eventId, day, `${String(hour).padStart(2, '0')}:00`);
                    }}
                    sx={{
                      height: '60px',
                      borderBottom: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: isToday(day) && hour === new Date().getHours() ? '#e8f0fe' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#f1f3f4',
                      },
                      p: 0.5,
                      overflow: 'hidden',
                    }}
                  >
                    {slotEvents.map((event) => (
                      <Paper
                        key={event.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', event.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        sx={{
                          p: 0.75,
                          backgroundColor: event.color || '#1967d2',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          mb: 0.25,
                          cursor: 'move',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 0.25,
                          border: event.id === highlightEventId ? '2px solid #ffeb3b' : 'none',
                          boxShadow: event.id === highlightEventId ? '0 0 0 1px rgba(255,235,59,0.3)' : 'none',
                          '&:hover': {
                            opacity: 0.85,
                          },
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#fff',
                            fontSize: '0.7rem',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            flex: 1,
                          }}
                        >
                          {event.time} {event.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.25 }}>
                          {onEditEvent && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEvent(event);
                              }}
                              sx={{
                                color: '#fff',
                                padding: '2px',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                              }}
                            >
                              <EditIcon sx={{ fontSize: '14px' }} />
                            </IconButton>
                          )}
                          {onDeleteEvent && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(event.id);
                              }}
                              sx={{
                                color: '#fff',
                                padding: '2px',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: '14px' }} />
                            </IconButton>
                          )}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
