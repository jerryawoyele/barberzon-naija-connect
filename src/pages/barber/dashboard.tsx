import React, { useState } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { TrendingUp, Users, Calendar, DollarSign, Clock, Star, BarChart3, Eye, EyeOff } from 'lucide-react';

const BarberDashboard = () => {
  const [showEarnings, setShowEarnings] = useState(true);
  const [timeframe, setTimeframe] = useState('today');

  const stats = {
    today: {
      grossEarnings: 35000,
      platformFees: 2800,
      netEarnings: 32200,
      appointments: 8,
      customers: 7,
      rating: 4.8,
      completionRate: 100
    },
    week: {
      grossEarnings: 125000,
      platformFees: 10000,
      netEarnings: 115000,
      appointments: 32,
      customers: 28,
      rating: 4.9,
      completionRate: 96
    },
    month: {
      grossEarnings: 485000,
      platformFees: 38800,
      netEarnings: 446200,
      appointments: 124,
      customers: 89,
      rating: 4.8,
      completionRate: 98
    }
  };

  const currentStats = stats[timeframe as keyof typeof stats];

  const upcomingAppointments = [
    {
      id: '1',
      customerName: 'John Adebayo',
      time: '2:00 PM',
      service: 'Haircut + Beard Trim',
      duration: '45 min',
      amount: 5400,
      image: 'photo-1472099645785-5658abf4ff4e'
    },
    {
      id: '2',
      customerName: 'Ibrahim Mohammed',
      time: '3:00 PM',
      service: 'Traditional Cut',
      duration: '30 min',
      amount: 4500,
      image: 'photo-1507003211169-0a1dd7228f2d'
    },
    {
      id: '3',
      customerName: 'Tunde Okafor',
      time: '4:30 PM',
      service: 'Afro Cut',
      duration: '40 min',
      amount: 5500,
      image: 'photo-1500648767791-00dcc994a43e'
    }
  ];

  const StatCard = ({ title, value, subtitle, icon: Icon, color, change }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon size={24} className={color} />
        </div>
      </div>
      {change && (
        <div className="flex items-center mt-2">
          <TrendingUp size={14} className="text-green-500 mr-1" />
          <span className="text-sm text-green-600">{change}% from last {timeframe}</span>
        </div>
      )}
    </div>
  );

  return (
    <Layout userType="barber">
      <Header 
        title="Dashboard"
        rightAction={
          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        }
      />
      
      <div className="pt-24 px-4 py-4">
        {/* Shop Status */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Kings Cut Barber Shop</h2>
              <p className="text-green-100 text-sm">Emeka Okafor • Victoria Island, Lagos</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm">Open</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">Current Queue</p>
              <p className="text-2xl font-bold">3 customers</p>
            </div>
            <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-medium">
              Manage Queue
            </button>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
            <button
              onClick={() => setShowEarnings(!showEarnings)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {showEarnings ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Gross Earnings</p>
                <p className="text-2xl font-bold text-green-700">
                  {showEarnings ? `₦${currentStats.grossEarnings.toLocaleString()}` : '₦••••••'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Platform Fees (8%)</p>
                <p className="text-lg font-semibold text-gray-700">
                  {showEarnings ? `-₦${currentStats.platformFees.toLocaleString()}` : '-₦••••••'}
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div>
                <p className="text-sm text-gray-600">Net Earnings</p>
                <p className="text-2xl font-bold text-blue-700">
                  {showEarnings ? `₦${currentStats.netEarnings.toLocaleString()}` : '₦••••••'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatCard
            title="Appointments"
            value={currentStats.appointments}
            subtitle={`${currentStats.completionRate}% completion rate`}
            icon={Calendar}
            color="text-blue-600"
            change={12}
          />
          <StatCard
            title="Customers"
            value={currentStats.customers}
            subtitle="Unique customers"
            icon={Users}
            color="text-purple-600"
            change={8}
          />
          <StatCard
            title="Rating"
            value={currentStats.rating}
            subtitle="Customer satisfaction"
            icon={Star}
            color="text-yellow-600"
          />
          <StatCard
            title="Avg. Wait Time"
            value="12 min"
            subtitle="Customer wait time"
            icon={Clock}
            color="text-orange-600"
          />
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Next Appointments</h3>
            <button className="text-green-700 text-sm font-medium">View All</button>
          </div>
          
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={`https://images.unsplash.com/${appointment.image}?w=40&h=40&fit=crop&crop=face`}
                  alt={appointment.customerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{appointment.customerName}</p>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{appointment.time}</p>
                  <p className="text-sm text-gray-600">₦{appointment.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-green-600 text-white p-4 rounded-xl font-medium">
            Start Next Appointment
          </button>
          <button className="bg-gray-100 text-gray-700 p-4 rounded-xl font-medium">
            Update Availability
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default BarberDashboard;
