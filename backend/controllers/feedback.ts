import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security, Request } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import Feedback from '../models/feedback';
import Document from '../models/document';
import { asyncCatch } from '../middlewares/errorHandler';
import { IUserAttributes } from '@/types';
import { Op } from 'sequelize';
import { User } from '@/models/users';
import Project from '@/models/project';
import Role from '@/models/role';

interface DocumentInput {
  documentName: string;
  documentUrl: string;
  type: string;
  size?: number | null;
  publicId?: string | null;
  deleteToken?: string | null;
}

interface FeedbackCreateRequest {
  projectId?: string | null;
  mainMessage?: string | null;
  feedbackType?: 'positive' | 'negative' | 'suggestion' | 'concern' | null;
  feedbackMethod: 'text' | 'voice' | 'video';
  suggestions?: string | null;
  followUpNeeded?: boolean;
  documents?: DocumentInput[];
  responderName?: string | null;
}

interface FeedbackUpdateRequest extends Partial<FeedbackCreateRequest> {
  status?: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
}

@Route('api/feedback')
@Tags('Feedback')
export class FeedbackController extends Controller {
  @Security('jwt', ['feedback:all:read'])
  @Get('/')
  @asyncCatch
  public async getFeedback(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() status?: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected',
    @Query() feedbackType?: 'positive' | 'negative' | 'suggestion' | 'concern',
    @Query() projectId?: string
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const where: any = {};
    
    if (status) where.status = status;
    if (feedbackType) where.feedbackType = feedbackType;
    if (projectId) where.projectId = projectId;

    const { count, rows } = await Feedback.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where,
      include: [
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'documentName', 'documentUrl', 'type', 'size', 'publicId', 'deleteToken'],
          required: false,
        },
        { 
          model: User, 
          as: 'user',
          attributes:['id', 'name', 'email'],
          include: [
            { model: Role, as: 'roles', attributes: ['id', 'name'] }
          ]
        },
        { model: Project, 
          as: 'project', 
          attributes: ['id', 'name', 'status'] },
      ],
      distinct: true,
    });

    return ServiceResponse.success(
      'Feedback retrieved successfully',
      rows,
      200,
      { total: count, page, totalPages: Math.ceil(count / limit) }
    );
  }

  @Security('jwt', ['feedback:personal:read'])
  @Get('/user')
  @asyncCatch
  public async getUserFeedback(
    @Request() req: { user: IUserAttributes },
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() status?: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected'
  ): Promise<ServiceResponse<any[]>> {
    const userId = req.user.id;
    const offset = (page - 1) * limit;
    const where: any = { userId };
    
    if (status) where.status = status;

    const { count, rows } = await Feedback.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where,
      include: [
        {
          model: Document,
          as: 'documents',
          attributes: ['id', 'documentName', 'documentUrl', 'type', 'size', 'publicId', 'deleteToken'],
          required: false,
        },
        { 
          model: User, 
          as: 'user',
          attributes:['id', 'name', 'email'],
          include: [
            { model: Role, as: 'roles', attributes: ['id', 'name'] }
          ]
        },
        { model: Project, 
          as: 'project', 
          attributes: ['id', 'name', 'status'] },
      ],
      distinct: true,
    });

    return ServiceResponse.success(
      'User feedback retrieved successfully',
      rows,
      200,
      { total: count, page, totalPages: Math.ceil(count / limit) }
    );
  }

  @Security('jwt', ['feedback:read'])
  @Get('/{feedbackId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Feedback not found')
  public async getFeedbackById(@Path() feedbackId: string): Promise<ServiceResponse<any | null>> {
    const feedback = await Feedback.findByPk(feedbackId, {
      include: [
        {
          model: Document,
          as: 'documents',
        },
      ],
    });
    
    if (!feedback) return ServiceResponse.failure('Feedback not found', null, 404);
    return ServiceResponse.success('Feedback retrieved successfully', feedback);
  }

  @Post('/')
  @asyncCatch
  public async createFeedback(
    @Request() req: { user: IUserAttributes },
    @Body() data: FeedbackCreateRequest
  ): Promise<ServiceResponse<any | null>> {
    const feedback = await Feedback.create({
      projectId: data.projectId || null,
      mainMessage: data.mainMessage || null,
      feedbackType: data.feedbackType || null,
      feedbackMethod: data.feedbackMethod,
      suggestions: data.suggestions || null,
      followUpNeeded: data.followUpNeeded || false,
      userId: req.user?.id || null,
      status: 'submitted',
      responderName: data.responderName || null,
    });

    if (data.documents && data.documents.length > 0) {
      const documentsToCreate = data.documents.map(doc => ({
        ...doc,
        userId: req.user?.id || null,
        addedAt: new Date(),
      }));

      const createdDocuments = await Document.bulkCreate(documentsToCreate as any[]);
      await feedback.addDocument(createdDocuments);
    }

    this.setStatus(201);
    const result = await Feedback.findByPk(feedback.id, {
      include: [
        {
          model: Document,
          as: 'documents',
        },
      ],
    });
    
    return ServiceResponse.success('Feedback created successfully', result, 201);
  }

  @Security('jwt', ['feedback:update'])
  @Put('/{feedbackId}')
  @asyncCatch
  public async updateFeedback(
    @Path() feedbackId: string,
    @Body() data: FeedbackUpdateRequest
  ): Promise<ServiceResponse<any | null>> {
    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) return ServiceResponse.failure('Feedback not found', null, 404);

    await feedback.update({
      projectId: data.projectId ?? feedback.projectId,
      mainMessage: data.mainMessage ?? feedback.mainMessage,
      feedbackType: data.feedbackType ?? feedback.feedbackType,
      feedbackMethod: data.feedbackMethod ?? feedback.feedbackMethod,
      suggestions: data.suggestions ?? feedback.suggestions,
      followUpNeeded: data.followUpNeeded ?? feedback.followUpNeeded,
      status: data.status ?? feedback.status,
      responderName: data.responderName ?? feedback.responderName,
    });

    if (data.documents) {
      // For simplicity, this example replaces all documents.
      // A more sophisticated approach might involve diffing the arrays.
      const existingDocuments = await feedback.getDocuments();
      if (existingDocuments.length > 0) {
        const idsToRemove = existingDocuments.map((doc: any) => doc.id);
        await Document.destroy({ where: { id: { [Op.in]: idsToRemove } } });
      }

      if (data.documents.length > 0) {
        const documentsToCreate = data.documents.map(doc => ({
          ...doc,
          userId: feedback.userId,
          addedAt: new Date(),
        }));
        const createdDocuments = await Document.bulkCreate(documentsToCreate as any[]);
        await feedback.addDocument(createdDocuments);
      }
    }

    const result = await Feedback.findByPk(feedback.id, {
      include: [
        {
          model: Document,
          as: 'documents',
        },
      ],
    });
    
    return ServiceResponse.success('Feedback updated successfully', result);
  }

  @Security('jwt', ['feedback:delete'])
  @Delete('/{feedbackId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteFeedback(@Path() feedbackId: string): Promise<ServiceResponse<null>> {
    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) return ServiceResponse.failure('Feedback not found', null, 404);

    // Remove associated documents
    const documents = await feedback.getDocuments();
    for (const doc of documents) {
      await doc.destroy();
    }

    await feedback.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Feedback deleted successfully', null, 204);
  }

  @Security('jwt', ['feedback:read'])
  @Get('/stats/summary')
  @asyncCatch
  public async getFeedbackStats(): Promise<ServiceResponse<any>> {
    const [
      totalCount,
      submittedCount,
      acknowledgedCount,
      resolvedCount,
      rejectedCount,
      positiveCount,
      negativeCount,
      suggestionCount,
      concernCount,
    ] = await Promise.all([
      Feedback.count(),
      Feedback.count({ where: { status: 'submitted' } }),
      Feedback.count({ where: { status: 'Acknowledged' } }),
      Feedback.count({ where: { status: 'Resolved' } }),
      Feedback.count({ where: { status: 'Rejected' } }),
      Feedback.count({ where: { feedbackType: 'positive' } }),
      Feedback.count({ where: { feedbackType: 'negative' } }),
      Feedback.count({ where: { feedbackType: 'suggestion' } }),
      Feedback.count({ where: { feedbackType: 'concern' } }),
    ]);

    const stats = {
      total: totalCount,
      byStatus: {
        submitted: submittedCount,
        acknowledged: acknowledgedCount,
        resolved: resolvedCount,
        rejected: rejectedCount,
      },
      byType: {
        positive: positiveCount,
        negative: negativeCount,
        suggestion: suggestionCount,
        concern: concernCount,
      },
    };

    return ServiceResponse.success('Feedback statistics retrieved successfully', stats);
  }
}
