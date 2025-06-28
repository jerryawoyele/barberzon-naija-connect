import { Request, Response } from 'express';
import { prisma } from '../app';
import { sendNotification } from '../utils/notification.utils';

/**
 * Search available barbershops
 */
export const searchShops = async (req: Request, res: Response) => {
  try {
    const { query, latitude, longitude, radius = 10 } = req.query;

    let whereClause: any = {
      isVerified: true
    };

    // Add text search if query provided
    if (query && typeof query === 'string') {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }

    const shops = await prisma.shop.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        barbers: {
          select: {
            id: true,
            status: true,
            seatNumber: true,
            user: {
              select: {
                fullName: true
              }
            }
          }
        },
        _count: {
          select: {
            barbers: true,
            bookings: true
          }
        }
      },
      orderBy: [
        { rating: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    // Calculate available seats and distance for each shop
    const shopsWithMetadata = shops.map(shop => {
      const availableSeats = shop.totalSeats - shop.barbers.length;
      let distance = null;

      // Calculate distance if coordinates provided
      if (latitude && longitude && shop.locationLat && shop.locationLng) {
        const lat1 = parseFloat(latitude as string);
        const lon1 = parseFloat(longitude as string);
        const lat2 = shop.locationLat;
        const lon2 = shop.locationLng;

        // Haversine formula for distance calculation
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance = R * c;
      }

      return {
        ...shop,
        availableSeats,
        distance,
        totalBookings: shop._count.bookings
      };
    });

    // Filter by radius if coordinates provided
    let filteredShops = shopsWithMetadata;
    if (latitude && longitude && radius) {
      filteredShops = shopsWithMetadata.filter(shop => 
        shop.distance === null || shop.distance <= parseFloat(radius as string)
      );
    }

    // Sort by distance if coordinates provided
    if (latitude && longitude) {
      filteredShops.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

      return res.status(200).json({
        status: 'success',
        data: filteredShops.map(shop => ({
          id: shop.id,
          name: shop.name,
          description: shop.description,
          address: shop.address,
          owner: shop.owner.user.fullName,
          ownerId: shop.owner.id,
          totalSeats: shop.totalSeats,
          availableSeats: shop.availableSeats,
          occupiedSeats: shop.barbers.length,
          rating: shop.rating,
          totalReviews: shop.totalReviews,
          totalBookings: shop.totalBookings,
          distance: shop.distance ? `${shop.distance.toFixed(1)}km` : null,
          images: shop.images,
          openingHours: shop.openingHours
        }))
      });
  } catch (error) {
    console.error('Error searching shops:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to search shops'
    });
  }
};

/**
 * Create a new barbershop
 */
export const createShop = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const {
      name,
      description,
      address,
      phoneNumber,
      email,
      totalSeats,
      locationLat,
      locationLng,
      openingHours
    } = req.body;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId: barberId },
      include: { ownedShops: true }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    // Check if barber already owns a shop
    if (barberProfile.ownedShops.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'You already own a barbershop'
      });
    }

    // Create the shop
    const shop = await prisma.shop.create({
      data: {
        ownerId: barberProfile.id,
        name,
        description,
        address,
        phoneNumber,
        email,
        totalSeats: totalSeats || 4,
        locationLat: locationLat || 0,
        locationLng: locationLng || 0,
        openingHours: openingHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '10:00', close: '16:00', closed: false }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        }
      }
    });

    // Update barber to be associated with this shop
    await prisma.barberProfile.update({
      where: { id: barberProfile.id },
      data: {
        shopId: shop.id,
        isSolo: false,
        seatNumber: 1 // Owner gets seat 1
      }
    });

    // Create shop seats
    const seatPromises = [];
    for (let i = 1; i <= totalSeats; i++) {
      seatPromises.push(
        prisma.shopSeat.create({
          data: {
            shopId: shop.id,
            seatNumber: i,
            barberId: i === 1 ? barberProfile.id : null // Assign owner to seat 1
          }
        })
      );
    }
    await Promise.all(seatPromises);

    return res.status(201).json({
      status: 'success',
      message: 'Barbershop created successfully',
      data: shop
    });
  } catch (error) {
    console.error('Error creating shop:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create barbershop'
    });
  }
};

/**
 * Submit join request to a barbershop
 */
export const submitJoinRequest = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const { shopId, message, seatNumber } = req.body;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Check if barber already belongs to a shop
    const barber = await prisma.barberProfile.findUnique({
      where: { userId: barberId },
      include: { shop: true, user: true }
    });

    if (!barber) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    if (barber?.shopId) {
      return res.status(400).json({
        status: 'error',
        message: 'You are already associated with a barbershop'
      });
    }

    // Check if shop exists
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        owner: true,
        barbers: true
      }
    });

    if (!shop) {
      return res.status(404).json({
        status: 'error',
        message: 'Barbershop not found'
      });
    }

    // Check if shop has available seats
    if (shop.barbers.length >= shop.totalSeats) {
      return res.status(400).json({
        status: 'error',
        message: 'This barbershop is currently full'
      });
    }

    // Check if request already exists
    const existingRequest = await prisma.barberJoinRequest.findUnique({
      where: {
        barberId_shopId: {
          barberId: barber.id, // Use barber profile ID
          shopId
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        status: 'error',
        message: 'You have already submitted a request to this barbershop'
      });
    }

    // Create join request
    const joinRequest = await prisma.barberJoinRequest.create({
      data: {
        barberId: barber.id, // Use barber profile ID
        shopId,
        message,
        seatNumber,
        status: 'pending'
      },
      include: {
        barber: {
          select: {
            id: true,
            specialties: true,
            rating: true,
            totalReviews: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            address: true
          }
        }
      }
    });

    // Send notification to shop owner
    await sendNotification(
      shop.ownerId,
      'barber_join_request',
      'New Barber Join Request',
      `${barber?.user.fullName} wants to join your barbershop "${shop.name}"`,
      {
        requestId: joinRequest.id,
        barberId: barberId,
        shopId: shopId,
        barberName: barber?.user.fullName,
        shopName: shop.name
      }
    );

    return res.status(201).json({
      status: 'success',
      message: 'Join request submitted successfully',
      data: joinRequest
    });
  } catch (error) {
    console.error('Error submitting join request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to submit join request'
    });
  }
};

/**
 * Get join requests for shop owner
 */
export const getJoinRequests = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const { status } = req.query;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId: barberId },
      include: { ownedShops: true }
    });

    if (!barberProfile || barberProfile.ownedShops.length === 0) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not own any barbershops'
      });
    }

    const ownedShops = barberProfile.ownedShops;

    const shopIds = ownedShops.map(shop => shop.id);

    let whereClause: any = {
      shopId: { in: shopIds }
    };

    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    const joinRequests = await prisma.barberJoinRequest.findMany({
      where: whereClause,
      include: {
        barber: {
          select: {
            id: true,
            specialties: true,
            rating: true,
            totalReviews: true,
            user: {
              select: {
                fullName: true,
                profileImage: true,
                phoneNumber: true,
                email: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            totalSeats: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      status: 'success',
      data: joinRequests
    });
  } catch (error) {
    console.error('Error getting join requests:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get join requests'
    });
  }
};

/**
 * Respond to join request (approve/reject)
 */
export const respondToJoinRequest = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;
    const { requestId } = req.params;
    const { action, seatNumber } = req.body; // action: 'approve' | 'reject'

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Find the join request
    const joinRequest = await prisma.barberJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        shop: {
          include: {
            barbers: true
          }
        },
        barber: true
      }
    });

    if (!joinRequest) {
      return res.status(404).json({
        status: 'error',
        message: 'Join request not found'
      });
    }

    // Get barber profile to check ownership
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId: barberId }
    });

    if (!barberProfile || joinRequest.shop.ownerId !== barberProfile.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only respond to requests for your own barbershops'
      });
    }

    // Check if request is still pending
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({
        status: 'error',
        message: 'This request has already been processed'
      });
    }

    if (action === 'approve') {
      // Check if shop has available seats
      if (joinRequest.shop.barbers.length >= joinRequest.shop.totalSeats) {
        return res.status(400).json({
          status: 'error',
          message: 'Barbershop is currently full'
        });
      }

      // Find available seat number
      let assignedSeatNumber = seatNumber;
      if (!assignedSeatNumber) {
        const occupiedSeats = joinRequest.shop.barbers.map(b => b.seatNumber).filter(Boolean);
        for (let i = 1; i <= joinRequest.shop.totalSeats; i++) {
          if (!occupiedSeats.includes(i)) {
            assignedSeatNumber = i;
            break;
          }
        }
      }

      // Update barber to join the shop
      await prisma.barberProfile.update({
        where: { id: joinRequest.barberId },
        data: {
          shopId: joinRequest.shopId,
          isSolo: false,
          seatNumber: assignedSeatNumber
        }
      });

      // Update seat assignment
      await prisma.shopSeat.upsert({
        where: {
          shopId_seatNumber: {
            shopId: joinRequest.shopId,
            seatNumber: assignedSeatNumber
          }
        },
        update: {
          barberId: joinRequest.barberId
        },
        create: {
          shopId: joinRequest.shopId,
          seatNumber: assignedSeatNumber,
          barberId: joinRequest.barberId
        }
      });

      // Send approval notification
      await sendNotification(
        joinRequest.barberId,
        'join_request_approved',
        'Join Request Approved!',
        `Your request to join "${joinRequest.shop.name}" has been approved. You've been assigned seat ${assignedSeatNumber}.`,
        {
          shopId: joinRequest.shopId,
          shopName: joinRequest.shop.name,
          seatNumber: assignedSeatNumber
        }
      );
    } else if (action === 'reject') {
      // Send rejection notification
      await sendNotification(
        joinRequest.barberId,
        'join_request_rejected',
        'Join Request Declined',
        `Your request to join "${joinRequest.shop.name}" has been declined.`,
        {
          shopId: joinRequest.shopId,
          shopName: joinRequest.shop.name
        }
      );
    }

    // Update request status
    const updatedRequest = await prisma.barberJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date()
      },
      include: {
        barber: {
          select: {
            id: true,
            user: {
              select: {
                fullName: true,
                profileImage: true
              }
            }
          }
        },
        shop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      message: `Join request ${action}d successfully`,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error responding to join request:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to respond to join request'
    });
  }
};

/**
 * Get barber's own join request status
 */
export const getMyJoinRequests = async (req: Request, res: Response) => {
  try {
    const barberId = req.user?.id;

    if (!barberId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get barber profile first
    const barberProfile = await prisma.barberProfile.findUnique({
      where: { userId: barberId }
    });

    if (!barberProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Barber profile not found'
      });
    }

    const joinRequests = await prisma.barberJoinRequest.findMany({
      where: { barberId: barberProfile.id }, // Use barber profile ID
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            address: true,
            totalSeats: true,
            owner: {
              select: {
                id: true,
                user: {
                  select: {
                    fullName: true,
                    profileImage: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      status: 'success',
      data: joinRequests
    });
  } catch (error) {
    console.error('Error getting my join requests:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get join requests'
    });
  }
};
