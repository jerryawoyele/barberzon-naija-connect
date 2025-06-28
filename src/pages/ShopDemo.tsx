import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Star, 
  Users, 
  Calendar, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Heart,
  Share2,
  Navigation,
  ChevronRight,
  Eye,
  Camera,
  Image,
  Video,
  Play,
  Monitor
} from 'lucide-react';
import { shopService, ShopWithBarbers, Barber, Service } from '@/services/shop.service';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services';
import BookingModal from '@/components/BookingModal';

const ShopDemo: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [shopData, setShopData] = useState<ShopWithBarbers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingBarber, setBookingBarber] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Determine user type for proper layout and functionality
  const isCustomer = authService.isCustomer();
  const isBarber = authService.isBarber();
  const layoutUserType = isCustomer ? 'customer' : 'barber';


  useEffect(() => {
    const loadShopData = async () => {
      if (!shopId) {
        setError('Shop ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🏪 Fetching shop data for:', shopId);
        const response = await shopService.getShopDetails(shopId);
        
        if (response.status === 'success') {
          console.log('✅ Shop data loaded:', response.data);
          setShopData(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch shop details');
        }
      } catch (err) {
        console.error('❌ Error loading shop data:', err);
        setError('Failed to load shop details');
        toast({
          title: 'Error',
          description: 'Failed to load shop details. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [shopId, toast]);


  const handleBookBarber = (barber: Barber) => {
    // Only customers can book appointments
    if (!isCustomer) {
      toast({
        title: 'Booking Not Available',
        description: 'Only customers can book appointments.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!barber.isAvailable) {
      toast({
        title: 'Barber Unavailable',
        description: `${barber.fullName} is currently unavailable. Please select an available barber.`,
        variant: 'destructive'
      });
      return;
    }
    
    setBookingBarber({
      id: barber.id,
      name: barber.fullName,
      profileImage: barber.profileImage,
      specialties: barber.specialties || [],
      rating: barber.rating,
      seatNumber: 1 // Default seat number
    });
    setShowBookingModal(true);
  };
  
  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      description: isFavorite 
        ? `${shopData?.name} has been removed from your favorites.`
        : `${shopData?.name} has been added to your favorites.`,
    });
  };
  
  const handleCallShop = () => {
    if (shopData?.phoneNumber) {
      window.open(`tel:${shopData.phoneNumber}`);
    } else {
      toast({
        title: 'No Phone Number',
        description: 'This shop has not provided a phone number.',
        variant: 'destructive'
      });
    }
  };
  
  const handleEmailShop = () => {
    if (shopData?.email) {
      window.open(`mailto:${shopData.email}`);
    } else {
      toast({
        title: 'No Email',
        description: 'This shop has not provided an email address.',
        variant: 'destructive'
      });
    }
  };
  
  const handleGetDirections = () => {
    if (shopData?.address) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopData.address)}`;
      window.open(mapsUrl, '_blank');
    }
  };
  
  const handleViewBarberProfile = (barberId: string) => {
    navigate(`/barber/profile/${barberId}`);
  };

  const handleBookingComplete = (booking: any) => {
    toast({
      title: 'Booking Confirmed!',
      description: `Your appointment with ${booking.barber?.fullName || bookingBarber.name} has been scheduled.`,
      variant: 'default'
    });
    setShowBookingModal(false);
    setBookingBarber(null);
  };

  if (loading) {
    return (
      <Layout userType={layoutUserType}>
        <Header 
          title="Loading..." 
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
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
            <span className="text-gray-600">Loading shop details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !shopData) {
    return (
      <Layout userType={layoutUserType}>
        <Header 
          title="Shop Not Found" 
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
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Shop Not Found</h3>
            <p className="text-gray-600 mb-4">{error || 'This barbershop could not be found.'}</p>
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

  // Parse opening hours for display
  const getOpeningStatus = () => {
    if (!shopData.openingHours || !shopData.closingHours) {
      return { text: 'Hours not available', isOpen: false };
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(shopData.openingHours.replace(':', ''));
    const closeTime = parseInt(shopData.closingHours.replace(':', ''));
    
    const isOpen = currentTime >= openTime && currentTime <= closeTime;
    
    return {
      text: isOpen ? `Open • Closes ${shopData.closingHours}` : `Closed • Opens ${shopData.openingHours}`,
      isOpen
    };
  };
  
  const openingStatus = getOpeningStatus();
  const availableBarbers = shopData.barbers?.filter(barber => barber.isAvailable) || [];
  const totalBarbers = shopData.barbers?.length || 0;

  return (
    <Layout userType={layoutUserType}>
      <Header 
        title={shopData.name} 
        leftAction={
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        }
        rightAction={
          <div className="flex items-center space-x-2">
            {isCustomer && (
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: shopData.name,
                    text: shopData.description,
                    url: window.location.href
                  });
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share2 size={20} />
            </button>
          </div>
        }
      />
      
      <div className="pt-20">
        {/* Beautiful Shop Header with Green Gradient */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white px-4 pt-6 pb-8 relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-black bg-opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start space-x-4 mb-6">
              <div className="relative">
                <img
                  src={shopData.images && shopData.images.length > 0 ? 
                    shopData.images[0] : 
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(shopData.name)}&size=80&background=ffffff&color=10b981`
                  }
                  alt={shopData.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(shopData.name)}&size=80&background=ffffff&color=10b981`;
                  }}
                />
                {shopData.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{shopData.name}</h1>
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <Star size={16} className="text-yellow-300 mr-2" fill="currentColor" />
                    <span className="font-semibold">{shopData.rating}</span>
                    <span className="text-green-100 text-sm ml-2">({shopData.totalReviews} reviews)</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-green-100">
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span className={openingStatus.isOpen ? 'text-green-200' : 'text-yellow-200'}>
                      {openingStatus.text}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    <span>{availableBarbers.length}/{totalBarbers} available</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white bg-opacity-15 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-green-100 leading-relaxed mb-4">
                {shopData.description || 'Professional barbering services with experienced barbers.'}
              </p>
              
              <div className="flex items-center text-sm text-green-100">
                <MapPin size={14} className="mr-2" />
                <span>{shopData.address}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="px-4 -mt-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className={`grid ${isCustomer ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
              {isCustomer && availableBarbers.length > 0 && (
                <button
                  onClick={() => handleBookBarber(availableBarbers[0])}
                  className="flex flex-col items-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Calendar size={20} className="mb-1" />
                  <span className="text-xs font-medium">Book Now</span>
                </button>
              )}
              
              <button
                onClick={handleCallShop}
                className="flex flex-col items-center p-3 bg-blue-40 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Phone size={20} className="mb-1" />
                <span className="text-xs font-medium">Call</span>
              </button>
              
              <button
                onClick={handleGetDirections}
                className="flex flex-col items-center p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Navigation size={20} className="mb-1" />
                <span className="text-xs font-medium">Directions</span>
              </button>
              
              <button
                onClick={handleEmailShop}
                className="flex flex-col items-center p-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mail size={20} className="mb-1" />
                <span className="text-xs font-medium">Email</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="px-4 pb-6">
          {/* Shop Details Tabs - Horizontally Scrollable */}
          <Tabs defaultValue="live" className="w-full">
            <div className="overflow-x-auto mb-6">
              <TabsList className="flex w-max min-w-full md:grid md:grid-cols-5 h-auto p-1">
                <TabsTrigger value="live" className="flex items-center space-x-2 whitespace-nowrap px-4 py-2">
                  <Monitor size={16} />
                  <span>Live View</span>
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center space-x-2 whitespace-nowrap px-4 py-2">
                  <Camera size={16} />
                  <span>Media</span>
                </TabsTrigger>
                <TabsTrigger value="barbers" className="flex items-center space-x-2 whitespace-nowrap px-4 py-2">
                  <Users size={16} />
                  <span>Our Barbers</span>
                </TabsTrigger>
                <TabsTrigger value="hours" className="flex items-center space-x-2 whitespace-nowrap px-4 py-2">
                  <Clock size={16} />
                  <span>Hours</span>
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center space-x-2 whitespace-nowrap px-4 py-2">
                  <MapPin size={16} />
                  <span>Info</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="live" className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Monitor size={20} className="mr-2 text-green-600" />
                  Live Shop View
                </h3>
                
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Monitor size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600 font-medium">Live Camera Feed</p>
                    <p className="text-sm text-gray-500 mt-1">See real-time shop activity</p>
                  </div>
                </div>
                
                {/* Shop Status Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <Users size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-700">{availableBarbers.length}</div>
                        <div className="text-sm text-green-600">Available Now</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <Clock size={24} className="text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-700">0</div>
                        <div className="text-sm text-blue-600">Queue Length</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Current Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Current Status</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${openingStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium text-gray-900">
                        {openingStatus.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {openingStatus.isOpen ? `Closes at ${shopData.closingHours}` : `Opens at ${shopData.openingHours}`}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="media" className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Camera size={20} className="mr-2 text-green-600" />
                    Shop Media
                  </h3>
                  <span className="text-sm text-gray-500">Latest posts</span>
                </div>
                
                {/* Media Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* Sample media items - replace with real data */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=300&h=300&fit=crop" 
                      alt="Shop work" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=300&h=300&fit=crop" 
                      alt="Barber work" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Video size={16} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop" 
                      alt="Shop interior" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=300&h=300&fit=crop" 
                      alt="Finished cut" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1599351431613-58b8b71fcf35?w=300&h=300&fit=crop" 
                      alt="Team photo" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                  
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group cursor-pointer">
                    <img 
                      src="https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=300&h=300&fit=crop" 
                      alt="Before after" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                </div>
                
                {/* View All Button */}
                <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center space-x-2">
                  <Image size={20} />
                  <span>View All Media</span>
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="barbers" className="space-y-4">
              {shopData.barbers && shopData.barbers.length > 0 ? (
                <div className="space-y-4">
                  {shopData.barbers.map((barber: Barber) => (
                    <div key={barber.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <img
                            src={barber.profileImage ? 
                              `https://images.unsplash.com/${barber.profileImage}?w=80&h=80&fit=crop&crop=face` :
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.fullName)}&size=80&background=10b981&color=white`
                            }
                            alt={barber.fullName}
                            className="w-16 h-16 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.fullName)}&size=80&background=10b981&color=white`;
                            }}
                          />
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                            barber.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900">{barber.fullName}</h3>
                            <Badge variant={barber.isAvailable ? 'default' : 'secondary'}>
                              {barber.isAvailable ? 'Available' : 'Busy'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
                            {barber.rating > 0 && (
                              <div className="flex items-center">
                                <Star size={14} className="text-yellow-500 mr-1" fill="currentColor" />
                                <span>{barber.rating.toFixed(1)}</span>
                                <span className="ml-1">({barber.totalReviews} reviews)</span>
                              </div>
                            )}
                          </div>
                          
                          {barber.specialties && barber.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {barber.specialties.slice(0, 3).map((specialty, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                                >
                                  {specialty}
                                </span>
                              ))}
                              {barber.specialties.length > 3 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                                  +{barber.specialties.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                          
                          {barber.hourlyRate && (
                            <div className="mb-3">
                              <span className="text-lg font-bold text-green-600">
                                ₦{(barber.hourlyRate + Math.round(barber.hourlyRate * 0.08)).toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 ml-2">per session</span>
                            </div>
                          )}
                          
                          <div className="flex space-x-2">
                            {isCustomer && barber.isAvailable && (
                              <button
                                onClick={() => handleBookBarber(barber)}
                                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm"
                              >
                                Book with {barber.fullName.split(' ')[0]}
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleViewBarberProfile(barber.id)}
                              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                            >
                              <Eye size={16} className="mr-1" />
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No barbers available</h3>
                  <p className="text-gray-600">This shop doesn't have any barbers listed yet.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="hours" className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Clock size={20} className="mr-2 text-green-600" />
                  Business Hours
                </h3>
                
                {/* Current Status */}
                <div className={`rounded-lg p-4 mb-6 ${
                  openingStatus.isOpen ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        openingStatus.isOpen ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className={`font-semibold ${
                          openingStatus.isOpen ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {openingStatus.isOpen ? 'Open Now' : 'Closed'}
                        </div>
                        <div className={`text-sm ${
                          openingStatus.isOpen ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {openingStatus.isOpen ? `Closes at ${shopData.closingHours}` : `Opens at ${shopData.openingHours}`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Operating Hours */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Operating Hours</h4>
                  <div className="space-y-2">
                    {shopData.openingHours && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">Daily</span>
                          <span className="text-gray-600">
                            {shopData.openingHours} - {shopData.closingHours}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="info" className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin size={20} className="mr-2 text-green-600" />
                  Contact Information
                </h3>
                
                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">{shopData.phoneNumber || 'Not provided'}</div>
                      <div className="text-sm text-gray-500">Tap to call</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">{shopData.email || 'Not provided'}</div>
                      <div className="text-sm text-gray-500">Send email</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900">{shopData.address}</div>
                      <div className="text-sm text-gray-500">Get directions</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Booking Modal - Only show for customers */}
      {isCustomer && bookingBarber && (
        <BookingModal
          open={showBookingModal}
          onOpenChange={setShowBookingModal}
          barber={bookingBarber}
          shop={{
            id: shopData.id,
            name: shopData.name,
            address: shopData.address,
            services: shopData.services || []
          }}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </Layout>
  );
};

export default ShopDemo;
