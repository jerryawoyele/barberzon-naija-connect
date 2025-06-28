import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import ShopOwnerDashboard from '@/components/ShopOwnerDashboard';
import { Bell, Filter, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

const BarberNotifications = () => {
  const [filter, setFilter] = useState<'all' | 'shop-requests' | 'appointments' | 'system'>('all');
  const [isShopOwner, setIsShopOwner] = useState(false);

  useEffect(() => {
    // Check if user is a shop owner
    // This would typically come from user context or API call
    setIsShopOwner(true); // Mock: assuming user owns a shop
  }, []);

  // Mock notifications data
  const notifications = [
    {
      id: '1',
      type: 'shop-request',
      title: 'New Barber Join Request',
      message: 'Ahmed Hassan wants to join your barbershop "Kings Cut Barber Shop"',
      timestamp: '5 minutes ago',
      isRead: false,
      data: {
        barberId: '123',
        barberName: 'Ahmed Hassan',
        shopId: '456'
      }
    },
    {
      id: '2',
      type: 'shop-request',
      title: 'Join Request Reminder',
      message: 'You have 2 pending join requests that need your attention',
      timestamp: '1 hour ago',
      isRead: false,
      data: {
        pendingCount: 2
      }
    },
    {
      id: '3',
      type: 'appointment',
      title: 'New Appointment Booking',
      message: 'John Adebayo booked a haircut for today at 3:00 PM',
      timestamp: '2 hours ago',
      isRead: true,
      data: {
        customerId: '789',
        customerName: 'John Adebayo',
        time: '3:00 PM'
      }
    },
    {
      id: '4',
      type: 'system',
      title: 'Weekly Earnings Report',
      message: 'Your earnings report for this week is ready',
      timestamp: '1 day ago',
      isRead: true,
      data: {}
    }
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.type === filter.replace('-', '_');
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'shop-request':
        return <Users className="text-blue-600" size={20} />;
      case 'appointment':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'system':
        return <Bell className="text-purple-600" size={20} />;
      default:
        return <Bell className="text-gray-600" size={20} />;
    }
  };

  const NotificationCard = ({ notification }: { notification: any }) => (
    <div className={`bg-white rounded-xl shadow-sm border p-4 mb-3 ${
      !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'border-gray-100'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${
          !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={`font-semibold ${
                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {notification.title}
              </h3>
              <p className={`text-sm mt-1 ${
                !notification.isRead ? 'text-gray-700' : 'text-gray-600'
              }`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-2">{notification.timestamp}</p>
            </div>
            {!notification.isRead && (
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            )}
          </div>
          
          {/* Action buttons for shop requests */}
          {notification.type === 'shop-request' && notification.data.barberId && (
            <div className="flex space-x-2 mt-3">
              <button className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">
                View Request
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200">
                Mark as Read
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const shopRequestCount = notifications.filter(n => n.type === 'shop-request' && !n.isRead).length;

  return (
    <Layout userType="barber">
      <Header 
        title="Notifications"
        rightAction={
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        }
      />
      
      <div className="pt-24 px-4 py-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <Bell className="text-red-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-xl font-bold text-gray-900">{unreadCount}</p>
              </div>
            </div>
          </div>
          
          {isShopOwner && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Join Requests</p>
                  <p className="text-xl font-bold text-gray-900">{shopRequestCount}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{notifications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6">
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'shop-requests', label: 'Join Requests', count: notifications.filter(n => n.type === 'shop-request').length },
              { key: 'appointments', label: 'Appointments', count: notifications.filter(n => n.type === 'appointment').length },
              { key: 'system', label: 'System', count: notifications.filter(n => n.type === 'system').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Special Shop Management Section */}
        {isShopOwner && filter === 'shop-requests' && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-6">
              <h2 className="text-lg font-semibold mb-2">Shop Management Dashboard</h2>
              <p className="text-blue-100 text-sm mb-4">
                Manage join requests and oversee your barbershop operations
              </p>
              <button 
                onClick={() => window.location.href = '/barber/dashboard'}
                className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors"
              >
                Open Shop Dashboard
              </button>
            </div>
            
            {/* Embed Shop Owner Dashboard for join requests */}
            <ShopOwnerDashboard />
          </div>
        )}

        {/* Notifications List */}
        {filter !== 'shop-requests' && (
          <div>
            {filteredNotifications.length > 0 ? (
              <div>
                {filteredNotifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {filter !== 'all' ? filter.replace('-', ' ') : ''} notifications
                </h3>
                <p className="text-gray-600">
                  You're all caught up! No notifications to show.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {filteredNotifications.some(n => !n.isRead) && filter !== 'shop-requests' && (
          <div className="mt-6 text-center">
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
              Mark All as Read
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BarberNotifications;
