import { Request, Response } from 'express';
import { prisma } from '../app';

/**
 * Get user notifications
 */
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { read, limit = '20', page = '1' } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Build filter based on query parameters
    const filter: {
      userId: string;
      isRead?: boolean;
    } = {
      userId
    };

    if (read !== undefined) {
      filter.isRead = read === 'true';
    }

    // Parse pagination parameters
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get notifications
    const notifications = await prisma.notification.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    // Get total count for pagination
    const totalCount = await prisma.notification.count({
      where: filter
    });

    return res.status(200).json({
      status: 'success',
      data: {
        notifications,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Find the notification
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    // Update notification
    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Update all unread notifications
    const { count } = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: { isRead: true }
    });

    return res.status(200).json({
      status: 'success',
      message: `${count} notifications marked as read`
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Register push token
 */
export const registerPushToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { deviceToken, platform } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!deviceToken || !platform) {
      return res.status(400).json({
        status: 'error',
        message: 'Device token and platform are required'
      });
    }

    // Check if token already exists
    const existingToken = await prisma.pushToken.findUnique({
      where: { deviceToken }
    });

    if (existingToken) {
      // Update existing token
      const updatedToken = await prisma.pushToken.update({
        where: { deviceToken },
        data: {
          userId,
          platform,
          isActive: true
        }
      });

      return res.status(200).json({
        status: 'success',
        message: 'Push token updated',
        data: updatedToken
      });
    }

    // Create new token
    const newToken = await prisma.pushToken.create({
      data: {
        userId,
        deviceToken,
        platform,
        isActive: true
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Push token registered',
      data: newToken
    });
  } catch (error) {
    console.error('Error registering push token:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register push token'
    });
  }
};

/**
 * Unregister push token
 */
export const unregisterPushToken = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { deviceToken } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!deviceToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Device token is required'
      });
    }

    // Find the token
    const token = await prisma.pushToken.findFirst({
      where: {
        deviceToken,
        userId
      }
    });

    if (!token) {
      return res.status(404).json({
        status: 'error',
        message: 'Push token not found'
      });
    }

    // Update token
    await prisma.pushToken.update({
      where: { id: token.id },
      data: { isActive: false }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Push token unregistered'
    });
  } catch (error) {
    console.error('Error unregistering push token:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to unregister push token'
    });
  }
};
