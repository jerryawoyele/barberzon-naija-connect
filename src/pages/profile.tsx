
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import EditProfileModal from '@/components/EditProfileModal';
import { User, Edit, Heart, Star, Gift, HelpCircle, Settings, LogOut, Shield, Phone, Mail, MapPin, Camera, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { customerService, CustomerProfile } from '@/services';

const ProfilePage = () => {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [location, setLocation] = useState({ state: '', country: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerService.getProfile();
      setProfile(response.data);
      
      // Reverse geocode location if available
      if (response.data.locationLat && response.data.locationLng) {
        reverseGeocode(response.data.locationLat, response.data.locationLng);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      
      setLocation({
        state: data.principalSubdivision || data.locality || '',
        country: data.countryName || ''
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocation({
        state: 'Unknown',
        country: 'Nigeria'
      });
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleProfileUpdate = (updatedProfile: CustomerProfile) => {
    setProfile(updatedProfile);
    if (updatedProfile.locationLat && updatedProfile.locationLng) {
      reverseGeocode(updatedProfile.locationLat, updatedProfile.locationLng);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Layout userType="customer">
        <Header title="Profile" />
        <div className="pt-24 px-4 py-4">
          <div className="space-y-4">
            {/* Profile Header Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error state
  if (error) {
    return (
      <Layout userType="customer">
        <Header title="Profile" />
        <div className="pt-24 px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error loading profile</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchProfile}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show empty state if no profile
  if (!profile) {
    return (
      <Layout userType="customer">
        <Header title="Profile" />
        <div className="pt-24 px-4 py-4">
          <div className="text-center py-12">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h3>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = customerService.formatCustomerStats(profile);
  const profileCompletion = customerService.calculateProfileCompletion(profile);

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
      icon: Heart,
      title: 'Favorite Shops',
      subtitle: `${stats.favoriteShopsCount} saved shops`,
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
      subtitle: `${stats.loyaltyPoints} points available`,
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Profile Details</h2>
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Edit size={18} />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={profile.profileImage} 
                  alt={profile.fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold">
                  {profile.fullName ? getInitials(profile.fullName) : <User size={32} />}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
              <p className="text-gray-600 text-sm mb-2">Member since {formatJoinDate(profile.createdAt)}</p>
              
              <div className="flex flex-col text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Phone size={14} className="mr-1" />
                  <span>{profile.phone || profile.phoneNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center">
                  <Mail size={14} className="mr-1" />
                  <span>{profile.email}</span>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={14} className="mr-1" />
                <span>
                  {location.state && location.country 
                    ? `${location.state}, ${location.country}`
                    : 'Location not set'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Total Bookings', value: stats.totalBookings, color: 'text-green-700' },
            { label: 'Your Rating', value: stats.averageRating.toFixed(1), color: 'text-blue-600' },
            { label: 'Total Spent', value: `₦${stats.totalSpent.toLocaleString()}`, color: 'text-purple-600' },
            { label: 'Loyalty Points', value: stats.loyaltyPoints, color: 'text-yellow-600' }
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
      
      {/* Edit Profile Modal */}
      {profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
          onUpdate={handleProfileUpdate}
        />
      )}
    </Layout>
  );
};

export default ProfilePage;
