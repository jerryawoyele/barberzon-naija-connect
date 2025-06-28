import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { User, MapPin, Scissors, Store, Upload, ChevronRight, ChevronLeft, Check, Search, Users, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { barbershopService } from '@/services/barbershop.service';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: (userType: 'customer' | 'barber', data: any) => void;
}

interface Shop {
  id: string;
  name: string;
  address: string;
  owner: string;
  totalSeats: number;
  availableSeats: number;
  rating: number;
  distance?: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onComplete }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [userType, setUserType] = useState<'customer' | 'barber' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Basic user info
    fullName: '',
    phoneNumber: '',
    
    // Common fields
    profileImage: '',
    locationLat: null as number | null,
    locationLng: null as number | null,
    
    // Customer specific
    bookingPreferences: {
      preferredTime: '',
      favoriteServices: [] as string[],
      notifications: true,
    },
    
    // Barber specific
    specialties: [] as string[],
    hourlyRate: '',
    bio: '',
    shopName: '',
    shopAddress: '',
    shopPhone: '',
    isNewShop: true,
    selectedShopId: '',
    joinMessage: ''
  });
  
  // Shop search states
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [nearbyShops, setNearbyShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [joinRequestSent, setJoinRequestSent] = useState(false);

  const customerServices = [
    'Haircut', 'Beard Trim', 'Shave', 'Hair Wash', 'Styling', 'Mustache Trim'
  ];

  const barberSpecialties = [
    'Fade', 'Beard Trim', 'Traditional Cut', 'Afro Cut', 'Line Up', 'Hot Towel Shave',
    'Hair Styling', 'Mustache Trim', 'Kids Cut', 'Senior Cut'
  ];

  const timeSlots = [
    'Morning (8AM - 12PM)', 'Afternoon (12PM - 5PM)', 'Evening (5PM - 8PM)', 'Flexible'
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      if (!userType) {
        toast({
          title: "Please select your role",
          description: "Choose whether you're a customer or barber to continue.",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.fullName.trim()) {
        toast({
          title: "Full name required",
          description: "Please enter your full name to continue.",
          variant: "destructive"
        });
        return;
      }
      
      if (!formData.phoneNumber.trim()) {
        toast({
          title: "Phone number required",
          description: "Please enter your phone number to continue.",
          variant: "destructive"
        });
        return;
      }
    }
    
    if (currentStep < getTotalSteps()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTotalSteps = () => {
    return userType === 'customer' ? 4 : 5;
  };

  const handleServiceToggle = (service: string) => {
    const updatedServices = formData.bookingPreferences.favoriteServices.includes(service)
      ? formData.bookingPreferences.favoriteServices.filter(s => s !== service)
      : [...formData.bookingPreferences.favoriteServices, service];
    
    setFormData({
      ...formData,
      bookingPreferences: {
        ...formData.bookingPreferences,
        favoriteServices: updatedServices
      }
    });
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const updatedSpecialties = formData.specialties.includes(specialty)
      ? formData.specialties.filter(s => s !== specialty)
      : [...formData.specialties, specialty];
    
    setFormData({
      ...formData,
      specialties: updatedSpecialties
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            locationLat: position.coords.latitude,
            locationLng: position.coords.longitude
          });
          toast({
            title: "Location saved",
            description: "Your current location has been saved."
          });
          // Load nearby shops when location is obtained
          if (userType === 'barber' && !formData.isNewShop) {
            loadNearbyShops(position.coords.latitude, position.coords.longitude);
          }
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. You can set it manually later.",
            variant: "destructive"
          });
          // Load shops without location
          if (userType === 'barber' && !formData.isNewShop) {
            loadNearbyShops();
          }
        }
      );
    }
  };

  // Load nearby shops
  const loadNearbyShops = async (lat?: number, lng?: number) => {
    setSearchLoading(true);
    try {
      const response = await barbershopService.searchShops(
        '', // empty query to get all shops
        lat || formData.locationLat || 6.5244, // Lagos default
        lng || formData.locationLng || 3.3792,
        20 // 20km radius
      );
      if (response.status === 'success') {
        const shops: Shop[] = response.data.map(shop => ({
          id: shop.id,
          name: shop.name,
          address: shop.address,
          owner: shop.owner,
          totalSeats: shop.totalSeats,
          availableSeats: shop.availableSeats,
          rating: shop.rating,
          distance: shop.distance
        }));
        setNearbyShops(shops);
        setSearchResults(shops);
      }
    } catch (error) {
      console.error('Error loading nearby shops:', error);
      toast({
        title: 'Error',
        description: 'Failed to load nearby barbershops.',
        variant: 'destructive'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Search shops
  const searchShops = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(nearbyShops);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await barbershopService.searchShops(
        query,
        formData.locationLat || 6.5244,
        formData.locationLng || 3.3792,
        20
      );
      if (response.status === 'success') {
        const shops: Shop[] = response.data.map(shop => ({
          id: shop.id,
          name: shop.name,
          address: shop.address,
          owner: shop.owner,
          totalSeats: shop.totalSeats,
          availableSeats: shop.availableSeats,
          rating: shop.rating,
          distance: shop.distance
        }));
        setSearchResults(shops);
      }
    } catch (error) {
      console.error('Error searching shops:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search barbershops.',
        variant: 'destructive'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle shop search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchShops(shopSearchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [shopSearchQuery]);

  // Load nearby shops when step 4 is reached and not creating new shop
  useEffect(() => {
    if (currentStep === 4 && userType === 'barber' && !formData.isNewShop && nearbyShops.length === 0) {
      loadNearbyShops();
    }
  }, [currentStep, userType, formData.isNewShop]);

  // Handle join request
  const handleJoinRequest = async () => {
    if (!selectedShop) return;
    
    setIsLoading(true);
    try {
      await barbershopService.submitJoinRequest(selectedShop.id, formData.joinMessage);
      toast({
        title: 'Join Request Sent',
        description: 'Your request to join the barbershop has been sent to the owner.',
      });
      setJoinRequestSent(true);
      setFormData({ ...formData, selectedShopId: selectedShop.id });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send join request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (!userType) return;
      
      // Validate required fields
      if (userType === 'barber') {
        if (formData.specialties.length === 0) {
          toast({
            title: "Specialties required",
            description: "Please select at least one specialty.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        if (!formData.hourlyRate) {
          toast({
            title: "Rate required",
            description: "Please set your hourly rate.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
      
      await onComplete(userType, formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Barberzon!</h3>
              <p className="text-gray-600">Let's get you set up with your basic information</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  placeholder="e.g. +234 803 123 4567"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">What best describes you?</Label>
              <RadioGroup value={userType || ''} onValueChange={(value) => setUserType(value as 'customer' | 'barber')}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="customer" id="customer" />
                    <User className="text-blue-600" size={24} />
                    <div className="flex-1">
                      <Label htmlFor="customer" className="font-medium cursor-pointer">I'm a Customer</Label>
                      <p className="text-sm text-gray-600">Looking to book haircuts and grooming services</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="barber" id="barber" />
                    <Scissors className="text-green-600" size={24} />
                    <div className="flex-1">
                      <Label htmlFor="barber" className="font-medium cursor-pointer">I'm a Barber</Label>
                      <p className="text-sm text-gray-600">Providing haircuts and grooming services</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="mx-auto text-blue-600 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your Location</h3>
              <p className="text-gray-600">This helps us find the best {userType === 'customer' ? 'barbers' : 'customers'} near you</p>
            </div>
            
            <div className="space-y-4">
              <Button onClick={getCurrentLocation} variant="outline" className="w-full">
                <MapPin className="mr-2" size={16} />
                Use Current Location
              </Button>
              
              {formData.locationLat && formData.locationLng && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Location saved: {formData.locationLat.toFixed(4)}, {formData.locationLng.toFixed(4)}
                  </p>
                </div>
              )}
              
              <div className="text-center text-sm text-gray-500">
                <p>Don't worry, you can always change this later in your settings</p>
              </div>
            </div>
          </div>
        );

      case 3:
        if (userType === 'customer') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Preferences</h3>
                <p className="text-gray-600">What services are you most interested in?</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Favorite Services</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {customerServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.bookingPreferences.favoriteServices.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Preferred Time</Label>
                <RadioGroup 
                  value={formData.bookingPreferences.preferredTime} 
                  onValueChange={(value) => setFormData({
                    ...formData,
                    bookingPreferences: { ...formData.bookingPreferences, preferredTime: value }
                  })}
                  className="mt-2"
                >
                  {timeSlots.map((slot) => (
                    <div key={slot} className="flex items-center space-x-2">
                      <RadioGroupItem value={slot} id={slot} />
                      <Label htmlFor={slot} className="text-sm">{slot}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Scissors className="mx-auto text-green-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Specialties</h3>
                <p className="text-gray-600">What services do you offer?</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Select Your Specialties</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {barberSpecialties.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-2">
                      <Checkbox
                        id={specialty}
                        checked={formData.specialties.includes(specialty)}
                        onCheckedChange={() => handleSpecialtyToggle(specialty)}
                      />
                      <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="hourlyRate" className="text-sm font-medium">Hourly Rate (₦)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          );
        }

      case 4:
        if (userType === 'customer') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Check className="mx-auto text-green-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">All Set!</h3>
                <p className="text-gray-600">You're ready to start booking appointments with top barbers</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Browse barbers near you</li>
                  <li>• Book your first appointment</li>
                  <li>• Add funds to your wallet</li>
                  <li>• Rate your experiences</li>
                </ul>
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Store className="mx-auto text-green-600 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Shop Information</h3>
                <p className="text-gray-600">Tell us about your barbershop</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="newShop"
                    checked={formData.isNewShop}
                    onCheckedChange={(checked) => setFormData({ ...formData, isNewShop: checked as boolean })}
                  />
                  <Label htmlFor="newShop" className="text-sm">I'm registering a new shop</Label>
                </div>
                
                {formData.isNewShop ? (
                  <>
                    <div>
                      <Label htmlFor="shopName" className="text-sm font-medium">Shop Name</Label>
                      <Input
                        id="shopName"
                        placeholder="e.g. Kings Cut Barber Shop"
                        value={formData.shopName}
                        onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="shopAddress" className="text-sm font-medium">Shop Address</Label>
                      <Input
                        id="shopAddress"
                        placeholder="e.g. 123 Main Street, Lagos"
                        value={formData.shopAddress}
                        onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="shopPhone" className="text-sm font-medium">Shop Phone</Label>
                      <Input
                        id="shopPhone"
                        placeholder="e.g. +234 803 123 4567"
                        value={formData.shopPhone}
                        onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <h4 className="font-medium text-gray-900">Find Your Barbershop</h4>
                      <p className="text-sm text-gray-600">Search for the barbershop you work at</p>
                    </div>
                    
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <Input
                        placeholder="Search barbershops by name or location..."
                        value={shopSearchQuery}
                        onChange={(e) => setShopSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      {searchLoading && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" size={20} />
                      )}
                    </div>
                    
                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((shop) => (
                          <Card 
                            key={shop.id} 
                            className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                              selectedShop?.id === shop.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                            }`}
                            onClick={() => setSelectedShop(shop)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm">{shop.name}</h4>
                                <p className="text-xs text-gray-600 flex items-center mt-1">
                                  <MapPin size={12} className="mr-1" />
                                  {shop.address}
                                </p>
                                <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                  <span>Owner: {shop.owner}</span>
                                  <span className="flex items-center">
                                    <Users size={10} className="mr-1" />
                                    {shop.availableSeats}/{shop.totalSeats} seats available
                                  </span>
                                  <span>⭐ {shop.rating}</span>
                                  {shop.distance && <span>{shop.distance} away</span>}
                                </div>
                              </div>
                              {selectedShop?.id === shop.id && (
                                <Check className="text-green-500" size={16} />
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    
                    {/* Join message */}
                    {selectedShop && !joinRequestSent && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="joinMessage" className="text-sm font-medium">Message to Shop Owner (Optional)</Label>
                          <Textarea
                            id="joinMessage"
                            value={formData.joinMessage}
                            onChange={(e) => setFormData({ ...formData, joinMessage: e.target.value })}
                            placeholder="Introduce yourself to the shop owner..."
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={handleJoinRequest}
                          disabled={isLoading}
                        >
                          {isLoading ? "Sending Request..." : "Send Join Request"}
                        </Button>
                      </div>
                    )}
                    
                    {/* Request sent confirmation */}
                    {joinRequestSent && selectedShop && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <Check className="text-green-600 mr-2" size={20} />
                          <div>
                            <h4 className="font-medium text-green-900">Join Request Sent!</h4>
                            <p className="text-sm text-green-700">Your request to join "{selectedShop.name}" has been sent to the owner. You'll be notified when they respond.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell customers about yourself and your experience..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          );
        }

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="mx-auto text-green-600 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Barberzon!</h3>
              <p className="text-gray-600">Your barber profile is ready. Start accepting bookings today!</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">What's Next?</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Set up your availability</li>
                <li>• Upload photos of your work</li>
                <li>• Start accepting bookings</li>
                <li>• Build your reputation</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Step {currentStep} of {getTotalSteps()}
          </DialogTitle>
          <DialogDescription>
            Complete your profile setup to start using Barberzon
          </DialogDescription>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
            />
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {renderStep()}
        </div>
        
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2" size={16} />
            Previous
          </Button>
          
          {currentStep === getTotalSteps() ? (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading ? 'Completing...' : 'Complete Setup'}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-2" size={16} />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;
