import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import Project from '../models/project';
import Document from '../models/document';
import Stakeholder from '../models/organization';
import { asyncCatch } from '../middlewares/errorHandler';
import sequelize from '../config/database';

interface ProjectCreateRequest {
  name: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  targetGroup?: string | null;
  stakeholderIds?: string[]; // optional to attach stakeholders
  // Inline resources to be created and associated
  documents?: Array<{
    documentName: string;
    size?: number | null;
    type?: string | null;
    addedAt?: Date;
    documentUrl?: string | null;
    userId: string; // required by Document model
    publicId?: string | null;
    deleteToken?: string | null;
  }>;
}

interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {}

@Route('api/projects')
@Tags('Projects')
export class ProjectController extends Controller {
  @Security('jwt', ['project:read'])
  @Get('/')
  @asyncCatch
  public async getProjects(
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const { count, rows } = await Project.findAndCountAll({
      limit,
      offset,
      include: [
        { model: Document, as: 'documents' },
        { model: Stakeholder, as: 'stakeholders', through: { attributes: [] } },
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return ServiceResponse.success('Projects retrieved successfully', rows, 200, { total: count, page, totalPages: Math.ceil(count / limit) });
  }

  @Security('jwt', ['project:read'])
  @Get('/{projectId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Project not found')
  public async getProjectById(@Path() projectId: string): Promise<ServiceResponse<any | null>> {
    const project = await Project.findByPk(projectId, {
      include: [
        { model: Document, as: 'documents' },
        { model: Stakeholder, as: 'stakeholders', through: { attributes: [] } },
      ],
    });
    if (!project) return ServiceResponse.failure('Project not found', null, 404);
    return ServiceResponse.success('Project retrieved successfully', project);
  }

  @Security('jwt', ['project:create'])
  @Post('/')
  @asyncCatch
  public async createProject(@Body() data: ProjectCreateRequest): Promise<ServiceResponse<any | null>> {
    const tx = await sequelize.transaction();
    try {
      const project = await Project.create({
        name: data.name,
        status: data.status ?? 'in_progress',
        targetGroup: data.targetGroup ?? null,
      }, { transaction: tx });

      if (data.stakeholderIds && data.stakeholderIds.length) {
        await (project as any).setStakeholders(data.stakeholderIds, { transaction: tx });
      }

      // Optionally create incoming document resources and associate
      if (data.documents && data.documents.length) {
        for (const res of data.documents) {
          await (project as any).createDocument({
            documentName: res.documentName,
            size: res.size ?? null,
            type: res.type ?? null,
            addedAt: res.addedAt ?? new Date(),
            documentUrl: res.documentUrl ?? null,
            userId: res.userId,
            publicId: res.publicId ?? null,
            deleteToken: res.deleteToken ?? null,
          }, { transaction: tx });
        }
      }

      await tx.commit();

      const result = await Project.findByPk(project.id, {
        include: [
          { model: Document, as: 'documents' },
          { model: Stakeholder, as: 'stakeholders', through: { attributes: [] } },
        ],
      });

      this.setStatus(201);
      return ServiceResponse.success('Project created successfully', result, 201);
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }

  @Security('jwt', ['project:update'])
  @Put('/{projectId}')
  @asyncCatch
  public async updateProject(
    @Path() projectId: string,
    @Body() data: ProjectUpdateRequest
  ): Promise<ServiceResponse<any | null>> {
    const project = await Project.findByPk(projectId);
    if (!project) return ServiceResponse.failure('Project not found', null, 404);

    await project.update({
      name: data.name ?? project.name,
      status: (data.status as any) ?? project.status,
      targetGroup: data.targetGroup ?? project.targetGroup,
    });

    if (data.stakeholderIds) {
      await (project as any).setStakeholders(data.stakeholderIds);
    }

    const result = await Project.findByPk(project.id, {
      include: [
        { model: Document, as: 'documents' },
        { model: Stakeholder, as: 'stakeholders', through: { attributes: [] } },
      ],
    });

    return ServiceResponse.success('Project updated successfully', result);
  }

  @Security('jwt', ['project:delete'])
  @Delete('/{projectId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteProject(@Path() projectId: string): Promise<ServiceResponse<null>> {
    const project = await Project.findByPk(projectId);
    if (!project) return ServiceResponse.failure('Project not found', null, 404);

    await project.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Project deleted successfully', null, 204);
  }
}
