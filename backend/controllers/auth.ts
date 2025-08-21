import { Controller, Post, Get, Body, Route, Tags, Response, SuccessResponse, Res, Query, TsoaResponse, Request, Security } from 'tsoa';
import { compare, hash } from 'bcrypt';
import { Request as ExpressRequest } from 'express';
import { Op } from 'sequelize';
import { ServiceResponse } from '../utils/serviceResponse';
import { generateToken as generateJwtToken } from '../utils/jwt';
import { getGoogleAuthURL, getGoogleUser } from '../utils/googleOAuth';
import config from '../config/config';
import { sendPasswordResetEmail } from '../utils/emailService';
import { IUserResponse } from '../types/user-controller-types';
import { User } from '../models/users';
import {
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types/auth-controller-types';
import sequelize from '../config/database';
import { asyncCatch } from '@/middlewares/errorHandler';
import db from '@/models';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles?: string[];
      };
    }
  }
}


@Route('api/auth')
@Tags('Authentication')
export class AuthController extends Controller {

  private async _buildUserResponse(user: User): Promise<IUserResponse> {
    const roles = await user.getRoles({
      attributes: ['id', 'name', 'description'],
      include: [{
        model: db.Permission,
        as: 'permissions',
        through: { attributes: [] },
        attributes: ['id', 'name', 'description']
      }]
    });

    const { password, resetPasswordCode, resetPasswordExpires, ...userData } = user.toJSON();

    return {
      ...userData,
      roles,
    };
  }

  @Post('/login')
  @SuccessResponse(200, 'Login successful')
  @Response(401, 'Invalid credentials')
  @Response(403, 'Account is inactive')
  @asyncCatch
  public async login(
    @Body() credentials: LoginRequest,
    @Res() res: TsoaResponse<200 | 401 | 403, ServiceResponse<{ user: IUserResponse | null }>>
  ): Promise<void> {
    const { type, email, phone, password } = credentials as any;

    if ((!email && !phone) || !password) {
      
      res(401, ServiceResponse.failure('Invalid credentials', { user: null }));
      return;
    }

    let where: any;
    if (type === 'email') {
      where = { email: email };
    } else if (type === 'phone') {
      where = { phone: phone };
    }

    const data = await db.User.findOne({ where });
    const user = data?.toJSON();

    if (!user || !user.password || !(await compare(password, user.password))) {
      res(401, ServiceResponse.failure('Invalid credentials', { user: null }));
      return;
    }

    if (user.status !== 'active') {
      res(403, ServiceResponse.failure('Your account is inactive. Please contact support.', { user: null }));
      return;
    }

    // Check if user needs verification (all roles except local_citizen)
    const userRoles = await data?.getRoles();
    const isLocalCitizen = userRoles?.some(role => role.name === 'local_citizen');

    if (!user.verified && !isLocalCitizen) {
      res(403, ServiceResponse.failure('Account Needs Verification.', { user: null }));
      return;
    }

    const token = await this.generateToken(data!);
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // Use 'none' in production for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
      domain: isProduction ? '.yourdomain.com' : 'localhost',
    };

    // Convert cookie options to string
    const cookieString = `token=${token}; ${Object.entries(cookieOptions)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')}`;

    const userResponse = await this._buildUserResponse(data!);
    res(200, ServiceResponse.success('Login successful', { user: userResponse }), {
      'Set-Cookie': cookieString,
    });
  }

  @Post('/signup')
  @SuccessResponse(201, 'User created')
  @Response(400, 'User with this email already exists')
  @asyncCatch
  public async signup(
    @Body() signupData: SignupRequest,
    @Res() res: TsoaResponse<201 | 400, ServiceResponse<{ user: IUserResponse | null }>>
  ): Promise<void> {
    const {
      email,
      password,
      name,
      address,
      phone,
      roleType,
      userType,
      // extended optional profile fields
      nationalId,
      district,
      sector,
      cell,
      village,
      preferredLanguage,
      nearByHealthCenter,
      // role-specific
      schoolName,
      schoolAddress,
      churchName,
      churchAddress,
      hospitalName,
      hospitalAddress,
      healthCenterName,
      healthCenterAddress,
      epiDistrict,
    } = signupData as any;

    // Require phone; email is optional
    if (!phone || !String(phone).trim()) {
      res(400, ServiceResponse.failure('Phone is required', { user: null }));
      return;
    }

    // Uniqueness checks
    if (await db.User.findOne({ where: { phone } })) {
      res(400, ServiceResponse.failure('User with this phone already exists', { user: null }));
      return;
    }
    if (email && (await db.User.findOne({ where: { email } }))) {
      res(400, ServiceResponse.failure('User with this email already exists', { user: null }));
      return;
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await sequelize.transaction(async (t) => {
      // Create user with verified status based on role
      const isLocalCitizen = roleType === 'local_citizen';
      const user = await db.User.create({
        name,
        email,
        password: hashedPassword,
        address,
        phone,
        status: 'active',
        verified: isLocalCitizen, // Auto-verify local_citizen
        userType,
        // extended optional fields
        nationalId,
        district,
        sector,
        cell,
        village,
        preferredLanguage,
        nearByHealthCenter,
        // role-specific optional fields
        schoolName,
        schoolAddress,
        churchName,
        churchAddress,
        hospitalName,
        hospitalAddress,
        healthCenterName,
        healthCenterAddress,
        epiDistrict,
      }, { transaction: t });

      // Find or create role
      let role = await db.Role.findOne({ where: { name: roleType }, transaction: t });

      // If role doesn't exist, return error
      if (!role) {
        res(400, ServiceResponse.failure('Can\'t create user, with that role.', { user: null }));
        return;
      }

      // Assign role to user
      await (user as any).addRole(role, { transaction: t });

      //save user
      await user.save({ transaction: t });

      return user;
    });

    if (!newUser) {
      res(400, ServiceResponse.failure('Can\'t create user, with that role.', { user: null }));
      return;
    }

    // if role is local_citizen, send token otherwise send message that they need to be verified
    if (roleType !== 'local_citizen') {
      res(201, ServiceResponse.success('Signup successful, Wait for our further verification.', { user: null }));
      return;
    }
    const token = await this.generateToken(newUser);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
    };

    const userResponse = await this._buildUserResponse(newUser);
    res(201, ServiceResponse.success('Signup successful', { user: userResponse }), {
      'Set-Cookie': `token=${token}; ${Object.entries(cookieOptions).map(([k, v]) => `${k}=${v}`).join('; ')}`,
    });
  }

  @Post('/forgot-password')
  @SuccessResponse(200, 'Password reset email sent')
  @asyncCatch
  public async forgotPassword(@Body() request: ForgotPasswordRequest): Promise<ServiceResponse<null>> {
    const { email } = request;
    const userModel = await db.User.findOne({ where: { email } });
    const user = userModel?.toJSON();

    if (!user) {
      return ServiceResponse.failure('User not found', null, 404);
    }

    const resetCode = Math.random().toString(36).substring(2, 12);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await userModel?.update({ resetPasswordCode: resetCode, resetPasswordExpires: resetExpires });
    await sendPasswordResetEmail(user.email, resetCode);


    return ServiceResponse.success('A password reset link has been sent to your email.', null);
  }

  @Post('/reset-password')
  @SuccessResponse(200, 'Password has been reset')
  @Response(400, 'Invalid or expired reset code')
  @asyncCatch
  public async resetPassword(@Body() request: ResetPasswordRequest): Promise<ServiceResponse<null>> {
    const { token, newPassword } = request;

    const user = await db.User.findOne({
      where: { resetPasswordCode: token, resetPasswordExpires: { [Op.gt]: new Date() } },
    });

    if (!user) {
      return ServiceResponse.failure('Invalid or expired reset code', null, 400);
    }

    const hashedPassword = await hash(newPassword, 10);
    await user.update({ password: hashedPassword, resetPasswordCode: null, resetPasswordExpires: null });

    return ServiceResponse.success('Password has been reset successfully', null);
  }

  @Get('/google')
  @SuccessResponse(302, 'Redirect to Google OAuth')
  @asyncCatch
  public googleAuth(@Res() res: TsoaResponse<302, void, { Location: string }>): void {
    res(302, undefined, { Location: getGoogleAuthURL() });
  }

  @Get('/google/callback')
  @SuccessResponse(302, 'Redirect after Google OAuth')
  @asyncCatch
  public async googleAuthCallback(
    @Res() res: TsoaResponse<302, void, { Location: string; 'Set-Cookie'?: string }>,
    @Query('code') code: string,
    @Query('error') error?: string
  ): Promise<void> {
    console.log('Google OAuth callback received:', { code, error });

    if (error) {
      console.error('OAuth error:', error);
      res(302, undefined, { Location: `${config.appUrl}/login?error=oauth_${error}` });
      return;
    }

    if (!code) {
      console.error('No code received from Google');
      res(302, undefined, { Location: `${config.appUrl}/login?error=no_code` });
      return;
    }

    const googleUser = await getGoogleUser(code);

    const user = await sequelize.transaction(async (t) => {
      // First try to find by googleId
      let user = await db.User.findOne({
        where: { googleId: googleUser.id },
        include: [{
          model: db.Role,
          as: 'roles' // Specify the alias for the Role association
        }],
        transaction: t
      });
      
      if (!user) {
        user = await db.User.findOne({
          where: { email: googleUser.email },
          include: [{
            model: db.Role,
            as: 'roles' // Specify the alias for the Role association
          }],
          transaction: t
        });
      }

      // Create new user if doesn't exist
      if (!user) {
        console.log('Creating new user for Google account');
        user = await db.User.create({
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.id,
          status: 'active',
          emailVerified: googleUser.email_verified,
          profile: googleUser.picture,
        }, { transaction: t });

        // Assign default 'user' role
        const userRole = await db.Role.findOne({
          where: { name: 'local_citizen' },
          transaction: t
        });

        if (userRole) {
          console.log('Assigning default user role');
          await (user as any).addRole(userRole, { transaction: t });
        }
      } else if (!user.googleId) {
        // Link existing account with Google
        console.log('Linking existing account with Google');
        await user.update({
          googleId: googleUser.id,
          emailVerified: googleUser.email_verified,
          profile: googleUser.picture || user.profile
        }, { transaction: t });
      }

      // Make sure to reload with roles
      return user.reload({
        include: [{
          model: db.Role,
          as: 'roles' // Specify the alias for the Role association
        }],
        transaction: t
      });
    });

    const token = await this.generateToken(user);

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax', // Use 'none' in production for cross-site cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: '/',
      domain: isProduction ? config.cookieDomain : 'localhost',
    };

    const cookieString = `token=${token}; ${Object.entries(cookieOptions)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')}`;

    console.log('Redirecting to dashboard');
    res(302, undefined, {
      Location: `${config.appUrl}/dashboard`,
      'Set-Cookie': cookieString,
    });
  }

  @Get('/me')
  @Security("jwt")
  @SuccessResponse(200, 'User retrieved successfully')
  @Response(401, 'Unauthorized')
  @asyncCatch
  public async getCurrentUser(
    @Request() req: ExpressRequest,
    @Res() res: TsoaResponse<200 | 401, ServiceResponse<{ user: IUserResponse | null }>>
  ): Promise<void> {
    // The user should be attached to the request by the auth middleware
    const user = req.user;

    if (!user) {
      res(401, ServiceResponse.failure('Not authenticated', { user: null }));
      return;
    }

    // Get fresh user data from the database with roles and permissions
    const userModel = await db.User.findByPk(user.id);

    if (!userModel) {
      res(401, ServiceResponse.failure('User not found', { user: null }));
      return;
    }

    const userResponse = await this._buildUserResponse(userModel);
    res(200, ServiceResponse.success('User retrieved successfully', { user: userResponse }));
  }

  @Post('/logout')
  @SuccessResponse(200, 'Logout successful')
  @asyncCatch
  public async logout(@Res() res: TsoaResponse<200, ServiceResponse<{ success: boolean }>, { 'Set-Cookie': string }>): Promise<void> {
    res(200, ServiceResponse.success('Logout successful', { success: true }), {
      'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    });
  }

  private async generateToken(userModel: User): Promise<string> {
    const roles = await userModel.getRoles({ attributes: ['name'] });
    const roleNames = roles.map(role => role.name);
    const user = userModel.toJSON();

    return generateJwtToken({
      userId: user.id,
      email: user.email,
      roles: roleNames,
    });
  }
}

