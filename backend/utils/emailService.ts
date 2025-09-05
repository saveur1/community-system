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
      tls: {
        rejectUnauthorized: false, // <--- allow self-signed certs if needed
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
    tls: {
    rejectUnauthorized: false, // <--- allow self-signed certs if needed
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

/**
 * Send an organization invite email with signup link
 */
export const sendOrganizationInviteEmail = async (
  to: string,
  organizationName: string,
  token: string,
  organizationId: string
): Promise<boolean> => {
  try {
    const transporter = await createTransporter();
    // In your email service
    const email = to.replace('@', '-').replace('.', '_');
    const verificationLink = `${config.frontendUrl}/verify-organization?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    await transporter.sendMail({
      from: '"Community Tool" <no-reply@communitytool.com>',
      to,
      subject: `Invitation to join ${organizationName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Organization Invitation</h2>
          <p>You have been invited to join <strong>${organizationName}</strong> on Community Tool.</p>
          <p>Click the button below to set up your account:</p>
          <a href="${verificationLink}" 
             style="display: inline-block; background: #004f64; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; margin: 16px 0;">
            Accept Invitation
          </a>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">Verification code: ${token}</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending organization invite:', error);
    return false;
  }
};

// Email templates
export const EmailTemplates = {
  ORGANIZATION_INVITE: (data: {
    organizationName: string;
    verificationLink: string;
    expiresIn: string;
  }) => ({
    subject: `Invitation to join ${data.organizationName}`,
    html: `
      <h1>Welcome to ${data.organizationName}</h1>
      <p>You have been invited to join the organization as an owner/administrator.</p>
      <p>Please click the link below to set up your account:</p>
      <a href="${data.verificationLink}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #0066cc;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      ">Set Up Account</a>
      <p>This link will expire in ${data.expiresIn}.</p>
      <p>If you did not expect this invitation, please ignore this email.</p>
    `,
  }),
};

/**
 * Send organization invite email
 */
export const sendOrganizationInvite = async (
  email: string,
  organizationName: string,
  verificationLink: string,
  expiresIn: string
): Promise<boolean> => {
  try {
    const template = EmailTemplates.ORGANIZATION_INVITE({
      organizationName,
      verificationLink,
      expiresIn,
    });
    const transporter = await createTransporter();

    await transporter.sendMail({
      from: '"Community Tool" <no-reply@communitytool.com>',
      to: email,
      subject: template.subject,
      html: template.html,
      tls: {
        rejectUnauthorized: false, // <--- allow self-signed certs if needed
      },
    });
    return true;
  } catch (error) {
    console.error('Failed to send organization invite:', error);
    return false;
  }
};
