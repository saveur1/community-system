import { Request, Response, NextFunction } from 'express';
import { ServiceResponse } from '../utils/serviceResponse';
import { verifyToken } from '../utils/jwt';
import db from '@/models';
import { Role } from '@/models/role';

// Extend the Role type to include the permissions association
type RoleWithPermissions = Role & {
  permissions?: Array<{
    name: string;
    [key: string]: any;
  }>;
};

// TSOA authentication function
export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
  if (securityName === 'jwt') {
    const token = request.cookies.token;
    if (!token) {
      return Promise.resolve(null);
    }

    try {
      const decoded = await verifyToken(token);
      
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid token');
      }

      const user = await db.User.findByPk(decoded.userId, {
        include: [
          {
            model: db.Role,
            as: 'roles',
            include: [
              {
                model: db.Permission,
                as: 'permissions',
                through: { attributes: [] },
              },
            ],
          },
          // include organizations the user belongs to (many-to-many)
          {
            model: db.Organization,
            as: 'organizations',
            through: { attributes: [] },
            attributes: ['id', 'name', 'ownerId'],
          },
        ],
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Attach organization summary for easy access
      const orgs = (user as any).organizations ?? [];
      (user as any).organizationIds = Array.isArray(orgs) ? orgs.map((o: any) => o.id) : [];
      (user as any).primaryOrganizationId = (user as any).organizationIds?.[0] ?? null;


      if (scopes && scopes.length > 0) {
        const userPermissions = user.roles?.flatMap((role: RoleWithPermissions) => role.permissions?.map(p => p.name) || []) || [];
        const hasAllScopes = scopes.some(scope => userPermissions.includes(scope));

        if (!hasAllScopes) {
          throw new Error('Forbidden: Insufficient permissions');
        }
      }

      return Promise.resolve(user);
    } catch (error: any) {
      throw new Error(error.message || 'Invalid token');
    }
  }
  return Promise.reject(new Error('No security definition found'));
}

// Optional: Keep old middleware for routes not managed by TSOA, or for other purposes.
export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await expressAuthentication(req, 'jwt');
    (req as any).user = user;
    next();
  } catch (error: any) {
    return res.status(401).json(ServiceResponse.failure(error.message, null, 401));
  }
};

export const checkPermission = (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await expressAuthentication(req, 'jwt', [requiredPermission]);
      next();
    } catch (error: any) {
      const statusCode = error.message.includes('Forbidden') ? 403 : 401;
      return res.status(statusCode).json(ServiceResponse.failure(error.message, null, statusCode));
    }
  };
};
