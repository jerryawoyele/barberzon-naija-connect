
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Calendar, Clock, MapPin, Star, MessageCircle, Navigation, Loader2, Phone, Search, Filter } from 'lucide-react';
import { bookingService } from '@/services';
import { BookingWithDetails } from '@/services/booking.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const BookingsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<string | null>(null);
  const [ratingBooking, setRatingBooking] = useState<BookingWithDetails | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getUserBookings();
      if (response.status === 'success') {
        setBookings(response.data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    const filter = urlParams.get('filter');
    
    if (tab === 'favorites') {
      setActiveTab('favorites');
    } else if (tab === 'popular') {
      setActiveTab('upcoming'); // For now, redirect popular to upcoming
    } else if (tab) {
      setActiveTab(tab);
    }
    
    if (filter === 'weekend') {
      // Apply weekend filter logic here
      setSearchQuery('weekend');
    }
  }, [location.search]);

  const upcomingBookings = bookings.filter(booking => 
    booking.status === 'pending' || booking.status === 'confirmed'
  );
  
  const pastBookings = bookings.filter(booking => 
    booking.status === 'completed' || booking.status === 'cancelled'
  );

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await bookingService.cancelBooking(bookingId, cancelReason);
      if (response.status === 'success') {
        toast({
          title: 'Booking Cancelled',
          description: response.message
        });
        await fetchBookings(); // Refresh bookings
        setCancellingBooking(null);
        setCancelReason('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to cancel booking',
        variant: 'destructive'
      });
    }
  };

  const handleRateBooking = async () => {
    if (!ratingBooking) return;
    
    try {
      setIsSubmittingRating(true);
      const response = await bookingService.rateBooking(ratingBooking.id, {
        rating,
        comment: review
      });
      
      if (response.status === 'success') {
        toast({
          title: 'Rating Submitted',
          description: 'Thank you for your feedback!'
        });
        setRatingBooking(null);
        setRating(5);
        setReview('');
        await fetchBookings(); // Refresh bookings
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit rating',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const BookingCard = ({ booking, isPast = false }: { booking: BookingWithDetails, isPast?: boolean }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      <div className="flex items-start space-x-3">
        <img
          src={booking.barber?.profileImage ? 
            `https://images.unsplash.com/${booking.barber.profileImage}?w=60&h=60&fit=crop&crop=face` :
            `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face`
          }
          alt={booking.barber?.fullName || 'Barber'}
          className="w-14 h-14 rounded-full object-cover"
        />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{booking.barber?.fullName || 'Unknown Barber'}</h3>
              <p className="text-gray-600 text-sm">{booking.shop?.name || 'Unknown Shop'}</p>
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
              <span>{formatDate(booking.bookingDate)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={14} className="mr-2" />
              <span>{new Date(booking.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={14} className="mr-2" />
              <span>{booking.shop?.address || 'Address not available'}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {booking.services && booking.services.length > 0 ? (
              booking.services.map((service: any, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                >
                  {typeof service === 'string' ? service : service.name}
                </span>
              ))
            ) : (
              <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-full">
                No services specified
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="text-right">
              <div className="font-bold text-gray-900">₦{booking.totalAmount.toLocaleString()}</div>
              <div className="text-xs text-gray-500">Status: {booking.paymentStatus}</div>
            </div>
            
            <div className="flex space-x-2">
              {!isPast && (
                <>
                  <button 
                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    onClick={() => window.open(`tel:${booking.barber?.phoneNumber}`)}
                    title="Call barber"
                  >
                    <Phone size={16} />
                  </button>
                  <button 
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(booking.shop?.address || '')}`)}
                    title="Get directions"
                  >
                    <Navigation size={16} />
                  </button>
                </>
              )}
              {isPast && booking.status === 'completed' && (
                <button 
                  className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm"
                  onClick={() => setRatingBooking(booking)}
                >
                  <Star size={14} className="mr-1" />
                  Rate
                </button>
              )}
            </div>
          </div>
          
          {!isPast && (booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="flex space-x-2 mt-3">
              <button 
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                onClick={() => {
                  toast({
                    title: 'Coming Soon',
                    description: 'Reschedule feature will be available soon.'
                  });
                }}
              >
                Reschedule
              </button>
              <button 
                className="flex-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium"
                onClick={() => setCancellingBooking(booking.id)}
              >
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
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search bookings, barbers, or shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-12 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300 border border-gray-200"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Filter className="text-green-700" size={18} />
          </button>
        </div>

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
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'favorites' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Favorites
          </button>
        </div>

        {/* Bookings List */}
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
              <span className="text-gray-600">Loading bookings...</span>
            </div>
          ) : (
            <>
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
                      <button 
                        onClick={() => navigate('/explore')}
                        className="bg-green-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-800 transition-colors"
                      >
                        Explore Barbers
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
              
              {activeTab === 'favorites' && (
                <div>
                  <div className="text-center py-12">
                    <Star className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorites Coming Soon</h3>
                    <p className="text-gray-600 mb-4">Your favorite barbers will appear here once you've rated them</p>
                    <button 
                      onClick={() => setActiveTab('past')}
                      className="bg-green-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-800 transition-colors"
                    >
                      View Past Bookings
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cancel Booking Dialog */}
        <AlertDialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="cancelReason">Reason for cancellation (optional)</Label>
              <Textarea
                id="cancelReason"
                placeholder="Let us know why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setCancelReason('')}>Keep Booking</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancellingBooking && handleCancelBooking(cancellingBooking)}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Rating Dialog */}
        <Dialog open={!!ratingBooking} onOpenChange={() => setRatingBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rate Your Experience</DialogTitle>
              <DialogDescription>
                How was your experience with {ratingBooking?.barber?.fullName}?
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Rating</Label>
                <div className="flex space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star size={24} fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="review">Review (optional)</Label>
                <Textarea
                  id="review"
                  placeholder="Share your experience..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRatingBooking(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRateBooking}
                disabled={isSubmittingRating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmittingRating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Submitting...
                  </>
                ) : (
                  'Submit Rating'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default BookingsPage;
