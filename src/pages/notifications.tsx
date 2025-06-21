
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Bell, Calendar, CreditCard, Star, Gift, Settings, Check, X } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your appointment with Emeka Okafor at Kings Cut is confirmed for June 22, 2:00 PM',
      time: '2 hours ago',
      isRead: false,
      icon: Calendar,
      color: 'green'
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Successful',
      message: 'Payment of ₦5,400 (inc. ₦400 platform fee) has been processed successfully',
      time: '3 hours ago',
      isRead: false,
      icon: CreditCard,
      color: 'blue'
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Appointment Reminder',
      message: 'Don\'t forget your appointment tomorrow at 2:00 PM with Emeka Okafor',
      time: '1 day ago',
      isRead: true,
      icon: Bell,
      color: 'yellow'
    },
    {
      id: '4',
      type: 'review',
      title: 'Rate Your Experience',
      message: 'How was your recent visit to Classic Cuts? Leave a review to help others',
      time: '2 days ago',
      isRead: true,
      icon: Star,
      color: 'purple'
    },
    {
      id: '5',
      type: 'promotion',
      title: 'Weekend Special!',
      message: 'Book any weekend appointment and get 15% off your next visit',
      time: '3 days ago',
      isRead: true,
      icon: Gift,
      color: 'red'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIconColor = (color: string) => {
    const colors = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const NotificationItem = ({ notification }: { notification: any }) => {
    const Icon = notification.icon;
    
    return (
      <div className={`p-4 border-b border-gray-100 ${!notification.isRead ? 'bg-green-50' : 'bg-white'}`}>
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${getIconColor(notification.color)}`}>
            <Icon size={20} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-2">
                <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
              </div>
              
              <div className="flex space-x-1 ml-2">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 hover:bg-green-100 rounded-full"
                    title="Mark as read"
                  >
                    <Check size={16} className="text-green-600" />
                  </button>
                )}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="p-1 hover:bg-red-100 rounded-full"
                  title="Remove"
                >
                  <X size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          </div>
          
          {!notification.isRead && (
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Layout userType="customer">
      <Header 
        title="Notifications" 
        rightAction={
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings size={20} className="text-gray-600" />
          </button>
        }
      />
      
      <div className="px-4 py-4">
        {/* Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up! We'll notify you of any updates.</p>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Booking Updates</p>
                <p className="text-sm text-gray-600">Confirmations, reminders, and changes</p>
              </div>
              <div className="w-12 h-6 bg-green-600 rounded-full relative">
                <div className="absolute right-0 top-0 w-6 h-6 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Payment Alerts</p>
                <p className="text-sm text-gray-600">Transaction confirmations and receipts</p>
              </div>
              <div className="w-12 h-6 bg-green-600 rounded-full relative">
                <div className="absolute right-0 top-0 w-6 h-6 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Promotions</p>
                <p className="text-sm text-gray-600">Special offers and discounts</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                <div className="absolute left-0 top-0 w-6 h-6 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">SMS Backup</p>
                <p className="text-sm text-gray-600">Important notifications via SMS</p>
              </div>
              <div className="w-12 h-6 bg-green-600 rounded-full relative">
                <div className="absolute right-0 top-0 w-6 h-6 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
