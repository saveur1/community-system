import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import { asyncCatch } from '../middlewares/errorHandler';
import db from '@/models';
import sequelize from '../config/database';

interface StakeholderCreateRequest {
  name: string;
  logo?: string | null;
}

interface StakeholderUpdateRequest extends Partial<StakeholderCreateRequest> {}

interface StakeholderUserAttachRequest {
  userId: string;
}

@Route('api/stakeholders')
@Tags('Stakeholders')
export class StakeholderController extends Controller {
  @Security('jwt', ['project:read'])
  @Get('/')
  @asyncCatch
  public async getStakeholders(
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const { count, rows } = await db.Stakeholder.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return ServiceResponse.success('Stakeholders retrieved successfully', rows, 200, { total: count, page, totalPages: Math.ceil(count / limit) });
  }

  @Security('jwt', ['project:read'])
  @Get('/{stakeholderId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Stakeholder not found')
  public async getStakeholderById(@Path() stakeholderId: string): Promise<ServiceResponse<any | null>> {
    const stakeholder = await db.Stakeholder.findByPk(stakeholderId, {
      include: [{ model: db.Project, as: 'projects', through: { attributes: [] } }],
    });
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', null, 404);
    return ServiceResponse.success('Stakeholder retrieved successfully', stakeholder);
  }

  @Security('jwt', ['project:create'])
  @Post('/')
  @asyncCatch
  public async createStakeholder(@Body() data: StakeholderCreateRequest): Promise<ServiceResponse<any | null>> {
    const stakeholder = await db.Stakeholder.create({
      name: data.name,
      logo: data.logo ?? null,
    });
    this.setStatus(201);
    return ServiceResponse.success('Stakeholder created successfully', stakeholder, 201);
  }

  @Security('jwt', ['project:update'])
  @Put('/{stakeholderId}')
  @asyncCatch
  public async updateStakeholder(
    @Path() stakeholderId: string,
    @Body() data: StakeholderUpdateRequest
  ): Promise<ServiceResponse<any | null>> {
    const stakeholder = await db.Stakeholder.findByPk(stakeholderId);
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', null, 404);

    await stakeholder.update({
      name: data.name ?? stakeholder.name,
      logo: data.logo ?? stakeholder.logo,
    });

    return ServiceResponse.success('Stakeholder updated successfully', stakeholder);
  }

  @Security('jwt', ['project:delete'])
  @Delete('/{stakeholderId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteStakeholder(@Path() stakeholderId: string): Promise<ServiceResponse<null>> {
    const stakeholder = await db.Stakeholder.findByPk(stakeholderId);
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', null, 404);

    await stakeholder.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Stakeholder deleted successfully', null, 204);
  }

  @Security('jwt', ['project:read'])
  @Get('/{stakeholderId}/users')
  @asyncCatch
  public async getStakeholderUsers(
    @Path() stakeholderId: string,
    @Query() page: number = 1,
    @Query() limit: number = 50
  ): Promise<ServiceResponse<any[]>> {
    const stakeholder = await db.Stakeholder.findByPk(stakeholderId, {
      include: [{ model: db.User, as: 'users', through: { attributes: [] } }],
    });
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', [], 404);

    // Note: pagination for associated users can be implemented if needed;
    // returning all associated users for simplicity
    return ServiceResponse.success('Stakeholder users retrieved successfully', (stakeholder as any).users || []);
  }

  @Security('jwt', ['project:update'])
  @Post('/{stakeholderId}/users')
  @asyncCatch
  public async attachUserToStakeholder(
    @Path() stakeholderId: string,
    @Body() body: StakeholderUserAttachRequest
  ): Promise<ServiceResponse<any | null>> {
    const stakeholder = await db.Stakeholder.findByPk(stakeholderId);
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', null, 404);

    const user = await db.User.findByPk(body.userId);
    if (!user) return ServiceResponse.failure('User not found', null, 404);

    const t = await sequelize.transaction();
    try {
      // create association stakeholder <-> user
      // use dynamic method added by Sequelize; cast to any to avoid typing issues
      await (stakeholder as any).addUser(user, { transaction: t });

      // ensure a Role exists for this stakeholder
      const roleName = stakeholder.name.toLocaleLowerCase().replace(/\s+/g, '_');
      const [role] = await db.Role.findOrCreate({
        where: { name: roleName },
        defaults: {
          name: roleName,
          description: stakeholder.name ?? `Role for stakeholder ${stakeholder.id}`,
          category: 'stakeholder'
        },
        transaction: t,
      });

      // assign role to user
      await user.addRoleById(role.id, t);

      await t.commit();
      return ServiceResponse.success('User attached to stakeholder and role assigned', { stakeholderId, userId: user.id, roleId: role.id }, 200);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }

  @Security('jwt', ['project:update'])
  @Delete('/{stakeholderId}/users/{userId}')
  @asyncCatch
  public async detachUserFromStakeholder(
    @Path() stakeholderId: string,
    @Path() userId: string
  ): Promise<ServiceResponse<null>> {
    const stakeholder = await db.Stakeholder.findByPk(stakeholderId);
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', null, 404);

    const user = await db.User.findByPk(userId);
    if (!user) return ServiceResponse.failure('User not found', null, 404);

    const t = await sequelize.transaction();
    try {
      await (stakeholder as any).removeUser(user, { transaction: t });

      // remove stakeholder role from user
      const roleName = stakeholder.name.toLocaleLowerCase().replace(/\s+/g, '_');
      const role = await db.Role.findOne({ where: { name: roleName }, transaction: t });

      if (role) {
        await user.removeRoleById(role.id, t);

        // cleanup: if no users remain associated to this stakeholder, remove the role
        const remainingUsers = await (stakeholder as any).countUsers({ transaction: t });
        if (remainingUsers === 0) {
          await role.destroy({ transaction: t });
        }
      }

      await t.commit();
      return ServiceResponse.success('User detached from stakeholder and role cleaned up (if needed)', null, 200);
    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
