import { Request, Response } from 'express';
import { prisma } from '../app';

/**
 * Get customer profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        wallet: true,
        bookings: {
          include: {
            barber: true,
            shop: true
          },
          orderBy: {
            bookingDate: 'desc'
          },
          take: 5
        },
        favoriteShops: true
      }
    });

    if (!customer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found'
      });
    }

    // Remove sensitive data
    const { password, ...customerData } = customer;

    return res.status(200).json({
      status: 'success',
      data: customerData
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch customer profile'
    });
  }
};

/**
 * Update customer profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const { fullName, email, profileImage, locationLat, locationLng } = req.body;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!existingCustomer) {
      return res.status(404).json({
        status: 'error',
        message: 'Customer not found'
      });
    }

    // Update customer profile
    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        fullName: fullName || undefined,
        email: email || undefined,
        profileImage: profileImage || undefined,
        locationLat: locationLat || undefined,
        locationLng: locationLng || undefined
      }
    });

    // Remove sensitive data
    const { password, ...customerData } = updatedCustomer;

    return res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: customerData
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update profile'
    });
  }
};

/**
 * Get customer bookings
 */
export const getBookings = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const status = req.query.status as string | undefined;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Build filter based on query parameters
    const filter: {
      customerId: string;
      status?: string;
    } = {
      customerId
    };

    if (status) {
      filter.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: filter,
      include: {
        barber: true,
        shop: true
      },
      orderBy: {
        bookingDate: 'desc'
      }
    });

    return res.status(200).json({
      status: 'success',
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bookings'
    });
  }
};

/**
 * Add shop to favorites
 */
export const addFavoriteShop = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const { shopId } = req.body;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
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

    // Add shop to favorites
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        favoriteShops: {
          connect: { id: shopId }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Shop added to favorites'
    });
  } catch (error) {
    console.error('Error adding shop to favorites:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to add shop to favorites'
    });
  }
};

/**
 * Remove shop from favorites
 */
export const removeFavoriteShop = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;
    const { shopId } = req.params;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Remove shop from favorites
    await prisma.customer.update({
      where: { id: customerId },
      data: {
        favoriteShops: {
          disconnect: { id: shopId }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Shop removed from favorites'
    });
  } catch (error) {
    console.error('Error removing shop from favorites:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to remove shop from favorites'
    });
  }
};

/**
 * Get customer wallet
 */
export const getWallet = async (req: Request, res: Response) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { customerId }
    });

    if (!wallet) {
      return res.status(404).json({
        status: 'error',
        message: 'Wallet not found'
      });
    }

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return res.status(200).json({
      status: 'success',
      data: {
        wallet,
        transactions
      }
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch wallet'
    });
  }
};
