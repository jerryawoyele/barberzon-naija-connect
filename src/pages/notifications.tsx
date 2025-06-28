import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Bell, Calendar, DollarSign, Star, Gift, Settings, Trash2, MailOpen, Loader2, AlertCircle } from 'lucide-react';
import { notificationService } from '@/services';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
}

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getUserNotifications();
      setNotifications(response.data.notifications || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId);
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      booking: Calendar,
      appointment: Calendar,
      payment: DollarSign,
      transaction: DollarSign,
      review: Star,
      rating: Star,
      loyalty: Gift,
      reward: Gift,
      app: Settings,
      system: Settings,
    };
    return iconMap[type.toLowerCase()] || Bell;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Layout userType="customer">
      <Header title="Notifications" />
      
      <div className="pt-24 px-4 py-4">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <p className="text-red-800 font-medium">Error loading notifications</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchNotifications}
              className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
              {['all', 'booking', 'payment', 'review', 'loyalty', 'app'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filter === type 
                      ? 'bg-white text-green-700 shadow-sm' 
                      : 'text-gray-600'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {type === 'all' && ` (${notifications.length})`}
                  {type !== 'all' && ` (${notifications.filter(n => n.type === type).length})`}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <div 
                      key={notification.id}
                      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 transition-all duration-200 hover:shadow-md ${
                        !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className={`p-2 rounded-xl ${
                            notification.type === 'booking' ? 'bg-blue-50 text-blue-600' :
                            notification.type === 'payment' ? 'bg-green-50 text-green-600' :
                            notification.type === 'review' ? 'bg-yellow-50 text-yellow-600' :
                            notification.type === 'loyalty' ? 'bg-purple-50 text-purple-600' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1">
                            {notification.title && (
                              <p className="font-semibold text-gray-900 mb-1">{notification.title}</p>
                            )}
                            <p className="text-gray-700 text-sm leading-relaxed">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-2">{formatTime(notification.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {!notification.isRead && (
                            <>
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <button 
                                onClick={() => markAsRead(notification.id)}
                                disabled={markingAsRead === notification.id}
                                className="p-1 hover:bg-gray-100 rounded-full text-blue-600 hover:text-blue-700 transition-colors"
                                title="Mark as read"
                              >
                                {markingAsRead === notification.id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <MailOpen size={16} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
                  </h3>
                  <p className="text-gray-600">
                    {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications to show.`}
                  </p>
                </div>
              )}
            </div>

            {/* Mark all as read button */}
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="w-full py-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors"
              >
                <MailOpen size={16} className="inline-block mr-2" />
                Mark all {unreadCount} as read
              </button>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
