import { NextApiRequest, NextApiResponse } from 'next';
import { clearEvents, createEvent, readEvents } from '@/lib/server/event-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const events = await readEvents();
    res.status(200).json(events);
    return;
  }

  if (req.method === 'POST') {
    try {
      const newEvent = await createEvent(req.body || {});

      if (newEvent.sendNotification) {
        console.log('Notification: Upcoming event -', newEvent.title);
      }

      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Create error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    await clearEvents();
    res.status(200).json({ message: 'All events deleted' });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
