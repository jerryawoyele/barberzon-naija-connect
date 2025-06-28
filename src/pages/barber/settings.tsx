import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  User, 
  Clock, 
  DollarSign, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  Camera, 
  Edit, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  Eye,
  Settings
} from 'lucide-react';
import { barberService } from '@/services/barber.service';

const BarberSettings = () => {
  const navigate = useNavigate();
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [shopInfo, setShopInfo] = useState({
    name: 'Kings Cut Barber Shop',
    address: '123 Victoria Island, Lagos',
    phone: '+234 803 123 4567',
    email: 'kingscutbarber@gmail.com',
    description: 'Premier barber shop offering traditional and modern cuts',
    image: 'photo-1585747860715-2ba37e788b70'
  });

  const [services, setServices] = useState([
    { id: '1', name: 'Haircut', price: 5000, duration: 30, active: true },
    { id: '2', name: 'Beard Trim', price: 2500, duration: 15, active: true },
    { id: '3', name: 'Traditional Cut', price: 4500, duration: 30, active: true },
    { id: '4', name: 'Afro Cut', price: 5500, duration: 40, active: true },
    { id: '5', name: 'Hot Towel', price: 1500, duration: 10, active: true },
    { id: '6', name: 'Premium Cut', price: 7500, duration: 60, active: false }
  ]);

  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '19:00', closed: false },
    saturday: { open: '08:00', close: '20:00', closed: false },
    sunday: { open: '10:00', close: '16:00', closed: false }
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    address: '',
    phoneNumber: '',
    email: '',
    profileImage: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [editHoursData, setEditHoursData] = useState(businessHours);
  const [isSavingHours, setIsSavingHours] = useState(false);
  const [showBarbersModal, setShowBarbersModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [profileEditData, setProfileEditData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    specialties: [] as string[],
    hourlyRate: '',
    experience: '',
    profileImage: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Check if user is shop owner - improved detection logic
  const isShopOwner = Boolean(
    settingsData?.barber?.ownedShops?.length > 0 || 
    settingsData?.shop || // Has shop data in settings
    (settingsData?.barber?.shop?.ownerId === settingsData?.barber?.id) ||
    (settingsData?.barber?.shop?.ownerId === settingsData?.barber?.user?.id) || // Check against user ID
    settingsData?.barber?.isOwner ||
    settingsData?.isShopOwner ||
    // Temporary fallback - if they have shop data, assume they're an owner
    (settingsData?.shop && settingsData?.barber)
  );


  // Fetch settings data from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await barberService.getSettings();
        if (response.status === 'success') {
          setSettingsData(response.data);
          
          // Update shop info if available
          if (response.data.shop) {
            const shopData = {
              name: response.data.shop.name || 'Shop Name',
              address: response.data.shop.address || 'Shop Address',
              phone: response.data.shop.phoneNumber || '+234 000 000 0000',
              email: response.data.shop.email || 'shop@example.com',
              description: response.data.shop.description || 'Shop description',
              image: response.data.shop.images?.[0] || 'photo-1585747860715-2ba37e788b70'
            };
            setShopInfo(shopData);
            
            // Set initial form data
            setEditFormData({
              name: shopData.name,
              description: shopData.description,
              address: shopData.address,
              phoneNumber: shopData.phone,
              email: shopData.email,
              profileImage: shopData.image
            });
          }
          
          // Update services if available
          if (response.data.shop?.services) {
            setServices(response.data.shop.services.map((service: any) => ({
              id: service.id,
              name: service.name,
              price: service.price,
              duration: service.durationMinutes,
              active: service.isActive
            })));
          }
          
          // Update business hours if available
          if (response.data.shop?.openingHours) {
            const hours = response.data.shop.openingHours;
            setBusinessHours(hours);
            setEditHoursData(hours);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle opening edit modal
  const handleEditShop = () => {
    setEditFormData({
      name: shopInfo.name,
      description: shopInfo.description,
      address: shopInfo.address,
      phoneNumber: shopInfo.phone,
      email: shopInfo.email,
      profileImage: shopInfo.image
    });
    setShowEditModal(true);
  };
  
  // Handle saving shop changes
  const handleSaveShop = async () => {
    try {
      setIsSaving(true);
      
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        address: editFormData.address,
        phoneNumber: editFormData.phoneNumber,
        email: editFormData.email,
        images: editFormData.profileImage ? [editFormData.profileImage] : []
      };
      
      const response = await barberService.updateShop(updateData);
      
      if (response.status === 'success') {
        // Update local state
        setShopInfo({
          ...shopInfo,
          name: editFormData.name,
          description: editFormData.description,
          address: editFormData.address,
          phone: editFormData.phoneNumber,
          email: editFormData.email,
          image: editFormData.profileImage
        });
        
        setShowEditModal(false);
        
        // Show success message
        alert('Shop information updated successfully!');
      }
    } catch (error) {
      console.error('Error updating shop:', error);
      alert('Failed to update shop information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle opening business hours modal
  const handleEditHours = () => {
    setEditHoursData(businessHours);
    setShowHoursModal(true);
  };
  
  // Handle saving business hours
  const handleSaveHours = async () => {
    try {
      setIsSavingHours(true);
      
      const response = await barberService.updateBusinessHours(editHoursData);
      
      if (response.status === 'success') {
        // Update local state
        setBusinessHours(editHoursData);
        setShowHoursModal(false);
        
        // Show success message
        alert('Business hours updated successfully!');
      }
    } catch (error) {
      console.error('Error updating business hours:', error);
      alert('Failed to update business hours. Please try again.');
    } finally {
      setIsSavingHours(false);
    }
  };

  // Handle opening profile edit modal
  const handleEditProfile = () => {
    if (settingsData?.barber) {
      setProfileEditData({
        fullName: settingsData.barber.fullName || '',
        email: settingsData.barber.email || '',
        phoneNumber: settingsData.barber.phoneNumber || '',
        bio: settingsData.barber.bio || '',
        specialties: settingsData.barber.specialties || [],
        hourlyRate: settingsData.barber.hourlyRate?.toString() || '',
        experience: settingsData.barber.experience || '',
        profileImage: settingsData.barber.profileImage || ''
      });
    }
    setShowProfileEditModal(true);
  };

  // Handle saving profile changes
  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      
      const updateData = {
        fullName: profileEditData.fullName,
        email: profileEditData.email,
        phoneNumber: profileEditData.phoneNumber,
        bio: profileEditData.bio,
        specialties: profileEditData.specialties,
        hourlyRate: parseFloat(profileEditData.hourlyRate) || 0,
        experience: profileEditData.experience,
        profileImage: profileEditData.profileImage
      };
      
      const response = await barberService.updateProfile(updateData);
      
      if (response.status === 'success') {
        // Update local state
        setSettingsData(prev => ({
          ...prev,
          barber: {
            ...prev.barber,
            ...updateData
          }
        }));
        
        setShowProfileEditModal(false);
        
        // Show success message
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const calculatePlatformFee = (price: number) => Math.round(price * 0.08);
  const calculateNetPrice = (price: number) => price - calculatePlatformFee(price);

  const MenuSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
        {title}
      </h3>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );

  const toggleService = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, active: !service.active }
        : service
    ));
  };

  const profileMenuItems = [
    {
      icon: User,
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Camera,
      title: 'Profile Picture',
      subtitle: 'Change your profile photo',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: Bell,
      title: 'Notification Settings',
      subtitle: 'Manage booking alerts and reminders',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Account security and data settings',
      color: 'bg-green-100 text-green-600'
    }
  ];
  
  const generalMenuItems = [
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: LogOut,
      title: 'Sign Out',
      subtitle: 'Sign out of your barber account',
      color: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <Layout userType="barber">
      <Header title="Settings" />
      
      <div className="pt-24 px-4 py-4">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-green-600 mr-2" size={24} />
            <span className="text-gray-600">Loading settings...</span>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load settings</h3>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <>
            {/* Main Tabs - Only show if shop owner, otherwise just show profile content */}
            {isShopOwner ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="profile" className="flex items-center space-x-2">
                    <User size={16} />
                    <span>Manage Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="shop" className="flex items-center space-x-2">
                    <Store size={16} />
                    <span>Manage Shop</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  {/* Profile Management Content */}
                  <div className="space-y-6">
                    {/* Profile Info Card */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                        Your Profile
                      </h3>
                      
                      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-2xl">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-start space-x-4">
                            <div className="relative">
                              <img
                                src={settingsData?.barber?.profileImage ? 
                                  `https://images.unsplash.com/${settingsData.barber.profileImage}?w=100&h=100&fit=crop` :
                                  `https://ui-avatars.com/api/?name=${encodeURIComponent(settingsData?.barber?.fullName || 'Barber')}&size=100&background=10b981&color=white`
                                }
                                alt={settingsData?.barber?.fullName || 'Barber'}
                                className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(settingsData?.barber?.fullName || 'Barber')}&size=100&background=10b981&color=white`;
                                }}
                              />
                              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                <User size={16} className="text-white" />
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <h2 className="text-2xl font-bold mb-2">{settingsData?.barber?.fullName || 'Barber Name'}</h2>
                              <div className="space-y-2 text-white/90">
                                <div className="flex items-center">
                                  <Mail size={16} className="mr-2 opacity-75" />
                                  <span className="text-sm max-w-40 flex-wrap truncate">{settingsData?.barber?.email || 'Not provided'}</span>
                                </div>
                                <div className="flex items-center">
                                  <Phone size={16} className="mr-2 opacity-75" />
                                  <span className="text-sm">{settingsData?.barber?.phoneNumber || 'Not provided'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleEditProfile}
                            className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white hover:bg-white/30 transition-all duration-200 flex items-center font-medium shadow-lg"
                          >
                            <Edit size={18}/>
                          </button>
                        </div>
                        
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <p className="text-white/90 leading-relaxed">
                            {settingsData?.barber?.bio || 'Professional barber providing quality services to clients.'}
                          </p>
                        </div>
                        
                        {/* Profile Stats */}
                        <div className="grid grid-cols-3 gap-4 mt-6">
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                            <div className="text-xl font-bold">
                              {settingsData?.barber?.rating ? settingsData.barber.rating.toFixed(1) : '0.0'}
                            </div>
                            <div className="text-xs text-white/75">Rating</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                            <div className="text-xl font-bold">
                              {settingsData?.barber?.totalReviews || 0}
                            </div>
                            <div className="text-xs text-white/75">Reviews</div>
                          </div>
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                            <div className="text-xl font-bold">
                              {settingsData?.barber?.specialties?.length || 0}
                            </div>
                            <div className="text-xs text-white/75">Specialties</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Profile Settings Menu */}
                    <MenuSection title="Profile Settings">
                      {profileMenuItems.map((item, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${item.color}`}>
                              <item.icon size={20} />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-600">{item.subtitle}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </MenuSection>
                    
                    {/* General Settings */}
                    <MenuSection title="General">
                      {generalMenuItems.map((item, index) => (
                        <button
                          key={index}
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${item.color}`}>
                              <item.icon size={20} />
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-600">{item.subtitle}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </MenuSection>
                  </div>
                </TabsContent>
                
                <TabsContent value="shop">
                  {/* Shop Management Content with Tab Structure */}
                  <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                    Your Shop's Profile
                  </h3>
                    {/* Shop Info Card */}
                    <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-2xl">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-start space-x-4">
                          <div className="relative">
                            <img
                              src={shopInfo.image.startsWith('http') ? 
                                shopInfo.image : 
                                `https://images.unsplash.com/${shopInfo.image}?w=100&h=100&fit=crop`
                              }
                              alt={shopInfo.name}
                              className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(shopInfo.name)}&size=100&background=10b981&color=white`;
                              }}
                            />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                              <Store size={16} className="text-white" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">{shopInfo.name}</h2>
                            <div className="space-y-2 text-white/90">
                              <div className="flex items-start">
                                <MapPin size={16} className="mr-2 opacity-75" />
                                <span className="text-sm">{shopInfo.address}</span>
                              </div>
                              <div className="flex items-center">
                                <Phone size={16} className="mr-2 opacity-75" />
                                <span className="text-sm">{shopInfo.phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={handleEditShop}
                          className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white hover:bg-white/30 transition-all duration-200 flex items-center font-medium shadow-lg"
                        >
                          <Edit size={18}  />
                        </button>
                      </div>
                    </div>

                    {/* Shop Management Tabs */}
                    <Tabs defaultValue="liveview" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="liveview" className="flex items-center space-x-2">
                          <Eye size={16} />
                          <span>Live View</span>
                        </TabsTrigger>
                        <TabsTrigger value="barbers" className="flex items-center space-x-2">
                          <User size={16} />
                          <span>Barbers</span>
                        </TabsTrigger>
                        <TabsTrigger value="hours" className="flex items-center space-x-2">
                          <Clock size={16} />
                          <span>Hours</span>
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center space-x-2">
                          <DollarSign size={16} />
                          <span>Analytics</span>
                        </TabsTrigger>
                      </TabsList>

                      {/* Live View Tab */}
                      <TabsContent value="liveview" className="mt-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">Shop Live View</h3>
                          
                          <div className="text-center py-12 text-gray-500">
                            <Eye size={48} className="mx-auto mb-4 opacity-50" />
                            <h4 className="text-lg font-medium text-gray-700 mb-2">Live Shop View</h4>
                            <p className="text-gray-600">Real-time view of your barbershop with barber statuses and seat availability.</p>
                            <div className="mt-6">
                              <div className="inline-flex items-center space-x-4 text-sm">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                  <span>Available</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                  <span>Busy</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                  <span>Break</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Barbers Management Tab */}
                      <TabsContent value="barbers" className="mt-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Shop Barbers</h3>
                            <button 
                              onClick={() => navigate('/barber/dashboard?tab=barber-management')}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Settings size={16} className="mr-2" />
                              Manage Barbers
                            </button>
                          </div>
                          
                          {settingsData?.shop?.barbers && settingsData.shop.barbers.length > 0 ? (
                            <div className="space-y-4">
                              {settingsData.shop.barbers.map((barber: any) => (
                                <div key={barber.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                  <img
                                    src={barber.user.profileImage ? 
                                      `https://images.unsplash.com/${barber.user.profileImage}?w=50&h=50&fit=crop` : 
                                      `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.user.fullName)}&size=50&background=10b981&color=white`
                                    }
                                    alt={barber.user.fullName}
                                    className="w-12 h-12 rounded-full object-cover mr-4"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{barber.user.fullName}</h4>
                                    <p className="text-sm text-gray-600">{barber.specialties?.join(', ') || 'No specialties'}</p>
                                    <div className="flex items-center mt-1">
                                      <span className={`w-2 h-2 rounded-full mr-2 ${
                                        barber.status === 'available' ? 'bg-green-500' :
                                        barber.status === 'busy' ? 'bg-red-500' :
                                        barber.status === 'break' ? 'bg-yellow-500' :
                                        'bg-gray-500'
                                      }`}></span>
                                      <span className="text-xs text-gray-500 capitalize">{barber.status || 'available'}</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">₦{barber.hourlyRate?.toLocaleString() || '0'}/hr</div>
                                    <div className="text-xs text-gray-500">{barber.totalReviews || 0} reviews</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <User size={48} className="mx-auto mb-2 opacity-50" />
                              <p>No barbers assigned to this shop yet</p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {/* Business Hours Tab */}
                      <TabsContent value="hours" className="mt-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Business Hours</h3>
                            <button
                              onClick={handleEditHours}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <Edit size={16} className="mr-2" />
                              Edit Hours
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {Object.entries(businessHours).map(([day, hours]) => (
                              <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-900 capitalize">{day}</span>
                                {hours.closed ? (
                                  <span className="text-gray-500 text-sm">Closed</span>
                                ) : (
                                  <span className="text-sm text-gray-600">
                                    {hours.open} - {hours.close}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Analytics Tab */}
                      <TabsContent value="analytics" className="mt-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-6">Shop Analytics</h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-green-600">{settingsData?.shop?.totalSeats || 0}</div>
                              <div className="text-sm text-gray-600">Total Seats</div>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-blue-600">{settingsData?.shop?.rating?.toFixed(1) || '0.0'}</div>
                              <div className="text-sm text-gray-600">Shop Rating</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="text-2xl font-bold text-purple-600">{settingsData?.shop?.totalReviews || 0}</div>
                              <div className="text-sm text-gray-600">Total Reviews</div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* Non-shop owner - Show only profile management */
              <div className="space-y-6">
                {/* Profile Info Card */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
                    Your Profile
                  </h3>
                  
                  <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-2xl">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <img
                            src={settingsData?.barber?.profileImage ? 
                              `https://images.unsplash.com/${settingsData.barber.profileImage}?w=100&h=100&fit=crop` :
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(settingsData?.barber?.fullName || 'Barber')}&size=100&background=10b981&color=white`
                            }
                            alt={settingsData?.barber?.fullName || 'Barber'}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(settingsData?.barber?.fullName || 'Barber')}&size=100&background=10b981&color=white`;
                            }}
                          />
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                            <User size={16} className="text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-2">{settingsData?.barber?.fullName || 'Barber Name'}</h2>
                          <div className="space-y-2 text-white/90">
                            <div className="flex items-center">
                              <Mail size={16} className="mr-2 opacity-75" />
                              <span className="text-sm">{settingsData?.barber?.email || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center">
                              <Phone size={16} className="mr-2 opacity-75" />
                              <span className="text-sm">{settingsData?.barber?.phoneNumber || 'Not provided'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={handleEditProfile}
                        className="bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-xl text-white hover:bg-white/30 transition-all duration-200 flex items-center font-medium shadow-lg"
                      >
                        <Edit size={18}  />
                      </button>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-white/90 leading-relaxed">
                        {settingsData?.barber?.bio || 'Professional barber providing quality services to clients.'}
                      </p>
                    </div>
                    
                    {/* Profile Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                        <div className="text-xl font-bold">
                          {settingsData?.barber?.rating ? settingsData.barber.rating.toFixed(1) : '0.0'}
                        </div>
                        <div className="text-xs text-white/75">Rating</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                        <div className="text-xl font-bold">
                          {settingsData?.barber?.totalReviews || 0}
                        </div>
                        <div className="text-xs text-white/75">Reviews</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
                        <div className="text-xl font-bold">
                          {settingsData?.barber?.specialties?.length || 0}
                        </div>
                        <div className="text-xs text-white/75">Specialties</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Current Shop Info (if barber works at a shop) */}
                {settingsData?.barber?.shop && (
                  <MenuSection title="Current Workplace">
                    <div className="p-4">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Store size={20} className="text-green-600 mr-3" />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{settingsData.barber.shop.name}</h4>
                          <p className="text-sm text-gray-600">{settingsData.barber.shop.address}</p>
                        </div>
                      </div>
                    </div>
                  </MenuSection>
                )}
                
                {/* Profile Settings Menu */}
                <MenuSection title="Profile Settings">
                  {profileMenuItems.map((item, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${item.color}`}>
                          <item.icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </MenuSection>
                
                {/* General Settings */}
                <MenuSection title="General">
                  {generalMenuItems.map((item, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${item.color}`}>
                          <item.icon size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-600">{item.subtitle}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </MenuSection>
              </div>
            )}
          </>
        )}
        
        {/* Modals - only include essential ones for now */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Edit Shop Information</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Profile Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Profile Picture
                  </label>
                  <ImageUpload
                    currentImage={editFormData.profileImage}
                    onImageChange={(imageUrl) => setEditFormData(prev => ({ ...prev, profileImage: imageUrl }))}
                    placeholder="Upload shop profile image"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter shop name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter shop address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="shop@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder="Describe your barbershop..."
                  />
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t flex space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveShop}
                  disabled={isSaving || !editFormData.name || !editFormData.address}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Edit Modal */}
        {showProfileEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Edit Profile</h3>
                  <button
                    onClick={() => setShowProfileEditModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Profile Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <ImageUpload
                    currentImage={profileEditData.profileImage}
                    onImageChange={(imageUrl) => setProfileEditData(prev => ({ ...prev, profileImage: imageUrl }))}
                    placeholder="Upload profile image"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={profileEditData.fullName}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileEditData.email}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileEditData.phoneNumber}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Rate (₦)
                  </label>
                  <input
                    type="number"
                    value={profileEditData.hourlyRate}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="5000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={profileEditData.experience}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g. 5 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialties
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Haircut', 'Beard Trim', 'Fade', 'Line Up', 'Afro Cut', 'Traditional Cut', 'Hot Towel', 'Hair Styling'].map((specialty) => (
                      <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={profileEditData.specialties.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setProfileEditData(prev => ({
                                ...prev,
                                specialties: [...prev.specialties, specialty]
                              }));
                            } else {
                              setProfileEditData(prev => ({
                                ...prev,
                                specialties: prev.specialties.filter(s => s !== specialty)
                              }));
                            }
                          }}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profileEditData.bio}
                    onChange={(e) => setProfileEditData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={4}
                    placeholder="Tell customers about yourself and your experience..."
                  />
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t flex space-x-3">
                <button
                  onClick={() => setShowProfileEditModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || !profileEditData.fullName}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Business Hours Edit Modal */}
        {showHoursModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">Edit Business Hours</h3>
                  <button
                    onClick={() => setShowHoursModal(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(editHoursData).map(([day, hours]) => (
                  <div key={day} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 capitalize">{day}</h4>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => {
                            setEditHoursData(prev => ({
                              ...prev,
                              [day]: {
                                ...prev[day],
                                closed: !e.target.checked
                              }
                            }));
                          }}
                          className="rounded text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-600">Open</span>
                      </label>
                    </div>
                    
                    {!hours.closed && (
                      <div className="grid grid-cols-2 gap-3 ml-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Opening Time
                          </label>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => {
                              setEditHoursData(prev => ({
                                ...prev,
                                [day]: {
                                  ...prev[day],
                                  open: e.target.value
                                }
                              }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Closing Time
                          </label>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => {
                              setEditHoursData(prev => ({
                                ...prev,
                                [day]: {
                                  ...prev[day],
                                  close: e.target.value
                                }
                              }));
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 border-t flex space-x-3">
                <button
                  onClick={() => setShowHoursModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  disabled={isSavingHours}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHours}
                  disabled={isSavingHours}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSavingHours ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" size={16} />
                      Save Hours
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BarberSettings;
