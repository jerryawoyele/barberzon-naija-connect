import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import barberRoutes from './routes/barber.routes';
import shopRoutes from './routes/shop.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes, { webhookRouter } from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import barberJoinRequestRoutes from './routes/barberJoinRequest.routes';
import uploadRoutes from './routes/upload.routes';
import publicRoutes from './routes/public.routes';

// Load environment variables
dotenv.config();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/barbers', barberRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/webhook/paystack', webhookRouter);
app.use('/api/notifications', notificationRoutes);
app.use('/api/barber-requests', barberJoinRequestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/public', publicRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

export default app;
