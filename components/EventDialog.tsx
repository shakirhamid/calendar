import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import { format } from 'date-fns';

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (eventData: any) => void;
  selectedDate: Date | null;
  defaultTime?: number;
  editEvent?: any;
}

export default function EventDialog({
  open,
  onClose,
  onSave,
  selectedDate,
  defaultTime = 10,
  editEvent,
}: EventDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: '10:00',
    color: '#1976d2',
    sendNotification: false,
    isTask: true,
  });

  useEffect(() => {
    if (editEvent) {
      // Load event data for editing
      setFormData({
        title: editEvent.title || '',
        description: editEvent.description || '',
        time: editEvent.time || '10:00',
        color: editEvent.color || '#1976d2',
        sendNotification: editEvent.sendNotification || false,
        isTask: editEvent.isTask ?? true,
      });
    } else if (defaultTime !== undefined) {
      // Set default time for new events
      const hours = String(defaultTime).padStart(2, '0');
      setFormData((prev) => ({
        ...prev,
        time: `${hours}:00`,
        isTask: true,
      }));
    }
  }, [editEvent, defaultTime, open]);

  const handleChange = (e: any) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Please enter event title');
      return;
    }

    const eventData: any = {
      ...formData,
      date: editEvent?.date || selectedDate || new Date(),
      isTask: editEvent?.id ? formData.isTask : true,
    };

    // Include ID if editing
    if (editEvent?.id) {
      eventData.id = editEvent.id;
    }

    onSave(eventData);

    setFormData({
      title: '',
      description: '',
      time: '10:00',
      color: '#1976d2',
      sendNotification: false,
      isTask: true,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editEvent
          ? `Edit Event - ${format(new Date(editEvent.date), 'MMMM dd, yyyy')}`
          : selectedDate
          ? format(selectedDate, 'MMMM dd, yyyy')
          : 'New Event'}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Event Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter event title"
            autoFocus
          />

          <TextField
            fullWidth
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            placeholder="Enter event description"
          />

          <Box>
            <TextField
              label="Color"
              name="color"
              type="color"
              value={formData.color}
              onChange={handleChange}
              sx={{ width: '60px' }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                name="sendNotification"
                checked={formData.sendNotification}
                onChange={handleChange}
              />
            }
            label="Send notification"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}
