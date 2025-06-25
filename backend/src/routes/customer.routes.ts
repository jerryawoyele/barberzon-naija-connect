import { Router, Request, Response } from 'express';
import {
  getProfile,
  updateProfile,
  getBookings,
  addFavoriteShop,
  removeFavoriteShop,
  getWallet
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all customer routes
router.use(authenticate as any);
router.use(authorize(['customer']) as any);

// Profile routes
router.get('/profile', async (req: Request, res: Response) => {
  await getProfile(req, res);
});

router.put('/profile', async (req: Request, res: Response) => {
  await updateProfile(req, res);
});

// Booking routes
router.get('/bookings', async (req: Request, res: Response) => {
  await getBookings(req, res);
});

// Favorite shop routes
router.post('/favorites', async (req: Request, res: Response) => {
  await addFavoriteShop(req, res);
});

router.delete('/favorites/:shopId', async (req: Request, res: Response) => {
  await removeFavoriteShop(req, res);
});

// Wallet routes
router.get('/wallet', async (req: Request, res: Response) => {
  await getWallet(req, res);
});

export default router;
