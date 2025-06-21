
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Calendar, Clock, MapPin, Star, MessageCircle, Navigation } from 'lucide-react';

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingBookings = [
    {
      id: '1',
      barberName: 'Emeka Okafor',
      shopName: 'Kings Cut Barber Shop',
      date: '2024-06-22',
      time: '2:00 PM',
      services: ['Haircut', 'Beard Trim'],
      total: 5400,
      platformFee: 400,
      status: 'confirmed',
      image: 'photo-1472099645785-5658abf4ff4e',
      rating: 4.8,
      address: '123 Victoria Island, Lagos'
    },
    {
      id: '2',
      barberName: 'Tunde Adebayo',
      shopName: 'Fresh Look Barber Shop',
      date: '2024-06-24',
      time: '10:30 AM',
      services: ['Afro Cut'],
      total: 5940,
      platformFee: 440,
      status: 'pending',
      image: 'photo-1500648767791-00dcc994a43e',
      rating: 4.7,
      address: '45 Ikeja GRA, Lagos'
    }
  ];

  const pastBookings = [
    {
      id: '3',
      barberName: 'Ibrahim Hassan',
      shopName: 'Classic Cuts',
      date: '2024-06-15',
      time: '3:30 PM',
      services: ['Traditional Cut', 'Hot Towel'],
      total: 4860,
      platformFee: 360,
      status: 'completed',
      image: 'photo-1507003211169-0a1dd7228f2d',
      rating: 4.9,
      address: '78 Abuja Central Area'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const BookingCard = ({ booking, isPast = false }: { booking: any, isPast?: boolean }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <img
          src={`https://images.unsplash.com/${booking.image}?w=60&h=60&fit=crop&crop=face`}
          alt={booking.barberName}
          className="w-14 h-14 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{booking.barberName}</h3>
              <p className="text-gray-600 text-sm">{booking.shopName}</p>
            </div>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar size={14} className="mr-2" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-2" />
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={14} className="mr-2" />
              <span>{booking.address}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {booking.services.map((service: string) => (
              <span
                key={service}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {service}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-right">
              <div className="font-bold text-gray-900">₦{booking.total.toLocaleString()}</div>
              <div className="text-xs text-gray-500">inc. ₦{booking.platformFee} fee</div>
            </div>
            
            <div className="flex space-x-2">
              {!isPast && (
                <>
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                    <MessageCircle size={16} />
                  </button>
                  <button className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                    <Navigation size={16} />
                  </button>
                </>
              )}
              {isPast && (
                <button className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                  <Star size={14} className="mr-1" />
                  Rate
                </button>
              )}
            </div>
          </div>
          
          {!isPast && booking.status === 'confirmed' && (
            <div className="flex space-x-2 mt-3">
              <button className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                Reschedule
              </button>
              <button className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Layout userType="customer">
      <Header title="My Bookings" />
      
      <div className="px-4 py-4">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'upcoming' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'past' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Past ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        <div>
          {activeTab === 'upcoming' && (
            <div>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 mb-4">Book your next appointment to see it here</p>
                  <button className="bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                    Book Now
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'past' && (
            <div>
              {pastBookings.length > 0 ? (
                pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isPast />
                ))
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No past bookings</h3>
                  <p className="text-gray-600">Your booking history will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingsPage;
