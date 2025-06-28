import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  searchShops,
  createShop,
  submitJoinRequest,
  getJoinRequests,
  respondToJoinRequest,
  getMyJoinRequests
} from '../controllers/barberJoinRequest.controller';

const router = Router();

// All routes require authentication
router.use(authenticate as any);

/**
 * @route GET /api/barber-requests/shops/search
 * @desc Search available barbershops
 * @access Private (Barber)
 */
router.get('/shops/search', async (req: Request, res: Response) => {
  await searchShops(req, res);
});

/**
 * @route POST /api/barber-requests/shops
 * @desc Create a new barbershop
 * @access Private (Barber)
 */
router.post('/shops', async (req: Request, res: Response) => {
  await createShop(req, res);
});

/**
 * @route POST /api/barber-requests/submit
 * @desc Submit join request to a barbershop
 * @access Private (Barber)
 */
router.post('/submit', async (req: Request, res: Response) => {
  await submitJoinRequest(req, res);
});

/**
 * @route GET /api/barber-requests/incoming
 * @desc Get join requests for shop owner
 * @access Private (Shop Owner)
 */
router.get('/incoming', async (req: Request, res: Response) => {
  await getJoinRequests(req, res);
});

/**
 * @route PUT /api/barber-requests/:requestId/respond
 * @desc Respond to join request (approve/reject)
 * @access Private (Shop Owner)
 */
router.put('/:requestId/respond', async (req: Request, res: Response) => {
  await respondToJoinRequest(req, res);
});

/**
 * @route GET /api/barber-requests/my-requests
 * @desc Get barber's own join request status
 * @access Private (Barber)
 */
router.get('/my-requests', async (req: Request, res: Response) => {
  await getMyJoinRequests(req, res);
});

export default router;
