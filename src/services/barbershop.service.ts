import apiClient from './api';

export interface Shop {
  id: string;
  name: string;
  description?: string;
  address: string;
  owner: string;
  ownerId: string;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  distance?: string;
  images: string[];
  openingHours: any;
}

export interface ShopCreateData {
  name: string;
  description?: string;
  address: string;
  phoneNumber: string;
  email?: string;
  totalSeats: number;
  locationLat?: number;
  locationLng?: number;
}

export interface JoinRequest {
  id: string;
  barberId: string;
  shopId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  seatNumber?: number;
  createdAt: string;
  updatedAt: string;
  barber?: {
    id: string;
    fullName: string;
    profileImage?: string;
    specialties: string[];
    rating: number;
    totalReviews: number;
    phoneNumber: string;
    email?: string;
  };
  shop?: {
    id: string;
    name: string;
    address: string;
    totalSeats: number;
    owner?: {
      fullName: string;
      profileImage?: string;
    };
  };
}

export interface BarberWithSeat {
  id: string;
  name: string;
  profileImage?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentCustomer?: string;
  estimatedFinishTime?: string;
  seatNumber: number;
}

/**
 * Service for handling barbershop-related API calls
 */
class BarbershopService {
  /**
   * Search available barbershops
   */
  async searchShops(query?: string, latitude?: number, longitude?: number, radius?: number) {
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (latitude) params.append('latitude', latitude.toString());
      if (longitude) params.append('longitude', longitude.toString());
      if (radius) params.append('radius', radius.toString());

      const response = await apiClient.get<{
        status: string;
        data: Shop[];
      }>(`/barber-requests/shops/search?${params.toString()}`);
      
      return response.data;
    } catch (error) {
      console.error('Error searching shops:', error);
      throw error;
    }
  }

  /**
   * Create a new barbershop
   */
  async createShop(shopData: ShopCreateData) {
    try {
      const response = await apiClient.post<{
        status: string;
        message: string;
        data: any;
      }>('/barber-requests/shops', shopData);
      
      return response.data;
    } catch (error) {
      console.error('Error creating shop:', error);
      throw error;
    }
  }

  /**
   * Submit join request to a barbershop
   */
  async submitJoinRequest(shopId: string, message?: string, seatNumber?: number) {
    try {
      const response = await apiClient.post<{
        status: string;
        message: string;
        data: JoinRequest;
      }>('/barber-requests/submit', {
        shopId,
        message,
        seatNumber
      });
      
      return response.data;
    } catch (error) {
      console.error('Error submitting join request:', error);
      throw error;
    }
  }

  /**
   * Get incoming join requests (for shop owners)
   */
  async getIncomingJoinRequests(status?: string) {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await apiClient.get<{
        status: string;
        data: JoinRequest[];
      }>(`/barber-requests/incoming${params}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching incoming join requests:', error);
      throw error;
    }
  }

  /**
   * Respond to join request (approve/reject)
   */
  async respondToJoinRequest(requestId: string, action: 'approve' | 'reject', seatNumber?: number) {
    try {
      const response = await apiClient.put<{
        status: string;
        message: string;
        data: JoinRequest;
      }>(`/barber-requests/${requestId}/respond`, {
        action,
        seatNumber
      });
      
      return response.data;
    } catch (error) {
      console.error('Error responding to join request:', error);
      throw error;
    }
  }

  /**
   * Get barber's own join request status
   */
  async getMyJoinRequests() {
    try {
      const response = await apiClient.get<{
        status: string;
        data: JoinRequest[];
      }>('/barber-requests/my-requests');
      
      return response.data;
    } catch (error) {
      console.error('Error fetching my join requests:', error);
      throw error;
    }
  }

  /**
   * Get shop details with live barber status
   */
  async getShopWithLiveStatus(shopId: string) {
    try {
      // This would typically call a shop details endpoint
      // For now, we'll return mock data based on shop ID
      const mockBarbers: BarberWithSeat[] = [
        {
          id: '1',
          name: 'Emeka Johnson',
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
          status: 'available',
          seatNumber: 1
        },
        {
          id: '2',
          name: 'Ahmed Hassan',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
          status: 'busy',
          currentCustomer: 'John Doe',
          estimatedFinishTime: '15 mins',
          seatNumber: 2
        },
        {
          id: '3',
          name: 'Grace Adebayo',
          status: 'break',
          seatNumber: 3
        },
        {
          id: '4',
          name: 'Tunde Okafor',
          status: 'available',
          seatNumber: 4
        }
      ];

      return {
        status: 'success',
        data: {
          shopId,
          shopName: 'Kings Cut Barber Shop',
          totalSeats: 6,
          barbers: mockBarbers
        }
      };
    } catch (error) {
      console.error('Error fetching shop live status:', error);
      throw error;
    }
  }

  /**
   * Complete barber onboarding with shop selection
   */
  async completeBarberOnboarding(onboardingData: {
    barberType: 'solo' | 'shop';
    isSolo: boolean;
    specialties: string[];
    hourlyRate: number;
    experience?: string;
    requestedShopId?: string;
    joinMessage?: string;
    newShop?: ShopCreateData;
  }) {
    try {
      if (onboardingData.barberType === 'solo') {
        // Update barber profile for solo barber
        const response = await apiClient.put('/barbers/profile', {
          specialties: onboardingData.specialties,
          hourlyRate: onboardingData.hourlyRate,
          isSolo: true,
          completedOnboarding: true
        });
        return response.data;
      } else {
        // Handle shop barber onboarding
        if (onboardingData.newShop) {
          // Create new shop
          const shopResponse = await this.createShop(onboardingData.newShop);
          
          // Update barber profile
          const barberResponse = await apiClient.put('/barbers/profile', {
            specialties: onboardingData.specialties,
            hourlyRate: onboardingData.hourlyRate,
            isSolo: false,
            completedOnboarding: true
          });
          
          return {
            status: 'success',
            message: 'Barbershop created and profile updated',
            data: {
              shop: shopResponse.data,
              barber: barberResponse.data
            }
          };
        } else if (onboardingData.requestedShopId) {
          // Submit join request
          const joinResponse = await this.submitJoinRequest(
            onboardingData.requestedShopId,
            onboardingData.joinMessage
          );
          
          // Update barber profile
          const barberResponse = await apiClient.put('/barbers/profile', {
            specialties: onboardingData.specialties,
            hourlyRate: onboardingData.hourlyRate,
            isSolo: false,
            completedOnboarding: true
          });
          
          return {
            status: 'success',
            message: 'Join request submitted and profile updated',
            data: {
              joinRequest: joinResponse.data,
              barber: barberResponse.data
            }
          };
        }
      }
    } catch (error) {
      console.error('Error completing barber onboarding:', error);
      throw error;
    }
  }
}

export const barbershopService = new BarbershopService();
export default barbershopService;
