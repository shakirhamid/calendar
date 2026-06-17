import { NextApiRequest, NextApiResponse } from 'next';
import { deleteEvent, readEvents, updateEvent } from '@/lib/server/event-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const eventId = Array.isArray(id) ? id[0] : id;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  if (req.method === 'GET') {
    const events = await readEvents();
    const event = events.find((item) => item.id === eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(event);
  }

  if (req.method === 'PUT') {
    const savedEvent = await updateEvent(eventId, req.body || {});

    if (!savedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(savedEvent);
  }

  if (req.method === 'DELETE') {
    const deletedEvent = await deleteEvent(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json(deletedEvent);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
