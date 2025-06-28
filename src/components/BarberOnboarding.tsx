import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Building2, User, Search, Plus, MapPin, Users, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { barbershopService, Shop } from '@/services/barbershop.service';

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

interface BarberOnboardingProps {
  onComplete: (data: any) => void;
}

const BarberOnboarding: React.FC<BarberOnboardingProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Form data
  const [barberType, setBarberType] = useState<'solo' | 'shop'>('');
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Shop[]>([]);
  const [joinMessage, setJoinMessage] = useState('');
  const [newShopData, setNewShopData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    email: '',
    totalSeats: 4,
    description: ''
  });
  
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [experience, setExperience] = useState('');

  // Specialty options
  const availableSpecialties = [
    'Fade Cut', 'Beard Trim', 'Line Up', 'Traditional Cut', 'Afro Cut',
    'Hot Towel Shave', 'Mustache Trim', 'Hair Styling', 'Kids Cut', 'Dreadlocks'
  ];

  // Search shops using real API
  const searchShops = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    try {
      // Get user's location for distance calculation
      const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            () => {
              // If location fails, use default Lagos coordinates
              resolve({
                latitude: 6.5244,
                longitude: 3.3792
              });
            }
          );
        });
      };

      const location = await getUserLocation();
      const response = await barbershopService.searchShops(
        query,
        location.latitude,
        location.longitude,
        20 // 20km radius
      );
      
      if (response.status === 'success') {
        const formattedShops: Shop[] = response.data.map(shop => ({
          id: shop.id,
          name: shop.name,
          address: shop.address,
          owner: shop.owner,
          totalSeats: shop.totalSeats,
          availableSeats: shop.availableSeats,
          rating: shop.rating,
          distance: shop.distance || undefined
        }));
        setSearchResults(formattedShops);
      }
    } catch (error) {
      console.error('Error searching shops:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search shops. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchShops(shopSearchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [shopSearchQuery]);

  const handleSpecialtyToggle = (specialty: string) => {
    setSpecialties(prev => 
      prev.includes(specialty) 
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

const handleJoinRequest = async (shopId: string | undefined) => {
    if (!shopId) return;
    setJoinLoading(true);
    try {
      await barbershopService.submitJoinRequest(shopId, joinMessage);
      toast({
        title: "Join Request Sent",
        description: "Your request to join the barbershop has been sent to the owner.",
      });
      // Move to next step after successful request
      nextStep();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const onboardingData = {
        barberType,
        isSolo: barberType === 'solo',
        specialties,
        hourlyRate: parseFloat(hourlyRate),
        experience,
        ...(barberType === 'shop' && selectedShop && {
          requestedShopId: selectedShop.id,
          joinMessage
        }),
        ...(barberType === 'shop' && !selectedShop && {
          newShop: newShopData
        })
      };

      await barbershopService.completeBarberOnboarding(onboardingData);
      
      toast({
        title: 'Onboarding Complete!',
        description: barberType === 'solo' 
          ? 'Your solo barber profile has been created.'
          : selectedShop 
            ? 'Your join request has been sent to the shop owner.'
            : 'Your new barbershop has been created and you are the owner!'
      });
      
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const canProceedFromStep = (currentStep: number) => {
    switch (currentStep) {
      case 1: return barberType !== '';
      case 2: 
        if (barberType === 'solo') return true;
        return selectedShop !== null || (newShopData.name && newShopData.address);
      case 3: return specialties.length > 0 && hourlyRate;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-xl max-h-[calc(100vh-200px)] overflow-y-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Barber Profile</CardTitle>
            <CardDescription>
              Let's set up your profile to connect you with customers
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Barber Type Selection */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">What type of barber are you?</h3>
                  <p className="text-gray-600">Choose the option that best describes your work setup</p>
                </div>

                <RadioGroup value={barberType} onValueChange={(value: 'solo' | 'shop') => setBarberType(value)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Label htmlFor="solo" className="cursor-pointer">
                      <Card className={`p-6 transition-all hover:shadow-md ${barberType === 'solo' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                        <RadioGroupItem value="solo" id="solo" className="sr-only" />
                        <div className="text-center">
                          <User className="mx-auto mb-4 h-12 w-12 text-green-600" />
                          <h4 className="font-semibold">Solo Barber</h4>
                          <p className="text-sm text-gray-600 mt-2">
                            I work independently and serve customers at my own location
                          </p>
                        </div>
                      </Card>
                    </Label>

                    <Label htmlFor="shop" className="cursor-pointer">
                      <Card className={`p-6 transition-all hover:shadow-md ${barberType === 'shop' ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
                        <RadioGroupItem value="shop" id="shop" className="sr-only" />
                        <div className="text-center">
                          <Building2 className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                          <h4 className="font-semibold">Shop Barber</h4>
                          <p className="text-sm text-gray-600 mt-2">
                            I work at a barbershop with other barbers
                          </p>
                        </div>
                      </Card>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Step 2: Shop Selection (only for shop barbers) */}
            {step === 2 && barberType === 'shop' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Find Your Barbershop</h3>
                  <p className="text-gray-600">Search for the barbershop you work at or create a new one</p>
                </div>

                {/* Shop Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search for barbershops by name or location..."
                    value={shopSearchQuery}
                    onChange={(e) => setShopSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" size={20} />
                  )}
                </div>

                {/* Search Results */}
{searchResults.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((shop) => (
                      <Card 
                        key={shop.id} 
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedShop?.id === shop.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                        }`}
                        onClick={() => setSelectedShop(shop)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{shop.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <MapPin size={14} className="mr-1" />
                              {shop.address}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Owner: {shop.owner}</span>
                              <span className="flex items-center">
                                <Users size={12} className="mr-1" />
                                {shop.availableSeats}/{shop.totalSeats} seats available
                              </span>
                              <span>⭐ {shop.rating}</span>
                              {shop.distance && <span>{shop.distance} away</span>}
                            </div>
                          </div>
                          {selectedShop?.id === shop.id && (
                            <Check className="text-green-500" size={20} />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Create New Shop Option */}
                <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedShop(null)}
                  >
                    <Plus className="mr-2" size={16} />
                    Can't find your shop? Create a new barbershop
                  </Button>
                </div>

                {/* New Shop Form */}
                {selectedShop === null && shopSearchQuery === '' && (
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold">Create New Barbershop</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shopName">Shop Name *</Label>
                        <Input
                          id="shopName"
                          value={newShopData.name}
                          onChange={(e) => setNewShopData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter shop name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="shopPhone">Phone Number *</Label>
                        <Input
                          id="shopPhone"
                          value={newShopData.phoneNumber}
                          onChange={(e) => setNewShopData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          placeholder="Shop phone number"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="shopAddress">Address *</Label>
                      <Input
                        id="shopAddress"
                        value={newShopData.address}
                        onChange={(e) => setNewShopData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Full shop address"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shopEmail">Email (Optional)</Label>
                        <Input
                          id="shopEmail"
                          type="email"
                          value={newShopData.email}
                          onChange={(e) => setNewShopData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="shop@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="totalSeats">Number of Seats</Label>
                        <Input
                          id="totalSeats"
                          type="number"
                          min="1"
                          max="20"
                          value={newShopData.totalSeats}
                          onChange={(e) => setNewShopData(prev => ({ ...prev, totalSeats: parseInt(e.target.value) || 4 }))}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="shopDescription">Description (Optional)</Label>
                      <Textarea
                        id="shopDescription"
                        value={newShopData.description}
                        onChange={(e) => setNewShopData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell customers about your barbershop..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Join Message for existing shop */}
                {selectedShop && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="joinMessage">Message to Shop Owner (Optional)</Label>
                      <Textarea
                        id="joinMessage"
                        value={joinMessage}
                        onChange={(e) => setJoinMessage(e.target.value)}
                        placeholder="Introduce yourself to the shop owner..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleJoinRequest(selectedShop?.id)} 
                      disabled={!selectedShop || joinLoading}
                    >
                      {joinLoading ? "Sending Request..." : "Send Join Request"}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Solo Barber (skip shop selection) */}
            {step === 2 && barberType === 'solo' && (
              <div className="text-center py-8">
                <User className="mx-auto mb-4 h-16 w-16 text-green-600" />
                <h3 className="text-lg font-semibold mb-2">Perfect! You're a Solo Barber</h3>
                <p className="text-gray-600">
                  You'll have your own independent profile where customers can book directly with you.
                </p>
              </div>
            )}

            {/* Step 3: Specialties and Rates */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Your Specialties & Rates</h3>
                  <p className="text-gray-600">Let customers know what services you offer</p>
                </div>

                <div>
                  <Label className="text-base font-medium">Select Your Specialties *</Label>
                  <p className="text-sm text-gray-600 mb-3">Choose at least one specialty</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {availableSpecialties.map((specialty) => (
                      <Button
                        key={specialty}
                        type="button"
                        variant={specialties.includes(specialty) ? "default" : "outline"}
                        size="sm"
                        className={`justify-start ${specialties.includes(specialty) ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => handleSpecialtyToggle(specialty)}
                      >
                        {specialty}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (₦) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 5 years"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Summary */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Review Your Information</h3>
                  <p className="text-gray-600">Make sure everything looks correct</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="font-medium">Barber Type:</span> {barberType === 'solo' ? 'Solo Barber' : 'Shop Barber'}
                  </div>
                  
                  {barberType === 'shop' && selectedShop && (
                    <div>
                      <span className="font-medium">Joining Shop:</span> {selectedShop.name}
                      <br />
                      <span className="text-sm text-gray-600">{selectedShop.address}</span>
                    </div>
                  )}
                  
                  {barberType === 'shop' && !selectedShop && newShopData.name && (
                    <div>
                      <span className="font-medium">Creating New Shop:</span> {newShopData.name}
                      <br />
                      <span className="text-sm text-gray-600">{newShopData.address}</span>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">Specialties:</span> {specialties.join(', ')}
                  </div>
                  
                  <div>
                    <span className="font-medium">Hourly Rate:</span> ₦{hourlyRate}
                  </div>
                  
                  {experience && (
                    <div>
                      <span className="font-medium">Experience:</span> {experience}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2" size={16} />
                Previous
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(step)}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  Next
                  <ChevronRight className="ml-2" size={16} />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !canProceedFromStep(step)}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Completing...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarberOnboarding;
