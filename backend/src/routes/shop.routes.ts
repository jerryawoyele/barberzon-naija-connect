import { Router, Request, Response } from 'express';
import {
  getAllShops,
  getShopDetails,
  getShopServices,
  getShopBarbers
} from '../controllers/shop.controller';

const router = Router();

// Get all shops (public route, no authentication required)
router.get('/', async (req: Request, res: Response) => {
  await getAllShops(req, res);
});

// Get shop details (public route, no authentication required)
router.get('/:shopId', async (req: Request, res: Response) => {
  await getShopDetails(req, res);
});

// Get shop services (public route, no authentication required)
router.get('/:shopId/services', async (req: Request, res: Response) => {
  await getShopServices(req, res);
});

// Get shop barbers (public route, no authentication required)
router.get('/:shopId/barbers', async (req: Request, res: Response) => {
  await getShopBarbers(req, res);
});

export default router;
