import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application configuration
 */
export const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'barberzon-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  // SendGrid configuration
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@barberzon.com',
  },
  
  // Google OAuth configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback',
  },
  
  // Payment gateway configuration (Paystack)
  payment: {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    baseUrl: 'https://api.paystack.co',
  },
  
  // Frontend URL for redirects and email links
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Cors configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  
  // Push notifications configuration
  pushNotifications: {
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:info@barberzon.com',
  },
  
};
