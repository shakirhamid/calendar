import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  date: {
    type: Date,
    required: true,
  },
  time: String,
  color: {
    type: String,
    default: '#1976d2',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,
    required: true,
  },
  tags: [String],
  reminders: [
    {
      type: String,
      enum: ['15min', '30min', '1hour', '1day'],
    },
  ],
});

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
