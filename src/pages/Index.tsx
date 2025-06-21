
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import BarberCard from '@/components/BarberCard';
import { Search, Filter, Heart } from 'lucide-react';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteBarbers = [
    {
      id: '1',
      name: 'Emeka Okafor',
      shopName: 'Kings Cut Barber Shop',
      rating: 4.8,
      distance: '0.5km',
      isAvailable: true,
      image: 'photo-1472099645785-5658abf4ff4e',
      specialties: ['Fade', 'Beard Trim'],
      price: 5000,
    },
    {
      id: '2',
      name: 'Ibrahim Hassan',
      shopName: 'Classic Cuts',
      rating: 4.9,
      distance: '1.2km',
      isAvailable: false,
      image: 'photo-1507003211169-0a1dd7228f2d',
      specialties: ['Traditional Cut', 'Hot Towel'],
      price: 4500,
    },
    {
      id: '3',
      name: 'Tunde Adebayo',
      shopName: 'Fresh Look Barber Shop',
      rating: 4.7,
      distance: '0.8km',
      isAvailable: true,
      image: 'photo-1500648767791-00dcc994a43e',
      specialties: ['Afro Cut', 'Line Up'],
      price: 5500,
    },
  ];

  const handleBookBarber = (id: string) => {
    console.log('Booking barber:', id);
    // TODO: Implement booking modal
  };

  return (
    <Layout userType="customer">
      <div className="bg-gradient-to-br from-green-700 to-green-800 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">Good morning, John!</h1>
            <p className="text-green-100 text-sm">Find your perfect barber today</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-700 font-bold text-lg">J</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search barbers or shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-green-50 rounded-lg">
            <Filter className="text-green-700" size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">12</div>
              <div className="text-xs text-gray-500">Total Cuts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">4.9</div>
              <div className="text-xs text-gray-500">Your Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₦2,400</div>
              <div className="text-xs text-gray-500">Saved</div>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Heart className="text-red-500 mr-2" size={20} />
            Your Favorites
          </h2>
          <span className="text-green-700 text-sm font-medium">View All</span>
        </div>

        <div className="space-y-4">
          {favoriteBarbers.map((barber) => (
            <BarberCard
              key={barber.id}
              {...barber}
              onBook={handleBookBarber}
            />
          ))}
        </div>

        {/* Weekend Special Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 mt-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">Weekend Special!</h3>
              <p className="text-yellow-100 text-sm">Book any weekend slot and save 15%</p>
            </div>
            <button className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium text-sm">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
