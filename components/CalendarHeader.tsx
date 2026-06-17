import React from 'react';
import { Box, Typography } from '@mui/material';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarHeaderProps {
  isMobile?: boolean;
}

export default function CalendarHeader({ isMobile = false }: CalendarHeaderProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 1,
        mb: 2,
      }}
    >
      {WEEKDAYS.map((day) => (
        <Box
          key={day}
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            py: 1,
            fontSize: isMobile ? '0.75rem' : '1rem',
            color: '#666',
          }}
        >
          {day}
        </Box>
      ))}
    </Box>
  );
}
