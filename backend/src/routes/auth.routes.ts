import { Router, Request, Response } from 'express';
import {
  registerCustomer,
  loginCustomer,
  registerBarber,
  loginBarber,
  requestEmailVerification,
  verifyEmail,
  googleAuth
} from '../controllers/auth.controller';

const router = Router();

// Customer authentication routes
router.post('/register/customer', async (req: Request, res: Response) => {
  await registerCustomer(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
  await loginCustomer(req, res);
});

// Barber authentication routes
router.post('/register/barber', async (req: Request, res: Response) => {
  await registerBarber(req, res);
});

router.post('/barber/login', async (req: Request, res: Response) => {
  await loginBarber(req, res);
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

export default router;
