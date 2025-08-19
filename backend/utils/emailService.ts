import nodemailer from 'nodemailer';
import config from '../config/config';

// Create a test account using ethereal.email for development
const createTestAccount = async () => {
  // Only create test account in development
  if (config.nodeEnv !== 'production') {
    const testAccount = await nodemailer.createTestAccount();
    return testAccount;

  }
  return null;
};

// Create a reusable transporter object using the default SMTP transport
const createTransporter = async () => {
  if (config.nodeEnv === 'development') {
    console.log("development");

    console.log("Credentials", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    })
    // In production, use real SMTP credentials from environment variables
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // In development, use ethereal.email
  const testAccount = await createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount?.user,
      pass: testAccount?.pass,
    },
  });
};

/**
 * Send a password reset email with the given reset code
 * @param to Recipient email address
 * @param resetCode The password reset code
 */
export const sendPasswordResetEmail = async (to: string, resetCode: string): Promise<void> => {
  try {
    const transporter = await createTransporter();

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Community Tool" <no-reply@communitytool.com>',
      to,
      subject: 'Password Reset Request',
      text: `Your password reset code is: ${resetCode}\n\nThis code will expire in 1 hour.`,
      html: `
        <div>
          <h2>Password Reset Request</h2>
          <p>Your password reset code is:</p>
          <h1 style="background: #f0f0f0; display: inline-block; padding: 10px 20px; border-radius: 5px;">
            ${resetCode}
          </h1>
          <p>This code will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    // Log email preview URL in development
    if (config.nodeEnv !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    // Don't throw the error to prevent exposing email sending issues to the client
  }
};

/**
 * Send a welcome email to new users
 * @param to Recipient email address
 * @param name User's name
 */
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  try {
    const transporter = await createTransporter();

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"Community Tool" <welcome@communitytool.com>',
      to,
      subject: 'Welcome to Community Tool!',
      text: `Welcome ${name}!\n\nThank you for joining our community.`,
      html: `
        <div>
          <h2>Welcome to Community Tool, ${name}!</h2>
          <p>We're excited to have you on board.</p>
          <p>Start exploring the platform and connect with your community.</p>
        </div>
      `,
    });

    // Log email preview URL in development
    if (config.nodeEnv !== 'production') {
      console.log('Welcome email preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw the error to prevent exposing email sending issues to the client
  }
};
