import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Bell, Calendar, DollarSign, Star, Gift, Settings, Trash2, MailOpen } from 'lucide-react';

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');

  const notifications = [
    {
      id: '1',
      type: 'booking',
      message: 'Your appointment with Kings Cut Barber Shop has been confirmed for tomorrow at 10:00 AM.',
      time: '2 hours ago',
      read: false,
      icon: Calendar
    },
    {
      id: '2',
      type: 'payment',
      message: 'Your wallet has been credited with ₦4,968 for a completed service.',
      time: '5 hours ago',
      read: true,
      icon: DollarSign
    },
    {
      id: '3',
      type: 'review',
      message: 'John Adebayo left you a 5-star review: "Excellent haircut and great service!"',
      time: '1 day ago',
      read: true,
      icon: Star
    },
    {
      id: '4',
      type: 'loyalty',
      message: 'You have earned 240 loyalty points for your recent bookings.',
      time: '3 days ago',
      read: true,
      icon: Gift
    },
    {
      id: '5',
      type: 'app',
      message: 'New app settings available. Update your preferences now.',
      time: '1 week ago',
      read: true,
      icon: Settings
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  return (
    <Layout userType="customer">
      <Header title="Notifications" />
      
      <div className="pt-24 px-4 py-4">
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
              const Icon = notification.icon || Bell;
              return (
                <div 
                  key={notification.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-green-50 text-green-600">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{notification.message}</p>
                        <p className="text-sm text-gray-600">{notification.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          New
                        </span>
                      )}
                      <button className="p-1 hover:bg-gray-100 rounded-full">
                        <Trash2 size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12">
              <Bell className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          )}
        </div>

        {/* Mark all as read button */}
        {filteredNotifications.filter(n => !n.read).length > 0 && (
          <button className="w-full py-3 bg-green-50 text-green-700 rounded-xl font-medium hover:bg-green-100 transition-colors">
            <MailOpen size={16} className="inline-block mr-2" />
            Mark all as read
          </button>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;
