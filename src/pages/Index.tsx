
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import BarberCard from '@/components/BarberCard';
import BookingModal from '@/components/BookingModal';
import { Search, Filter, Heart, Loader2, Calendar, AlertCircle, Star, MapPin } from 'lucide-react';
import { shopService, customerService, authService } from '@/services';
import { ShopWithBarbers, Barber } from '@/services/shop.service';
import { CustomerProfile } from '@/services/customer.service';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [shops, setShops] = useState<ShopWithBarbers[]>([]);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [favoriteBarbers, setFavoriteBarbers] = useState<Array<{
    id: string;
    name: string;
    shopName: string;
    rating: number;
    distance: string;
    isAvailable: boolean;
    image: string;
    specialties: string[];
    price: number;
    shopId?: string;
  }>>([]);
  const [popularBarbers, setPopularBarbers] = useState<Array<{
    id: string;
    name: string;
    shopName: string;
    rating: number;
    distance: string;
    isAvailable: boolean;
    image: string;
    specialties: string[];
    price: number;
    shopId?: string;
  }>>([]);
  const [selectedBarber, setSelectedBarber] = useState<{
    id: string;
    name: string;
    shopName: string;
    rating: number;
    specialties: string[];
    price: number;
    image: string;
    shopId?: string;
  } | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Check authentication and redirect if needed
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const user = authService.getCurrentUser();
      if (user?.role === 'customer') {
        navigate('/home');
      } else if (user?.role === 'barber') {
        navigate('/barber/dashboard');
      }
    }
  }, [navigate]);

  // Get dynamic greeting based on time
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch customer profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const response = await customerService.getProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);
  
  // Fetch shops and barbers
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setIsLoading(true);
        const response = await shopService.getAllShops();
        
        if (response.status === 'success') {
          setShops(response.data);
          
          // Extract barbers from shops for display
          const allBarbers: Array<{
            id: string;
            name: string;
            shopName: string;
            rating: number;
            distance: string;
            isAvailable: boolean;
            image: string;
            specialties: string[];
            price: number;
          }> = [];
          
          response.data.forEach(shop => {
            shop.barbers.forEach(barber => {
              allBarbers.push({
                id: barber.id,
                name: barber.fullName,
                shopName: shop.name,
                rating: barber.rating,
                distance: shop.distance ? `${shop.distance.toFixed(1)}km` : 'Unknown',
                isAvailable: barber.isAvailable,
                image: barber.profileImage || `photo-${Math.floor(Math.random() * 3) + 1}`,
                specialties: barber.specialties,
                price: barber.hourlyRate || 5000,
              });
            });
          });
          
          // For now, just use the first few barbers as "favorites"
          setFavoriteBarbers(allBarbers.slice(0, 3));
        } else {
          // If API is not available, use mock data
          setFavoriteBarbers([
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
              shopId: 'mock-shop-1',
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
          ]);
        }
      } catch (error) {
        console.error('Error fetching shops:', error);
        toast({
          title: 'Error',
          description: 'Failed to load barber shops. Please try again later.',
          variant: 'destructive'
        });
        
        // Use mock data as fallback
        setFavoriteBarbers([
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
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShops();
  }, [toast]);

  const handleBookBarber = (id: string) => {
    const barber = favoriteBarbers.find(b => b.id === id);
    if (barber) {
      setSelectedBarber(barber);
      setIsBookingModalOpen(true);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBarber(null);
  };

  const handleViewAllFavorites = () => {
    navigate('/bookings?tab=favorites');
  };

  const handleViewAllPopular = () => {
    navigate('/explore');
  };

  const handleSearchBarbers = () => {
    navigate('/explore');
  };

  const handleWeekendSpecialBook = () => {
    navigate('/explore?filter=weekend');
  };

  return (
    <Layout userType="customer">
      <div className="bg-gradient-to-br from-green-700 to-green-800 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            {profileLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white bg-opacity-20 rounded mb-2 w-48"></div>
                <div className="h-4 bg-white bg-opacity-20 rounded w-36"></div>
              </div>
            ) : (
              <>
                <h1 className="text-white text-2xl font-bold">
                  {getTimeBasedGreeting()}, {profile?.fullName?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-green-100 text-sm">Find your perfect barber today</p>
              </>
            )}
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
            {profile?.profileImage ? (
              <img 
                src={profile.profileImage} 
                alt={profile.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-green-700 font-bold text-lg">
                {profile?.fullName?.charAt(0) || 'U'}
              </span>
            )}
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
            onFocus={handleSearchBarbers}
            className="w-full pl-10 pr-12 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button 
            onClick={handleSearchBarbers}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Filter className="text-green-700" size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          {profileLoading ? (
            <div className="grid grid-cols-3 divide-x divide-gray-200 animate-pulse">
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2 mx-auto w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2 mx-auto w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
              <div className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2 mx-auto w-8"></div>
                <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {profile?.bookings?.filter(b => b.status === 'completed').length || 0}
                </div>
                <div className="text-xs text-gray-500">Total Cuts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {profile?.bookings?.length ? 
                    (customerService.formatCustomerStats(profile).averageRating || 0).toFixed(1) 
                    : '0.0'
                  }
                </div>
                <div className="text-xs text-gray-500">Your Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ₦{((profile?.wallet?.balance || 0) * 0.1).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Saved</div>
              </div>
            </div>
          )}
        </div>

        {/* Favorites Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Heart className="text-red-500 mr-2" size={20} />
            Your Favorites
          </h2>
          <button 
            onClick={handleViewAllFavorites}
            className="text-green-700 text-sm font-medium hover:text-green-800 transition-colors"
          >
            View All
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
            <span className="text-gray-600">Loading barbers...</span>
          </div>
        ) : profile?.bookings?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You haven't had a haircut with any barber</h3>
            <p className="text-gray-600 mb-4">Book your first appointment to start building your favorites.</p>
            <button 
              onClick={handleSearchBarbers}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteBarbers.map((barber) => (
              <BarberCard
                key={barber.id}
                {...barber}
                onBook={handleBookBarber}
              />
            ))}
          </div>
        )}

        {/* Weekend Special Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 mt-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">Weekend Special!</h3>
              <p className="text-yellow-100 text-sm">Book any weekend slot and save 15%</p>
            </div>
            <button 
              onClick={handleWeekendSpecialBook}
              className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-yellow-50 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* Popular Barbers Near You Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Star className="text-yellow-500 mr-2" size={20} />
              Popular Barbers Near You
            </h2>
            <button 
              onClick={handleViewAllPopular}
              className="text-green-700 text-sm font-medium hover:text-green-800 transition-colors"
            >
              View All
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
              <span className="text-gray-600">Loading popular barbers...</span>
            </div>
          ) : favoriteBarbers.length > 0 ? (
            <div className="space-y-4">
              {favoriteBarbers.slice(0, 5).map((barber) => (
                <div key={`popular-${barber.id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img
                        src={`https://images.unsplash.com/${barber.image}?w=60&h=60&fit=crop&crop=face`}
                        alt={barber.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        barber.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{barber.name}</h3>
                          <p className="text-gray-600 text-sm">{barber.shopName}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-700">₦{(barber.price + Math.round(barber.price * 0.08)).toLocaleString()}</div>
                          <div className="text-xs text-gray-500">inc. ₦{Math.round(barber.price * 0.08)} fee</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Star size={14} className="text-yellow-500 mr-1" />
                          <span>{barber.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          <span>{barber.distance}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {barber.specialties.slice(0, 2).map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => handleBookBarber(barber.id)}
                        disabled={!barber.isAvailable}
                        className={`w-full mt-3 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                          barber.isAvailable
                            ? 'bg-green-700 text-white hover:bg-green-800'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {barber.isAvailable ? 'Book Now' : 'Unavailable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
              <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No popular barbers found nearby</h3>
              <p className="text-gray-600">Try expanding your search radius or check back later.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Booking Modal */}
      {selectedBarber && (
        <BookingModal
          open={isBookingModalOpen}
          onOpenChange={setIsBookingModalOpen}
          barber={{
            id: selectedBarber.id,
            name: selectedBarber.name,
            profileImage: selectedBarber.image.startsWith('photo-') ? 
              `https://images.unsplash.com/${selectedBarber.image}?w=120&h=120&fit=crop&crop=face` : 
              selectedBarber.image,
            specialties: selectedBarber.specialties,
            rating: selectedBarber.rating,
            seatNumber: 1 // Default seat number
          }}
          shop={{
            id: selectedBarber.shopId || 'unknown',
            name: selectedBarber.shopName,
            address: 'Shop location', // Default address
            services: [] // Will use default services from the modal
          }}
          onBookingComplete={(booking) => {
            toast({
              title: 'Booking Confirmed!',
              description: `Your appointment with ${selectedBarber.name} has been scheduled.`,
            });
            setIsBookingModalOpen(false);
            setSelectedBarber(null);
          }}
        />
      )}
    </Layout>
  );
};

export default Index;
