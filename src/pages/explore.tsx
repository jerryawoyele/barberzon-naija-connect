import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import BarberCard from '@/components/BarberCard';
import BookingModal from '@/components/BookingModal';
import { Search, Filter, MapPin, Star, Sliders, Grid, List, Loader2, AlertCircle } from 'lucide-react';
import { shopService } from '@/services';
import { ShopWithBarbers, Barber } from '@/services/shop.service';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExtendedBarber {
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
  reviewCount: number;
  experience: string;
  shopAddress: string;
}

const ExploreBarbersPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [barbers, setBarbers] = useState<ExtendedBarber[]>([]);
  const [filteredBarbers, setFilteredBarbers] = useState<ExtendedBarber[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Get URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const filter = urlParams.get('filter');
    const search = urlParams.get('search');
    
    if (filter === 'weekend') {
      setFilterBy('weekend');
    }
    
    if (search) {
      setSearchQuery(search);
    }
  }, [location.search]);

  // Fetch barbers data
  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        setIsLoading(true);
        const response = await shopService.getAllShops();
        
        if (response.status === 'success') {
          // Transform shop data into barber list
          const allBarbers: ExtendedBarber[] = [];
          
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
                shopId: shop.id,
                reviewCount: Math.floor(Math.random() * 50) + 5, // Mock review count
                experience: `${Math.floor(Math.random() * 8) + 2} years`, // Mock experience
                shopAddress: shop.address
              });
            });
          });

          setBarbers(allBarbers);
        } else {
          // Use mock data if API fails
          const mockBarbers: ExtendedBarber[] = [
            {
              id: '1',
              name: 'Emeka Okafor',
              shopName: 'Kings Cut Barber Shop',
              rating: 4.8,
              distance: '0.5km',
              isAvailable: true,
              image: 'photo-1472099645785-5658abf4ff4e',
              specialties: ['Fade', 'Beard Trim', 'Line Up'],
              price: 5000,
              reviewCount: 42,
              experience: '5 years',
              shopAddress: '123 Victoria Island, Lagos'
            },
            {
              id: '2',
              name: 'Ibrahim Hassan',
              shopName: 'Classic Cuts',
              rating: 4.9,
              distance: '1.2km',
              isAvailable: true,
              image: 'photo-1507003211169-0a1dd7228f2d',
              specialties: ['Traditional Cut', 'Hot Towel', 'Mustache Trim'],
              price: 4500,
              reviewCount: 38,
              experience: '7 years',
              shopAddress: '45 Ikeja GRA, Lagos'
            },
            {
              id: '3',
              name: 'Tunde Adebayo',
              shopName: 'Fresh Look Barber Shop',
              rating: 4.7,
              distance: '0.8km',
              isAvailable: false,
              image: 'photo-1500648767791-00dcc994a43e',
              specialties: ['Afro Cut', 'Line Up', 'Hair Styling'],
              price: 5500,
              reviewCount: 29,
              experience: '4 years',
              shopAddress: '78 Surulere, Lagos'
            },
            {
              id: '4',
              name: 'Chike Okonkwo',
              shopName: 'Elite Barber Lounge',
              rating: 4.6,
              distance: '2.1km',
              isAvailable: true,
              image: 'photo-1472099645785-5658abf4ff4e',
              specialties: ['Fade', 'Beard Styling', 'Kids Cut'],
              price: 6000,
              reviewCount: 51,
              experience: '6 years',
              shopAddress: '12 Lekki Phase 1, Lagos'
            },
            {
              id: '5',
              name: 'Yusuf Abdullahi',
              shopName: 'Prime Cuts',
              rating: 4.5,
              distance: '1.8km',
              isAvailable: true,
              image: 'photo-1507003211169-0a1dd7228f2d',
              specialties: ['Traditional Cut', 'Shave', 'Beard Trim'],
              price: 4000,
              reviewCount: 33,
              experience: '8 years',
              shopAddress: '89 Maryland, Lagos'
            }
          ];
          setBarbers(mockBarbers);
        }
      } catch (error) {
        console.error('Error fetching barbers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load barbers. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBarbers();
  }, [toast]);

  // Filter and sort barbers
  useEffect(() => {
    let filtered = [...barbers];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(barber =>
        barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barber.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barber.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      switch (filterBy) {
        case 'available':
          filtered = filtered.filter(barber => barber.isAvailable);
          break;
        case 'top-rated':
          filtered = filtered.filter(barber => barber.rating >= 4.5);
          break;
        case 'nearby':
          filtered = filtered.filter(barber => parseFloat(barber.distance) <= 2);
          break;
        case 'weekend':
          // Mock weekend availability
          filtered = filtered.filter(barber => barber.isAvailable);
          break;
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => (b.rating * b.reviewCount) - (a.rating * a.reviewCount));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filtered.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredBarbers(filtered);
  }, [barbers, searchQuery, sortBy, filterBy]);

  const handleBookBarber = (id: string) => {
    const barber = filteredBarbers.find(b => b.id === id);
    if (barber) {
      setSelectedBarber(barber);
      setIsBookingModalOpen(true);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBarber(null);
  };

  const BarberListItem = ({ barber }: { barber: ExtendedBarber }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={`https://images.unsplash.com/${barber.image}?w=80&h=80&fit=crop&crop=face`}
            alt={barber.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
            barber.isAvailable ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{barber.name}</h3>
              <p className="text-gray-600 text-sm">{barber.shopName}</p>
              <p className="text-gray-500 text-xs">{barber.experience} experience</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-700">₦{barber.price.toLocaleString()}</div>
              <div className="text-xs text-gray-500">per session</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center">
              <Star size={14} className="text-yellow-500 mr-1" />
              <span className="font-medium">{barber.rating}</span>
              <span className="ml-1">({barber.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>{barber.distance}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{barber.shopAddress}</p>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {barber.specialties.slice(0, 3).map((specialty) => (
              <span
                key={specialty}
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
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/barber/profile/${barber.id}`)}
              className="flex-1 py-2 px-4 rounded-lg font-medium text-sm border border-green-600 text-green-600 hover:bg-green-50 transition-colors"
            >
              View Profile
            </button>
            <button
              onClick={() => handleBookBarber(barber.id)}
              disabled={!barber.isAvailable}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
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
    </div>
  );

  return (
    <Layout userType="customer">
      <Header title="Explore Barbers" />
      
      <div className="px-4 py-4">
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search barbers, shops, or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-300 border border-gray-200"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                showFilters ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600'
              }`}
            >
              <Sliders size={18} />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="distance">Nearest</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by</label>
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Barbers</SelectItem>
                      <SelectItem value="available">Available Now</SelectItem>
                      <SelectItem value="top-rated">Top Rated (4.5+)</SelectItem>
                      <SelectItem value="nearby">Nearby (2km)</SelectItem>
                      <SelectItem value="weekend">Weekend Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* View Mode and Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filteredBarbers.length} barber{filteredBarbers.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'text-gray-600'}`}
              >
                <Grid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Barbers List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
            <span className="text-gray-600">Loading barbers...</span>
          </div>
        ) : filteredBarbers.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredBarbers.map((barber) => (
              viewMode === 'grid' ? (
                <BarberCard
                  key={barber.id}
                  {...barber}
                  onBook={handleBookBarber}
                />
              ) : (
                <BarberListItem key={barber.id} barber={barber} />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No barbers found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            <Button onClick={() => { setSearchQuery(''); setFilterBy('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
      
      {/* Booking Modal */}
      {selectedBarber && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          barber={selectedBarber}
        />
      )}
    </Layout>
  );
};

export default ExploreBarbersPage;
