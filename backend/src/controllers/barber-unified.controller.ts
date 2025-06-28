import { Request, Response } from 'express';
import { prisma } from '../app';
import { sendBookingNotification } from '../utils/notification.utils';

/**
 * Get barber profile (for unified user system)
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get user with barber profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        barberProfile: {
          include: {
            shop: true,
            ownedShops: true,
            bookings: {
              include: {
                customer: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        profileImage: true
                      }
                    }
                  }
                }
              },
              orderBy: {
                bookingDate: 'desc'
              },
              take: 5
            }
          }
        }
      }
    });

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Flatten the structure to match the expected format
    const barberData = {
      ...user.barberProfile,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      // Transform booking data to match expected format
      bookings: user.barberProfile.bookings.map(booking => ({
        ...booking,
        customer: {
          id: booking.customer.user.id,
          fullName: booking.customer.user.fullName,
          phoneNumber: booking.customer.user.phoneNumber,
          profileImage: booking.customer.user.profileImage
        }
      }))
    };

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
    const userId = req.user?.id;
    const { fullName, email, profileImage, specialties, hourlyRate, isAvailable, bio, status } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if user and barber profile exist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { barberProfile: true }
    });

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Update user table
    if (fullName || email || profileImage !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(fullName && { fullName }),
          ...(email && { email }),
          ...(profileImage !== undefined && { profileImage })
        }
      });
    }

    // Update barber profile
    const updatedBarberProfile = await prisma.barberProfile.update({
      where: { id: user.barberProfile.id },
      data: {
        ...(specialties && { specialties }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
        ...(bio !== undefined && { bio }),
        ...(status && { status })
      }
    });

    // Get updated user with barber profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        barberProfile: {
          include: {
            shop: true,
            ownedShops: true
          }
        }
      }
    });

    // Flatten the response
    const responseData = {
      ...updatedUser?.barberProfile,
      fullName: updatedUser?.fullName,
      email: updatedUser?.email,
      phoneNumber: updatedUser?.phoneNumber,
      profileImage: updatedUser?.profileImage
    };

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: responseData
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
 * Get barber appointments/bookings
 */
export const getAppointments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get user's barber profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { barberProfile: true }
    });

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    const barberId = user.barberProfile.id;

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
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                profileImage: true
              }
            }
          }
        },
        shop: true
      },
      orderBy: {
        bookingDate: 'asc'
      }
    });

    // Transform the data to match expected format
    const transformedAppointments = appointments.map(appointment => ({
      ...appointment,
      customer: {
        id: appointment.customer.user.id,
        fullName: appointment.customer.user.fullName,
        phoneNumber: appointment.customer.user.phoneNumber,
        profileImage: appointment.customer.user.profileImage
      }
    }));

    return res.status(200).json({
      status: 'success',
      data: transformedAppointments
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
    const userId = req.user?.id;
    const { bookingId } = req.params;
    const { status, notes } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get user's barber profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { barberProfile: true }
    });

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    const barberId = user.barberProfile.id;

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true
              }
            }
          }
        },
        barber: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if the barber owns this booking
    if (booking.barberId !== barberId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this booking'
      });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        notes: notes || booking.notes,
        // If completing, also update payment status
        ...(status === 'completed' && { paymentStatus: 'paid' })
      }
    });

    // Send notification to customer
    await sendBookingNotification(bookingId, booking.customer.user.id, status);

    return res.status(200).json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update appointment status'
    });
  }
};

/**
 * Get barber earnings
 */
/**
 * Update barber status (available, busy, break, offline)
 */
export const updateStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Validate status
    const validStatuses = ['available', 'busy', 'break', 'offline'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status. Must be one of: available, busy, break, offline'
      });
    }

    // Get user's barber profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { barberProfile: true }
    });

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Update barber status
    const updatedBarberProfile = await prisma.barberProfile.update({
      where: { id: user.barberProfile.id },
      data: {
        status,
        isAvailable: status === 'available'
      }
    });

    console.log(`🔄 Barber ${user.fullName} status updated to: ${status}`);

    return res.status(200).json({
      status: 'success',
      message: 'Status updated successfully',
      data: {
        status: updatedBarberProfile.status,
        isAvailable: updatedBarberProfile.isAvailable
      }
    });
  } catch (error) {
    console.error('Error updating barber status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update status'
    });
  }
};

/**
 * Get barber earnings for a specific period
 */
export const getEarnings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { period = 'month' } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get user's barber profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { barberProfile: true }
    });

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    const barberId = user.barberProfile.id;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get completed bookings for the period
    const completedBookings = await prisma.booking.findMany({
      where: {
        barberId,
        status: 'completed',
        paymentStatus: 'paid',
        bookingDate: {
          gte: startDate,
          lte: now
        }
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true
              }
            }
          }
        }
      }
    });

    // Calculate earnings
    const grossEarnings = completedBookings.reduce((total, booking) => total + booking.totalAmount, 0);
    const platformFees = grossEarnings * 0.08; // 8% platform fee
    const netEarnings = grossEarnings - platformFees;
    const totalBookings = completedBookings.length;
    const uniqueCustomers = new Set(completedBookings.map(b => b.customer.user.id)).size;

    // Calculate completion rate
    const allBookings = await prisma.booking.findMany({
      where: {
        barberId,
        bookingDate: {
          gte: startDate,
          lte: now
        }
      }
    });

    const completionRate = allBookings.length > 0 ? (totalBookings / allBookings.length) * 100 : 100;

    return res.status(200).json({
      status: 'success',
      data: {
        grossEarnings,
        platformFees,
        netEarnings,
        totalBookings,
        uniqueCustomers,
        completionRate: Math.round(completionRate),
        period,
        startDate,
        endDate: now
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
