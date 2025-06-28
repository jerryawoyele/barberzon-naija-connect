import apiClient from './api';

export interface BarberProfile {
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
    totalSeats: number;
    rating: number;
  };
}

export interface DashboardData {
  barber: BarberProfile;
  earnings: {
    weekly: number;
    monthly: number;
    currency: string;
  };
  bookings: {
    total: number;
    today: number;
    upcoming: number;
    upcomingList: any[];
  };
  shop?: {
    id: string;
    name: string;
    address: string;
    totalSeats: number;
    rating: number;
    isOwner: boolean;
  };
  isShopOwner: boolean;
  hasShop: boolean;
}

export interface StatusUpdateResponse {
  status: string;
  message: string;
  data: {
    status: string;
    isAvailable: boolean;
  };
}

/**
 * Service for handling barber-related API calls
 */
class BarberService {
  /**
   * Get barber profile
   */
  async getProfile() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: BarberProfile;
      }>('/barbers/profile');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching barber profile:', error);
      throw error;
    }
  }

  /**
   * Get any barber's profile by ID (public endpoint)
   */
  async getBarberProfile(barberId: string) {
    try {
      const response = await apiClient.get<{
        status: string;
        data: BarberProfile;
      }>(`/public/barbers/${barberId}/profile`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching barber profile:', error);
      throw error;
    }
  }

  /**
   * Update barber profile
   */
  async updateProfile(profileData: Partial<BarberProfile>) {
    try {
      const response = await apiClient.put<{
        status: string;
        message: string;
        data: BarberProfile;
      }>('/barbers/profile', profileData);
      
      return response.data;
    } catch (error) {
      console.error('Error updating barber profile:', error);
      throw error;
    }
  }

  /**
   * Update barber status
   */
  async updateStatus(status: 'available' | 'busy' | 'break' | 'offline') {
    try {
      console.log(`🔄 BarberService: Updating status to ${status}`);
      
      const response = await apiClient.patch<StatusUpdateResponse>('/barbers/status', {
        status
      });
      
      console.log('✅ BarberService: Status updated successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarberService: Error updating status:', error);
      throw error;
    }
  }

  /**
   * Get dashboard data (unified endpoint)
   */
  async getDashboardData() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: DashboardData;
      }>('/barbers/dashboard');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get barber appointments
   */
  async getAppointments(status?: string, date?: string) {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (date) params.append('date', date);

      const response = await apiClient.get<{
        status: string;
        data: any[];
      }>(`/barbers/appointments?${params.toString()}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching barber appointments:', error);
      throw error;
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(bookingId: string, status: string, notes?: string) {
    try {
      const response = await apiClient.patch<{
        status: string;
        message: string;
        data: any;
      }>(`/barbers/appointments/${bookingId}/status`, {
        status,
        notes
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  /**
   * Get barber earnings
   */
  async getEarnings(period: 'day' | 'week' | 'month' | 'year' = 'week') {
    try {
      const response = await apiClient.get<{
        status: string;
        data: {
          period: string;
          totalEarnings: number;
          bookingsCount: number;
          bookings: any[];
          transactions: any[];
        };
      }>(`/barbers/earnings?period=${period}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching barber earnings:', error);
      throw error;
    }
  }

  /**
   * Get barber customers
   */
  async getCustomers(search?: string, status?: string) {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);

      const response = await apiClient.get<{
        status: string;
        data: any[];
      }>(`/barbers/customers?${params.toString()}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching barber customers:', error);
      throw error;
    }
  }

  /**
   * Get barber transactions
   */
  async getTransactions(period: string = 'month', type?: string) {
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      if (type) params.append('type', type);

      const response = await apiClient.get<{
        status: string;
        data: {
          summary: {
            grossEarnings: number;
            platformFees: number;
            netEarnings: number;
            totalTransactions: number;
            period: string;
          };
          transactions: any[];
        };
      }>(`/barbers/transactions?${params.toString()}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching barber transactions:', error);
      throw error;
    }
  }

  /**
   * Get barber settings
   */
  async getSettings() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: {
          barber: any;
          shop: any;
        };
      }>('/barbers/settings');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching barber settings:', error);
      throw error;
    }
  }

  /**
   * Update shop information
   */
  async updateShop(shopData: {
    name?: string;
    description?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    openingHours?: any;
    images?: string[];
  }) {
    try {
      console.log('🏪 BarberService: Updating shop data:', shopData);
      
      const response = await apiClient.put<{
        status: string;
        message: string;
        data: any;
      }>('/barbers/shop', shopData);
      
      console.log('✅ BarberService: Shop updated successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarberService: Error updating shop:', error);
      throw error;
    }
  }

  /**
   * Get payout account
   */
  async getPayoutAccount() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: any;
      }>('/barbers/payout-account');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching payout account:', error);
      throw error;
    }
  }

  /**
   * Create or update payout account
   */
  async upsertPayoutAccount(payoutData: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
  }) {
    try {
      console.log('💳 BarberService: Updating payout account:', payoutData);
      
      const response = await apiClient.put<{
        status: string;
        message: string;
        data: any;
      }>('/barbers/payout-account', payoutData);
      
      console.log('✅ BarberService: Payout account updated successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarberService: Error updating payout account:', error);
      throw error;
    }
  }

  /**
   * Get upcoming payouts
   */
  async getUpcomingPayouts() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: any[];
      }>('/barbers/upcoming-payouts');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming payouts:', error);
      throw error;
    }
  }

  /**
   * Update business hours
   */
  async updateBusinessHours(openingHours: any) {
    try {
      console.log('🕐 BarberService: Updating business hours:', openingHours);
      
      const response = await apiClient.put<{
        status: string;
        message: string;
        data: any;
      }>('/barbers/business-hours', { openingHours });
      
      console.log('✅ BarberService: Business hours updated successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ BarberService: Error updating business hours:', error);
      throw error;
    }
  }
}

export const barberService = new BarberService();
export default barberService;
