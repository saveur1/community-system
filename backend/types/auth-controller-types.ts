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

export interface RawGoogleUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}
