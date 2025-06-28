import { Request, Response } from 'express';
import { prisma } from '../app';
import { sendBookingNotification } from '../utils/notification.utils';

/**
 * Get barber profile
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

    // Combine user and barber profile data
    const { password, ...userData } = user;
    const barberData = {
      ...userData,
      ...user.barberProfile,
      // Map bookings to include customer user data properly
      bookings: user.barberProfile.bookings.map(booking => ({
        ...booking,
        customer: {
          ...booking.customer,
          ...booking.customer.user
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
    const { fullName, email, profileImage, specialties, hourlyRate, isAvailable } = req.body;

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

    // Update user data (basic info)
    const userUpdateData: any = {};
    if (fullName) userUpdateData.fullName = fullName;
    if (email) userUpdateData.email = email;
    if (profileImage !== undefined) userUpdateData.profileImage = profileImage;

    // Update barber profile data (barber-specific info)
    const barberUpdateData: any = {};
    if (specialties) barberUpdateData.specialties = specialties;
    if (hourlyRate !== undefined) barberUpdateData.hourlyRate = parseFloat(hourlyRate);
    if (isAvailable !== undefined) barberUpdateData.isAvailable = Boolean(isAvailable);

    // Perform updates
    const updatePromises = [];
    
    if (Object.keys(userUpdateData).length > 0) {
      updatePromises.push(
        prisma.user.update({
          where: { id: userId },
          data: userUpdateData
        })
      );
    }

    if (Object.keys(barberUpdateData).length > 0) {
      updatePromises.push(
        prisma.barberProfile.update({
          where: { userId },
          data: barberUpdateData
        })
      );
    }

    await Promise.all(updatePromises);

    // Get updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        barberProfile: {
          include: {
            shop: true
          }
        }
      }
    });

    // Remove sensitive data and combine user + barber profile
    const { password, ...userData } = updatedUser!;
    const combinedData = {
      ...userData,
      ...userData.barberProfile
    };

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: combinedData
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
    const userId = req.user?.id;
    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
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
      barberId: barberProfile.id // Use barber profile ID
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

    // Map appointments to include customer user data properly
    const mappedAppointments = appointments.map(appointment => ({
      ...appointment,
      customer: {
        ...appointment.customer,
        ...appointment.customer.user
      }
    }));

    return res.status(200).json({
      status: 'success',
      data: mappedAppointments
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
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Check if booking exists and belongs to this barber
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        barberId: barberProfile.id // Use barber profile ID
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
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true
              }
            }
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
    const userId = req.user?.id;
    const period = req.query.period as string || 'week';

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
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
        barberId: barberProfile.id, // Use barber profile ID
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

    // Get transactions (these are still linked to user ID)
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: userId, // Transactions are linked to user, not barber profile
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

/**
 * Get barber dashboard data (aggregated data for dashboard cards)
 */
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }


    // Get user with barber profile and shop info
    const user = await prisma.user.findUnique({
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


    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    const barberProfile = user.barberProfile;


    // Calculate date ranges
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);
    const startOfMonth = new Date(today);
    startOfMonth.setMonth(today.getMonth() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get earnings data (this week)
    const weeklyBookings = await prisma.booking.findMany({
      where: {
        barberId: barberProfile.id,
        status: 'completed',
        bookingDate: {
          gte: startOfWeek,
          lte: today
        }
      },
      select: {
        totalAmount: true
      }
    });

    const weeklyEarnings = weeklyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Get total bookings count (all time)
    const totalBookingsCount = await prisma.booking.count({
      where: {
        barberId: barberProfile.id,
        status: {
          in: ['completed', 'confirmed']
        }
      }
    });

    // Get upcoming bookings (next 7 days)
    const upcomingBookings = await prisma.booking.findMany({
      where: {
        barberId: barberProfile.id,
        status: {
          in: ['confirmed', 'pending']
        },
        bookingDate: {
          gte: today,
          lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                fullName: true,
                phoneNumber: true,
                profileImage: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'asc'
      },
      take: 5
    });

    // Map upcoming bookings with customer data
    const mappedUpcomingBookings = upcomingBookings.map(booking => ({
      ...booking,
      customer: {
        ...booking.customer,
        ...booking.customer.user
      }
    }));

    // Get monthly earnings for comparison
    const monthlyBookings = await prisma.booking.findMany({
      where: {
        barberId: barberProfile.id,
        status: 'completed',
        bookingDate: {
          gte: startOfMonth,
          lte: today
        }
      },
      select: {
        totalAmount: true
      }
    });

    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

    // Calculate today's bookings
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayBookingsCount = await prisma.booking.count({
      where: {
        barberId: barberProfile.id,
        bookingDate: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });


    // Determine shop info
    const shopInfo = barberProfile.shop || (barberProfile.ownedShops.length > 0 ? barberProfile.ownedShops[0] : null);
    const isShopOwner = barberProfile.ownedShops.length > 0;


    // Prepare dashboard data
    const dashboardData = {
      // Barber basic info
      barber: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profileImage: user.profileImage,
        specialties: barberProfile.specialties,
        hourlyRate: barberProfile.hourlyRate,
        rating: barberProfile.rating,
        totalReviews: barberProfile.totalReviews,
        isAvailable: barberProfile.isAvailable,
        status: barberProfile.status
      },

      // Earnings data
      earnings: {
        weekly: weeklyEarnings,
        monthly: monthlyEarnings,
        currency: 'NGN'
      },

      // Bookings data
      bookings: {
        total: totalBookingsCount,
        today: todayBookingsCount,
        upcoming: mappedUpcomingBookings.length,
        upcomingList: mappedUpcomingBookings
      },

      // Shop info
      shop: shopInfo ? {
        id: shopInfo.id,
        name: shopInfo.name,
        address: shopInfo.address,
        totalSeats: shopInfo.totalSeats,
        rating: shopInfo.rating,
        isOwner: isShopOwner
      } : null,

      // Status flags
      isShopOwner,
      hasShop: !!shopInfo
    };


    return res.status(200).json({
      status: 'success',
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard data'
    });
  }
};

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
 * Get barber customers (people who have booked with this barber)
 */
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { search, status } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Get all customers who have booked with this barber
    const bookings = await prisma.booking.findMany({
      where: {
        barberId: barberProfile.id
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                email: true,
                profileImage: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    // Group bookings by customer and calculate stats
    const customerMap = new Map();
    
    bookings.forEach(booking => {
      const customerId = booking.customer.user.id;
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: booking.customer.user.fullName,
          phone: booking.customer.user.phoneNumber,
          email: booking.customer.user.email,
          profileImage: booking.customer.user.profileImage,
          totalVisits: 0,
          totalSpent: 0,
          lastVisit: null,
          services: new Set(),
          avgRating: 0,
          bookings: []
        });
      }
      
      const customer = customerMap.get(customerId);
      customer.totalVisits++;
      customer.totalSpent += booking.totalAmount;
      customer.bookings.push(booking);
      
      if (!customer.lastVisit || booking.bookingDate > customer.lastVisit) {
        customer.lastVisit = booking.bookingDate;
      }
      
      // Add services
      if (Array.isArray(booking.services)) {
        booking.services.forEach(service => customer.services.add(service));
      }
    });

    // Convert to array and calculate derived fields
    let customers = Array.from(customerMap.values()).map(customer => ({
      ...customer,
      services: Array.from(customer.services),
      status: customer.totalVisits >= 10 ? 'vip' : 
              customer.totalVisits >= 3 ? 'regular' : 'new',
      loyaltyPoints: Math.floor(customer.totalSpent * 0.01) // 1% of spending as points
    }));

    // Apply search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(search) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status && typeof status === 'string' && status !== 'all') {
      customers = customers.filter(customer => customer.status === status);
    }

    return res.status(200).json({
      status: 'success',
      data: customers
    });
  } catch (error) {
    console.error('Error fetching barber customers:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch customers'
    });
  }
};

/**
 * Get barber transactions and payment history
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { period = 'month', type } = req.query;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Calculate date range
    const today = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
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
        startDate.setMonth(today.getMonth() - 1);
    }

    // Get completed bookings for earnings
    const completedBookings = await prisma.booking.findMany({
      where: {
        barberId: barberProfile.id,
        status: 'completed',
        paymentStatus: 'paid',
        bookingDate: {
          gte: startDate,
          lte: today
        }
      },
      include: {
        customer: {
          include: {
            user: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    // Calculate summary data
    const grossEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const platformFees = grossEarnings * 0.08;
    const netEarnings = grossEarnings - platformFees;

    // Format transactions
    const transactions = completedBookings.map(booking => ({
      id: booking.id,
      type: 'earning',
      customerName: booking.customer.user.fullName,
      service: Array.isArray(booking.services) ? booking.services.join(', ') : 'Service',
      grossAmount: booking.totalAmount,
      platformFee: booking.totalAmount * 0.08,
      netAmount: booking.totalAmount * 0.92,
      date: booking.bookingDate,
      time: booking.startTime,
      status: 'completed'
    }));

    // Get user transactions (payouts, etc.)
    const userTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: today
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const payoutTransactions = userTransactions.map(transaction => ({
      id: transaction.id,
      type: 'payout',
      description: transaction.description || 'Payout',
      amount: transaction.amount,
      date: transaction.createdAt,
      status: transaction.status,
      reference: transaction.reference
    }));

    // Combine and sort all transactions
    const allTransactions = [...transactions, ...payoutTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.status(200).json({
      status: 'success',
      data: {
        summary: {
          grossEarnings,
          platformFees,
          netEarnings,
          totalTransactions: completedBookings.length,
          period
        },
        transactions: allTransactions
      }
    });
  } catch (error) {
    console.error('Error fetching barber transactions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions'
    });
  }
};

/**
 * Get/Update barber shop and profile settings
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get user with barber profile and shop
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        barberProfile: {
          include: {
            shop: {
              include: {
                services: true,
                barbers: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                      }
                    }
                  }
                }
              }
            },
            ownedShops: {
              include: {
                services: true,
                barbers: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                      }
                    }
                  }
                }
              }
            },
            reviews: true,
            payoutAccount: true
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

    const barberProfile = user.barberProfile;
    const shop = barberProfile.shop || (barberProfile.ownedShops.length > 0 ? barberProfile.ownedShops[0] : null);

    // Calculate shop stats if shop exists
    let shopStats = null;
    if (shop) {
      const totalSeats = shop.barbers.length; // Number of barbers = number of seats
      shopStats = {
        totalSeats,
        rating: shop.rating,
        totalReviews: shop.totalReviews
      };
    }

    return res.status(200).json({
      status: 'success',
      data: {
        barber: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profileImage: user.profileImage,
          specialties: barberProfile.specialties,
          hourlyRate: barberProfile.hourlyRate,
          bio: barberProfile.bio,
          experience: barberProfile.experience,
          rating: barberProfile.rating,
          totalReviews: barberProfile.totalReviews
        },
        shop: shop ? {
          id: shop.id,
          name: shop.name,
          description: shop.description,
          address: shop.address,
          phoneNumber: shop.phoneNumber,
          email: shop.email,
          openingHours: shop.openingHours,
          images: shop.images,
          services: shop.services,
          barbers: shop.barbers,
          ...shopStats
        } : null,
        payoutAccount: barberProfile.payoutAccount
      }
    });
  } catch (error) {
    console.error('Error fetching barber settings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch settings'
    });
  }
};

/**
 * Update shop information
 */
export const updateShop = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, description, address, phoneNumber, email, openingHours, images } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile to find shop
    const user = await prisma.user.findUnique({
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

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Find the shop to update (either associated shop or owned shop)
    const shop = user.barberProfile.shop || 
                (user.barberProfile.ownedShops.length > 0 ? user.barberProfile.ownedShops[0] : null);

    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'No shop found to update'
      });
    }

    // Check if user is owner or has permission to edit
    const isOwner = user.barberProfile.ownedShops.some(ownedShop => ownedShop.id === shop.id);
    
    if (!isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to edit this shop'
      });
    }

    // Update shop data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (address) updateData.address = address;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (email !== undefined) updateData.email = email;
    if (openingHours) updateData.openingHours = openingHours;
    if (images && Array.isArray(images)) updateData.images = images;

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: updateData,
      include: {
        services: true,
        barbers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true
              }
            }
          }
        }
      }
    });

    console.log(`🏪 Shop ${updatedShop.name} updated by barber ${user.fullName}`);

    return res.status(200).json({
      status: 'success',
      message: 'Shop updated successfully',
      data: updatedShop
    });
  } catch (error) {
    console.error('Error updating shop:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update shop'
    });
  }
};

/**
 * Get/Create/Update payout account
 */
export const getPayoutAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId },
      include: {
        payoutAccount: true
      }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: barberProfile.payoutAccount
    });
  } catch (error) {
    console.error('Error fetching payout account:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch payout account'
    });
  }
};

export const upsertPayoutAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { bankName, accountNumber, accountName, bankCode } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({
        status: 'error',
        message: 'Bank name, account number, and account name are required'
      });
    }

    // Get barber profile
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId },
      include: {
        payoutAccount: true
      }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Create or update payout account
    const payoutAccount = await prisma.payoutAccount.upsert({
      where: {
        barberId: barberProfile.id
      },
      update: {
        bankName,
        accountNumber,
        accountName,
        bankCode,
        isVerified: false // Reset verification status on update
      },
      create: {
        barberId: barberProfile.id,
        bankName,
        accountNumber,
        accountName,
        bankCode,
        isVerified: false
      }
    });

    console.log(`💳 Payout account ${payoutAccount.id} updated for barber ${barberProfile.id}`);

    return res.status(200).json({
      status: 'success',
      message: 'Payout account updated successfully',
      data: payoutAccount
    });
  } catch (error) {
    console.error('Error updating payout account:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update payout account'
    });
  }
};

/**
 * Get upcoming payouts
 */
export const getUpcomingPayouts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId },
      include: {
        payoutAccount: true
      }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Calculate pending earnings from completed bookings
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const completedBookings = await prisma.booking.findMany({
      where: {
        barberId: barberProfile.id,
        status: 'completed',
        paymentStatus: 'paid',
        bookingDate: {
          gte: startOfWeek,
          lte: today
        }
      }
    });

    const grossEarnings = completedBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
    const platformFees = grossEarnings * 0.08;
    const netEarnings = grossEarnings - platformFees;

    // Calculate next payout date (every Friday)
    const nextFriday = new Date();
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);

    const upcomingPayouts = netEarnings > 0 ? [{
      id: 'upcoming-1',
      amount: netEarnings,
      date: nextFriday.toISOString().split('T')[0],
      description: 'Weekly Payout',
      bankAccount: barberProfile.payoutAccount ? 
        `${barberProfile.payoutAccount.bankName} ****${barberProfile.payoutAccount.accountNumber.slice(-4)}` : 
        'No payout account set'
    }] : [];

    return res.status(200).json({
      status: 'success',
      data: upcomingPayouts
    });
  } catch (error) {
    console.error('Error fetching upcoming payouts:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch upcoming payouts'
    });
  }
};

/**
 * Update business hours
 */
export const updateBusinessHours = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { openingHours } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Validate opening hours format
    if (!openingHours || typeof openingHours !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid opening hours format'
      });
    }

    // Get barber profile to find shop
    const user = await prisma.user.findUnique({
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

    if (!user || !user.barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Find the shop to update
    const shop = user.barberProfile.shop || 
                (user.barberProfile.ownedShops.length > 0 ? user.barberProfile.ownedShops[0] : null);

    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'No shop found to update'
      });
    }

    // Check if user is owner
    const isOwner = user.barberProfile.ownedShops.some(ownedShop => ownedShop.id === shop.id);
    
    if (!isOwner) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to edit this shop'
      });
    }

    // Update shop opening hours
    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: { openingHours }
    });

    console.log(`🕐 Business hours updated for shop ${updatedShop.name}`);

    return res.status(200).json({
      status: 'success',
      message: 'Business hours updated successfully',
      data: updatedShop
    });
  } catch (error) {
    console.error('Error updating business hours:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update business hours'
    });
  }
};
