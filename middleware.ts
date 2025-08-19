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

    // Skip auth check for public paths
    if (isPublicPath(path)) {
        return next();
    }

    // Check if user is authenticated
    // This is a simplified example - replace with your actual auth check
    const token = req.cookies?.token;

    if (!token) {
        // If not authenticated and trying to access protected route, redirect to login
        if (path.startsWith('/dashboard')) {
            return res.redirect('/auth/login');
        }
        return res.redirect('/auth/login');
    }

    // If user is authenticated but tries to access auth pages, redirect to dashboard
    if (path.startsWith('/auth')) {
        return res.redirect('/dashboard');
    }

    next();
};
