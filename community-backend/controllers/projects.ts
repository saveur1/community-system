import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security } from '@tsoa/runtime';
import { ServiceResponse } from '../utils/serviceResponse';
import { asyncCatch } from '../middlewares/errorHandler';
import sequelize from '../config/database';
import db from '@/models';

interface ProjectCreateRequest {
  name: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  targetGroup?: string | null;
  description?: string | null;
  projectDuration?: string | null; // New field
  geographicArea?: string | null; // New field
  stakeholderIds?: string[]; // optional to attach stakeholders
  donorIds?: string[]; // New field - optional to attach donors
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

interface ProjectUpdateRequest extends Partial<ProjectCreateRequest> {
  // For updates, allow removing specific existing documents by ID
  removeDocumentIds?: string[];
}

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
    const { count, rows } = await db.Project.findAndCountAll({
      limit,
      offset,
      include: [
        { model: db.Document, as: 'documents' },
        { model: db.Organization, as: 'stakeholders', through: { attributes: [] } },
        { model: db.Organization, as: 'donors', through: { attributes: [] } },
        { model: db.Survey, as: 'surveys' },
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
    const project = await db.Project.findByPk(projectId, {
      include: [
        { model: db.Document, as: 'documents' },
        { model: db.Organization, as: 'stakeholders', through: { attributes: [] } },
        { model: db.Organization, as: 'donors', through: { attributes: [] } },
        { model: db.Survey, as: 'surveys' },
        { model: db.Feedback, as: "feedbacks"}
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
      const project = await db.Project.create({
        name: data.name,
        status: data.status ?? 'in_progress',
        description: data.description ?? null,
        targetGroup: data.targetGroup ?? null,
        projectDuration: data.projectDuration ?? null,
        geographicArea: data.geographicArea ?? null,
      }, { transaction: tx });

      if (data.stakeholderIds && data.stakeholderIds.length) {
        await (project as any).setStakeholders(data.stakeholderIds, { transaction: tx });
      }

      if (data.donorIds && data.donorIds.length) {
        await (project as any).setDonors(data.donorIds, { transaction: tx });
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

      

      const result = await db.Project.findByPk(project.id, {
        include: [
          { model: db.Document, as: 'documents' },
          { model: db.Organization, as: 'stakeholders', through: { attributes: [] } },
          { model: db.Organization, as: 'donors', through: { attributes: [] } },
          { model: db.Survey, as: 'surveys' },
        ],
      });

      this.setStatus(201);
      await tx.commit();
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
    const project = await db.Project.findByPk(projectId);
    if (!project) return ServiceResponse.failure('Project not found', null, 404);

    await project.update({
      name: data.name ?? project.name,
      description: data.description ?? project.description,
      status: (data.status as any) ?? project.status,
      targetGroup: data.targetGroup ?? project.targetGroup,
      projectDuration: data.projectDuration ?? project.projectDuration,
      geographicArea: data.geographicArea ?? project.geographicArea,
    });

    if (data.stakeholderIds) {
      await (project as any).setStakeholders(data.stakeholderIds);
    }

    if (data.donorIds) {
      await (project as any).setDonors(data.donorIds);
    }

    // Remove selected existing documents
    if (data.removeDocumentIds && data.removeDocumentIds.length) {
      await db.Document.destroy({
        where: {
          id: data.removeDocumentIds,
          projectId: project.id,
        }
      });
    }

    // Add new documents (resources)
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
        });
      }
    }

    const result = await db.Project.findByPk(project.id, {
      include: [
        { model: db.Document, as: 'documents' },
        { model: db.Organization, as: 'stakeholders', through: { attributes: [] } },
        { model: db.Organization, as: 'donors', through: { attributes: [] } },
        { model: db.Survey, as: 'surveys' },
      ],
    });

    return ServiceResponse.success('Project updated successfully', result);
  }

  @Security('jwt', ['project:delete'])
  @Delete('/{projectId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteProject(@Path() projectId: string): Promise<ServiceResponse<null>> {
    const project = await db.Project.findByPk(projectId);
    if (!project) return ServiceResponse.failure('Project not found', null, 404);

    await project.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Project deleted successfully', null, 204);
  }
}
