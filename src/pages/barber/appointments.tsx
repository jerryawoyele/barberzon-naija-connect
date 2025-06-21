import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Calendar, Clock, User, MessageCircle, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

const BarberAppointments = () => {
  const [selectedDate, setSelectedDate] = useState('2024-06-22');
  const [filter, setFilter] = useState('all');

  const appointments = [
    {
      id: '1',
      customerName: 'John Adebayo',
      phone: '+234 803 123 4567',
      time: '9:00 AM',
      duration: 45,
      services: ['Haircut', 'Beard Trim'],
      status: 'completed',
      amount: 5400,
      platformFee: 432,
      netAmount: 4968,
      notes: 'Regular customer, prefers medium fade',
      image: 'photo-1472099645785-5658abf4ff4e',
      isVIP: true
    },
    {
      id: '2',
      customerName: 'Ibrahim Mohammed',
      phone: '+234 811 456 7890',
      time: '10:30 AM',
      duration: 30,
      services: ['Traditional Cut'],
      status: 'completed',
      amount: 4500,
      platformFee: 360,
      netAmount: 4140,
      notes: 'First-time customer',
      image: 'photo-1507003211169-0a1dd7228f2d',
      isVIP: false
    },
    {
      id: '3',
      customerName: 'Tunde Okafor',
      phone: '+234 709 234 5678',
      time: '2:00 PM',
      duration: 40,
      services: ['Afro Cut', 'Line Up'],
      status: 'confirmed',
      amount: 5500,
      platformFee: 440,
      netAmount: 5060,
      notes: 'Likes his hair short on the sides',
      image: 'photo-1500648767791-00dcc994a43e',
      isVIP: false
    },
    {
      id: '4',
      customerName: 'Kemi Williams',
      phone: '+234 802 345 6789',
      time: '4:00 PM',
      duration: 60,
      services: ['Premium Cut', 'Hot Towel', 'Styling'],
      status: 'pending',
      amount: 7500,
      platformFee: 600,
      netAmount: 6900,
      notes: 'Corporate client, very specific about styling',
      image: 'photo-1494790108755-2616c9fc2647',
      isVIP: true
    },
    {
      id: '5',
      customerName: 'Ahmed Hassan',
      phone: '+234 701 567 8901',
      time: '5:30 PM',
      duration: 30,
      services: ['Beard Trim'],
      status: 'cancelled',
      amount: 2500,
      platformFee: 200,
      netAmount: 2300,
      notes: 'Cancelled due to emergency',
      image: 'photo-1507003211169-0a1dd7228f2d',
      isVIP: false
    }
  ];

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === 'all') return true;
    return appointment.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={`https://images.unsplash.com/${appointment.image}?w=50&h=50&fit=crop&crop=face`}
              alt={appointment.customerName}
              className="w-12 h-12 rounded-full object-cover"
            />
            {appointment.isVIP && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">V</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{appointment.customerName}</h3>
            <p className="text-sm text-gray-600">{appointment.phone}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded-full">
            <MoreHorizontal size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm text-gray-600">
        <div className="flex items-center">
          <Clock size={14} className="mr-2" />
          <span>{appointment.time} ({appointment.duration} min)</span>
        </div>
        <div className="text-right">
          <div className="font-semibold text-gray-900">₦{appointment.netAmount.toLocaleString()}</div>
          <div className="text-xs text-gray-500">₦{appointment.platformFee} platform fee</div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {appointment.services.map((service: string) => (
          <span
            key={service}
            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
          >
            {service}
          </span>
        ))}
      </div>
      
      {appointment.notes && (
        <p className="text-sm text-gray-600 mb-3 italic">"{appointment.notes}"</p>
      )}
      
      <div className="flex space-x-2">
        {appointment.status === 'pending' && (
          <>
            <button className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
              <CheckCircle size={16} className="mr-1" />
              Confirm
            </button>
            <button className="flex-1 bg-red-50 text-red-600 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
              <XCircle size={16} className="mr-1" />
              Decline
            </button>
          </>
        )}
        
        {appointment.status === 'confirmed' && (
          <>
            <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium">
              Start Service
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium">
              <MessageCircle size={16} />
            </button>
          </>
        )}
        
        {appointment.status === 'completed' && (
          <button className="flex-1 bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg text-sm font-medium">
            View Receipt
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Layout userType="barber">
      <Header title="Appointments" />
      
      <div className="pt-24 px-4 py-4">
        {/* Date Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Select Date</h3>
            <Calendar size={20} className="text-gray-600" />
          </div>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === status 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)} 
              {status === 'all' && ` (${appointments.length})`}
              {status !== 'all' && ` (${appointments.filter(a => a.status === status).length})`}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-green-700">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.status === 'confirmed').length}
            </div>
            <div className="text-xs text-gray-500">Confirmed</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {appointments.filter(a => a.status === 'pending').length}
            </div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
        </div>

        {/* Appointments List */}
        <div>
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">No appointments match your current filter</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BarberAppointments;
