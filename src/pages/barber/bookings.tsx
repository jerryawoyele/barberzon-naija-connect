import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Calendar, Clock, User, MessageCircle, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { bookingService } from '@/services';
import { BookingWithDetails } from '@/services/booking.service';
import { useToast } from '@/hooks/use-toast';

const BarberBookings = () => {

  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [filter, setFilter] = useState('all');
  const [appointments, setAppointments] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await bookingService.getUserBookings();
        if (response.status === 'success') {
          setAppointments(response.data.bookings.map((booking) => ({
            ...booking,
            customerName: booking.customer?.fullName || 'Unknown Customer',
            phone: booking.customer?.phoneNumber || 'N/A',
            time: new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            duration: booking.services?.reduce((acc, service) => acc + (service.duration || 30), 0) || 30,
            services: booking.services?.map(service => typeof service === 'string' ? service : service.name) || ['Service'],
            image: booking.customer?.profileImage || 'photo-1472099645785-5658abf4ff4e',
            isVIP: booking.customer?.fullName?.startsWith('VIP') || false,
            netAmount: booking.totalAmount - 0.08 * booking.totalAmount,
            platformFee: 0.08 * booking.totalAmount,
            notes: booking.notes || '',
            amount: booking.totalAmount
          })));
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load appointments. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const response = await bookingService.confirmBooking(appointmentId);
      if (response.status === 'success') {
        toast({
          title: 'Appointment Confirmed',
          description: 'The appointment has been confirmed successfully.'
        });
        // Refresh appointments
        const refreshResponse = await bookingService.getUserBookings();
        if (refreshResponse.status === 'success') {
          setAppointments(refreshResponse.data.bookings);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to confirm appointment',
        variant: 'destructive'
      });
    }
  };

  const handleDeclineAppointment = async (appointmentId: string) => {
    try {
      const response = await bookingService.cancelBooking(appointmentId, 'Declined by barber');
      if (response.status === 'success') {
        toast({
          title: 'Appointment Declined',
          description: 'The appointment has been declined.'
        });
        // Refresh appointments
        const refreshResponse = await bookingService.getUserBookings();
        if (refreshResponse.status === 'success') {
          setAppointments(refreshResponse.data.bookings);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to decline appointment',
        variant: 'destructive'
      });
    }
  };

  const handleStartService = async (appointmentId: string) => {
    try {
      const response = await bookingService.completeBooking(appointmentId, 'Service started');
      if (response.status === 'success') {
        toast({
          title: 'Service Started',
          description: 'The service has been marked as started.'
        });
        // Refresh appointments
        const refreshResponse = await bookingService.getUserBookings();
        if (refreshResponse.status === 'success') {
          setAppointments(refreshResponse.data.bookings);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start service',
        variant: 'destructive'
      });
    }
  };

  const handleMessageCustomer = (phoneNumber: string) => {
    if (phoneNumber) {
      window.open(`sms:${phoneNumber}`, '_blank');
    } else {
      toast({
        title: 'No Phone Number',
        description: 'Customer phone number is not available.',
        variant: 'destructive'
      });
    }
  };

  const handleViewReceipt = (appointmentId: string) => {
    toast({
      title: 'Coming Soon',
      description: 'Receipt viewing feature will be available soon.'
    });
  };

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
            <button 
              className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center"
              onClick={() => handleConfirmAppointment(appointment.id)}
            >
              <CheckCircle size={16} className="mr-1" />
              Confirm
            </button>
            <button 
              className="flex-1 bg-red-50 text-red-600 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center"
              onClick={() => handleDeclineAppointment(appointment.id)}
            >
              <XCircle size={16} className="mr-1" />
              Decline
            </button>
          </>
        )}
        
        {appointment.status === 'confirmed' && (
          <>
            <button 
              className="flex-1 bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium"
              onClick={() => handleStartService(appointment.id)}
            >
              Start Service
            </button>
            <button 
              className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium"
              onClick={() => handleMessageCustomer(appointment.phone)}
            >
              <MessageCircle size={16} />
            </button>
          </>
        )}
        
        {appointment.status === 'completed' && (
          <button 
            className="flex-1 bg-yellow-50 text-yellow-700 py-2 px-4 rounded-lg text-sm font-medium"
            onClick={() => handleViewReceipt(appointment.id)}
          >
            View Receipt
          </button>
        )}
      </div>
    </div>
  );

  return (
    <Layout userType="barber">
      <Header title="Bookings" />
      
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

export default BarberBookings;
