import express from 'express';
import { db } from '../db/index.js';
import { notifications } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userNotifications = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
    
    res.json({ success: true, data: userNotifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notif = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    if (notif.length === 0 || notif[0].userId !== userId) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
