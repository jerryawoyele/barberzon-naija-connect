import { Router, Request, Response } from 'express';
import { upload } from '../config/cloudinary';
import { uploadShopImage, deleteShopImage, validateImageUrl } from '../controllers/upload.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all upload routes
router.use(authenticate as any);
router.use(authorize(['barber']) as any);

// Upload shop profile image
router.post('/shop-image', upload.single('image'), async (req: Request, res: Response) => {
  await uploadShopImage(req, res);
});

// Delete shop image
router.delete('/shop-image', async (req: Request, res: Response) => {
  await deleteShopImage(req, res);
});

// Validate image URL
router.post('/validate-url', async (req: Request, res: Response) => {
  await validateImageUrl(req, res);
});

export default router;
