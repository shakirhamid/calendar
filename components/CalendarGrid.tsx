import React from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import CalendarHeader from './CalendarHeader';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  color?: string;
}

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  isMobile?: boolean;
}

export default function CalendarGrid({
  currentDate,
  events,
  onDateClick,
  isMobile = false,
}: CalendarGridProps) {
  const firstDay = startOfWeek(startOfMonth(currentDate));
  const lastDay = endOfWeek(endOfMonth(currentDate));
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  const getEventsForDate = (date: Date) =>
    events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });

  return (
    <Box>
      <CalendarHeader isMobile={isMobile} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: isMobile ? 0.5 : 1,
        }}
      >
        {days.map((day) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <Paper
              key={day.toString()}
              onClick={() => onDateClick(day)}
              sx={{
                p: isMobile ? 0.5 : 1,
                minHeight: isMobile ? '64px' : '110px',
                cursor: 'pointer',
                backgroundColor: isTodayDate ? '#e3f2fd' : isCurrentMonth ? '#fff' : '#f5f5f5',
                border: isTodayDate ? '2px solid #1976d2' : '1px solid #ddd',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 3,
                  transform: 'translateY(-2px)',
                },
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                sx={{
                  fontWeight: isTodayDate ? 'bold' : 'normal',
                  color: isCurrentMonth ? '#000' : '#999',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  mb: 0.5,
                }}
              >
                {format(day, 'd')}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                  overflow: 'hidden',
                }}
              >
                {dayEvents.slice(0, 2).map((event) => (
                  <Chip
                    key={event.id}
                    label={event.time ? `${event.time} ${event.title}` : event.title}
                    size="small"
                    sx={{
                      fontSize: isMobile ? '0.65rem' : '0.75rem',
                      height: isMobile ? '18px' : '24px',
                      backgroundColor: event.color || '#1976d2',
                      color: '#fff',
                    }}
                  />
                ))}
                {dayEvents.length > 2 && (
                  <Typography
                    sx={{
                      fontSize: isMobile ? '0.6rem' : '0.7rem',
                      color: '#666',
                    }}
                  >
                    +{dayEvents.length - 2} more
                  </Typography>
                )}
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
