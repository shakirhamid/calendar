import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Apps,
  ChevronLeft,
  ChevronRight,
  Help,
  KeyboardDoubleArrowRight,
  Menu as MenuIcon,
  NotificationsActive,
  NotificationsNone,
  Search,
  Settings,
} from '@mui/icons-material';
import { addDays, format } from 'date-fns';
import CalendarGrid from './CalendarGrid';
import DayView from './DayView';
import EventDialog from './EventDialog';
import NotificationCenter from './NotificationCenter';
import Sidebar from './Sidebar';
import TasksView from './TasksView';
import WeekView from './WeekView';

export type ViewType = 'week' | 'month' | 'day' | 'tasks';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  description?: string;
  color?: string;
  sendNotification?: boolean;
  isTask?: boolean;
}

interface CalendarAppProps {
  initialView?: ViewType;
}

function getRouteForView(view: ViewType) {
  if (view === 'week') return '/week';
  if (view === 'month') return '/month';
  if (view === 'day') return '/day';
  return '/tasks';
}

export default function CalendarApp({ initialView = 'week' }: CalendarAppProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState(0);
  const [notifications, setNotifications] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [view, setView] = useState<ViewType>(initialView);
  const [viewAnchor, setViewAnchor] = useState<null | HTMLElement>(null);
  const [editEvent, setEditEvent] = useState<CalendarEvent | null>(null);
  const [highlightEventId, setHighlightEventId] = useState<string | null>(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (!router.isReady) return;

    const taskId = Array.isArray(router.query.taskId)
      ? router.query.taskId[0]
      : router.query.taskId;

    if (!taskId) {
      setHighlightEventId(null);
      return;
    }

    if (events.length === 0) return;

    const event = events.find((item) => item.id === taskId);
    if (!event) return;

    const dateValue = typeof event.date === 'string' ? new Date(event.date) : event.date;
    setCurrentDate(dateValue);
    setHighlightEventId(event.id);
  }, [router.isReady, router.query.taskId, events]);

  useEffect(() => {
    fetchEvents();
    setupNotifications();
  }, []);

  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
      return;
    }

    setDesktopSidebarOpen(true);
  }, [isMobile]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const setupNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotifications(true);
    }
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) return;

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();

    setNotifications(permission === 'granted');
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setHighlightEventId(null);
  };

  const handlePrevious = () => {
    setHighlightEventId(null);

    if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
      return;
    }

    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
      return;
    }

    setCurrentDate(addDays(currentDate, -1));
  };

  const handleNext = () => {
    setHighlightEventId(null);

    if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
      return;
    }

    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
      return;
    }

    setCurrentDate(addDays(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditEvent(null);
    setOpenEventDialog(true);
  };

  const handleSidebarDateSelect = (date: Date) => {
    setCurrentDate(date);
    setHighlightEventId(null);
    setMobileSidebarOpen(false);
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedTime(hour);
    setEditEvent(null);
    setOpenEventDialog(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditEvent(event);
    setSelectedDate(typeof event.date === 'string' ? new Date(event.date) : event.date);
    setOpenEventDialog(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    try {
      if (
        eventData.sendNotification &&
        'Notification' in window &&
        Notification.permission !== 'granted'
      ) {
        const permission = await Notification.requestPermission();
        setNotifications(permission === 'granted');
      }

      if (editEvent?.id) {
        const response = await fetch(`/api/events/${editEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        const updatedEvent = await response.json();
        setEvents((currentEvents) =>
          currentEvents.map((event) => (event.id === editEvent.id ? updatedEvent : event))
        );
      } else {
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        const newEvent = await response.json();
        setEvents((currentEvents) => [...currentEvents, newEvent]);
      }

      setOpenEventDialog(false);
      setEditEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== id));
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handleMoveEvent = async (eventId: string, targetDate: Date, targetTime?: string) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;

    const updatedEvent = {
      ...event,
      date: targetDate.toISOString(),
      time: targetTime ?? event.time,
    };

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      const savedEvent = await response.json();
      setEvents((currentEvents) =>
        currentEvents.map((item) => (item.id === eventId ? savedEvent : item))
      );
    } catch (error) {
      console.error('Failed to move event:', error);
      setEvents((currentEvents) =>
        currentEvents.map((item) => (item.id === eventId ? updatedEvent : item))
      );
    }
  };

  const handleCopyEvent = async (eventId: string, targetDate: Date) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) return;

    const copiedEvent = {
      title: event.title,
      date: targetDate.toISOString(),
      time: event.time,
      description: event.description || '',
      color: event.color || '#1976d2',
      sendNotification: Boolean(event.sendNotification),
      isTask: true,
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copiedEvent),
      });
      const newEvent = await response.json();
      await fetchEvents();
      setHighlightEventId(newEvent.id);
    } catch (error) {
      console.error('Failed to copy event:', error);
    }
  };

  const navigateToView = (nextView: ViewType) => {
    setView(nextView);
    router.push(getRouteForView(nextView));
  };

  const taskCount = events.filter((event) => event.isTask).length;

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileSidebarOpen((current) => !current);
      return;
    }

    setDesktopSidebarOpen((current) => !current);
  };

  const viewButtons = [
    { value: 'week' as ViewType, label: 'Week' },
    { value: 'month' as ViewType, label: 'Month' },
    { value: 'day' as ViewType, label: 'Day' },
    { value: 'tasks' as ViewType, label: 'Tasks' },
  ];

  const query = searchQuery.trim().toLowerCase();
  const filteredEvents = query
    ? events.filter((event) =>
        [event.title, event.description, event.time]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query))
      )
    : events;

  const renderSearchInput = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f1f3f4',
        borderRadius: '20px',
        px: 1.5,
        minWidth: isMobile ? 'auto' : '220px',
      }}
    >
      <Search sx={{ fontSize: '20px', color: '#5f6368', mr: 1 }} />
      <InputBase
        placeholder="Search events"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        sx={{ flex: 1, fontSize: '0.875rem' }}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {!isMobile && desktopSidebarOpen && (
        <Sidebar
          currentDate={currentDate}
          onSelectDate={handleSidebarDateSelect}
          onCreateClick={() => {
            setSelectedDate(new Date());
            setEditEvent(null);
            setOpenEventDialog(true);
          }}
          tasks={events}
          onDropTaskToDate={(taskId, date) => {
            handleCopyEvent(taskId, date);
          }}
          onCopyTask={(taskId) => {
            handleCopyEvent(taskId, currentDate);
          }}
          onClose={() => setDesktopSidebarOpen(false)}
        />
      )}

      {!isMobile && !desktopSidebarOpen && (
        <Box
          sx={{
            width: 72,
            borderRight: '1px solid #e0e0e0',
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 2,
          }}
        >
          <IconButton
            onClick={() => setDesktopSidebarOpen(true)}
            sx={{
              border: '1px solid #dadce0',
              color: '#3c4043',
              backgroundColor: '#fff',
            }}
          >
            <KeyboardDoubleArrowRight />
          </IconButton>
          <Box sx={{ textAlign: 'center', px: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', color: '#5f6368', mb: 0.5 }}>
              Tasks
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1967d2' }}>
              {taskCount}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setSelectedDate(new Date());
              setEditEvent(null);
              setOpenEventDialog(true);
            }}
            sx={{
              minWidth: 0,
              px: 1,
              textTransform: 'none',
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            Create
          </Button>
        </Box>
      )}

      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          PaperProps={{
            sx: {
              backgroundColor: '#fff',
            },
          }}
        >
          <Sidebar
            currentDate={currentDate}
            onSelectDate={handleSidebarDateSelect}
            onCreateClick={() => {
              setSelectedDate(new Date());
              setEditEvent(null);
              setOpenEventDialog(true);
              setMobileSidebarOpen(false);
            }}
            tasks={events}
            onDropTaskToDate={(taskId, date) => {
              setMobileSidebarOpen(false);
              handleCopyEvent(taskId, date);
            }}
            onCopyTask={(taskId) => {
              setMobileSidebarOpen(false);
              handleCopyEvent(taskId, currentDate);
            }}
            isMobile
            onClose={() => setMobileSidebarOpen(false)}
          />
        </Drawer>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, pb: isMobile ? 8 : 0 }}>
        <AppBar position="static" elevation={1} sx={{ backgroundColor: '#fff', color: '#3c4043' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton size="small" onClick={handleSidebarToggle}>
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: '#1967d2', fontSize: '1.5rem' }}
              >
                Calendar
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleToday}
                sx={{ textTransform: 'none', borderColor: '#dadce0', color: '#3c4043' }}
              >
                Today
              </Button>
              <IconButton size="small" onClick={handlePrevious}>
                <ChevronLeft />
              </IconButton>
              <IconButton size="small" onClick={handleNext}>
                <ChevronRight />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  minWidth: isMobile ? '120px' : '180px',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                }}
              >
                {view === 'week' && `${format(currentDate, 'MMM d')} - ${format(addDays(currentDate, 6), 'MMM d, yyyy')}`}
                {view === 'month' && format(currentDate, 'MMMM yyyy')}
                {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
                {view === 'tasks' && 'Daily list'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && renderSearchInput()}
              <Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(event) => setViewAnchor(event.currentTarget)}
                  sx={{ textTransform: 'none', borderColor: '#dadce0', color: '#3c4043' }}
                >
                  {viewButtons.find((button) => button.value === view)?.label}
                </Button>
                <Menu
                  anchorEl={viewAnchor}
                  open={!!viewAnchor}
                  onClose={() => setViewAnchor(null)}
                >
                  {viewButtons.map((button) => (
                    <MenuItem
                      key={button.value}
                      onClick={() => {
                        navigateToView(button.value);
                        setViewAnchor(null);
                      }}
                    >
                      {button.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
              <Tooltip title={notifications ? 'Notifications enabled' : 'Enable notifications'}>
                <IconButton
                  size="small"
                  onClick={handleEnableNotifications}
                  color={notifications ? 'primary' : 'default'}
                >
                  {notifications ? (
                    <NotificationsActive sx={{ fontSize: '20px' }} />
                  ) : (
                    <NotificationsNone sx={{ fontSize: '20px' }} />
                  )}
                </IconButton>
              </Tooltip>
              <IconButton size="small">
                <Settings sx={{ fontSize: '20px' }} />
              </IconButton>
              <IconButton size="small">
                <Help sx={{ fontSize: '20px' }} />
              </IconButton>
              <IconButton size="small">
                <Apps sx={{ fontSize: '20px' }} />
              </IconButton>
            </Box>
          </Toolbar>

          {isMobile && (
            <Box sx={{ px: 2, pb: 1.5, bgcolor: '#fff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
                <Box sx={{ flex: 1 }}>{renderSearchInput()}</Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setMobileSidebarOpen(true)}
                  sx={{
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    borderColor: '#dadce0',
                    color: '#3c4043',
                  }}
                >
                  Planner
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: '#5f6368' }}>
                {taskCount} task{taskCount === 1 ? '' : 's'} ready to copy or reschedule
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, p: 1, bgcolor: '#f8f9fa', flexWrap: 'wrap' }}>
            {viewButtons.map((button) => (
              <Button
                key={button.value}
                size="small"
                component={Link}
                href={getRouteForView(button.value)}
                variant={view === button.value ? 'contained' : 'outlined'}
                sx={{ textTransform: 'none' }}
              >
                {button.label}
              </Button>
            ))}
          </Box>
        </AppBar>

        {searchQuery.trim() && filteredEvents.length === 0 && (
          <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #e0e0e0', bgcolor: '#fff8e1' }}>
            <Typography variant="body2" color="text.secondary">
              No events match {`"${searchQuery}"`}.
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {view === 'week' && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onTimeSlotClick={handleTimeSlotClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onMoveEvent={handleMoveEvent}
              highlightEventId={highlightEventId}
            />
          )}
          {view === 'day' && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              onTimeSlotClick={handleTimeSlotClick}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
              onMoveEvent={handleMoveEvent}
              highlightEventId={highlightEventId}
            />
          )}
          {view === 'month' && (
            <Box sx={{ p: 3 }}>
              <CalendarGrid
                currentDate={currentDate}
                events={filteredEvents}
                onDateClick={handleDateClick}
                isMobile={isMobile}
              />
            </Box>
          )}
          {view === 'tasks' && (
            <TasksView
              currentDate={currentDate}
              events={filteredEvents}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          )}
        </Box>

        {isMobile && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: '#fff',
              borderTop: '1px solid #e0e0e0',
              zIndex: 20,
              display: 'flex',
              justifyContent: 'space-around',
              p: 1,
              gap: 0.5,
            }}
          >
            {viewButtons.map((button) => (
              <Button
                key={button.value}
                component={Link}
                href={getRouteForView(button.value)}
                size="small"
                variant={view === button.value ? 'contained' : 'text'}
                sx={{ minWidth: 0, flex: 1, textTransform: 'none' }}
              >
                {button.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>

      <EventDialog
        open={openEventDialog}
        onClose={() => {
          setOpenEventDialog(false);
          setEditEvent(null);
        }}
        onSave={handleSaveEvent}
        selectedDate={selectedDate}
        defaultTime={selectedTime}
        editEvent={editEvent}
      />

      <NotificationCenter enabled={notifications} events={events} />
    </Box>
  );
}
