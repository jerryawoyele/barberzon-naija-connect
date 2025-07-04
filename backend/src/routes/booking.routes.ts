import { Router, Request, Response } from 'express';
import {
  createBooking,
  getBookingDetails,
  cancelBooking,
  rateBooking,
  getUserBookings,
  confirmBooking,
  completeBooking
} from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all booking routes
router.use(authenticate as any);

// Get user's bookings (both customer and barber)
router.get('/user', async (req: Request, res: Response) => {
  await getUserBookings(req, res);
});

// Create booking (customer only)
router.post('/', async (req: Request, res: Response) => {
  await createBooking(req, res);
});

// Get booking details (both customer and barber)
router.get('/:bookingId', async (req: Request, res: Response) => {
  await getBookingDetails(req, res);
});

// Cancel booking (both customer and barber)
router.patch('/:bookingId/cancel', async (req: Request, res: Response) => {
  await cancelBooking(req, res);
});

// Confirm booking (barber only)
router.patch('/:bookingId/confirm', async (req: Request, res: Response) => {
  await confirmBooking(req, res);
});

// Complete booking (barber only)
router.patch('/:bookingId/complete', async (req: Request, res: Response) => {
  await completeBooking(req, res);
});

// Rate booking (customer only)
router.post('/:bookingId/rate', async (req: Request, res: Response) => {
  await rateBooking(req, res);
});

export default router;
