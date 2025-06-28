import { apiClient } from './api';

/**
 * Payment service for handling payment-related operations
 */
const paymentService = {
  /**
   * Get wallet balance
   * @returns Wallet balance response
   */
  getWalletBalance: async () => {
    try {
      const response = await apiClient.get('/payments/wallet/balance');
      return response.data;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      throw error;
    }
  },

  /**
   * Fund wallet
   * @param amount Amount to fund
   * @param paymentMethod Payment method
   * @returns Payment initialization response
   */
  fundWallet: async (amount: number, paymentMethod: string = 'card') => {
    try {
      const response = await apiClient.post('/payments/wallet/fund', {
        amount,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error funding wallet:', error);
      throw error;
    }
  },

  /**
   * Pay for booking
   * @param bookingId Booking ID
   * @param paymentMethod Payment method
   * @returns Payment response
   */
  payForBooking: async (bookingId: string, paymentMethod: string = 'wallet') => {
    try {
      const response = await apiClient.post('/payments/booking/pay', {
        bookingId,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error('Error paying for booking:', error);
      throw error;
    }
  },

  /**
   * Get transaction history
   * @param params Query parameters
   * @returns Transaction history response
   */
  getTransactionHistory: async (params: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    try {
      const response = await apiClient.get('/payments/transactions', {
        params
      });
      return response.data;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  },

  /**
   * Verify payment
   * @param reference Payment reference
   * @returns Payment verification response
   */
  verifyPayment: async (reference: string) => {
    try {
      const response = await apiClient.get(`/payments/verify/${reference}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },

  /**
   * Handle Paystack callback
   * @param reference Payment reference
   * @returns Promise that resolves when payment is verified
   */
  handlePaystackCallback: async (reference: string) => {
    try {
      // Verify payment
      const verificationResponse = await paymentService.verifyPayment(reference);
      
      // If payment was for wallet funding, update wallet balance
      if (verificationResponse.data.transaction.type === 'deposit') {
        // Refresh wallet balance
        await paymentService.getWalletBalance();
      }
      
      return verificationResponse;
    } catch (error) {
      console.error('Error handling Paystack callback:', error);
      throw error;
    }
  }
};

export default paymentService;
