import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security, Request } from '@tsoa/runtime';
import { ServiceResponse } from '../utils/serviceResponse';
import { asyncCatch } from '../middlewares/errorHandler';
import db from '@/models';
import sequelize from '../config/database';
import { createSystemLog } from '../utils/systemLog';
import { generateInviteToken, verifyInviteToken } from '../utils/tokenService';
import { sendOrganizationInviteEmail } from '../utils/emailService';
import { hash } from 'bcrypt';

// NOTE: this controller previously called "StakeholderController" — updated to manage Organizations
@Route('api/organizations')
@Tags('Organizations')
export class OrganizationController extends Controller {
  @Security('jwt', ['project:read'])
  @Get('/')
  @asyncCatch
  public async getOrganizations(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() type?: 'stakeholder' | 'system_owner',
    @Query() status?: 'active' | 'suspended' | 'deleted'
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;

    // Build where clause based on query parameters
    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await db.Organization.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [
        { model: db.User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] },
        { model: db.Project, as: 'projects', through: { attributes: [] } },
        { model: db.User, as: 'users', through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return ServiceResponse.success('Organizations retrieved successfully', rows, 200, { total: count, page, totalPages: Math.ceil(count / limit) });
  }

  @Security('jwt', ['project:read'])
  @Get('/{organizationId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Organization not found')
  public async getOrganizationById(@Path() organizationId: string): Promise<ServiceResponse<any | null>> {
    const organization = await db.Organization.findByPk(organizationId, {
      include: [
        { model: db.Project, as: 'projects', through: { attributes: [] } },
        { model: db.User, as: 'users', through: { attributes: [] } }
      ],
    });
    if (!organization) return ServiceResponse.failure('Organization not found', null, 404);
    return ServiceResponse.success('Organization retrieved successfully', organization);
  }

  @Security('jwt', ['project:create'])
  @Post('/')
  @asyncCatch
  public async createOrganization(@Request() req: any, @Body() data: {
    name: string;
    description?: string | null;
    logo?: string | null;
    type?: 'stakeholder' | 'system_owner';
    ownerEmail: string;
    permissionIds?: string[];
  }): Promise<ServiceResponse<any | null>> {
    const t = await sequelize.transaction();
    try {
      // Create organization first
      const organization = await db.Organization.create({
        name: data.name,
        description: data.description ?? null,
        logo: data.logo ?? null,
        type: data.type ?? 'stakeholder',
        status: 'active',
      }, { transaction: t });

      // Generate token and ensure it's URL-safe
      const token = generateInviteToken(data.ownerEmail, organization.id);

      // Send invite email with encoded token
       await sendOrganizationInviteEmail(
        data.ownerEmail,
        organization.name,
        token,  // token will be encoded in emailService
        organization.id
      );

      // 2. Create role for organization
      const roleName = organization.name.toLowerCase().replace(/\s+/g, '_');
      const [role] = await db.Role.findOrCreate({
        where: { name: roleName },
        defaults: {
          name: roleName,
          description: organization.name ?? `Role for organization ${organization.id}`,
          stakeholderId: organization.id,
          category: 'Organizations',
        },
        transaction: t,
      });

      // 3. Set permissions if provided
      if (data.permissionIds?.length) {
        const permissions = await db.Permission.findAll({
          where: { id: data.permissionIds },
          transaction: t
        });
        if (permissions.length) {
          await (role as any).setPermissions(permissions, { transaction: t });
        }
      }

      await t.commit();
      await createSystemLog(req ?? null, 'created_organization', 'Organization', organization.id, {
        roleId: role.id,
        inviteSentTo: data.ownerEmail
      });

      this.setStatus(201);
      return ServiceResponse.success(
        'Organization created and invite sent successfully',
        { organization, role },
        201
      );
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  @Security('jwt', ['project:update'])
  @Put('/{organizationId}')
  @asyncCatch
  public async updateOrganization(
    @Request() req: any,
    @Path() organizationId: string,
    @Body() data: {
      name?: string;
      description?: string | null;
      logo?: string | null;
      type?: 'stakeholder' | 'system_owner';
      ownerId?: string | null;
      permissionIds?: string[];
      status?: 'active' | 'suspended' | 'deleted';
    }
  ): Promise<ServiceResponse<any | null>> {
    const t = await sequelize.transaction();
    try {
      const organization = await db.Organization.findByPk(organizationId, { transaction: t });
      if (!organization) {
        await t.rollback();
        return ServiceResponse.failure('Organization not found', null, 404);
      }

      const previousName = organization.name;
      await organization.update({
        name: data.name ?? organization.name,
        description: data.description ?? organization.description,
        logo: data.logo ?? organization.logo,
        type: data.type ?? organization.type,
        ownerId: data.ownerId ?? organization.ownerId,
        status: data.status ?? organization.status,
      }, { transaction: t });

      const role = await db.Role.findOne({ where: { stakeholderId: organization.id }, transaction: t });
      if (role) {
        if (data.name && data.name !== previousName) {
          const newRoleName = data.name.toLowerCase().replace(/\s+/g, '_');
          await role.update({ name: newRoleName, description: data.name ?? role.description }, { transaction: t });
        }
        if (data.permissionIds && Array.isArray(data.permissionIds)) {
          const permissions = await db.Permission.findAll({ where: { id: data.permissionIds }, transaction: t });
          await (role as any).setPermissions(permissions, { transaction: t });
        }
      }

      await t.commit();
      await createSystemLog(req ?? null, 'updated_organization', 'Organization', organization.id, { changes: Object.keys(data) });
      return ServiceResponse.success('Organization updated successfully', organization);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  @Security('jwt', ['project:delete'])
  @Delete('/{organizationId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteOrganization(@Path() organizationId: string): Promise<ServiceResponse<null>> {
    const organization = await db.Organization.findByPk(organizationId);
    if (!organization) return ServiceResponse.failure('Organization not found', null, 404);

    // soft/hard delete decision: we'll mark as deleted
    await organization.update({ status: 'deleted' });
    await createSystemLog(null, 'deleted_organization', 'Organization', organizationId, { name: organization.name });
    this.setStatus(204);
    return ServiceResponse.success('Organization deleted successfully', null, 204);
  }

  // Additional endpoints (users attach/detach) can reuse existing logic but refer to Organization model
  @Security('jwt', ['project:read'])
  @Get('/{organizationId}/users')
  @asyncCatch
  public async getOrganizationUsers(@Path() organizationId: string, @Query() page: number = 1, @Query() limit: number = 50): Promise<ServiceResponse<any[]>> {
    const organization = await db.Organization.findByPk(organizationId, { include: [{ model: db.User, as: 'users', through: { attributes: [] } }] });
    if (!organization) return ServiceResponse.failure('Organization not found', [], 404);
    return ServiceResponse.success('Organization users retrieved successfully', (organization as any).users || []);
  }
}

@Route('api/organizations')
@Tags('Organizations')
export class OrganizationVerificationController extends Controller {
  @Post('/verify-invite')
  public async verifyInvite(
    @Body() body: {
      token: string;
      name: string;
      email: string;
      password: string;
      phone: string;
    }
  ): Promise<ServiceResponse<any>> {
    try {
      // Verify token
      const verified = await verifyInviteToken(body.token);
      if (!verified) {
        return ServiceResponse.failure('Invalid or expired token', null, 401);
      }

      // Check if organization exists
      const organization = await db.Organization.findByPk(verified.organizationId);
      if (!organization) {
        return ServiceResponse.failure('Invalid organization', null, 404);
      }

      const t = await sequelize.transaction();
      try {
        // Create user with provided details
        const hashedPassword = await hash(body.password, 10);
        const user = await db.User.create({
          name: body.name,
          email: body.email,
          password: hashedPassword,
          phone: body.phone,
          status: 'active',
          emailVerified: true,
        }, { transaction: t });

        // Update organization with verified owner
        await organization.update({ ownerId: user.id }, { transaction: t });

        // Find or create organization admin role
        const [role] = await db.Role.findOrCreate({
          where: { name: organization.name.toLowerCase().replace(/\s+/g, '_') },
          defaults: {
            name: organization.name.toLowerCase().replace(/\s+/g, '_'),
            description: `Administrator role for ${organization.name}`,
            stakeholderId: organization.id,
            category: 'Organizations',
          },
          transaction: t,
        });

        // Assign role to user
        await user.addRole(role, { transaction: t });
        await t.commit();

        return ServiceResponse.success('Account verified successfully', { userId: user.id });
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (error: any) {
      return ServiceResponse.failure(error.message || 'Verification failed', null, 400);
    }
  }
}