import { Resend } from 'resend';
import jwt from 'jsonwebtoken';
import { config } from '../config';

interface DecodedToken {
  email: string;
  role: 'customer' | 'barber';
  purpose: string;
  iat: number;
  exp: number;
}

// Initialize Resend client
const resend = new Resend(config.resend.apiKey);

/**
 * Generate a verification token
 */
export const generateVerificationToken = (email: string, role: 'customer' | 'barber'): string => {
  return jwt.sign(
    { email, role, purpose: 'email_verification' },
    config.jwt.secret,
    { expiresIn: '24h' }
  );
};

/**
 * Verify a verification token
 */
export const verifyEmailToken = (token: string): { email: string; role: 'customer' | 'barber' } | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as DecodedToken;
    
    if (decoded.purpose !== 'email_verification') {
      return null;
    }
    
    return {
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
};

/**
 * Send a verification email using Resend
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  role: 'customer' | 'barber'
): Promise<boolean> => {
  const frontendUrl = config.frontendUrl;
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
  
  const roleText = role === 'customer' ? 'Customer' : 'Barber';
  
  try {
    const { data, error } = await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: `Verify Your Barberzon ${roleText} Account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #16a34a;">Barberzon</h1>
          </div>
          
          <h2 style="color: #16a34a; text-align: center;">Verify Your Email Address</h2>
          
          <p>Hello,</p>
          
          <p>Thank you for registering with Barberzon! To complete your registration and activate your ${roleText.toLowerCase()} account, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify My Email</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <p>If you did not create an account with Barberzon, please ignore this email.</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #6b7280; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Barberzon. All rights reserved.</p>
            <p>123 Barber Street, Lagos, Nigeria</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email with Resend:', error);
      return false;
    }
    
    console.log('Verification email sent with Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending verification email with Resend:', error);
    return false;
  }
};

/**
 * Send a welcome email after successful verification using Resend
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string,
  role: 'customer' | 'barber'
): Promise<boolean> => {
  const frontendUrl = config.frontendUrl;
  const loginUrl = role === 'customer' 
    ? `${frontendUrl}/login` 
    : `${frontendUrl}/barber/login`;
  
  const roleText = role === 'customer' ? 'Customer' : 'Barber';
  
  try {
    const { data, error } = await resend.emails.send({
      from: config.resend.fromEmail,
      to: email,
      subject: `Welcome to Barberzon!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #16a34a;">Barberzon</h1>
          </div>
          
          <h2 style="color: #16a34a; text-align: center;">Welcome to Barberzon!</h2>
          
          <p>Hello ${name},</p>
          
          <p>Thank you for verifying your email address. Your ${roleText.toLowerCase()} account has been successfully activated!</p>
          
          ${role === 'customer' 
            ? `<p>You can now book appointments with the best barbers in your area, manage your bookings, and enjoy a seamless haircut experience.</p>` 
            : `<p>You can now set up your shop profile, manage appointments, and start accepting bookings from customers in your area.</p>`
          }
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In to Your Account</a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The Barberzon Team</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #6b7280; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Barberzon. All rights reserved.</p>
            <p>123 Barber Street, Lagos, Nigeria</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending welcome email with Resend:', error);
      return false;
    }
    
    console.log('Welcome email sent with Resend:', data?.id);
    return true;
  } catch (error) {
    console.error('Error sending welcome email with Resend:', error);
    return false;
  }
};
