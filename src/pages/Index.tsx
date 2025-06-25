
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import BarberCard from '@/components/BarberCard';
import { Search, Filter, Heart, Loader2 } from 'lucide-react';
import { shopService, authService } from '@/services';
import { ShopWithBarbers, Barber } from '@/services/shop.service';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [shops, setShops] = useState<ShopWithBarbers[]>([]);
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
  }>>([]);
  
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
    console.log('Booking barber:', id);
    // TODO: Implement booking modal
  };

  return (
    <Layout userType="customer">
      <div className="bg-gradient-to-br from-green-700 to-green-800 px-4 pt-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">Good morning, John!</h1>
            <p className="text-green-100 text-sm">Find your perfect barber today</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-green-700 font-bold text-lg">J</span>
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
            className="w-full pl-10 pr-12 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 bg-green-50 rounded-lg">
            <Filter className="text-green-700" size={18} />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">12</div>
              <div className="text-xs text-gray-500">Total Cuts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">4.9</div>
              <div className="text-xs text-gray-500">Your Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₦2,400</div>
              <div className="text-xs text-gray-500">Saved</div>
            </div>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Heart className="text-red-500 mr-2" size={20} />
            Your Favorites
          </h2>
          <span className="text-green-700 text-sm font-medium">View All</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
            <span className="text-gray-600">Loading barbers...</span>
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
            <button className="bg-white text-yellow-600 px-4 py-2 rounded-lg font-medium text-sm">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
