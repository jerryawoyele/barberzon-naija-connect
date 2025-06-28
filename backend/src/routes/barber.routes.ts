import { Router, Request, Response } from 'express';
import {
  getProfile,
  updateProfile,
  getAppointments,
  updateAppointmentStatus,
  getEarnings,
  getDashboardData,
  updateStatus,
  getCustomers,
  getTransactions,
  getSettings,
  updateShop,
  getPayoutAccount,
  upsertPayoutAccount,
  getUpcomingPayouts,
  updateBusinessHours
} from '../controllers/barber.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all barber routes
router.use(authenticate as any);
router.use(authorize(['barber']) as any);

// Profile routes
router.get('/profile', async (req: Request, res: Response) => {
  await getProfile(req, res);
});

router.put('/profile', async (req: Request, res: Response) => {
  await updateProfile(req, res);
});

// Status routes
router.patch('/status', async (req: Request, res: Response) => {
  await updateStatus(req, res);
});

// Appointment routes
router.get('/appointments', async (req: Request, res: Response) => {
  await getAppointments(req, res);
});

router.patch('/appointments/:bookingId/status', async (req: Request, res: Response) => {
  await updateAppointmentStatus(req, res);
});

// Earnings routes
router.get('/earnings', async (req: Request, res: Response) => {
  await getEarnings(req, res);
});

// Dashboard routes
router.get('/dashboard', async (req: Request, res: Response) => {
  await getDashboardData(req, res);
});

// Customer routes
router.get('/customers', async (req: Request, res: Response) => {
  await getCustomers(req, res);
});

// Transaction routes
router.get('/transactions', async (req: Request, res: Response) => {
  await getTransactions(req, res);
});

// Settings routes
router.get('/settings', async (req: Request, res: Response) => {
  await getSettings(req, res);
});

// Shop update routes
router.put('/shop', async (req: Request, res: Response) => {
  await updateShop(req, res);
});

// Payout account routes
router.get('/payout-account', async (req: Request, res: Response) => {
  await getPayoutAccount(req, res);
});

router.put('/payout-account', async (req: Request, res: Response) => {
  await upsertPayoutAccount(req, res);
});

router.get('/upcoming-payouts', async (req: Request, res: Response) => {
  await getUpcomingPayouts(req, res);
});

// Business hours routes
router.put('/business-hours', async (req: Request, res: Response) => {
  await updateBusinessHours(req, res);
});

export default router;
