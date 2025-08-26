import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import Document from '../models/document';
import Project from '../models/project';
import { asyncCatch } from '../middlewares/errorHandler';

interface DocumentCreateRequest {
  projectId?: string;
  documentName: string;
  size?: number | null;
  type?: string | null;
  addedAt?: Date;
  documentUrl?: string | null;
  userId: string;
  publicId?: string | null;
  deleteToken?: string | null;
}

interface DocumentUpdateRequest extends Partial<DocumentCreateRequest> {}

@Route('api/documents')
@Tags('Documents')
export class DocumentController extends Controller {
  @Security('jwt', ['project:read'])
  @Get('/')
  @asyncCatch
  public async getDocuments(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() projectId?: string,
    @Query() userId?: string
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    const { count, rows } = await Document.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    return ServiceResponse.success('Documents retrieved successfully', rows, 200, { total: count, page, totalPages: Math.ceil(count / limit) });
  }

  @Security('jwt', ['project:read'])
  @Get('/{documentId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Document not found')
  public async getDocumentById(@Path() documentId: string): Promise<ServiceResponse<any | null>> {
    const doc = await Document.findByPk(documentId);
    if (!doc) return ServiceResponse.failure('Document not found', null, 404);
    return ServiceResponse.success('Document retrieved successfully', doc);
  }

  @Security('jwt', ['project:create'])
  @Post('/')
  @SuccessResponse(201, 'Created')
  @asyncCatch
  public async createDocument(@Body() data: DocumentCreateRequest): Promise<ServiceResponse<any | null>> {
    if (data.projectId) {
      const project = await Project.findByPk(data.projectId);
      if (!project) return ServiceResponse.failure('Parent project not found', null, 404);
    }

    const doc = await Document.create({
      projectId: data.projectId ?? null,
      documentName: data.documentName,
      size: data.size ?? null,
      type: data.type ?? null,
      addedAt: data.addedAt ?? new Date(),
      documentUrl: data.documentUrl ?? null,
      userId: data.userId,
      publicId: data.publicId ?? null,
      deleteToken: data.deleteToken ?? null,
    });

    this.setStatus(201);
    return ServiceResponse.success('Document created successfully', doc, 201);
  }

  @Security('jwt', ['project:update'])
  @Put('/{documentId}')
  @asyncCatch
  public async updateDocument(
    @Path() documentId: string,
    @Body() data: DocumentUpdateRequest
  ): Promise<ServiceResponse<any | null>> {
    const doc = await Document.findByPk(documentId);
    if (!doc) return ServiceResponse.failure('Document not found', null, 404);

    await doc.update({
      documentName: data.documentName ?? doc.documentName,
      size: data.size ?? doc.size,
      type: data.type ?? doc.type,
      addedAt: data.addedAt ?? doc.addedAt,
      documentUrl: data.documentUrl ?? doc.documentUrl,
      projectId: data.projectId ?? doc.projectId,
      userId: data.userId ?? doc.userId,
      publicId: data.publicId ?? doc.publicId,
      deleteToken: data.deleteToken ?? doc.deleteToken,
    });

    return ServiceResponse.success('Document updated successfully', doc);
  }

  @Security('jwt', ['project:delete'])
  @Delete('/{documentId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteDocument(@Path() documentId: string): Promise<ServiceResponse<null>> {
    const doc = await Document.findByPk(documentId);
    if (!doc) return ServiceResponse.failure('Document not found', null, 404);

    await doc.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Document deleted successfully', null, 204);
  }
}
