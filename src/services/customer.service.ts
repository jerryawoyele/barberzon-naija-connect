import apiClient from './api';

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone?: string; // Frontend uses 'phone' but backend uses 'phoneNumber'
  phoneNumber?: string; // Backend field name
  profileImage?: string;
  locationLat?: number;
  locationLng?: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile extends Customer {
  wallet?: {
    id: string;
    balance: number;
    currency: string;
  };
  bookings?: Booking[];
  favoriteShops?: Shop[];
}

export interface Booking {
  id: string;
  customerId: string;
  barberId: string;
  shopId: string;
  serviceType: string;
  totalAmount: number;
  bookingDate: string;
  status: string;
  paymentStatus: string;
  barber?: {
    id: string;
    fullName: string;
    profileImage?: string;
  };
  shop?: {
    id: string;
    name: string;
    address: string;
  };
}

export interface Shop {
  id: string;
  name: string;
  address: string;
  rating: number;
  image?: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
  locationLat?: number;
  locationLng?: number;
}

/**
 * Service for handling customer-related API calls
 */
class CustomerService {
  /**
   * Get customer profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: CustomerProfile;
      }>('/customers/profile');
      
      // Map phoneNumber to phone for frontend consistency
      if (response.data.data.phoneNumber) {
        response.data.data.phone = response.data.data.phoneNumber;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      throw error;
    }
  }

  /**
   * Update customer profile
   */
  async updateProfile(data: ProfileUpdateData) {
    try {
      const response = await apiClient.put<{
        status: string;
        message: string;
        data: Customer;
      }>('/customers/profile', data);
      
      // Map phoneNumber to phone for frontend consistency
      if (response.data.data.phoneNumber) {
        response.data.data.phone = response.data.data.phoneNumber;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating customer profile:', error);
      throw error;
    }
  }

  /**
   * Get customer bookings
   */
  async getBookings(status?: string) {
    try {
      const response = await apiClient.get<{
        status: string;
        data: Booking[];
      }>('/customers/bookings', {
        params: status ? { status } : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      throw error;
    }
  }

  /**
   * Add shop to favorites
   */
  async addFavoriteShop(shopId: string) {
    try {
      const response = await apiClient.post<{
        status: string;
        message: string;
      }>('/customers/favorites', { shopId });
      return response.data;
    } catch (error) {
      console.error('Error adding shop to favorites:', error);
      throw error;
    }
  }

  /**
   * Remove shop from favorites
   */
  async removeFavoriteShop(shopId: string) {
    try {
      const response = await apiClient.delete<{
        status: string;
        message: string;
      }>(`/customers/favorites/${shopId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing shop from favorites:', error);
      throw error;
    }
  }

  /**
   * Get customer wallet
   */
  async getWallet() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: {
          wallet: {
            id: string;
            customerId: string;
            balance: number;
            currency: string;
            createdAt: string;
            updatedAt: string;
          };
          transactions: Array<{
            id: string;
            userId: string;
            type: string;
            amount: number;
            reference: string;
            status: string;
            paymentMethod?: string;
            description?: string;
            createdAt: string;
          }>;
        };
      }>('/customers/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching customer wallet:', error);
      throw error;
    }
  }

  /**
   * Calculate profile completion percentage
   */
  calculateProfileCompletion(profile: CustomerProfile): number {
    const fields = [
      profile.fullName,
      profile.email,
      profile.phone,
      profile.profileImage,
      profile.locationLat,
      profile.locationLng
    ];
    
    const completedFields = fields.filter(field => field !== null && field !== undefined && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  /**
   * Format customer stats for display
   */
  formatCustomerStats(profile: CustomerProfile) {
    const totalBookings = profile.bookings?.length || 0;
    const completedBookings = profile.bookings?.filter(booking => booking.status === 'completed')?.length || 0;
    const totalSpent = profile.bookings?.filter(booking => booking.paymentStatus === 'paid')
      ?.reduce((sum, booking) => sum + booking.totalAmount, 0) || 0;
    const favoriteShopsCount = profile.favoriteShops?.length || 0;
    
    // Calculate average rating from completed bookings (if available)
    const completedBookingsWithRating = profile.bookings?.filter(booking => 
      booking.status === 'completed' && booking.paymentStatus === 'paid'
    );
    const averageRating = completedBookingsWithRating && completedBookingsWithRating.length > 0 
      ? 4.8 // Default good rating - in real app this would come from actual ratings
      : 0;

    // Calculate loyalty points (example: 1 point per ₦100 spent)
    const loyaltyPoints = Math.floor(totalSpent / 100);

    return {
      totalBookings,
      completedBookings,
      totalSpent,
      favoriteShopsCount,
      averageRating,
      loyaltyPoints,
      walletBalance: profile.wallet?.balance || 0
    };
  }
}

export const customerService = new CustomerService();
export default customerService;
