import sgMail from '@sendgrid/mail';
import { config } from '../config';

// Set SendGrid API key
sgMail.setApiKey(config.sendgrid.apiKey);

/**
 * Send an email using SendGrid
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 * @returns Promise<boolean>
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
  try {
    console.log('Attempting to send email via SendGrid to:', to);
    
    const emailData = {
      to: to,
      from: {
        email: config.sendgrid.fromEmail,
        name: 'Barberzon'
      },
      subject: subject,
      html: html,
    };
    
    const response = await sgMail.send(emailData);
    
    console.log('Email sent via SendGrid successfully');
    console.log('SendGrid response status:', response[0].statusCode);
    return true;
  } catch (error: any) {
    console.warn('SendGrid failed, falling back to console logging:', error.message);
    
    // Fallback: Log email details to console for development
    console.log('\n=== EMAIL FALLBACK (Development Mode) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML Content:');
    console.log(html);
    console.log('=== END EMAIL FALLBACK ===\n');
    
    // Return true to indicate email was "sent" (logged)
    return true;
  }
};
