import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import ShopOwnerDashboard from '@/components/ShopOwnerDashboard';
import { TrendingUp, Users, Calendar, DollarSign, Clock, Star, BarChart3, Eye, EyeOff, Store, Bell, ChevronDown, UserCog } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '@/services/api';
import { barberService } from '@/services/barber.service';

const BarberDashboard = () => {
  const [showEarnings, setShowEarnings] = useState(true);
  const [timeframe, setTimeframe] = useState('today');
  const [activeTab, setActiveTab] = useState<'overview' | 'barber-management'>('overview');
  const [isShopOwner, setIsShopOwner] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<any>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [barberProfile, setBarberProfile] = useState<any>(null);
  const [availability, setAvailability] = useState('available');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle URL parameters to set active tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'barber-management') {
      setActiveTab('barber-management');
    }
  }, [searchParams]);

  // Fetch dashboard data using the new unified endpoint
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Frontend: Fetching dashboard data from /api/barbers/dashboard...');
        
        // Use the new unified dashboard endpoint
        const dashboardResponse = await apiClient.get('/barbers/dashboard');
        
        console.log('🔍 Frontend: Raw API response:', dashboardResponse);
        console.log('🔍 Frontend: Response status:', dashboardResponse.status);
        console.log('🔍 Frontend: Response data:', dashboardResponse.data);
        
        if (dashboardResponse.data.status === 'success') {
          const dashboardData = dashboardResponse.data.data;
          console.log('📊 Frontend: Dashboard data received:', dashboardData);
          
          // Set barber profile - include shop data from API response
          const barberWithShop = {
            ...dashboardData.barber,
            shop: dashboardData.shop // Map shop data to barber profile
          };
          setBarberProfile(barberWithShop);
          console.log('👤 Frontend: Barber profile set:', barberWithShop);
          console.log('🏪 Frontend: Shop data mapped:', dashboardData.shop);
          
          // Set earnings data
          setEarnings({
            grossEarnings: dashboardData.earnings.weekly,
            netEarnings: dashboardData.earnings.weekly * 0.92, // Assuming 8% platform fee
            platformFees: dashboardData.earnings.weekly * 0.08,
            totalBookings: dashboardData.bookings.total,
            completionRate: 95 // Default completion rate
          });
          console.log('💰 Frontend: Earnings data set:', dashboardData.earnings);
          
          // Set upcoming bookings
          setUpcomingBookings(dashboardData.bookings.upcomingList || []);
          console.log('📅 Frontend: Upcoming bookings set:', dashboardData.bookings.upcomingList?.length || 0);
          console.log('📅 Frontend: Upcoming bookings data:', dashboardData.bookings.upcomingList);
          
          // Set shop ownership status
          setIsShopOwner(dashboardData.isShopOwner);
          console.log('🏪 Frontend: Shop owner status:', dashboardData.isShopOwner);
          
          // Check for pending requests if shop owner
          if (dashboardData.isShopOwner) {
            try {
              const pendingResponse = await fetch('/api/barber-requests/incoming?status=pending', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              
              if (pendingResponse.ok) {
                const pendingData = await pendingResponse.json();
                setPendingRequestsCount(pendingData.data?.length || 0);
          console.log('🔔 Frontend: Pending requests count:', pendingData.data?.length || 0);
              } else {
                setPendingRequestsCount(0);
              }
            } catch (error) {
              console.log('⚠️ Frontend: Failed to fetch pending requests:', error);
              setPendingRequestsCount(0);
            }
          } else {
            setPendingRequestsCount(0);
          }
          
          // Set initial availability status from API data
          if (dashboardData.barber?.status) {
            setAvailability(dashboardData.barber.status);
          }
          
        } else {
          console.log('❌ Frontend: Dashboard API call failed, using fallback data');
          // Keep existing fallback logic
        }
        
      } catch (error) {
        console.error('❌ Frontend: Error fetching dashboard data:', error);
        
        // Fallback to individual API calls if dashboard endpoint fails
        console.log('🔄 Frontend: Falling back to individual API calls...');
        try {
          const profileResponse = await apiClient.get('/barbers/profile');
          if (profileResponse.data.status === 'success') {
            setBarberProfile(profileResponse.data.data);
            console.log('👤 Frontend: Fallback - Profile loaded');
          }
        } catch (fallbackError) {
          console.error('❌ Frontend: Fallback failed too:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    
    try {
      console.log(`🔄 Frontend: Updating status to: ${newStatus}`);
      
      const response = await barberService.updateStatus(newStatus as 'available' | 'busy' | 'break' | 'offline');
      
      if (response.status === 'success') {
        setAvailability(newStatus);
        console.log('✅ Frontend: Status updated successfully');
        
        // Update the barber profile state too
        if (barberProfile) {
          setBarberProfile({
            ...barberProfile,
            status: newStatus,
            isAvailable: newStatus === 'available'
          });
        }
      }
    } catch (error) {
      console.error('❌ Frontend: Failed to update status:', error);
      // Revert the UI change on error
      setAvailability(availability);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle navigation to bookings
  const handleViewAllBookings = () => {
    navigate('/barber/bookings');
  };

  // Use real earnings data or fallback to mock data
  const mockStats = {
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

  const currentStats = earnings ? {
    grossEarnings: earnings.grossEarnings || 0,
    platformFees: earnings.platformFees || 0,
    netEarnings: earnings.netEarnings || 0,
    appointments: earnings.totalBookings || 0,
    customers: earnings.uniqueCustomers || 0,
    rating: barberProfile?.rating || 5.0,
    completionRate: earnings.completionRate || 100
  } : mockStats[timeframe as keyof typeof mockStats];

  // Use real upcoming bookings or fallback to mock data
  const mockUpcomingBookings = [
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

  // Always use real data from API, don't fall back to mock data
  const displayUpcomingBookings = upcomingBookings.map(booking => ({
    id: booking.id,
    customerName: booking.customer?.fullName || 'Unknown Customer',
    time: new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    service: Array.isArray(booking.services) ? booking.services.join(', ') : (booking.services || 'Service'),
    duration: '30 min', // Default duration
    amount: booking.totalAmount,
    image: booking.customer?.profileImage || 'photo-1472099645785-5658abf4ff4e',
    status: booking.status,
    paymentStatus: booking.paymentStatus
  }));

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
        title={activeTab === 'overview' ? 'Dashboard' : 'Shop Management'}
        rightAction={
          <div className="flex items-center space-x-2">
            {activeTab === 'overview' && (
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            )}
          </div>
        }
      />
      
      <div className="pt-24 px-4 py-4">
        {/* Tab Navigation for Shop Owners */}
        {isShopOwner && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                  activeTab === 'overview'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <BarChart3 size={16} className="mr-2" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('barber-management')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                  activeTab === 'barber-management'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <UserCog size={16} className="mr-2" />
                Manage Barbers
                {pendingRequestsCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Render Content Based on Active Tab */}
        {activeTab === 'barber-management' ? (
          <ShopOwnerDashboard />
        ) : (
          <>
        {/* Availability Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Status</h3>
              <p className="text-sm text-gray-600">Update your availability for customers</p>
            </div>
            <div className="relative">
              <select
                value={availability}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className={`appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <option value="available">🟢 Available</option>
                <option value="busy">🟡 Busy</option>
                <option value="break">🔴 On Break</option>
                <option value="offline">⚫ Offline</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Shop Status Card - Always show with accurate info */}
        <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                {barberProfile?.shop?.name || 'Barbershop Name'}
              </h2>
              <p className="text-green-100 text-sm">
                {barberProfile?.fullName || 'Barber'} • {barberProfile?.shop?.address || 'Barbershop Location'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                availability === 'available' ? 'bg-green-400' : 
                availability === 'busy' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="text-sm capitalize">{availability}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-100">
                {upcomingBookings.length > 0 ? 'Current Queue' : "Today's Bookings"}
              </p>
              <p className="text-2xl font-bold">
                {upcomingBookings.length > 0 
                  ? `${upcomingBookings.length} customer${upcomingBookings.length === 1 ? '' : 's'}` 
                  : 'No bookings'
                }
              </p>
            </div>
            <button 
              onClick={handleViewAllBookings}
              className="bg-white bg-opacity-20 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30 transition-colors"
            >
              {upcomingBookings.length > 0 ? 'Manage Queue' : 'View All Bookings'}
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
            title="Bookings"
            value={currentStats.appointments}
            subtitle={`${currentStats.completionRate}% completion rate`}
            icon={Calendar}
            color="text-blue-600"
          />
          <StatCard
            title="Customers"
            value={currentStats.customers}
            subtitle="Unique customers"
            icon={Users}
            color="text-purple-600"
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
            value={barberProfile?.averageWaitTime || "N/A"}
            subtitle="Customer wait time"
            icon={Clock}
            color="text-orange-600"
          />
        </div>

        {/* Next Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Next Bookings</h3>
            <button 
              onClick={handleViewAllBookings}
              className="text-green-700 text-sm font-medium hover:text-green-800 transition-colors"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {displayUpcomingBookings.length > 0 ? (
              displayUpcomingBookings.map((booking, index) => {
                const bookingTime = new Date(`${booking.time}`);
                const currentTime = new Date();
                const isFinished = bookingTime < currentTime && booking.paymentStatus === 'completed';
                
                return (
                  <div key={booking.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    isFinished ? 'bg-green-50 border border-green-200' : 
                    index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <img
                      src={`https://images.unsplash.com/${booking.image}?w=40&h=40&fit=crop&crop=face`}
                      alt={booking.customerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isFinished ? 'text-green-700' : 'text-gray-900'
                      }`}>{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                      {isFinished && <p className="text-xs text-green-600 font-medium">Completed</p>}
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        isFinished ? 'text-green-700' : 'text-gray-900'
                      }`}>{booking.time}</p>
                      <p className="text-sm text-gray-600">₦{booking.amount.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No upcoming bookings</p>
                <p className="text-sm text-gray-400">Your next bookings will appear here</p>
              </div>
            )}
          </div>
        </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default BarberDashboard;
