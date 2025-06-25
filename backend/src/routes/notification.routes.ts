import { Router, Request, Response } from 'express';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  registerPushToken,
  unregisterPushToken
} from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all notification routes
router.use(authenticate as any);

// Get user notifications
router.get('/', async (req: Request, res: Response) => {
  await getUserNotifications(req, res);
});

// Mark notification as read
router.patch('/:notificationId/read', async (req: Request, res: Response) => {
  await markNotificationAsRead(req, res);
});

// Mark all notifications as read
router.patch('/read-all', async (req: Request, res: Response) => {
  await markAllNotificationsAsRead(req, res);
});

// Register push token
router.post('/push-token', async (req: Request, res: Response) => {
  await registerPushToken(req, res);
});

// Unregister push token
router.delete('/push-token', async (req: Request, res: Response) => {
  await unregisterPushToken(req, res);
});

export default router;
