import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  Add,
  ChevronLeft,
  ChevronRight,
  Close,
  ContentCopy,
  PushPin,
} from '@mui/icons-material';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';

interface SidebarTask {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  color?: string;
  isTask?: boolean;
}

interface SidebarProps {
  currentDate: Date;
  onSelectDate: (date: Date) => void;
  onCreateClick: () => void;
  tasks: SidebarTask[];
  onDropTaskToDate: (taskId: string, date: Date, behavior: 'move' | 'copy') => void;
  onCopyTask: (taskId: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const parseTaskDate = (task: SidebarTask) =>
  typeof task.date === 'string' ? new Date(task.date) : new Date(task.date);

export default function Sidebar({
  currentDate,
  onSelectDate,
  onCreateClick,
  tasks,
  onDropTaskToDate,
  onCopyTask,
  isMobile = false,
  onClose,
}: SidebarProps) {
  const [monthDate, setMonthDate] = useState(currentDate);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);

  useEffect(() => {
    setMonthDate(currentDate);
  }, [currentDate]);

  const firstDay = startOfWeek(startOfMonth(monthDate));
  const lastDay = endOfWeek(endOfMonth(monthDate));
  const days = eachDayOfInterval({ start: firstDay, end: lastDay });

  const sortedTasks = useMemo(
    () =>
      [...tasks]
        .filter((task) => task.isTask)
        .sort((a, b) => parseTaskDate(a).getTime() - parseTaskDate(b).getTime()),
    [tasks]
  );

  const selectedDayTasks = sortedTasks.filter((task) => isSameDay(parseTaskDate(task), currentDate));
  const otherTasks = sortedTasks.filter((task) => !isSameDay(parseTaskDate(task), currentDate));

  const renderTaskCard = (task: SidebarTask, behavior: 'move' | 'copy') => {
    const taskDate = parseTaskDate(task);

    return (
      <Paper
        key={task.id}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', task.id);
          event.dataTransfer.setData('application/x-calendar-drag-action', behavior);
          event.dataTransfer.effectAllowed = behavior === 'copy' ? 'copy' : 'move';
        }}
        sx={{
          p: 1.25,
          borderRadius: 2,
          borderLeft: `4px solid ${task.color || '#1967d2'}`,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#202124',
            mb: 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.title}
        </Typography>
        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block' }}>
          {format(taskDate, 'MMM d, yyyy')}
          {task.time ? ` - ${task.time}` : ''}
        </Typography>
        <Button
          size="small"
          variant="text"
          startIcon={<ContentCopy sx={{ fontSize: '14px' }} />}
          onClick={() => onCopyTask(task.id)}
          sx={{
            mt: 1,
            px: 0,
            minWidth: 0,
            justifyContent: 'flex-start',
            textTransform: 'none',
            fontSize: '0.75rem',
          }}
        >
          Copy
        </Button>
      </Paper>
    );
  };

  return (
    <Box
      sx={{
        width: isMobile ? 'min(88vw, 320px)' : 280,
        height: '100%',
        backgroundColor: '#fff',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#202124' }}>
              Planner
            </Typography>
            <Typography variant="caption" sx={{ color: '#5f6368' }}>
              {format(currentDate, 'EEE, MMM d')}
            </Typography>
          </Box>
          {onClose && (
            <IconButton size="small" onClick={onClose} sx={{ color: '#5f6368' }}>
              <Close sx={{ fontSize: '20px' }} />
            </IconButton>
          )}
        </Box>

        <Paper
          sx={{
            p: 1.5,
            mb: 1.5,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#202124', mb: 0.5 }}>
            {selectedDayTasks.length} task{selectedDayTasks.length === 1 ? '' : 's'} on this day
          </Typography>
          <Typography variant="caption" sx={{ color: '#5f6368', display: 'block' }}>
            {sortedTasks.length} total pinned task{sortedTasks.length === 1 ? '' : 's'} in the sidebar
          </Typography>
          {isMobile && (
            <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', mt: 0.75 }}>
              Open this panel when you want quick create, date jump, or task copy.
            </Typography>
          )}
        </Paper>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Add />}
          onClick={onCreateClick}
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            borderColor: '#dadce0',
            color: '#3c4043',
            '&:hover': {
              backgroundColor: '#f8f9fa',
            },
          }}
        >
          Quick create
        </Button>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <IconButton
            size="small"
            onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1))}
          >
            <ChevronLeft sx={{ fontSize: '20px' }} />
          </IconButton>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {format(monthDate, 'MMMM yyyy')}
          </Typography>
          <IconButton
            size="small"
            onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1))}
          >
            <ChevronRight sx={{ fontSize: '20px' }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Typography
              key={`weekday-${index}`}
              sx={{
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#5f6368',
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
          {days.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const isSelected = day.toDateString() === currentDate.toDateString();
            const isCurrentMonth = day.getMonth() === monthDate.getMonth();
            const dateKey = day.toISOString();
            const isDropTarget = dragOverDate === dateKey;

            return (
              <Box
                key={day.toString()}
                onClick={() => onSelectDate(day)}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragOverDate(dateKey);
                }}
                onDragLeave={() => {
                  if (dragOverDate === dateKey) {
                    setDragOverDate(null);
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const taskId = event.dataTransfer.getData('text/plain');
                  const dragBehavior =
                    event.dataTransfer.getData('application/x-calendar-drag-action') === 'copy'
                      ? 'copy'
                      : 'move';
                  setDragOverDate(null);
                  if (!taskId) return;
                  onDropTaskToDate(taskId, day, dragBehavior);
                }}
                sx={{
                  padding: '4px',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderRadius: '50%',
                  backgroundColor: isDropTarget
                    ? '#d3e3fd'
                    : isSelected
                    ? '#1967d2'
                    : isToday
                    ? '#e8f0fe'
                    : 'transparent',
                  color: isSelected ? '#fff' : isToday ? '#1967d2' : isCurrentMonth ? '#3c4043' : '#b0b7c3',
                  fontWeight: isToday || isSelected ? 600 : 400,
                  outline: isDropTarget ? '2px dashed #1967d2' : 'none',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: isSelected ? '#1967d2' : '#f1f3f4',
                  },
                }}
              >
                {format(day, 'd')}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <PushPin sx={{ fontSize: '18px', color: '#5f6368' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#3c4043' }}>
            Pinned tasks
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#5f6368', display: 'block', mb: 1.5 }}>
          Drag a task and drop it on a day above to create a copy on that date.
        </Typography>

        {selectedDayTasks.length === 0 ? (
          <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa', mb: 2 }}>
            <Typography variant="body2">No pinned tasks for this day.</Typography>
          </Paper>
        ) : (
          <Stack spacing={1.25} sx={{ mb: 2 }}>
            {selectedDayTasks.map((task) => renderTaskCard(task, 'copy'))}
          </Stack>
        )}
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, color: '#3c4043' }}>
          Other tasks
        </Typography>
        {otherTasks.length === 0 ? (
          <Paper sx={{ p: 1.5, bgcolor: '#f8f9fa' }}>
            <Typography variant="body2">No other tasks yet.</Typography>
          </Paper>
        ) : (
          <Stack spacing={1.25}>
            {otherTasks.map((task) => renderTaskCard(task, 'copy'))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
