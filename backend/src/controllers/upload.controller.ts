import { Request, Response } from 'express';
import { upload, deleteImage, extractPublicId } from '../config/cloudinary';

/**
 * Upload shop profile image
 */
export const uploadShopImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No image file provided'
      });
    }

    // Extract the uploaded file information
    const file = req.file as any;
    const imageUrl = file.path; // Cloudinary URL
    const publicId = file.filename; // Cloudinary public ID

    console.log(`📸 Image uploaded successfully for user ${userId}:`, {
      url: imageUrl,
      publicId: publicId
    });

    return res.status(200).json({
      status: 'success',
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        publicId: publicId
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to upload image'
    });
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteShopImage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { imageUrl } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    if (!imageUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Image URL is required'
      });
    }

    // Extract public ID from Cloudinary URL
    const publicId = extractPublicId(imageUrl);
    
    if (!publicId) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Cloudinary URL'
      });
    }

    // Delete image from Cloudinary
    await deleteImage(publicId);

    console.log(`🗑️ Image deleted successfully for user ${userId}:`, publicId);

    return res.status(200).json({
      status: 'success',
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete image'
    });
  }
};

/**
 * Validate image URL (for external URLs)
 */
export const validateImageUrl = async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Image URL is required'
      });
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid URL format'
      });
    }

    // Check if URL is accessible (basic validation)
    // You could add more sophisticated validation here if needed

    return res.status(200).json({
      status: 'success',
      message: 'Image URL is valid',
      data: {
        url: imageUrl
      }
    });
  } catch (error) {
    console.error('Error validating image URL:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to validate image URL'
    });
  }
};
