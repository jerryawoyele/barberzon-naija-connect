import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import { generateToken } from '../utils/jwt.utils';
import { generateVerificationToken, sendVerificationEmail, verifyEmailToken, sendWelcomeEmail } from '../utils/email.utils';
import axios from 'axios';
import { config } from '../config';

/**
 * Register a new user (customer or barber)
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, email, password, fullName, role = 'customer' } = req.body;

    // Validate role
    if (!['customer', 'barber'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be either customer or barber'
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

    // Create new user with appropriate profile
    const userData = {
      phoneNumber,
      email,
      password: hashedPassword,
      fullName,
      role,
      completedOnboarding: true,
      emailVerified: false,
    };

    let newUser;

    if (role === 'customer') {
      newUser = await prisma.user.create({
        data: {
          ...userData,
          customerProfile: {
            create: {
              wallet: {
                create: {
                  balance: 0,
                  currency: 'NGN'
                }
              }
            }
          }
        },
        include: {
          customerProfile: {
            include: {
              wallet: true
            }
          }
        }
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          ...userData,
          barberProfile: {
            create: {
              specialties: [],
              hourlyRate: 0,
              isAvailable: true,
            }
          }
        },
        include: {
          barberProfile: true
        }
      });
    }

    // Generate token
    const token = generateToken({
      id: newUser.id,
      role
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      status: 'success',
      message: `${role === 'customer' ? 'Customer' : 'Barber'} registered successfully`,
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register user'
    });
  }
};

// Maintain backward compatibility with existing routes
export const registerCustomer = register;
export const registerBarber = register;

/**
 * Login user (customer or barber)
 */
export const login = async (req: Request, res: Response) => {
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
      role: user.role || 'customer'
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
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

// Maintain backward compatibility
export const loginCustomer = login;
export const loginBarber = login;

/**
 * Get user profile with onboarding status
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    const user = await prisma.user.findUnique({
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

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user profile without password
    const { password: _, ...userProfile } = user;

    const profileData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role?.toLowerCase() || 'customer',
      phoneNumber: user.phoneNumber,
      profileImage: user.profileImage,
      completedOnboarding: user.completedOnboarding,
      emailVerified: user.emailVerified,
      ...(user.customerProfile && { customerProfile: user.customerProfile }),
      ...(user.barberProfile && { barberProfile: user.barberProfile })
    };

    res.status(200).json({
      user: profileData
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
 * Complete user onboarding (transition to barber role if needed)
 */
export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;

    const { userType, ...data } = req.body;

    // Find existing user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        barberProfile: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    let updatedUser;

    if (userType === 'customer') {
      // Update user as customer
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'customer',
          completedOnboarding: true,
          ...(data.fullName && { fullName: data.fullName }),
          ...(data.profileImage !== undefined && { profileImage: data.profileImage }),
        },
        include: {
          customerProfile: {
            include: {
              wallet: true
            }
          }
        }
      });

      // Update customer profile if it exists
      if (existingUser.customerProfile) {
        await prisma.customerProfile.update({
          where: { userId },
          data: {
            ...(data.locationLat && data.locationLng && {
              locationLat: data.locationLat,
              locationLng: data.locationLng
            }),
            ...(data.bookingPreferences && {
              bookingPreferences: data.bookingPreferences
            })
          }
        });
      } else {
        // Create customer profile if it doesn't exist
        await prisma.customerProfile.create({
          data: {
            userId,
            ...(data.locationLat && data.locationLng && {
              locationLat: data.locationLat,
              locationLng: data.locationLng
            }),
            ...(data.bookingPreferences && {
              bookingPreferences: data.bookingPreferences
            }),
            wallet: {
              create: {
                balance: 0,
                currency: 'NGN'
              }
            }
          }
        });
      }

    } else if (userType === 'barber') {
      // Update user as barber
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role: 'barber',
          completedOnboarding: true,
          ...(data.fullName && { fullName: data.fullName }),
          ...(data.profileImage !== undefined && { profileImage: data.profileImage }),
        },
        include: {
          barberProfile: {
            include: {
              shop: true
            }
          }
        }
      });

      // Update or create barber profile
      if (existingUser.barberProfile) {
        await prisma.barberProfile.update({
          where: { userId },
          data: {
            specialties: data.specialties || [],
            hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : 0,
            bio: data.bio,
            experience: data.experience,
            isAvailable: true,
          }
        });
      } else {
        await prisma.barberProfile.create({
          data: {
            userId,
            specialties: data.specialties || [],
            hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : 0,
            bio: data.bio,
            experience: data.experience,
            isAvailable: true,
          }
        });
      }

      // Handle shop creation or joining
      if (data.isNewShop && data.shopName) {
        const barberProfile = await prisma.barberProfile.findUnique({ where: { userId } });
        
        const shop = await prisma.shop.create({
          data: {
            name: data.shopName,
            address: data.shopAddress || '',
            phoneNumber: data.shopPhone || '',
            description: data.shopDescription || '',
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
            },
            images: [],
            ownerId: barberProfile!.id
          }
        });

        // Associate barber with the shop
        await prisma.barberProfile.update({
          where: { userId },
          data: { shopId: shop.id }
        });
      } else if (data.shopId) {
        // Join existing shop
        await prisma.barberProfile.update({
          where: { userId },
          data: { shopId: data.shopId }
        });
      }

      // Generate new token with barber role
      const newToken = generateToken({
        id: userId,
        role: 'barber'
      });

      // Get updated user data
      const finalUser = await prisma.user.findUnique({
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
        message: 'Onboarding completed successfully',
        user: finalUser,
        newToken // Include new token for role change
      });
    }

    // Get final updated user data
    const finalUser = await prisma.user.findUnique({
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
      user: finalUser
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

    if (role !== 'customer' && role !== 'barber') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role specified'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({ 
      where: { email } 
    });

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
    const existingUser = await prisma.user.findFirst({ 
      where: { email } 
    });

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

    // Create new user with appropriate profile
    const userCreateData = {
      email,
      phoneNumber: userData.phoneNumber || `temp${Date.now()}`,
      fullName: userData.fullName || 'New User',
      password: hashedPassword,
      role,
      completedOnboarding: false,
      emailVerified: true,
    };

    let newUser;

    if (role === 'customer') {
      newUser = await prisma.user.create({
        data: {
          ...userCreateData,
          customerProfile: {
            create: {
              wallet: {
                create: {
                  balance: 0,
                  currency: 'NGN'
                }
              }
            }
          }
        },
        include: {
          customerProfile: {
            include: {
              wallet: true
            }
          }
        }
      });
    } else {
      newUser = await prisma.user.create({
        data: {
          ...userCreateData,
          barberProfile: {
            create: {
              specialties: userData.specialties || [],
              hourlyRate: userData.hourlyRate || 0,
              isAvailable: true,
            }
          }
        },
        include: {
          barberProfile: true
        }
      });
    }

    // Generate token
    const authToken = generateToken({
      id: newUser.id,
      role
    });

    // Send welcome email
    await sendWelcomeEmail(email, newUser.fullName, role);

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      status: 'success',
      message: `${role === 'customer' ? 'Customer' : 'Barber'} registered successfully`,
      data: {
        user: userWithoutPassword,
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

/**
 * Google OAuth login/signup
 */
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { code, role = 'customer' } = req.body;

    if (!code) {
      return res.status(400).json({
        status: 'error',
        message: 'Authorization code is required'
      });
    }

    if (role !== 'customer' && role !== 'barber') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role specified'
      });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      redirect_uri: config.google.redirectUri,
      grant_type: 'authorization_code'
    });

    const { access_token } = tokenResponse.data;

    // Get user info
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { 
      email, 
      name: fullName, 
      picture: profilePicture,
      email_verified: isEmailVerified
    } = userInfoResponse.data;

    if (!email || !isEmailVerified) {
      return res.status(400).json({
        status: 'error',
        message: 'Google account must have a verified email'
      });
    }

    let user;
    let isNewUser = false;

    // Check if user exists
    user = await prisma.user.findFirst({ 
      where: { email },
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

    if (!user) {
      // Create new user - only User table, no profiles (follow new pattern)
      const userCreateData = {
        email,
        phoneNumber: `g${Date.now().toString().slice(-10)}`,
        fullName: fullName || 'Google User',
        profileImage: profilePicture,
        password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
        role: null, // Role will be set during onboarding
        completedOnboarding: false,
        emailVerified: true,
      };

      user = await prisma.user.create({
        data: userCreateData,
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
      
      isNewUser = true;
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      role: user.role || role
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: 'success',
      message: isNewUser 
        ? `${role === 'customer' ? 'Customer' : 'Barber'} registered successfully with Google` 
        : 'Login successful with Google',
      data: {
        user: userWithoutPassword,
        token,
        isNewUser
      }
    });
  } catch (error) {
    console.error('Error with Google authentication:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate with Google'
    });
  }
};
