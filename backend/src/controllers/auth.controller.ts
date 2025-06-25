import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../app';
import { generateToken } from '../utils/jwt.utils';
import { generateVerificationToken, sendVerificationEmail, verifyEmailToken, sendWelcomeEmail } from '../utils/email.resend.utils';
import axios from 'axios';
import { config } from '../config';

/**
 * Register a new customer
 */
export const registerCustomer = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.customer.findFirst({
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

    // Create new customer
    const newCustomer = await prisma.customer.create({
      data: {
        phoneNumber,
        email,
        password: hashedPassword,
        fullName,
        // Create a wallet for the customer
        wallet: {
          create: {
            balance: 0,
            currency: 'NGN'
          }
        }
      }
    });

    // Generate token
    const token = generateToken({
      id: newCustomer.id,
      role: 'customer'
    });

    // Return user data without password
    const { password: _, ...customerData } = newCustomer;

    return res.status(201).json({
      status: 'success',
      message: 'Customer registered successfully',
      data: {
        user: customerData,
        token
      }
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register customer'
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
    const existingUser = role === 'customer'
      ? await prisma.customer.findFirst({ where: { email } })
      : await prisma.barber.findFirst({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: `${role === 'customer' ? 'Customer' : 'Barber'} with this email already exists`
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
    const existingUser = role === 'customer'
      ? await prisma.customer.findFirst({ where: { email } })
      : await prisma.barber.findFirst({ where: { email } });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: `${role === 'customer' ? 'Customer' : 'Barber'} with this email already exists`
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

    let newUser;

    if (role === 'customer') {
      // Create new customer
      newUser = await prisma.customer.create({
        data: {
          email,
          password: hashedPassword,
          fullName: userData.fullName || 'New Customer',
          phoneNumber: userData.phoneNumber || '',
          // Create a wallet for the customer
          wallet: {
            create: {
              balance: 0,
              currency: 'NGN'
            }
          }
        }
      });
    } else {
      // Create new barber with a default shop
      // First, find or create a default shop
      let defaultShop = await prisma.shop.findFirst({
        where: { name: 'Default Shop' }
      });
      
      if (!defaultShop) {
        defaultShop = await prisma.shop.create({
          data: {
            name: 'Default Shop',
            address: 'To be updated',
            phoneNumber: '00000000000',
            ownerId: 'system',
            locationLat: 0,
            locationLng: 0,
            openingHours: {}
          }
        });
      }
      
      // Create new barber
      newUser = await prisma.barber.create({
        data: {
          email,
          password: hashedPassword,
          fullName: userData.fullName || 'New Barber',
          phoneNumber: userData.phoneNumber || '',
          isAvailable: true,
          hourlyRate: userData.hourlyRate || 0,
          specialties: userData.specialties || [],
          shopId: defaultShop.id
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
    const { password: _, ...userData2 } = newUser;

    return res.status(201).json({
      status: 'success',
      message: `${role === 'customer' ? 'Customer' : 'Barber'} registered successfully`,
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

    const { access_token, id_token } = tokenResponse.data;

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
    if (role === 'customer') {
      user = await prisma.customer.findFirst({ where: { email } });

      if (!user) {
        // Create new customer
        user = await prisma.customer.create({
          data: {
            email,
            fullName: fullName || 'Google User',
            profileImage: profilePicture,
            // Generate a random phone number for Google users
            phoneNumber: `g${Date.now().toString().slice(-10)}`,
            // Use a random password for Google users
            password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
            // Create a wallet for the customer
            wallet: {
              create: {
                balance: 0,
                currency: 'NGN'
              }
            }
          }
        });
        isNewUser = true;
      }
    } else {
      user = await prisma.barber.findFirst({ where: { email } });

      if (!user) {
        // Find or create a default shop
        let defaultShop = await prisma.shop.findFirst({
          where: { name: 'Default Shop' }
        });
        
        if (!defaultShop) {
          defaultShop = await prisma.shop.create({
            data: {
              name: 'Default Shop',
              address: 'To be updated',
              phoneNumber: '00000000000',
              ownerId: 'system',
              locationLat: 0,
              locationLng: 0,
              openingHours: {}
            }
          });
        }
        
        // Create new barber
        user = await prisma.barber.create({
          data: {
            email,
            fullName: fullName || 'Google User',
            profileImage: profilePicture,
            // Generate a random phone number for Google users
            phoneNumber: `g${Date.now().toString().slice(-10)}`,
            // Use a random password for Google users
            password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10),
            isAvailable: true,
            hourlyRate: 0, // Default hourly rate
            specialties: [], // Default specialties
            shopId: defaultShop.id
          }
        });
        isNewUser = true;
      }
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      role
    });

    return res.status(200).json({
      status: 'success',
      message: isNewUser 
        ? `${role === 'customer' ? 'Customer' : 'Barber'} registered successfully with Google` 
        : 'Login successful with Google',
      data: {
        user,
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

/**
 * Register a new barber
 */
export const registerBarber = async (req: Request, res: Response) => {
  try {
    const { 
      phoneNumber, 
      email, 
      password, 
      fullName, 
      shopId,
      specialties,
      hourlyRate
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.barber.findFirst({
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
        message: 'Barber with this phone number or email already exists'
      });
    }

    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId }
    });

    if (!shop) {
      return res.status(400).json({
        status: 'error',
        message: 'Shop not found'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new barber
    const newBarber = await prisma.barber.create({
      data: {
        phoneNumber,
        email,
        password: hashedPassword,
        fullName,
        shopId,
        specialties,
        hourlyRate,
        isAvailable: true
      }
    });

    // Generate token
    const token = generateToken({
      id: newBarber.id,
      role: 'barber'
    });

    // Return user data without password
    const { password: _, ...barberData } = newBarber;

    return res.status(201).json({
      status: 'success',
      message: 'Barber registered successfully',
      data: {
        user: barberData,
        token
      }
    });
  } catch (error) {
    console.error('Error registering barber:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register barber'
    });
  }
};

/**
 * Login a customer
 */
export const loginCustomer = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    console.log('Login attempt:', { phoneNumber });

    // Check if the input looks like an email
    const isEmail = phoneNumber.includes('@');
    
    console.log('Is email?', isEmail);

    // Find the customer by phoneNumber or email
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phoneNumber },
          { email: phoneNumber } // Try to find by email if phoneNumber is actually an email
        ]
      }
    });

    if (!customer) {
      console.log('Customer not found');
      
      // Log more details to help debug
      if (isEmail) {
        const emailCheck = await prisma.customer.findFirst({
          where: { email: phoneNumber }
        });
        console.log('Email check result:', emailCheck ? 'Found' : 'Not found');
      } else {
        const phoneCheck = await prisma.customer.findFirst({
          where: { phoneNumber }
        });
        console.log('Phone check result:', phoneCheck ? 'Found' : 'Not found');
      }
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    console.log('Customer found:', { id: customer.id });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

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
      id: customer.id,
      role: 'customer'
    });

    // Return user data without password
    const { password: _, ...customerData } = customer;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: customerData,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in customer:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to login'
    });
  }
};

/**
 * Login a barber
 */
export const loginBarber = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, password } = req.body;

    console.log('Barber login attempt:', { phoneNumber });

    // Check if the input looks like an email
    const isEmail = phoneNumber.includes('@');
    
    console.log('Is email?', isEmail);

    // Find the barber by phoneNumber or email
    const barber = await prisma.barber.findFirst({
      where: {
        OR: [
          { phoneNumber },
          { email: phoneNumber } // Try to find by email if phoneNumber is actually an email
        ]
      }
    });

    if (!barber) {
      console.log('Barber not found');
      
      // Log more details to help debug
      if (isEmail) {
        const emailCheck = await prisma.barber.findFirst({
          where: { email: phoneNumber }
        });
        console.log('Email check result:', emailCheck ? 'Found' : 'Not found');
      } else {
        const phoneCheck = await prisma.barber.findFirst({
          where: { phoneNumber }
        });
        console.log('Phone check result:', phoneCheck ? 'Found' : 'Not found');
      }
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    console.log('Barber found:', { id: barber.id });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, barber.password);

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
      id: barber.id,
      role: 'barber'
    });

    // Return user data without password
    const { password: _, ...barberData } = barber;

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: barberData,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in barber:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to login'
    });
  }
};
