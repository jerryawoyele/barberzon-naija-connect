import apiClient from './api';

export interface Shop {
  id: string;
  name: string;
  description: string;
  address: string;
  locationLat: number;
  locationLng: number;
  openingHours: string;
  closingHours: string;
  phoneNumber: string;
  email: string;
  website?: string;
  images: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShopWithBarbers extends Shop {
  barbers: Barber[];
  services: Service[];
  distance?: number;
}

export interface Barber {
  id: string;
  fullName: string;
  profileImage?: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  isAvailable: boolean;
  hourlyRate?: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export interface ShopSearchParams {
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

/**
 * Service for handling shop-related API calls
 */
class ShopService {
  /**
   * Get all shops with optional filtering
   */
  async getAllShops(params?: ShopSearchParams) {
    try {
      const response = await apiClient.get<{ status: string; data: ShopWithBarbers[] }>('/shops', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching shops:', error);
      throw error;
    }
  }

  /**
   * Get shop details by ID
   */
  async getShopDetails(shopId: string) {
    try {
      const response = await apiClient.get<{ status: string; data: ShopWithBarbers }>(
        `/shops/${shopId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching shop details for ${shopId}:`, error);
      throw error;
    }
  }

  /**
   * Get shop services
   */
  async getShopServices(shopId: string) {
    try {
      const response = await apiClient.get<{ status: string; data: Service[] }>(
        `/shops/${shopId}/services`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching services for shop ${shopId}:`, error);
      throw error;
    }
  }

  /**
   * Get shop barbers
   */
  async getShopBarbers(shopId: string) {
    try {
      const response = await apiClient.get<{ status: string; data: Barber[] }>(
        `/shops/${shopId}/barbers`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching barbers for shop ${shopId}:`, error);
      throw error;
    }
  }

  /**
   * Get nearby shops based on user location
   */
  async getNearbyShops(lat: number, lng: number, radius: number = 10) {
    return this.getAllShops({ lat, lng, radius });
  }

  /**
   * Search shops by name
   */
  async searchShops(query: string) {
    return this.getAllShops({ search: query });
  }
}

export const shopService = new ShopService();
export default shopService;
