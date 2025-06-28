import { prisma } from '../app';

/**
 * Send notification to a user
 * @param userId User ID to send notification to
 * @param type Notification type
 * @param title Notification title
 * @param message Notification message
 * @param dataPayload Optional data payload
 * @returns Created notification
 */
export const sendNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  dataPayload?: Record<string, unknown>
) => {
  try {
    // Determine if user is customer or barber
    const customer = await prisma.customer.findUnique({ where: { id: userId } });
    const barber = await prisma.barber.findUnique({ where: { id: userId } });

    if (!customer && !barber) {
      throw new Error(`User not found: ${userId}`);
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        customerId: customer ? userId : null,
        barberId: barber ? userId : null,
        type,
        title,
        message,
        isRead: false,
        dataPayload: dataPayload ? JSON.parse(JSON.stringify(dataPayload)) : {}
      }
    });

    // TODO: Send push notification if user has push tokens
    // This would involve integrating with a push notification service
    // like Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send booking notification
 * @param bookingId Booking ID
 * @param recipientId User ID to send notification to
 * @param action Action performed on booking (created, updated, cancelled, etc.)
 * @returns Created notification
 */
export const sendBookingNotification = async (
  bookingId: string,
  recipientId: string,
  action: 'created' | 'confirmed' | 'cancelled' | 'completed' | 'updated'
) => {
  try {
    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            fullName: true
          }
        },
        barber: {
          select: {
            fullName: true
          }
        },
        shop: {
          select: {
            name: true
          }
        }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Format booking date
    const bookingDate = new Date(booking.bookingDate);
    const formattedDate = bookingDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = bookingDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Prepare notification content based on action
    let title = '';
    let message = '';

    switch (action) {
      case 'created':
        title = 'New Booking';
        message = `Booking with ${booking.barber.fullName} at ${booking.shop.name} on ${formattedDate} at ${formattedTime} has been created.`;
        break;
      case 'confirmed':
        title = 'Booking Confirmed';
        message = `Your booking with ${booking.barber.fullName} at ${booking.shop.name} on ${formattedDate} at ${formattedTime} has been confirmed.`;
        break;
      case 'cancelled':
        title = 'Booking Cancelled';
        message = `Your booking with ${booking.barber.fullName} at ${booking.shop.name} on ${formattedDate} at ${formattedTime} has been cancelled.`;
        break;
      case 'completed':
        title = 'Booking Completed';
        message = `Your booking with ${booking.barber.fullName} at ${booking.shop.name} on ${formattedDate} at ${formattedTime} has been completed.`;
        break;
      case 'updated':
        title = 'Booking Updated';
        message = `Your booking with ${booking.barber.fullName} at ${booking.shop.name} on ${formattedDate} at ${formattedTime} has been updated.`;
        break;
      default:
        title = 'Booking Update';
        message = `There's an update to your booking with ${booking.barber.fullName} at ${booking.shop.name} on ${formattedDate} at ${formattedTime}.`;
    }

    // Send notification
    return await sendNotification(
      recipientId,
      'booking',
      title,
      message,
      { bookingId: booking.id, action }
    );
  } catch (error) {
    console.error('Error sending booking notification:', error);
    throw error;
  }
};

/**
 * Send payment notification
 * @param transactionId Transaction ID
 * @param recipientId User ID to send notification to
 * @returns Created notification
 */
export const sendPaymentNotification = async (
  transactionId: string,
  recipientId: string
) => {
  try {
    // Get transaction details
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Format amount
    const formattedAmount = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(transaction.amount);

    // Prepare notification content based on transaction type
    let title = '';
    let message = '';

    switch (transaction.type) {
      case 'deposit':
        title = 'Wallet Funded';
        message = `Your wallet has been funded with ${formattedAmount}.`;
        break;
      case 'withdrawal':
        title = 'Withdrawal Processed';
        message = `Your withdrawal of ${formattedAmount} has been processed.`;
        break;
      case 'payment':
        title = 'Payment Successful';
        message = `Your payment of ${formattedAmount} has been successful.`;
        break;
      case 'refund':
        title = 'Refund Processed';
        message = `A refund of ${formattedAmount} has been processed to your wallet.`;
        break;
      default:
        title = 'Transaction Update';
        message = `A transaction of ${formattedAmount} has been ${transaction.status}.`;
    }

    // Send notification
    return await sendNotification(
      recipientId,
      'payment',
      title,
      message,
      { transactionId: transaction.id, type: transaction.type, status: transaction.status }
    );
  } catch (error) {
    console.error('Error sending payment notification:', error);
    throw error;
  }
};
