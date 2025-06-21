
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { User, Edit, Heart, Star, Gift, HelpCircle, Settings, LogOut, Shield, Phone, Mail, MapPin, Camera } from 'lucide-react';

const ProfilePage = () => {
  const [user] = useState({
    name: 'John Adebayo',
    email: 'john.adebayo@gmail.com',
    phone: '+234 803 123 4567',
    location: 'Victoria Island, Lagos',
    joinDate: 'March 2024',
    totalBookings: 12,
    favoriteShops: 3,
    totalSpent: 65400,
    loyaltyPoints: 240,
    rating: 4.9,
    avatar: 'photo-1472099645785-5658abf4ff4e'
  });

  const MenuSection = ({ title, items }: { title: string, items: any[] }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {items.map((item, index) => (
          <button
            key={index}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0 transition-all duration-200 hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${item.color} transition-transform duration-200 hover:scale-110`}>
                <item.icon size={20} />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">{item.title}</p>
                {item.subtitle && (
                  <p className="text-sm text-gray-600">{item.subtitle}</p>
                )}
              </div>
            </div>
            {item.badge && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const profileMenuItems = [
    {
      icon: Edit,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Heart,
      title: 'Favorite Shops',
      subtitle: `${user.favoriteShops} saved shops`,
      color: 'bg-red-100 text-red-600'
    },
    {
      icon: Star,
      title: 'My Reviews',
      subtitle: 'Rate your recent experiences',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Gift,
      title: 'Loyalty Points',
      subtitle: `${user.loyaltyPoints} points available`,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const settingsMenuItems = [
    {
      icon: Settings,
      title: 'App Settings',
      subtitle: 'Notifications, language, and more',
      color: 'bg-gray-100 text-gray-600'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Manage your data and security',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help with your account',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  const accountMenuItems = [
    {
      icon: LogOut,
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      color: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <Layout userType="customer">
      <Header title="Profile" />
      
      <div className="pt-24 px-4 py-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={`https://images.unsplash.com/${user.avatar}?w=80&h=80&fit=crop&crop=face`}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
              />
              <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg hover:scale-110 transition-transform">
                <Camera size={14} className="text-white" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 text-sm mb-2">Member since {user.joinDate}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Phone size={14} className="mr-1" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail size={14} className="mr-1" />
                  <span>{user.email}</span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                <span>{user.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: user.totalBookings, color: 'text-green-700' },
            { label: 'Your Rating', value: user.rating, color: 'text-blue-600' },
            { label: 'Total Spent', value: `₦${user.totalSpent.toLocaleString()}`, color: 'text-purple-600' },
            { label: 'Loyalty Points', value: user.loyaltyPoints, color: 'text-yellow-600' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-fade-in hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Sections */}
        <MenuSection title="Profile" items={profileMenuItems} />
        <MenuSection title="Settings" items={settingsMenuItems} />
        <MenuSection title="Account" items={accountMenuItems} />

        {/* App Version */}
        <div className="text-center text-sm text-gray-400 mt-8 mb-4">
          <p>Barberzon Nigeria v1.0.0</p>
          <p>Made with ❤️ in Nigeria</p>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
