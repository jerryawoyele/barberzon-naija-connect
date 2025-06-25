import apiClient from './api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  dataPayload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  status: string;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface PushToken {
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
}

/**
 * Service for handling notification-related API calls
 */
class NotificationService {
  /**
   * Get user notifications
   */
  async getUserNotifications(page: number = 1, limit: number = 20, read?: boolean) {
    try {
      const response = await apiClient.get<NotificationResponse>('/notifications', {
        params: {
          page,
          limit,
          read: read !== undefined ? String(read) : undefined
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    try {
      const response = await apiClient.patch<{ status: string; message: string; data: Notification }>(
        `/notifications/${notificationId}/read`
      );
      return response.data;
    } catch (error) {
      console.error(`Error marking notification ${notificationId} as read:`, error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await apiClient.patch<{ status: string; message: string }>(
        '/notifications/read-all'
      );
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Register push token
   */
  async registerPushToken(token: PushToken) {
    try {
      const response = await apiClient.post<{ status: string; message: string; data: Record<string, unknown> }>(
        '/notifications/push-token',
        token
      );
      return response.data;
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  /**
   * Unregister push token
   */
  async unregisterPushToken(deviceToken: string) {
    try {
      const response = await apiClient.delete<{ status: string; message: string }>(
        '/notifications/push-token',
        {
          data: { deviceToken }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error unregistering push token:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    try {
      const response = await this.getUserNotifications(1, 1, false);
      return response.data.pagination.total;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }

  /**
   * Format notification time
   */
  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
