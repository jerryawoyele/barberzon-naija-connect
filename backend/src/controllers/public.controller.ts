import { Request, Response } from 'express';
import { prisma } from '../app';

/**
 * Get public barber profile by ID
 * This endpoint allows anyone to view a barber's public profile information
 */
export const getBarberProfile = async (req: Request, res: Response) => {
  try {
    const { barberId } = req.params;
    console.log(`🔍 Fetching public barber profile for ID: ${barberId}`);

    if (!barberId) {
      return res.status(400).json({
        status: 'error',
        message: 'Barber ID is required'
      });
    }

    // Find the barber profile with user and shop information
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId: barberId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            profileImage: true,
            email: false // Don't expose email in public profile
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            phoneNumber: true,
            rating: true,
            totalReviews: true,
            totalSeats: true,
            ownerId: true
          }
        }
      }
    });

    if (!barberProfile) {
      console.log(`❌ Barber profile not found for user ID: ${barberId}`);
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    console.log(`✅ Found barber profile for: ${barberProfile.user.fullName}`);
    console.log(`   - Barber ID: ${barberProfile.id}`);
    console.log(`   - User ID: ${barberProfile.userId}`);
    console.log(`   - Shop: ${barberProfile.shop?.name || 'No shop'}`);

    // Calculate some additional stats
    const totalBookings = await prisma.booking.count({
      where: { 
        barberId: barberProfile.id,
        status: 'completed'
      }
    });

    // Calculate average rating from reviews
    const avgRating = await prisma.review.aggregate({
      where: { 
        barberId: barberProfile.id
      },
      _avg: {
        rating: true
      },
      _count: {
        rating: true
      }
    });

    // Flatten the response structure
    const publicProfile = {
      id: barberProfile.userId,
      fullName: barberProfile.user.fullName,
      phoneNumber: barberProfile.user.phoneNumber,
      profileImage: barberProfile.user.profileImage,
      specialties: barberProfile.specialties,
      hourlyRate: barberProfile.hourlyRate,
      rating: avgRating._avg.rating || 0,
      totalReviews: totalBookings,
      isAvailable: barberProfile.isAvailable,
      status: barberProfile.status,
      bio: barberProfile.bio,
      experience: barberProfile.experience,
      shop: barberProfile.shop ? {
        id: barberProfile.shop.id,
        name: barberProfile.shop.name,
        address: barberProfile.shop.address,
        phoneNumber: barberProfile.shop.phoneNumber,
        rating: barberProfile.shop.rating,
        totalReviews: barberProfile.shop.totalReviews,
        ownerId: barberProfile.shop.ownerId
      } : null
    };

    console.log(`📊 Profile stats calculated:`);
    console.log(`   - Rating: ${avgRating._avg.rating || 0}`);
    console.log(`   - Total bookings: ${totalBookings}`);
    console.log(`   - Total reviews: ${avgRating._count.rating}`);

    return res.status(200).json({
      status: 'success',
      data: publicProfile
    });
  } catch (error) {
    console.error('Error fetching public barber profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch barber profile'
    });
  }
};
