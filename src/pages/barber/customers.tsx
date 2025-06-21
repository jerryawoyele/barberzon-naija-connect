import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Search, Star, MessageCircle, Calendar, TrendingUp, Crown, Filter } from 'lucide-react';

const BarberCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const customers = [
    {
      id: '1',
      name: 'John Adebayo',
      phone: '+234 803 123 4567',
      email: 'john.adebayo@gmail.com',
      totalVisits: 8,
      totalSpent: 43200,
      avgRating: 4.9,
      lastVisit: '2024-06-22',
      preferredServices: ['Haircut', 'Beard Trim'],
      notes: 'Prefers medium fade, always on time',
      status: 'vip',
      image: 'photo-1472099645785-5658abf4ff4e',
      loyaltyPoints: 432
    },
    {
      id: '2',
      name: 'Ibrahim Mohammed',
      phone: '+234 811 456 7890',
      email: 'ibrahim.m@gmail.com',
      totalVisits: 3,
      totalSpent: 13500,
      avgRating: 4.7,
      lastVisit: '2024-06-20',
      preferredServices: ['Traditional Cut'],
      notes: 'Likes conservative styling',
      status: 'regular',
      image: 'photo-1507003211169-0a1dd7228f2d',
      loyaltyPoints: 135
    },
    {
      id: '3',
      name: 'Tunde Okafor',
      phone: '+234 709 234 5678',
      email: 'tunde.ok@yahoo.com',
      totalVisits: 12,
      totalSpent: 66000,
      avgRating: 4.8,
      lastVisit: '2024-06-18',
      preferredServices: ['Afro Cut', 'Line Up'],
      notes: 'Regular customer, very particular about line-up',
      status: 'vip',
      image: 'photo-1500648767791-00dcc994a43e',
      loyaltyPoints: 660
    },
    {
      id: '4',
      name: 'Kemi Williams',
      phone: '+234 802 345 6789',
      email: 'kemi.w@outlook.com',
      totalVisits: 1,
      totalSpent: 7500,
      avgRating: 5.0,
      lastVisit: '2024-06-15',
      preferredServices: ['Premium Cut', 'Styling'],
      notes: 'Corporate client, high standards',
      status: 'new',
      image: 'photo-1494790108755-2616c9fc2647',
      loyaltyPoints: 75
    },
    {
      id: '5',
      name: 'Ahmed Hassan',
      phone: '+234 701 567 8901',
      email: 'ahmed.h@gmail.com',
      totalVisits: 6,
      totalSpent: 27000,
      avgRating: 4.6,
      lastVisit: '2024-06-10',
      preferredServices: ['Beard Trim', 'Mustache Trim'],
      notes: 'Specialist in beard styling',
      status: 'regular',
      image: 'photo-1507003211169-0a1dd7228f2d',
      loyaltyPoints: 270
    }
  ];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.phone.includes(searchQuery) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && customer.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vip': return { color: 'bg-yellow-100 text-yellow-800', label: 'VIP', icon: Crown };
      case 'regular': return { color: 'bg-blue-100 text-blue-800', label: 'Regular', icon: null };
      case 'new': return { color: 'bg-green-100 text-green-800', label: 'New', icon: null };
      default: return { color: 'bg-gray-100 text-gray-800', label: 'Customer', icon: null };
    }
  };

  const CustomerCard = ({ customer }: { customer: any }) => {
    const statusBadge = getStatusBadge(customer.status);
    const StatusIcon = statusBadge.icon;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-start space-x-3">
          <div className="relative">
            <img
              src={`https://images.unsplash.com/${customer.image}?w=60&h=60&fit=crop&crop=face`}
              alt={customer.name}
              className="w-14 h-14 rounded-full object-cover"
            />
            {customer.status === 'vip' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown size={12} className="text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-600">{customer.phone}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${statusBadge.color}`}>
                {StatusIcon && <StatusIcon size={12} className="mr-1" />}
                {statusBadge.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
              <div>
                <p className="text-gray-600">Total Visits</p>
                <p className="font-semibold text-gray-900">{customer.totalVisits}</p>
              </div>
              <div>
                <p className="text-gray-600">Total Spent</p>
                <p className="font-semibold text-gray-900">₦{customer.totalSpent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Avg Rating</p>
                <div className="flex items-center">
                  <Star size={14} className="text-yellow-500 mr-1" />
                  <p className="font-semibold text-gray-900">{customer.avgRating}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Last Visit</p>
                <p className="font-semibold text-gray-900">
                  {new Date(customer.lastVisit).toLocaleDateString('en-NG', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">Preferred Services</p>
              <div className="flex flex-wrap gap-1">
                {customer.preferredServices.map((service) => (
                  <span
                    key={service}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
            
            {customer.notes && (
              <p className="text-sm text-gray-600 mb-3 italic">"{customer.notes}"</p>
            )}
            
            <div className="flex space-x-2">
              <button className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center">
                <Calendar size={16} className="mr-1" />
                Book Appointment
              </button>
              <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                <MessageCircle size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout userType="barber">
      <Header title="Customers" />
      
      <div className="pt-24 px-4 py-4">
        {/* Search and Filter */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          
          <div className="flex bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {['all', 'vip', 'regular', 'new'].map((status) => (
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
                {status === 'all' && ` (${customers.length})`}
                {status !== 'all' && ` (${customers.filter(c => c.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {customers.filter(c => c.status === 'vip').length}
            </div>
            <div className="text-xs text-gray-500">VIP Customers</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {customers.reduce((sum, c) => sum + c.totalVisits, 0)}
            </div>
            <div className="text-xs text-gray-500">Total Visits</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ₦{customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Total Revenue</div>
          </div>
        </div>

        {/* Customers List */}
        <div>
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BarberCustomers;
