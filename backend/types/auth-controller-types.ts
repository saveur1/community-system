export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  roleType?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

// Raw response from Google OAuth2 API (covers both v2 and v3 endpoints)
export interface RawGoogleUser {
  // v3 endpoint fields
  sub?: string;              // User ID in v3
  email: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
  
  // v2 endpoint fields (fallback)
  id?: string;              // User ID in v2
  verified_email?: boolean; // v2 version of email_verified
}
