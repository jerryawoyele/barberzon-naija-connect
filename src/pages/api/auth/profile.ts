import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    // Get user with related data
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine onboarding status
    let completedOnboarding = user.completedOnboarding || false;
    
    // Double-check by looking at related records
    if (user.role.toLowerCase() === 'customer' && user.customer) {
      completedOnboarding = user.customer.completedOnboarding || completedOnboarding;
    } else if (user.role.toLowerCase() === 'barber' && user.barber) {
      completedOnboarding = user.barber.completedOnboarding || completedOnboarding;
    }

    // Return user profile
    const userProfile = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role.toLowerCase(), // Ensure lowercase role
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      completedOnboarding,
      emailVerified: user.emailVerified,
      customer: user.customer,
      barber: user.barber
    };

    res.status(200).json({
      user: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
