import { Request, Response } from 'express';
import { prisma } from '../app';
import { sendBookingNotification } from '../utils/notification.utils';

/**
 * Create a new booking
 */
export const createBooking = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const { barberId, shopId, services, bookingDate, bookingTime, notes } = req.body;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if barber exists
    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      include: { shop: true }
    });

    if (!barber) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber not found'
      });
    }

    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'Shop not found'
      });
    }

    // Check if barber belongs to the shop
    if (barber.shopId !== shopId) {
      return res.status(400).json({
        status: 'error',
        message: 'Barber does not belong to this shop'
      });
    }

    // Check if barber is available
    if (!barber.isAvailable) {
      return res.status(400).json({
        status: 'error',
        message: 'Barber is not available for bookings'
      });
    }

    // Validate booking date and time
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const now = new Date();

    if (bookingDateTime < now) {
      return res.status(400).json({
        status: 'error',
        message: 'Booking date and time must be in the future'
      });
    }

    // Check if the barber is already booked at this time
    const existingBooking = await prisma.booking.findFirst({
      where: {
        barberId,
        bookingDate: bookingDateTime,
        status: {
          in: ['pending', 'confirmed']
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        status: 'error',
        message: 'Barber is already booked at this time'
      });
    }

    // Calculate total amount based on services
    let totalAmount = 0;
    if (Array.isArray(services)) {
      for (const service of services) {
        totalAmount += service.price;
      }
    }

    // Create booking
    // Calculate end time based on services duration (assuming 30 minutes per service)
    const servicesDuration = Array.isArray(services) ? services.length * 30 : 30; // Default 30 minutes
    const startTime = bookingDateTime;
    const endTime = new Date(startTime.getTime() + servicesDuration * 60000);

    const booking = await prisma.booking.create({
      data: {
        customerId,
        barberId,
        shopId,
        services: services || [],
        bookingDate: bookingDateTime,
        startTime,
        endTime,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount,
        notes: notes || ''
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        barber: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        shop: true
      }
    });

    // Send notification to barber about new booking
    await sendBookingNotification(booking.id, booking.barberId, 'created');

    return res.status(201).json({
      status: 'success',
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create booking'
    });
  }
};

/**
 * Get booking details
 */
export const getBookingDetails = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { bookingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            profileImage: true
          }
        },
        barber: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            profileImage: true,
            specialties: true
          }
        },
        shop: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if the user is authorized to view this booking
    if (userRole === 'customer' && booking.customerId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this booking'
      });
    }

    if (userRole === 'barber' && booking.barberId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to view this booking'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch booking details'
    });
  }
};

/**
 * Cancel booking
 */
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { bookingId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        barber: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if the user is authorized to cancel this booking
    if (userRole === 'customer' && booking.customerId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to cancel this booking'
      });
    }

    if (userRole === 'barber' && booking.barberId !== userId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        status: 'error',
        message: `Booking is already ${booking.status}`
      });
    }

    // Calculate booking date
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursDifference = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // If less than 2 hours before the booking, customer may be charged a cancellation fee
    let cancellationFee = 0;
    if (userRole === 'customer' && hoursDifference < 2) {
      cancellationFee = booking.totalAmount * 0.2; // 20% cancellation fee
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled: No reason provided'
      }
    });

    // Send notification about cancellation
    await sendBookingNotification(bookingId, booking.customerId, 'cancelled');
    if (booking.barberId !== userId) {
      await sendBookingNotification(bookingId, booking.barberId, 'cancelled');
    }

    return res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: {
        booking: updatedBooking,
        cancellationFee
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to cancel booking'
    });
  }
};

/**
 * Rate and review booking
 */
export const rateBooking = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const { bookingId } = req.params;
    const { rating, comment } = req.body;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if the user is authorized to rate this booking
    if (booking.customerId !== customerId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to rate this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Only completed bookings can be rated'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId }
    });

    let review;
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment: comment || ''
        }
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          bookingId,
          customerId,
          barberId: booking.barberId,
          rating,
          comment: comment || ''
        }
      });
    }

    // Update barber's average rating
    const barberReviews = await prisma.review.findMany({
      where: {
        barberId: booking.barberId
      },
      select: {
        rating: true
      }
    });

    const totalRatings = barberReviews.length;
    const sumRatings = barberReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    await prisma.barber.update({
      where: { id: booking.barberId },
      data: {
        rating: averageRating,
        totalReviews: totalRatings
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Booking rated successfully',
      data: review
    });
  } catch (error) {
    console.error('Error rating booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to rate booking'
    });
  }
};

/**
 * Get user's bookings (for both customers and barbers)
 */
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status, page = 1, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where condition based on user role
    let whereCondition: any = {};
    
    if (userRole === 'customer') {
      // For customers, find their CustomerProfile first
      const customerProfile = await prisma.customerProfile.findUnique({
        where: { userId }
      });
      
      if (!customerProfile) {
        return res.status(404).json({
          status: 'error',
          message: 'Customer profile not found'
        });
      }
      
      whereCondition.customerId = customerProfile.id;
    } else if (userRole === 'barber') {
      // For barbers, find their BarberProfile first
      const barberProfile = await prisma.barberProfile.findUnique({
        where: { userId }
      });
      
      if (!barberProfile) {
        return res.status(404).json({
          status: 'error',
          message: 'Barber profile not found'
        });
      }
      
      whereCondition.barberId = barberProfile.id;
    } else {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid user role'
      });
    }

    // Add status filter if provided
    if (status && typeof status === 'string') {
      whereCondition.status = status;
    }

    // Get bookings with pagination
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: whereCondition,
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
          barber: {
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
          shop: {
            select: {
              id: true,
              name: true,
              address: true,
              phoneNumber: true
            }
          }
        },
        orderBy: {
          bookingDate: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.booking.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    
    // Map bookings to flatten user data
    const mappedBookings = bookings.map(booking => ({
      ...booking,
      customer: {
        ...booking.customer,
        ...booking.customer.user
      },
      barber: {
        ...booking.barber,
        ...booking.barber.user,
        specialties: booking.barber.specialties
      }
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        bookings: mappedBookings,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
};

/**
 * Confirm booking (barber only)
 */
export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const userRole = req.user?.role;
    const { bookingId } = req.params;

    if (!barberId || userRole !== 'barber') {
      return res.status(403).json({
        status: 'error',
        message: 'Only barbers can confirm bookings'
      });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        barber: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if the barber is authorized to confirm this booking
    if (booking.barberId !== barberId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to confirm this booking'
      });
    }

    // Check if booking can be confirmed
    if (booking.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: `Booking is already ${booking.status}`
      });
    }

    // Update booking status to confirmed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed'
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        barber: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        shop: true
      }
    });

    // Send notification to customer about confirmation
    await sendBookingNotification(bookingId, booking.customerId, 'confirmed');

    return res.status(200).json({
      status: 'success',
      message: 'Booking confirmed successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error confirming booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to confirm booking'
    });
  }
};

/**
 * Complete booking (barber only)
 */
export const completeBooking = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const userRole = req.user?.role;
    const { bookingId } = req.params;
    const { notes } = req.body;

    if (!barberId || userRole !== 'barber') {
      return res.status(403).json({
        status: 'error',
        message: 'Only barbers can complete bookings'
      });
    }

    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        barber: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found'
      });
    }

    // Check if the barber is authorized to complete this booking
    if (booking.barberId !== barberId) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to complete this booking'
      });
    }

    // Check if booking can be completed
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        status: 'error',
        message: 'Only confirmed bookings can be completed'
      });
    }

    // Update booking status to completed
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'completed',
        paymentStatus: 'completed', // Assuming payment is completed when service is done
        notes: notes ? `${booking.notes}\nCompleted: ${notes}` : booking.notes
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        barber: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true
          }
        },
        shop: true
      }
    });

    // Send notification to customer about completion
    await sendBookingNotification(bookingId, booking.customerId, 'completed');

    return res.status(200).json({
      status: 'success',
      message: 'Booking completed successfully',
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to complete booking'
    });
  }
};
