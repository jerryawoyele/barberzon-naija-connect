import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, MapPin, Phone, Mail, User, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { customerService, CustomerProfile, ProfileUpdateData } from '@/services';
import { useToast } from '@/hooks/use-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CustomerProfile;
  onUpdate: (updatedProfile: CustomerProfile) => void;
}

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'your-upload-preset';

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdate
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ProfileUpdateData>({
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || profile.phoneNumber || '',
    profileImage: profile.profileImage || '',
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [location, setLocation] = useState({
    state: '',
    country: '',
    lat: profile.locationLat,
    lng: profile.locationLng
  });

  useEffect(() => {
    if (profile.locationLat && profile.locationLng) {
      // Reverse geocode to get readable location
      reverseGeocode(profile.locationLat, profile.locationLng);
    }
  }, [profile.locationLat, profile.locationLng]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using a simple reverse geocoding service (you can replace with your preferred service)
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await response.json();
      
      setLocation({
        state: data.principalSubdivision || data.locality || '',
        country: data.countryName || '',
        lat,
        lng
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setLocation({
        state: 'Unknown',
        country: 'Nigeria', // Default to Nigeria
        lat,
        lng
      });
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
    formData.append('folder', 'barberzon/avatars');

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUploading(true);
      const imageUrl = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, profileImage: imageUrl }));
      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully!'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation.',
        variant: 'destructive'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({ 
          ...prev, 
          locationLat: latitude, 
          locationLng: longitude 
        }));
        await reverseGeocode(latitude, longitude);
        toast({
          title: 'Location updated',
          description: 'Your current location has been set.'
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: 'Location error',
          description: 'Unable to get your current location.',
          variant: 'destructive'
        });
      }
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate required fields
      if (!formData.fullName?.trim()) {
        toast({
          title: 'Validation error',
          description: 'Full name is required.',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.email?.trim()) {
        toast({
          title: 'Validation error',
          description: 'Email is required.',
          variant: 'destructive'
        });
        return;
      }

      const updateData: ProfileUpdateData = {
        ...formData,
        locationLat: location.lat,
        locationLng: location.lng
      };

      const response = await customerService.updateProfile(updateData);
      
      if (response.status === 'success') {
        // Update the profile with new data
        const updatedProfile: CustomerProfile = {
          ...profile,
          ...response.data
        };
        
        onUpdate(updatedProfile);
        toast({
          title: 'Success',
          description: 'Profile updated successfully!'
        });
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={formData.profileImage} 
                  alt={formData.fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-green-400 to-blue-500 text-white text-xl font-bold">
                  {formData.fullName ? getInitials(formData.fullName) : <User size={32} />}
                </AvatarFallback>
              </Avatar>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            
            <p className="text-sm text-gray-600 text-center">
              Click the camera icon to change your profile picture
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 mb-2 block">
                Full Name *
              </Label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
                Email Address *
              </Label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                Phone Number
              </Label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="pl-10"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Location
              </Label>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>
                    {location.state && location.country 
                      ? `${location.state}, ${location.country}`
                      : 'Location not set'
                    }
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetCurrentLocation}
                  className="w-full"
                >
                  <MapPin size={16} className="mr-2" />
                  Use Current Location
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
