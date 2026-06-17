import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Send push notification
    try {
      const { title, body, tokens } = req.body;

      // Firebase Cloud Messaging logic would go here
      console.log('Sending notification:', { title, body });

      res.status(200).json({
        success: true,
        message: 'Notification sent',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send notification' });
    }
  } else if (req.method === 'GET') {
    // Get notifications
    res.status(200).json([]);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
