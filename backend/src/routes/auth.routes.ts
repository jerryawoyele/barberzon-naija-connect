import { Router, Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  requestEmailVerification,
  verifyEmail,
  getUserProfile,
  completeOnboarding
} from '../controllers/auth-unified.controller';
import { googleAuth } from '../controllers/auth.controller'; // Keep Google auth from old controller for now

const router = Router();

// Unified registration - only creates User table, no profiles
router.post('/register', async (req: Request, res: Response) => {
  await registerUser(req, res);
});

// Backward compatibility routes - redirect to unified endpoints
router.post('/register/customer', async (req: Request, res: Response) => {
  await registerUser(req, res);
});

router.post('/register/barber', async (req: Request, res: Response) => {
  await registerUser(req, res);
});

// Unified login
router.post('/login', async (req: Request, res: Response) => {
  await loginUser(req, res);
});

// Backward compatibility
router.post('/barber/login', async (req: Request, res: Response) => {
  await loginUser(req, res);
});

// Email verification routes
router.post('/verify/request', async (req: Request, res: Response) => {
  await requestEmailVerification(req, res);
});

router.post('/verify/confirm', async (req: Request, res: Response) => {
  await verifyEmail(req, res);
});

// Google OAuth routes
router.post('/google', async (req: Request, res: Response) => {
  await googleAuth(req, res);
});

// For backward compatibility
router.post('/google/customer', async (req: Request, res: Response) => {
  req.body.role = 'customer';
  await googleAuth(req, res);
});

router.post('/google/barber', async (req: Request, res: Response) => {
  req.body.role = 'barber';
  await googleAuth(req, res);
});

// Profile routes
router.get('/profile', async (req: Request, res: Response) => {
  await getUserProfile(req, res);
});

// Onboarding routes
router.post('/onboarding/complete', async (req: Request, res: Response) => {
  await completeOnboarding(req, res);
});

// Test endpoint to create a shop for existing barbers
router.post('/create-test-shop', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.id;
    const userRole = decoded.role;

    if (userRole !== 'barber') {
      return res.status(403).json({ message: 'Only barbers can create shops' });
    }

    // Get barber profile
    const barberProfile = await require('../app').prisma.barberProfile.findUnique({
      where: { userId },
      include: { ownedShops: true }
    });

    if (!barberProfile) {
      return res.status(404).json({ message: 'Barber profile not found' });
    }

    // Check if barber already owns a shop
    if (barberProfile.ownedShops.length > 0) {
      return res.status(400).json({ message: 'You already own a shop' });
    }

    // Create a test shop
    const shop = await require('../app').prisma.shop.create({
      data: {
        name: 'My Barbershop',
        address: '123 Test Street, Lagos, Nigeria',
        phoneNumber: '+234-123-456-7890',
        ownerId: barberProfile.id, // Link to barber profile, not user
        locationLat: 6.5244,
        locationLng: 3.3792,
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
    await require('../app').prisma.barberProfile.update({
      where: { id: barberProfile.id },
      data: { shopId: shop.id }
    });

    res.status(201).json({
      message: 'Test shop created successfully',
      shop
    });
  } catch (error) {
    console.error('Error creating test shop:', error);
    res.status(500).json({ message: 'Failed to create shop' });
  }
});

export default router;
