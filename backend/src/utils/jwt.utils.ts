import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface TokenPayload {
  id: string;
  role: 'customer' | 'barber';
  [key: string]: unknown;
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  
  try {
    // @ts-expect-error - Ignoring type issues with jwt.sign
    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  
  try {
    const decoded = jwt.verify(token, secret);
    return decoded as TokenPayload;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
}
