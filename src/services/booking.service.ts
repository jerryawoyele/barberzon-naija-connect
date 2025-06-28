import apiClient from './api';
import { Barber } from './shop.service';

export interface BookingServiceType {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export interface Booking {
  id: string;
  customerId: string;
  barberId: string;
  shopId: string;
  services: BookingServiceType[];
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  totalAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetails extends Booking {
  customer?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    profileImage?: string;
  };
  barber?: {
    id: string;
    fullName: string;
    phoneNumber: string;
    profileImage?: string;
    specialties: string[];
  };
  shop?: {
    id: string;
    name: string;
    address: string;
    phoneNumber: string;
  };
}

export interface CreateBookingData {
  barberId: string;
  shopId: string;
  services: BookingServiceType[];
  bookingDate: string;
  bookingTime: string;
  notes?: string;
}

export interface BookingReviewData {
  rating: number;
  comment?: string;
}

/**
 * Service for handling booking-related API calls
 */
class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingData) {
    try {
      const response = await apiClient.post<{ status: string; message: string; data: BookingWithDetails }>(
        '/bookings',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string) {
    try {
      const response = await apiClient.get<{ status: string; data: BookingWithDetails }>(
        `/bookings/${bookingId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking details for ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Get user bookings (for customer or barber)
   */
  async getUserBookings(status?: string, page: number = 1, limit: number = 10) {
    try {
      const response = await apiClient.get<{ 
        status: string; 
        data: {
          bookings: BookingWithDetails[];
          pagination: {
            currentPage: number;
            totalPages: number;
            totalCount: number;
            limit: number;
          }
        }
      }>(
        '/bookings/user',
        {
          params: { status, page, limit }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason?: string) {
    try {
      const response = await apiClient.patch<{ status: string; message: string; data: BookingWithDetails }>(
        `/bookings/${bookingId}/cancel`,
        { reason }
      );
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Confirm booking (for barbers)
   */
  async confirmBooking(bookingId: string) {
    try {
      const response = await apiClient.patch<{ status: string; message: string; data: BookingWithDetails }>(
        `/bookings/${bookingId}/confirm`
      );
      return response.data;
    } catch (error) {
      console.error(`Error confirming booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Complete booking (for barbers)
   */
  async completeBooking(bookingId: string, notes?: string) {
    try {
      const response = await apiClient.patch<{ status: string; message: string; data: BookingWithDetails }>(
        `/bookings/${bookingId}/complete`,
        { notes }
      );
      return response.data;
    } catch (error) {
      console.error(`Error completing booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Rate and review a booking
   */
  async rateBooking(bookingId: string, data: BookingReviewData) {
    try {
      const response = await apiClient.post<{ status: string; message: string; data: Record<string, unknown> }>(
        `/bookings/${bookingId}/rate`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Error rating booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Pay for a booking
   */
  async payForBooking(bookingId: string, paymentMethod: string = 'wallet') {
    try {
      const response = await apiClient.post<{ status: string; message: string; data: Record<string, unknown> }>(
        '/payments/booking/pay',
        { bookingId, paymentMethod }
      );
      return response.data;
    } catch (error) {
      console.error(`Error paying for booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Format booking date for display
   */
  formatBookingDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format booking time for display
   */
  formatBookingTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export const bookingService = new BookingService();
export default bookingService;
