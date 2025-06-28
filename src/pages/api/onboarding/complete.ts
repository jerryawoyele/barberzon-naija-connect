import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const { userType, ...data } = req.body;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: true,
        barber: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role if it's different
    const roleMapping = { customer: 'customer', barber: 'barber' };
    const newRole = roleMapping[userType as keyof typeof roleMapping];

    await prisma.user.update({
      where: { id: userId },
      data: {
        role: newRole,
        completedOnboarding: true
      }
    });

    if (userType === 'customer') {
      // Create or update customer profile
      const customerData = {
        userId,
        completedOnboarding: true,
        // Add location if provided
        ...(data.locationLat && data.locationLng && {
          latitude: data.locationLat,
          longitude: data.locationLng
        }),
        // Add preferences if provided
        ...(data.bookingPreferences && {
          preferences: JSON.stringify(data.bookingPreferences)
        })
      };

      await prisma.customer.upsert({
        where: { userId },
        update: customerData,
        create: customerData
      });

    } else if (userType === 'barber') {
      // Create or update barber profile
      const barberData = {
        userId,
        completedOnboarding: true,
        specialties: data.specialties || [],
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        bio: data.bio || '',
        // Add location if provided
        ...(data.locationLat && data.locationLng && {
          latitude: data.locationLat,
          longitude: data.locationLng
        })
      };

      await prisma.barber.upsert({
        where: { userId },
        update: barberData,
        create: barberData
      });

      // If creating a new shop, create shop record
      if (data.isNewShop && data.shopName) {
        const shop = await prisma.shop.create({
          data: {
            name: data.shopName,
            address: data.shopAddress || '',
            phone: data.shopPhone || '',
            ownerId: userId,
            // Add location if provided
            ...(data.locationLat && data.locationLng && {
              latitude: data.locationLat,
              longitude: data.locationLng
            })
          }
        });

        // Associate barber with the shop
        await prisma.barber.update({
          where: { userId },
          data: { shopId: shop.id }
        });
      }
    }

    // Return updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customer: true,
        barber: {
          include: {
            shop: true
          }
        }
      }
    });

    // Ensure role is lowercase in response
    const responseUser = {
      ...updatedUser,
      role: updatedUser?.role?.toLowerCase()
    };

    res.status(200).json({
      message: 'Onboarding completed successfully',
      user: responseUser
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
