import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for profile images
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'barberzon/shop-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    public_id: (req: any, file: any) => {
      // Generate unique filename
      return `shop-${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    }
  }
});

// Configure multer with Cloudinary storage
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper function to delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️ Deleted image: ${publicId}`);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

// Helper function to extract public ID from Cloudinary URL
export const extractPublicId = (url: string): string | null => {
  try {
    const regex = /\/v\d+\/(.+)\./;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

export default cloudinary;
