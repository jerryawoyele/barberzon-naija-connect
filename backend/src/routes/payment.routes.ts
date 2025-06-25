import { Router, Request, Response } from 'express';
import {
  getWalletBalance,
  fundWallet,
  payForBooking,
  getTransactionHistory,
  verifyPayment,
  handlePaystackWebhook
} from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all protected payment routes
router.use(authenticate as any);

// Get wallet balance
router.get('/wallet/balance', async (req: Request, res: Response) => {
  await getWalletBalance(req, res);
});

// Fund wallet (customer only)
router.post('/wallet/fund', async (req: Request, res: Response) => {
  await fundWallet(req, res);
});

// Pay for booking (customer only)
router.post('/booking/pay', async (req: Request, res: Response) => {
  await payForBooking(req, res);
});

// Get transaction history
router.get('/transactions', async (req: Request, res: Response) => {
  await getTransactionHistory(req, res);
});

// Verify payment
router.get('/verify/:reference', async (req: Request, res: Response) => {
  await verifyPayment(req, res);
});

// Create a separate webhook route that doesn't use authentication
const webhookRouter = Router();

// Paystack webhook - no authentication required
webhookRouter.post('/webhook', async (req: Request, res: Response) => {
  await handlePaystackWebhook(req, res);
});

export { webhookRouter };
export default router;
