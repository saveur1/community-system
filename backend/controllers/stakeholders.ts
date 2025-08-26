import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import Stakeholder from '../models/stakeholder';
import Project from '../models/project';
import { asyncCatch } from '../middlewares/errorHandler';

interface StakeholderCreateRequest {
  name: string;
  logo?: string | null;
}

interface StakeholderUpdateRequest extends Partial<StakeholderCreateRequest> {}

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
    const { count, rows } = await Stakeholder.findAndCountAll({
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
    const stakeholder = await Stakeholder.findByPk(stakeholderId, {
      include: [{ model: Project, as: 'projects', through: { attributes: [] } }],
    });
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', null, 404);
    return ServiceResponse.success('Stakeholder retrieved successfully', stakeholder);
  }

  @Security('jwt', ['project:create'])
  @Post('/')
  @asyncCatch
  public async createStakeholder(@Body() data: StakeholderCreateRequest): Promise<ServiceResponse<any | null>> {
    const stakeholder = await Stakeholder.create({
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
    const stakeholder = await Stakeholder.findByPk(stakeholderId);
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
    const stakeholder = await Stakeholder.findByPk(stakeholderId);
    if (!stakeholder) return ServiceResponse.failure('Stakeholder not found', null, 404);

    await stakeholder.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Stakeholder deleted successfully', null, 204);
  }
}
