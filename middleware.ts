import db from '@/models';
import { verifyToken } from '@/utils/jwt';
import { Request, Response, NextFunction } from 'express';

// Define user type
export interface User {
    id: string;
    email: string;
    roles?: string[];
}

// Extend the Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

// Public routes that don't require authentication
const publicPaths = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/google',
    '/auth/google/callback',
    '/auth/forgot-password',
    '/auth/reset-password',
    /^\/feedback\/.*$/ // Matches /feedback/any-characters-here
];

// Check if the current path is public
const isPublicPath = (path: string): boolean => {
    return publicPaths.some(publicPath => {
        if (typeof publicPath === 'string') {
            return path === publicPath;
        } else if (publicPath instanceof RegExp) {
            return publicPath.test(path);
        }
        return false;
    });
};



// Middleware to check authentication status
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { path } = req;

    if (isPublicPath(path)) {
        return next();
    }

    const token = req.cookies?.token;

    if (!token) {
        return res.redirect('/auth/login');
    }

    try {
        const decoded = await verifyToken(token) as { userId: string };
        const user = await db.User.findByPk(decoded.userId);

        if (!user) {
            return res.redirect('/auth/login?error=user-not-found');
        }

        req.user = {
            id: user.id,
            email: user.email,
            roles: user.roles?.map((r: any) => r.name) ?? []
        };

        if (path.startsWith('/auth')) {
            return res.redirect('/dashboard');
        }

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.redirect('/auth/login?error=invalid-token');
    }
};
