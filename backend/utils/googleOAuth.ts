import { OAuth2Client } from 'google-auth-library';
import { GoogleUser, RawGoogleUser } from '../types/auth-controller-types';
import config from '../config/config';

const { google } = config;

// Create a new OAuth2 client with the Google client ID and secret
export const oauth2Client = new OAuth2Client(
  google.clientId,
  google.clientSecret,
  google.callbackURL
);

/**
 * Generate the Google OAuth2 URL for user login
 * @param state Optional state parameter for CSRF protection
 * @returns The Google OAuth2 URL
 */
export const getGoogleAuthURL = (state: string = 'state_parameter_passthrough_value'): string => {
  // Define the scopes needed for the Google OAuth2 request
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  // Generate the URL for the Google OAuth2 consent page
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent', // Forces the consent screen to be shown
    scope: scopes,
    state,
  });
};

/**
 * Exchange the authorization code for user information
 * @param code The authorization code from Google
 * @returns User information from Google
 */
export const getGoogleUser = async (code: string): Promise<GoogleUser> => {
  try {
    // Exchange the authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set the credentials on the OAuth2 client
    oauth2Client.setCredentials(tokens);
    
    // Get user info from Google's OAuth2 API
        const userInfo = await oauth2Client.request<RawGoogleUser>({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const googleUserData = userInfo.data as RawGoogleUser;

    return {
      id: googleUserData.sub,
      email: googleUserData.email,
      name: googleUserData.name,
      picture: googleUserData.picture,
      email_verified: googleUserData.email_verified,
    };
  } catch (error) {
    console.error('Error getting Google user:', error);
    throw new Error('Failed to authenticate with Google');
  }
};
