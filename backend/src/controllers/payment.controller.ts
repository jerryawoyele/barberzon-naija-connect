import { Request, Response } from 'express';
import { prisma } from '../app';
import { sendPaymentNotification } from '../utils/notification.utils';
import { paystackService } from '../utils/payment.utils';

/**
 * Get wallet balance
 */
export const getWalletBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (userRole === 'customer') {
      const wallet = await prisma.wallet.findUnique({
        where: { customerId: userId }
      });

      if (!wallet) {
        return res.status(404).json({
          status: 'error',
          message: 'Wallet not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: wallet
      });
    } else {
      // For barbers, we calculate their earnings
      const completedBookings = await prisma.booking.findMany({
        where: {
          barberId: userId,
          status: 'completed',
          paymentStatus: 'paid'
        },
        select: {
          totalAmount: true
        }
      });

      const totalEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

      return res.status(200).json({
        status: 'success',
        data: {
          totalEarnings,
          currency: 'NGN'
        }
      });
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch wallet balance'
    });
  }
};

/**
 * Fund wallet
 */
export const fundWallet = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const { amount, paymentMethod } = req.body;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.user?.role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only customers can fund their wallet'
      });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid amount'
      });
    }

    // Check if wallet exists
    const wallet = await prisma.wallet.findUnique({
      where: { customerId }
    });

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }

    // Generate a unique reference
    const reference = `FUND-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: customerId,
        type: 'deposit',
        amount: parsedAmount,
        reference,
        status: 'pending',
        paymentMethod: paymentMethod || 'card',
        description: 'Wallet funding'
      }
    });

    // Get customer details for payment
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true, fullName: true }
    });

    if (!customer || !customer.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Customer email is required for payment'
      });
    }

    // Initialize payment with Paystack
    const paymentResponse = await paystackService.initializeTransaction(
      parsedAmount * 100, // Convert to kobo (Naira * 100)
      customer.email,
      reference,
      {
        customerId,
        transactionId: transaction.id,
        type: 'wallet_funding'
      }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Payment initialized',
      data: {
        authorization_url: paymentResponse.data.authorization_url,
        access_code: paymentResponse.data.access_code,
        reference: paymentResponse.data.reference,
        transaction
      }
    });

    // The rest of the function is handled by the webhook
  } catch (error) {
    console.error('Error funding wallet:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fund wallet'
    });
  }
};

/**
 * Pay for booking
 */
export const payForBooking = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const { bookingId, paymentMethod } = req.body;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (req.user?.role !== 'customer') {
      return res.status(403).json({
        status: 'error',
        message: 'Only customers can pay for bookings'
      });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        barber: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to this customer
    if (booking.customerId !== customerId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to pay for this booking'
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        status: 'error',
        message: 'Booking is already paid'
      });
    }

    // Get customer wallet
    const wallet = await prisma.wallet.findUnique({
      where: { customerId }
    });

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }

    // Check if wallet has enough balance
    if (wallet.balance < booking.totalAmount) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient wallet balance'
      });
    }

    // Generate a unique reference
    const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId: customerId,
        type: 'payment',
        amount: booking.totalAmount,
        reference,
        status: 'pending',
        paymentMethod: paymentMethod || 'wallet',
        description: `Payment for booking #${bookingId}`
      }
    });

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { customerId },
      data: {
        balance: wallet.balance - booking.totalAmount
      }
    });

    // Update booking payment status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'paid'
      }
    });

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: 'successful'
      }
    });

    // Send notification to customer and barber about payment
    await sendPaymentNotification(updatedTransaction.id, customerId);
    await sendPaymentNotification(updatedTransaction.id, booking.barberId);

    return res.status(200).json({
      status: 'success',
      message: 'Payment successful',
      data: {
        booking: updatedBooking,
        transaction: updatedTransaction,
        wallet: updatedWallet
      }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process payment'
    });
  }
};

/**
 * Verify payment
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment reference is required'
      });
    }

    // Verify payment with Paystack
    const verificationResponse = await paystackService.verifyTransaction(reference);

    if (verificationResponse.status !== 'success' || verificationResponse.data.status !== 'success') {
      return res.status(400).json({
        status: 'error',
        message: 'Payment verification failed',
        data: verificationResponse
      });
    }

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { reference }
    });

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
    }

    // If transaction is already successful, return success
    if (transaction.status === 'successful') {
      return res.status(200).json({
        status: 'success',
        message: 'Payment already verified',
        data: { transaction }
      });
    }

    // Update transaction status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'successful' }
    });

    // If it's a wallet funding transaction, update wallet balance
    if (transaction.type === 'deposit') {
      const wallet = await prisma.wallet.findUnique({
        where: { customerId: transaction.userId }
      });

      if (wallet) {
        await prisma.wallet.update({
          where: { customerId: transaction.userId },
          data: { balance: wallet.balance + transaction.amount }
        });
      }
    }

    // Send notification
    await sendPaymentNotification(transaction.id, transaction.userId);

    return res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify payment'
    });
  }
};

/**
 * Handle Paystack webhook
 */
export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    
    // Verify webhook signature
    if (!signature || !paystackService.verifyWebhookSignature(signature, JSON.stringify(req.body))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid signature'
      });
    }

    const event = req.body;

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
      
      case 'transfer.success':
        await handleSuccessfulTransfer(event.data);
        break;
      
      case 'transfer.failed':
        await handleFailedTransfer(event.data);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    // Acknowledge receipt of webhook
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling Paystack webhook:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process webhook'
    });
  }
};

/**
 * Paystack webhook data interface
 */
interface PaystackWebhookData {
  reference: string;
  amount: number;
  metadata?: {
    customerId?: string;
    transactionId?: string;
    bookingId?: string;
    type?: string;
  };
  status: string;
  gateway_response: string;
}

/**
 * Handle successful payment
 */
const handleSuccessfulPayment = async (data: PaystackWebhookData) => {
  try {
    const { reference, amount, metadata } = data;

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { reference }
    });

    if (!transaction) {
      console.error(`Transaction not found for reference: ${reference}`);
      return;
    }

    // If transaction is already successful, skip processing
    if (transaction.status === 'successful') {
      return;
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'successful' }
    });

    // If it's a wallet funding transaction, update wallet balance
    if (transaction.type === 'deposit') {
      const wallet = await prisma.wallet.findUnique({
        where: { customerId: transaction.userId }
      });

      if (wallet) {
        await prisma.wallet.update({
          where: { customerId: transaction.userId },
          data: { balance: wallet.balance + transaction.amount }
        });
      }
    }

    // If it's a booking payment, update booking status
    if (transaction.type === 'payment' && metadata?.bookingId) {
      await prisma.booking.update({
        where: { id: metadata.bookingId },
        data: { paymentStatus: 'paid' }
      });
    }

    // Send notification
    await sendPaymentNotification(transaction.id, transaction.userId);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

/**
 * Handle successful transfer
 */
const handleSuccessfulTransfer = async (data: PaystackWebhookData) => {
  try {
    const { reference } = data;

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { reference }
    });

    if (!transaction) {
      console.error(`Transaction not found for reference: ${reference}`);
      return;
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'successful' }
    });

    // Send notification
    await sendPaymentNotification(transaction.id, transaction.userId);
  } catch (error) {
    console.error('Error handling successful transfer:', error);
  }
};

/**
 * Handle failed transfer
 */
const handleFailedTransfer = async (data: PaystackWebhookData) => {
  try {
    const { reference } = data;

    // Find the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { reference }
    });

    if (!transaction) {
      console.error(`Transaction not found for reference: ${reference}`);
      return;
    }

    // Update transaction status
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'failed' }
    });

    // Send notification
    await sendPaymentNotification(transaction.id, transaction.userId);
  } catch (error) {
    console.error('Error handling failed transfer:', error);
  }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, status, limit = '10', page = '1' } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Build filter based on query parameters
    const filter: {
      userId: string;
      type?: string;
      status?: string;
    } = {
      userId
    };

    if (type) {
      filter.type = type as string;
    }

    if (status) {
      filter.status = status as string;
    }

    // Parse pagination parameters
    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limitNum
    });

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: filter
    });

    return res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transaction history'
    });
  }
};
