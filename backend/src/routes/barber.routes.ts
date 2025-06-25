import { Router, Request, Response } from 'express';
import {
  getProfile,
  updateProfile,
  getAppointments,
  updateAppointmentStatus,
  getEarnings
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

export default router;
