import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security, Request } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import CommunitySession from '../models/community-session';
import Comment from '../models/comment';
import Document from '../models/document';
import { User } from '../models/users';
import { Role } from '../models/role';
import { asyncCatch } from '../middlewares/errorHandler';
import { IUserAttributes } from '@/types';

interface CommunitySessionCreateRequest {
  title: string;
  shortDescription: string;
  type: 'video' | 'image' | 'document' | 'audio';
  allowedRoles: string[];
  document: {
    documentName: string;
    size?: number | null;
    type?: string | null;
    addedAt?: Date;
    documentUrl?: string | null;
    userId: string;
    publicId?: string | null;
    deleteToken?: string | null;
  };
}

interface CommunitySessionUpdateRequest extends Partial<CommunitySessionCreateRequest> {
  isActive?: boolean;
}

interface CommentCreateRequest {
  content: string;
  timestamp?: number;
}

@Route('api/community-sessions')
@Tags('Community Sessions')
export class CommunitySessionController extends Controller {
  @Security('jwt', ['community_session:read'])
  @Get('/')
  @asyncCatch
  public async getCommunitySessions(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() type?: 'video' | 'image' | 'document' | 'audio',
    @Query() isActive?: boolean
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const where: any = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive;

    const { count, rows } = await CommunitySession.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where,
      include: [
        { 
          model: Document, 
          as: 'document',
          attributes: ['id', 'documentName', 'documentUrl', 'type', 'size']
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        },
        { 
          model: User, 
          as: 'creator',
          attributes: ['id', 'name', 'email', 'profile']
        },
        { 
          model: Comment, 
          as: 'comments',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'profile']
          }]
        }
      ],
      distinct: true,
    });

    return ServiceResponse.success(
      'Community sessions retrieved successfully',
      rows,
      200,
      { total: count, page, totalPages: Math.ceil(count / limit) }
    );
  }

  @Security('jwt', ['community_session:read'])
  @Get('/{sessionId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Community session not found')
  public async getCommunitySessionById(@Path() sessionId: string): Promise<ServiceResponse<any | null>> {
    const session = await CommunitySession.findByPk(sessionId, {
      include: [
        { 
          model: Document, 
          as: 'document',
          attributes: ['id', 'documentName', 'documentUrl', 'type', 'size']
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        },
        { 
          model: User, 
          as: 'creator',
          attributes: ['id', 'name', 'email', 'profile']
        },
        { 
          model: Comment, 
          as: 'comments',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'profile']
          }],
          order: [['createdAt', 'ASC']]
        }
      ],
    });

    if (!session) return ServiceResponse.failure('Community session not found', null, 404);
    return ServiceResponse.success('Community session retrieved successfully', session);
  }

  @Security('jwt', ['community_session:create'])
  @Post('/')
  @asyncCatch
  public async createCommunitySession(
    @Request() req: { user: IUserAttributes },
    @Body() data: CommunitySessionCreateRequest
  ): Promise<ServiceResponse<any | null>> {
    // 1) Create the session first (no document yet)
    const created = await CommunitySession.create({
      title: data.title,
      shortDescription: data.shortDescription,
      documentId: null,
      type: data.type,
      allowedRoles: data.allowedRoles,
      createdBy: req.user.id,
      isActive: true,
    });

    // Link roles to session (many-to-many) and persist in allowedRoles cache
    await created.setAllowedRolesByIds(data.allowedRoles);

    // 2) Create the document and link it to the session
    const createdDoc = await Document.create({
      documentName: data.document.documentName,
      size: data.document.size ?? null,
      type: data.document.type ?? null,
      addedAt: data.document.addedAt ?? new Date(),
      documentUrl: data.document.documentUrl ?? null,
      projectId: null,
      userId: req.user.id, // enforce server-side user
      publicId: data.document.publicId ?? null,
      deleteToken: data.document.deleteToken ?? null,
    });

    await created.update({ documentId: createdDoc.id });

    this.setStatus(201);
    const result = await CommunitySession.findByPk(created.id, {
      include: [
        { 
          model: Document, 
          as: 'document',
          attributes: ['id', 'documentName', 'documentUrl', 'type', 'size']
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        },
        { 
          model: User, 
          as: 'creator',
          attributes: ['id', 'name', 'email', 'profile']
        },
        { model: Comment, as: 'comments' }
      ],
    });

    return ServiceResponse.success('Community session created successfully', result, 201);
  }

  @Security('jwt', ['community_session:update'])
  @Put('/{sessionId}')
  @asyncCatch
  public async updateCommunitySession(
    @Path() sessionId: string,
    @Body() data: CommunitySessionUpdateRequest,
    @Request() req: { user: IUserAttributes }
  ): Promise<ServiceResponse<any | null>> {
    const session = await CommunitySession.findByPk(sessionId);
    if (!session) return ServiceResponse.failure('Community session not found', null, 404);

    await session.update({
      title: data.title ?? session.title,
      shortDescription: data.shortDescription ?? session.shortDescription,
      type: data.type ?? session.type,
      allowedRoles: data.allowedRoles ?? session.allowedRoles,
      isActive: data.isActive ?? session.isActive,
    });

    if (data.allowedRoles) {
      await session.setAllowedRolesByIds(data.allowedRoles);
    }

    // If a new document payload is provided, create it and relink
    if (data.document) {
      const newDoc = await Document.create({
        documentName: data.document.documentName,
        size: data.document.size ?? null,
        type: data.document.type ?? null,
        addedAt: data.document.addedAt ?? new Date(),
        documentUrl: data.document.documentUrl ?? null,
        projectId: null,
        userId: req.user.id,
        publicId: data.document.publicId ?? null,
        deleteToken: data.document.deleteToken ?? null,
      });
      await session.update({ documentId: newDoc.id });
    }

    const result = await CommunitySession.findByPk(session.id, {
      include: [
        { 
          model: Document, 
          as: 'document',
          attributes: ['id', 'documentName', 'documentUrl', 'type', 'size']
        },
        {
          model: Role,
          as: 'roles',
          attributes: ['id', 'name', 'description']
        },
        { 
          model: User, 
          as: 'creator',
          attributes: ['id', 'name', 'email', 'profile']
        },
        { model: Comment, as: 'comments' }
      ],
    });

    return ServiceResponse.success('Community session updated successfully', result);
  }

  @Security('jwt', ['community_session:delete'])
  @Delete('/{sessionId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteCommunitySession(@Path() sessionId: string): Promise<ServiceResponse<null>> {
    const session = await CommunitySession.findByPk(sessionId);
    if (!session) return ServiceResponse.failure('Community session not found', null, 404);

    await session.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Community session deleted successfully', null, 204);
  }

  @Security('jwt', ['community_session:read'])
  @Get('/{sessionId}/comments')
  @asyncCatch
  public async getSessionComments(
    @Path() sessionId: string,
    @Query() page: number = 1,
    @Query() limit: number = 50
  ): Promise<ServiceResponse<any[]>> {
    const session = await CommunitySession.findByPk(sessionId);
    if (!session) return ServiceResponse.failure('Community session not found', [], 404);

    const offset = (page - 1) * limit;
    const { count, rows } = await Comment.findAndCountAll({
      where: { communitySessionId: sessionId, isActive: true },
      limit,
      offset,
      order: [['createdAt', 'ASC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile']
      }],
    });

    return ServiceResponse.success(
      'Comments retrieved successfully',
      rows,
      200,
      { total: count, page, totalPages: Math.ceil(count / limit) }
    );
  }

  @Post('/{sessionId}/comments')
  @asyncCatch
  public async addComment(
    @Request() req: { user: IUserAttributes },
    @Path() sessionId: string,
    @Body() data: CommentCreateRequest
  ): Promise<ServiceResponse<any | null>> {
    const session = await CommunitySession.findByPk(sessionId);
    if (!session) return ServiceResponse.failure('Community session not found', null, 404);

    if (!session.isActive) {
      return ServiceResponse.failure('Cannot comment on inactive session', null, 403);
    }

    const comment = await Comment.create({
      content: data.content,
      communitySessionId: sessionId,
      userId: req.user.id,
      timestamp: data.timestamp,
      isActive: true,
    });

    this.setStatus(201);
    const result = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile']
      }],
    });

    return ServiceResponse.success('Comment added successfully', result, 201);
  }

  @Security('jwt', ['comment:update'])
  @Put('/comments/{commentId}')
  @asyncCatch
  public async updateComment(
    @Request() req: { user: IUserAttributes },
    @Path() commentId: string,
    @Body() data: { content: string }
  ): Promise<ServiceResponse<any | null>> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) return ServiceResponse.failure('Comment not found', null, 404);

    // Only allow user to update their own comments
    if (comment.userId !== req.user.id) {
      return ServiceResponse.failure('Unauthorized to update this comment', null, 403);
    }

    await comment.update({ content: data.content });

    const result = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'profile']
      }],
    });

    return ServiceResponse.success('Comment updated successfully', result);
  }

  @Security('jwt', ['comment:delete'])
  @Delete('/comments/{commentId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteComment(
    @Request() req: { user: IUserAttributes },
    @Path() commentId: string
  ): Promise<ServiceResponse<null>> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) return ServiceResponse.failure('Comment not found', null, 404);

    // Only allow user to delete their own comments
    if (comment.userId !== req.user.id) {
      return ServiceResponse.failure('Unauthorized to delete this comment', null, 403);
    }

    await comment.update({ isActive: false }); // Soft delete
    this.setStatus(204);
    return ServiceResponse.success('Comment deleted successfully', null, 204);
  }
}
