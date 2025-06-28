import { Router, Request, Response } from 'express';
import { getBarberProfile } from '../controllers/public.controller';

const router = Router();

// Public barber profile route - no authentication required
router.get('/barbers/:barberId/profile', async (req: Request, res: Response) => {
  await getBarberProfile(req, res);
});

export default router;
