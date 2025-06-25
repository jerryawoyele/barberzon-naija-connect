import { Request, Response } from 'express';
import { prisma } from '../app';
import { sendBookingNotification } from '../utils/notification.utils';

/**
 * Get barber profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      include: {
        shop: true,
        bookings: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                profileImage: true
              }
            }
          },
          orderBy: {
            bookingDate: 'desc'
          },
          take: 5
        }
      }
    });

    if (!barber) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber not found'
      });
    }

    // Remove sensitive data
    const { password, ...barberData } = barber;

    return res.status(200).json({
      status: 'success',
      data: barberData
    });
  } catch (error) {
    console.error('Error fetching barber profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch barber profile'
    });
  }
};

/**
 * Update barber profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const { fullName, email, profileImage, specialties, hourlyRate, isAvailable } = req.body;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if barber exists
    const existingBarber = await prisma.barber.findUnique({
      where: { id: barberId }
    });

    if (!existingBarber) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber not found'
      });
    }

    // Update barber profile
    const updatedBarber = await prisma.barber.update({
      where: { id: barberId },
      data: {
        fullName: fullName || undefined,
        email: email || undefined,
        profileImage: profileImage || undefined,
        specialties: specialties || undefined,
        hourlyRate: hourlyRate !== undefined ? parseFloat(hourlyRate) : undefined,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : undefined
      }
    });

    // Remove sensitive data
    const { password, ...barberData } = updatedBarber;

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: barberData
    });
  } catch (error) {
    console.error('Error updating barber profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

/**
 * Get barber appointments
 */
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Build filter based on query parameters
    const filter: {
      barberId: string;
      status?: string;
      bookingDate?: {
        gte: Date;
        lt: Date;
      };
    } = {
      barberId
    };

    if (status) {
      filter.status = status;
    }

    if (date) {
      // If date is provided, filter by that specific date
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.bookingDate = {
        gte: selectedDate,
        lt: nextDay
      };
    }

    const appointments = await prisma.booking.findMany({
      where: filter,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            profileImage: true
          }
        },
        shop: true
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    return res.status(200).json({
      status: 'success',
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching barber appointments:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments'
    });
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if booking exists and belongs to this barber
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        barberId
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found or does not belong to this barber'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: pending, confirmed, completed, cancelled'
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        }
      }
    });

    // Send notification to customer about status change
    await sendBookingNotification(
      bookingId, 
      updatedBooking.customer.id, 
      status as 'confirmed' | 'cancelled' | 'completed' | 'updated'
    );

    return res.status(200).json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update booking status'
    });
  }
};

/**
 * Get barber earnings
 */
export const getEarnings = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const period = req.query.period as string || 'week';

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Calculate date range based on period
    const today = new Date();
    const startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 7); // Default to week
    }

    // Get completed bookings in the date range
    const bookings = await prisma.booking.findMany({
      where: {
        barberId,
        status: 'completed',
        bookingDate: {
          gte: startDate,
          lte: today
        }
      },
      select: {
        id: true,
        bookingDate: true,
        totalAmount: true
      }
    });

    // Calculate total earnings
    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: barberId,
        type: 'payment',
        status: 'successful',
        createdAt: {
          gte: startDate,
          lte: today
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        period,
        totalEarnings,
        bookingsCount: bookings.length,
        bookings,
        transactions
      }
    });
  } catch (error) {
    console.error('Error fetching barber earnings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch earnings'
    });
  }
};
