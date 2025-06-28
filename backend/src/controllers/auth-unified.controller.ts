import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { generateToken } from '../utils/jwt.utils';
import { generateVerificationToken, sendVerificationEmail, verifyEmailToken, sendWelcomeEmail } from '../utils/email.utils';

/**
 * Register a new user (unified registration - only creates User table)
 * No profiles are created at this stage - they're created during onboarding
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, email, password, fullName } = req.body;

    console.log('Registering new user:', { phoneNumber, email, fullName });

    // Validate required fields
    if (!phoneNumber || !password || !fullName) {
      return res.status(400).json({
        status: 'error',
        message: 'Phone number, password, and full name are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          { email: email || undefined }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this phone number or email already exists'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user - ONLY User table, no profiles yet
    const newUser = await prisma.user.create({
      data: {
        phoneNumber,
        email: email || null,
        password: hashedPassword,
        fullName,
        role: null, // Role will be assigned during onboarding
        completedOnboarding: false,
        emailVerified: false,
        isVerified: false
      }
    });

    console.log('User created successfully:', { id: newUser.id, phoneNumber: newUser.phoneNumber });

    // Generate token with no role
    const token = generateToken({
      id: newUser.id,
      role: null
    });

    // Return user data without password
    const { password: _, ...userData } = newUser;

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please complete onboarding.',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register user',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Login user (unified login for both customers and barbers)
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    console.log('Login attempt:', { phoneNumber });

    // Check if the input looks like an email
    const isEmail = phoneNumber.includes('@');
    
    console.log('Is email?', isEmail);

    // Find the user by phoneNumber or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          { email: phoneNumber } // Try to find by email if phoneNumber is actually an email
        ]
      },
      include: {
        customerProfile: true,
        barberProfile: {
          include: {
            shop: true
          }
        }
      }
    });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', { id: user.id, role: user.role });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    console.log('Password valid, generating token');

    // Generate token
    const token = generateToken({
      id: user.id,
      role: user.role
    });

    // Return user data without password
    const { password: _, ...userData } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to login'
    });
  }
};

/**
 * Get user profile (unified profile endpoint)
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    // Get user with both profile types
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: {
          include: {
            wallet: true,
            favoriteShops: true
          }
        },
        barberProfile: {
          include: {
            shop: true,
            ownedShops: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user profile without password
    const { password: _, ...userProfile } = user;

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
};

/**
 * Complete user onboarding (unified onboarding)
 */
export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    const { userType, ...data } = req.body;

    console.log('Completing onboarding:', { userId, userType, data });

    // Update user with role and onboarding status
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: userType,
        completedOnboarding: true,
        // Update basic fields if provided
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        ...(data.profileImage !== undefined && { profileImage: data.profileImage })
      }
    });

    if (userType === 'customer') {
      // Create customer profile
      const customerData = {
        userId,
        locationLat: data.locationLat,
        locationLng: data.locationLng,
        bookingPreferences: data.bookingPreferences ? JSON.stringify(data.bookingPreferences) : null,
        loyaltyPoints: 0
      };

      console.log('Creating customer profile:', customerData);
      
      const customerProfile = await prisma.customerProfile.create({
        data: customerData
      });

      // Create wallet for customer
      await prisma.wallet.create({
        data: {
          customerId: customerProfile.id,
          balance: 0,
          currency: 'NGN'
        }
      });

    } else if (userType === 'barber') {
      // Create barber profile
      const barberData = {
        userId,
        specialties: data.specialties || [],
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : 0,
        bio: data.bio || '',
        isAvailable: true,
        isSolo: data.isNewShop ? false : true, // If creating new shop, not solo
        status: 'available'
      };

      console.log('Creating barber profile:', barberData);
      
      const barberProfile = await prisma.barberProfile.create({
        data: barberData
      });

      // Handle shop creation if needed
      let createdShop = null;
      if (data.isNewShop && data.shopName) {
        console.log('Creating new shop:', data.shopName);
        
        createdShop = await prisma.shop.create({
          data: {
            ownerId: barberProfile.id, // Link to barber profile, not user
            name: data.shopName,
            address: data.shopAddress || '',
            phoneNumber: data.shopPhone || '',
            locationLat: data.locationLat || 0,
            locationLng: data.locationLng || 0,
            openingHours: {
              monday: { open: '09:00', close: '18:00' },
              tuesday: { open: '09:00', close: '18:00' },
              wednesday: { open: '09:00', close: '18:00' },
              thursday: { open: '09:00', close: '18:00' },
              friday: { open: '09:00', close: '18:00' },
              saturday: { open: '09:00', close: '18:00' },
              sunday: { open: '10:00', close: '16:00' }
            }
          }
        });

        // Associate barber with the shop
        await prisma.barberProfile.update({
          where: { id: barberProfile.id },
          data: { shopId: createdShop.id }
        });

        console.log('Shop created and barber associated:', createdShop.id);
      }

      // Generate new token with barber role
      const newToken = generateToken({
        id: userId,
        role: 'barber'
      });

      // Return response with new token for role change
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

      return res.status(200).json({
        message: createdShop 
          ? 'Onboarding completed successfully - shop created' 
          : 'Onboarding completed successfully',
        user: updatedUser,
        newToken, // Include new token for role change
        shop: createdShop
      });
    }

    // Return updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: {
          include: {
            wallet: true
          }
        },
        barberProfile: {
          include: {
            shop: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Onboarding completed successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

/**
 * Request email verification
 */
export const requestEmailVerification = async (req: Request, res: Response) => {
  try {
    const { email, role = 'customer' } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Generate verification token
    const token = generateVerificationToken(email, role as 'customer' | 'barber');

    // Send verification email
    const emailSent = await sendVerificationEmail(email, token, role as 'customer' | 'barber');

    if (!emailSent) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Error requesting email verification:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process email verification request'
    });
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token, userData } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Verification token is required'
      });
    }

    // Verify the token
    const verifiedData = verifyEmailToken(token);

    if (!verifiedData) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired verification token'
      });
    }

    const { email, role } = verifiedData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Check if userData is provided
    if (!userData || !userData.password) {
      return res.status(400).json({
        status: 'error',
        message: 'User data with password is required'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: userData.fullName || 'New User',
        phoneNumber: userData.phoneNumber || '',
        emailVerified: true,
        role: null, // Role will be set during onboarding
        completedOnboarding: false
      }
    });

    // Generate token
    const authToken = generateToken({
      id: newUser.id,
      role: null
    });

    // Send welcome email
    await sendWelcomeEmail(email, newUser.fullName, role);

    // Return user data without password
    const { password: _, ...userData2 } = newUser;

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userData2,
        token: authToken
      }
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to verify email'
    });
  }
};
