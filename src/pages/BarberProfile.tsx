import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import BookingModal from '@/components/BookingModal';
import { 
  Star, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  Award, 
  Users, 
  Heart,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  MessageCircle
} from 'lucide-react';
import { barberService } from '@/services/barber.service';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';

interface BarberProfile {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  profileImage?: string;
  specialties: string[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  status: 'available' | 'busy' | 'break' | 'offline';
  bio?: string;
  experience?: string;
  shop?: {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
    rating: number;
    totalReviews: number;
    ownerId?: string;
  };
}

const BarberProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Check if current user is a customer (only customers can book appointments)
  const isCustomer = authService.isCustomer();
  const isBarber = authService.isBarber();
  const currentUser = authService.getCurrentUser();
  const isOwner = currentUser?.id === id; // Check if viewing own profile

  useEffect(() => {
    const fetchBarberProfile = async () => {
      if (!id) {
        setError('Barber ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch real barber data from API
        const response = await barberService.getBarberProfile(id);
        
        if (response.status === 'success') {
          const barberData = response.data;
          
          // Transform the API response to match our interface
          const transformedBarber: BarberProfile = {
            id: barberData.id,
            fullName: barberData.fullName,
            phoneNumber: barberData.phoneNumber,
            profileImage: barberData.profileImage,
            specialties: barberData.specialties || [],
            hourlyRate: barberData.hourlyRate || 0,
            rating: barberData.rating || 0,
            totalReviews: barberData.totalReviews || 0,
            isAvailable: barberData.isAvailable,
            status: barberData.status || 'offline',
            bio: barberData.bio,
            experience: barberData.experience,
            shop: barberData.shop ? {
              id: barberData.shop.id,
              name: barberData.shop.name,
              address: barberData.shop.address,
              phoneNumber: barberData.shop.phoneNumber,
              rating: barberData.shop.rating || 0,
              totalReviews: barberData.shop.totalReviews || 0,
              ownerId: barberData.shop.ownerId
            } : undefined
          };
          
          setBarber(transformedBarber);
        } else {
          throw new Error(response.message || 'Failed to fetch barber profile');
        }
        
      } catch (err) {
        console.error('Error fetching barber profile:', err);
        setError('Failed to load barber profile');
        toast({
          title: 'Error',
          description: 'Failed to load barber profile. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBarberProfile();
  }, [id, toast]);

  const handleBookBarber = () => {
    if (barber && isCustomer) {
      setIsBookingModalOpen(true);
    } else if (isBarber) {
      toast({
        title: 'Booking Not Available',
        description: 'Barbers cannot book appointments with other barbers.',
        variant: 'destructive'
      });
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorite 
        ? `${barber?.fullName} has been removed from your favorites.`
        : `${barber?.fullName} has been added to your favorites.`,
    });
  };

  const handleCallBarber = () => {
    if (barber?.phoneNumber) {
      window.open(`tel:${barber.phoneNumber}`);
    }
  };

  const handleMessageBarber = () => {
    if (barber?.phoneNumber) {
      // Navigate to SMS app with the barber's phone number
      window.open(`sms:${barber.phoneNumber}`);
    } else {
      toast({
        title: 'No Phone Number',
        description: 'This barber has not provided a phone number for messaging.',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'break': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'break': return 'On Break';
      default: return 'Offline';
    }
  };

  // Determine layout userType based on current user
  const layoutUserType = isCustomer ? 'customer' : 'barber';

  if (loading) {
    return (
      <Layout userType={layoutUserType}>
        <Header title="Barber Profile" />
        <div className="pt-24 px-4 py-4">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
            <span className="text-gray-600">Loading barber profile...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !barber) {
    return (
      <Layout userType={layoutUserType}>
        <Header title="Barber Profile" />
        <div className="pt-24 px-4 py-4">
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'This barber profile could not be found.'}</p>
            <button 
              onClick={() => navigate(-1)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout userType={layoutUserType}>
      <Header 
        title="Barber Profile" 
        leftAction={
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        }
      />
      
      <div className="pt-24 px-4 py-4">
        {/* Profile Header - Green Gradient Design */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-xl text-white p-6 mb-6 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-black bg-opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start space-x-6">
              <div className="relative ">
                <img
                  src={barber.profileImage ? 
                    `https://images.unsplash.com/${barber.profileImage}?w=120&h=120&fit=crop&crop=face` :
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.fullName)}&size=120&background=ffffff&color=10b981`
                  }
                  alt={barber.fullName}
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.fullName)}&size=120&background=ffffff&color=10b981`;
                  }}
                />
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-md ${getStatusColor(barber.status)}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{barber.fullName}</h1>
                    {barber.experience && <p className="text-green-100 text-lg">{barber.experience} experience</p>}
                  </div>
                  
                  {isCustomer && (
                    <button
                      onClick={handleToggleFavorite}
                      className={`p-3 rounded-full transition-all duration-200 ${
                        isFavorite ? 'bg-red-500 text-white shadow-lg' : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                    >
                      <Heart size={24} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  )}
                </div>
                
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <Star size={18} className="text-yellow-300 mr-2" fill="currentColor" />
                    <span className="font-semibold text-lg">{barber.rating}</span>
                    <span className="text-green-100 text-sm ml-2">({barber.totalReviews} reviews)</span>
                  </div>
                  
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 ${
                    barber.status === 'available' ? 'border-green-300 bg-green-500 text-white' :
                    barber.status === 'busy' ? 'border-red-300 bg-red-500 text-white' :
                    barber.status === 'break' ? 'border-yellow-300 bg-yellow-500 text-white' :
                    'border-gray-300 bg-gray-500 text-white'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      barber.status === 'available' ? 'bg-green-200' :
                      barber.status === 'busy' ? 'bg-red-200' :
                      barber.status === 'break' ? 'bg-yellow-200' :
                      'bg-gray-200'
                    }`} />
                    {getStatusText(barber.status)}
                  </div>
                </div>
                
                {/* Price Section */}
                <div className="bg-white bg-opacity-15 rounded-xl p-4 backdrop-blur-sm">
                  {isOwner ? (
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-white">
                        ₦{barber.hourlyRate.toLocaleString()}
                        <span className="text-lg text-green-100 font-normal ml-2">base rate</span>
                      </div>
                      <div className="text-sm text-green-100">
                        + ₦{Math.round(barber.hourlyRate * 0.08).toLocaleString()} platform fee (8%)
                      </div>
                      <div className="border-t border-white border-opacity-30 pt-2">
                        <div className="text-xl font-semibold text-white">
                          ₦{(barber.hourlyRate + Math.round(barber.hourlyRate * 0.08)).toLocaleString()}
                          <span className="text-sm text-green-100 font-normal ml-2">total per session</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-white">
                      ₦{(barber.hourlyRate + Math.round(barber.hourlyRate * 0.08)).toLocaleString()}
                      <span className="text-lg text-green-100 font-normal ml-2">per session</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Bio */}
            {barber.bio && (
              <div className="mt-6 p-4 bg-white bg-opacity-15 rounded-xl backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-green-100 leading-relaxed">{barber.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Currently Works At Section */}
        {barber.shop && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="mr-2 text-green-600" size={20} />
              Currently works at
            </h3>
            
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{barber.shop.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      barber.shop.ownerId === barber.id 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {barber.shop.ownerId === barber.id ? '👑 Owner' : '✂️ Barber'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm flex items-center">
                    <MapPin size={14} className="mr-1 text-green-600" />
                    {barber.shop.address}
                  </p>
                </div>
                
                {/* Shop Profile Link */}
                <button
                  onClick={() => navigate(`/shop/${barber.shop.id}`)}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors group"
                  title="View shop profile"
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="text-green-600 group-hover:text-green-700"
                  >
                    <path 
                      d="M13 7L18 12L13 17M6 12H18" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Star size={16} className="text-yellow-500" />
                  <span className="font-medium text-gray-900">{barber.shop.rating}</span>
                  <span className="text-gray-500 text-sm">({barber.shop.totalReviews} reviews)</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone size={16} className="text-green-600" />
                  <span className="text-sm font-medium">{barber.shop.phoneNumber}</span>
                </div>
              </div>
              
              {barber.shop.ownerId !== barber.id && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-blue-800 text-sm">
                    <Award size={14} className="inline mr-1" />
                    This barber is employed at {barber.shop.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Specialties */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="mr-2 text-green-600" size={20} />
            Specialties
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {barber.specialties.map((specialty, index) => (
              <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                <CheckCircle size={16} className="text-green-600 mr-2" />
                <span className="text-green-700 font-medium">{specialty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`grid ${isCustomer ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-6`}>
          {isCustomer && (
            <button
              onClick={handleBookBarber}
              disabled={!barber.isAvailable}
              className={`flex flex-col items-center justify-center p-4 rounded-xl font-medium transition-colors ${
                barber.isAvailable
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Calendar size={20} className="mb-1" />
              <span className="text-sm">{barber.isAvailable ? 'Book Now' : 'Unavailable'}</span>
            </button>
          )}
          
          <button
            onClick={handleCallBarber}
            className="flex flex-col items-center justify-center p-4 rounded-xl font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Phone size={20} className="mb-1" />
            <span className="text-sm">Call</span>
          </button>
          
          <button
            onClick={handleMessageBarber}
            className="flex flex-col items-center justify-center p-4 rounded-xl font-medium bg-gray-600 text-white hover:bg-gray-700 transition-colors"
          >
            <MessageCircle size={20} className="mb-1" />
            <span className="text-sm">Message</span>
          </button>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="mr-2 text-green-600" size={20} />
            Recent Reviews
          </h3>
          
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
            <p>Reviews will be displayed here</p>
            <p className="text-sm">Feature coming soon</p>
          </div>
        </div>
      </div>
      
      {/* Booking Modal - Only show for customers */}
      {barber && isCustomer && (
        <BookingModal
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          barber={{
            id: barber.id,
            name: barber.fullName,
            profileImage: barber.profileImage ? 
              `https://images.unsplash.com/${barber.profileImage}?w=120&h=120&fit=crop&crop=face` : 
              undefined,
            specialties: barber.specialties,
            rating: barber.rating,
            seatNumber: 1 // Default seat number since this is from profile view
          }}
          shop={{
            id: barber.shop?.id || 'unknown',
            name: barber.shop?.name || 'Independent Barber',
            address: barber.shop?.address || 'Unknown location',
            services: [] // Will use default services from the modal
          }}
          onBookingComplete={(booking) => {
            toast({
              title: 'Booking Confirmed!',
              description: `Your appointment with ${barber.fullName} has been scheduled.`,
            });
          }}
        />
      )}
    </Layout>
  );
};

export default BarberProfilePage;
