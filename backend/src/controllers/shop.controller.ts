import { Request, Response } from 'express';
import { prisma } from '../app';

/**
 * Get all shops
 */
export const getAllShops = async (req: Request, res: Response) => {
  try {
    const { search, lat, lng, radius } = req.query;
    
    // Build filter based on query parameters
    const filter: {
      name?: {
        contains: string;
        mode: 'insensitive';
      };
    } = {};
    
    // Search by name
    if (search) {
      filter.name = {
        contains: search as string,
        mode: 'insensitive'
      };
    }
    
    // Get all shops with their barbers
    const shops = await prisma.shop.findMany({
      where: filter,
      include: {
        barbers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        services: true
      }
    });
    
    // If location is provided, calculate distance and sort by proximity
    if (lat && lng) {
      const userLat = parseFloat(lat as string);
      const userLng = parseFloat(lng as string);
      const maxRadius = radius ? parseFloat(radius as string) : 10; // Default 10km radius
      
      // Calculate distance for each shop and transform barber data
      const shopsWithDistance = shops.map(shop => {
        const distance = calculateDistance(
          userLat, 
          userLng, 
          shop.locationLat, 
          shop.locationLng
        );
        
        return {
          ...shop,
          distance,
          barbers: shop.barbers.map(barber => ({
            id: barber.user.id,
            fullName: barber.user.fullName,
            profileImage: barber.user.profileImage,
            specialties: barber.specialties,
            rating: barber.rating,
            totalReviews: barber.totalReviews,
            isAvailable: barber.isAvailable
          }))
        };
      });
      
      // Filter shops within radius and sort by distance
      const nearbyShops = shopsWithDistance
        .filter(shop => shop.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance);
      
      return res.status(200).json({
        status: 'success',
        data: nearbyShops
      });
    }
    
    // Transform barber data for shops without distance calculation
    const transformedShops = shops.map(shop => ({
      ...shop,
      barbers: shop.barbers.map(barber => ({
        id: barber.user.id,
        fullName: barber.user.fullName,
        profileImage: barber.user.profileImage,
        specialties: barber.specialties,
        rating: barber.rating,
        totalReviews: barber.totalReviews,
        isAvailable: barber.isAvailable
      }))
    }));
    
    return res.status(200).json({
      status: 'success',
      data: transformedShops
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch shops'
    });
  }
};

/**
 * Get shop details
 */
export const getShopDetails = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        barbers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        services: {
          where: {
            isActive: true
          }
        }
      }
    });
    
    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'Shop not found'
      });
    }
    
    // Parse opening hours from JSON or provide defaults
    let openingHours = '09:00';
    let closingHours = '18:00';
    
    if (shop.openingHours && typeof shop.openingHours === 'object') {
      // If openingHours is stored as JSON with day-specific hours
      const hours = shop.openingHours as any;
      if (hours.monday && !hours.monday.closed) {
        openingHours = hours.monday.open || '09:00';
        closingHours = hours.monday.close || '18:00';
      }
    }
    
    // Transform the data to match frontend expectations
    const transformedShop = {
      ...shop,
      openingHours,
      closingHours,
      barbers: shop.barbers.map(barber => ({
        id: barber.user.id,
        fullName: barber.user.fullName,
        profileImage: barber.user.profileImage,
        specialties: barber.specialties,
        hourlyRate: barber.hourlyRate,
        rating: barber.rating,
        totalReviews: barber.totalReviews,
        isAvailable: barber.isAvailable
      })),
      services: shop.services.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.durationMinutes
      }))
    };
    
    return res.status(200).json({
      status: 'success',
      data: transformedShop
    });
  } catch (error) {
    console.error('Error fetching shop details:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch shop details'
    });
  }
};

/**
 * Get shop services
 */
export const getShopServices = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true,
        name: true,
        services: {
          where: {
            isActive: true
          }
        }
      }
    });
    
    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'Shop not found'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: shop.services
    });
  } catch (error) {
    console.error('Error fetching shop services:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch shop services'
    });
  }
};

/**
 * Get shop barbers
 */
export const getShopBarbers = async (req: Request, res: Response) => {
  try {
    const { shopId } = req.params;
    
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true,
        name: true,
        barbers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profileImage: true
              }
            }
          }
        }
      }
    });
    
    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'Shop not found'
      });
    }
    
    // Transform barber data to match frontend expectations
    const transformedBarbers = shop.barbers.map(barber => ({
      id: barber.user.id,
      fullName: barber.user.fullName,
      profileImage: barber.user.profileImage,
      specialties: barber.specialties,
      hourlyRate: barber.hourlyRate,
      rating: barber.rating,
      totalReviews: barber.totalReviews,
      isAvailable: barber.isAvailable
    }));
    
    return res.status(200).json({
      status: 'success',
      data: transformedBarbers
    });
  } catch (error) {
    console.error('Error fetching shop barbers:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch shop barbers'
    });
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(2));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
