import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.utils';

// Extend Express Request interface to include user property
// Using module augmentation instead of namespace
import 'express';
declare module 'express' {
  interface Request {
    user?: TokenPayload;
  }
}

/**
 * Authentication middleware to protect routes
 * Verifies the JWT token from the Authorization header
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please provide a valid token.'
      });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = verifyToken(token);

    // Attach the user to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

/**
 * Role-based authorization middleware
 * Ensures the authenticated user has the required role
 */
export const authorize = (roles: ('customer' | 'barber')[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this resource.'
      });
    }

    next();
  };
};
