import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';
import { prisma } from '../app';

/**
 * Paystack API client for payment processing
 */
export class PaystackService {
  private readonly baseUrl: string;
  private readonly secretKey: string;
  private readonly publicKey: string;

  constructor() {
    this.baseUrl = config.payment.baseUrl;
    this.secretKey = config.payment.secretKey;
    this.publicKey = config.payment.publicKey;
  }

  /**
   * Initialize a payment transaction
   * @param amount Amount in kobo (Naira * 100)
   * @param email Customer email
   * @param reference Optional reference, will be generated if not provided
   * @param metadata Additional data to store with transaction
   * @returns Transaction initialization response
   */
  async initializeTransaction(
    amount: number,
    email: string,
    reference?: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          amount,
          email,
          reference: reference || this.generateReference(),
          metadata,
          callback_url: `${config.frontendUrl}/payment/callback`,
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack transaction initialization error:', error);
      throw error;
    }
  }

  /**
   * Verify a payment transaction
   * @param reference Transaction reference
   * @returns Transaction verification response
   */
  async verifyTransaction(reference: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack transaction verification error:', error);
      throw error;
    }
  }

  /**
   * List banks available for transfers
   * @returns List of banks
   */
  async listBanks() {
    try {
      const response = await axios.get(`${this.baseUrl}/bank`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Paystack list banks error:', error);
      throw error;
    }
  }

  /**
   * Create a transfer recipient for bank transfers
   * @param name Recipient name
   * @param accountNumber Bank account number
   * @param bankCode Bank code
   * @returns Transfer recipient creation response
   */
  async createTransferRecipient(
    name: string,
    accountNumber: string,
    bankCode: string
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transferrecipient`,
        {
          type: 'nuban',
          name,
          account_number: accountNumber,
          bank_code: bankCode,
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack create transfer recipient error:', error);
      throw error;
    }
  }

  /**
   * Initiate a transfer to a recipient
   * @param amount Amount in kobo (Naira * 100)
   * @param recipientCode Recipient code
   * @param reason Transfer reason
   * @param reference Optional reference, will be generated if not provided
   * @returns Transfer initiation response
   */
  async initiateTransfer(
    amount: number,
    recipientCode: string,
    reason: string,
    reference?: string
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transfer`,
        {
          source: 'balance',
          amount,
          recipient: recipientCode,
          reason,
          reference: reference || this.generateReference(),
        },
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack initiate transfer error:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   * @param signature Signature from request header
   * @param payload Request body as string
   * @returns Whether signature is valid
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha512', this.secretKey)
        .update(payload)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Generate a unique reference
   * @returns Unique reference string
   */
  generateReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `BZ-${timestamp}-${random}`;
  }

  /**
   * Record a transaction in the database
   * @param userId User ID
   * @param type Transaction type
   * @param amount Amount in Naira
   * @param reference Transaction reference
   * @param status Transaction status
   * @param paymentMethod Payment method
   * @param description Transaction description
   * @returns Created transaction
   */
  async recordTransaction(
    userId: string,
    type: 'deposit' | 'withdrawal' | 'payment' | 'refund',
    amount: number,
    reference: string,
    status: 'pending' | 'successful' | 'failed',
    paymentMethod?: string,
    description?: string
  ) {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type,
          amount,
          reference,
          status,
          paymentMethod,
          description,
        },
      });

      return transaction;
    } catch (error) {
      console.error('Error recording transaction:', error);
      throw error;
    }
  }

  /**
   * Update wallet balance
   * @param customerId Customer ID
   * @param amount Amount to add (positive) or subtract (negative)
   * @returns Updated wallet
   */
  async updateWalletBalance(customerId: string, amount: number) {
    try {
      // Get current wallet
      const wallet = await prisma.wallet.findUnique({
        where: { customerId },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for customer ${customerId}`);
      }

      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { customerId },
        data: {
          balance: wallet.balance + amount,
        },
      });

      return updatedWallet;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const paystackService = new PaystackService();
