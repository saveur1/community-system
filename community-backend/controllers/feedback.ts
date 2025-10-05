import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security, Request } from '@tsoa/runtime';
import { ServiceResponse } from '../utils/serviceResponse';
import Feedback from '../models/feedback';
import Document from '../models/document';
import { asyncCatch } from '../middlewares/errorHandler';
import { IUserAttributes } from '@/types';
import { Op } from 'sequelize';
import { User } from '@/models/users';
import Project from '@/models/project';
import Role from '@/models/role';
import { createSystemLog } from '../utils/systemLog';
import Organization from '@/models/organization';
import { createNotificationForAdmins, createNotificationForUsers } from './notifications';
import { sendFeedbackReplyEmail } from '../utils/emailService';
import config from '../config/config';
import FeedbackReply from '@/models/feedback-reply';

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
  otherFeedbackOn?: string;
}

interface FeedbackUpdateRequest extends Partial<FeedbackCreateRequest> {
  status?: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected';
}

interface FeedbackReplyCreateRequest {
  subject?: string | null;
  message: string;
}

@Route('api/feedback')
@Tags('Feedback')
export class FeedbackController extends Controller {
  @Security('jwt', ['feedback:read'])
  @Get('/')
  @asyncCatch
  public async getFeedback(
    @Request() req: { user: IUserAttributes },
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() status?: 'submitted' | 'Acknowledged' | 'Resolved' | 'Rejected',
    @Query() feedbackType?: 'positive' | 'negative' | 'suggestion' | 'concern',
    @Query() projectId?: string,
    @Query() owner?: 'me' | 'other',
    @Query() org?: 'mine' | 'others' | 'all',
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() search?: string
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (feedbackType) where.feedbackType = feedbackType;
    if (projectId) where.projectId = projectId;
    if (owner) {
      where.userId = owner === 'me' ? req.user.id : { [Op.ne]: req.user.id };
    }

    // Organization filtering: 'mine' => only current user's primary org
    // 'others' => organizations different from user's primary org
    // 'all' or undefined => no org filter
    if (org && req.user) {
      const userPrimaryOrg = (req.user as any).primaryOrganizationId ?? null;
      if (org === 'mine') {
        where.organizationId = userPrimaryOrg;
      } else if (org === 'others') {
        // include only feedbacks not from user's org
        where.organizationId = { [Op.ne]: userPrimaryOrg };
      }
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Search functionality
    let searchConditions: any = {};
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      searchConditions = {
        [Op.or]: [
          // Search in feedback main message
          { mainMessage: { [Op.like]: searchTerm } },
          // Search in feedback suggestions
          { suggestions: { [Op.like]: searchTerm } },
          // Search in otherFeedbackOn field
          { otherFeedbackOn: { [Op.like]: searchTerm } },
          // Search in user name
          { '$user.name$': { [Op.like]: searchTerm } },
          // Search in user email
          { '$user.email$': { [Op.like]: searchTerm } },
          // Search in project name
          { '$project.name$': { [Op.like]: searchTerm } }
        ]
      };
    }

    // Combine where conditions with search conditions
    const finalWhere = search && search.trim() 
      ? { [Op.and]: [where, searchConditions] }
      : where;

    const { count, rows } = await Feedback.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where: finalWhere,
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
          attributes: ['id', 'name', 'email'],
          include: [
            { model: Role, as: 'roles', attributes: ['id', 'name'] }
          ]
        },
        { 
          model: Project, 
          as: 'project', 
          attributes: ['id', 'name', 'status'] 
        },
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

  @Security('optionalJwt')
  @Post('/')
  @asyncCatch
  public async createFeedback(
    @Request() req: { user: IUserAttributes },
    @Body() data: FeedbackCreateRequest
  ): Promise<ServiceResponse<any | null>> {
    // determine organization for this feedback
    let orgId: string | null = null;
    if (req?.user && (req.user as any).primaryOrganizationId) {
      orgId = (req.user as any).primaryOrganizationId;
    } else {
      const sys = await Organization.findOne({ where: { type: 'system_owner' } });
      orgId = sys?.id ?? null;
    }

    const feedback = await Feedback.create({
      projectId: data.projectId || null,
      mainMessage: data.mainMessage || null,
      feedbackType: data.feedbackType || null,
      feedbackMethod: data.feedbackMethod,
      suggestions: data.suggestions || null,
      followUpNeeded: data.followUpNeeded || false,
      userId: req.user?.id || null,
      organizationId: orgId,
      status: 'submitted',
      responderName: data.responderName || null,
      otherFeedbackOn: data.otherFeedbackOn || null,
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
    
    await createSystemLog(req ?? null, 'created_feedback', 'Feedback', feedback.id, { feedbackType: data.feedbackType });

    // Create notifications for admins about new feedback
    try {
      // Get project name or use otherFeedbackOn for notification message
      let feedbackSubject = data.otherFeedbackOn || 'Unknown';
      if (data.projectId) {
        const project = await Project.findByPk(data.projectId, { attributes: ['name'] });
        if (project) {
          feedbackSubject = project.name;
        }
      }

      await createNotificationForAdmins(
        'feedback',
        'New feedback received',
        `New feedback has been submitted on ${feedbackSubject}. Please review and take appropriate action.`,
        {
          icon: 'HiOutlineChatAlt',
          link: `/dashboard/feedback?feedbackId=${feedback.id}`,
          entityId: feedback.id,
          entityType: 'Feedback',
          createdBy: req.user?.id,
          organizationId: orgId || undefined,
        }
      );
    } catch (error) {
      console.error('Failed to create feedback notifications:', error);
      // Don't fail the feedback creation if notification fails
    }

    return ServiceResponse.success('Feedback created successfully', result, 201);
  }

  // Replies
  @Security('jwt', ['feedback:read'])
  @Get('/{feedbackId}/replies')
  @asyncCatch
  public async getFeedbackReplies(@Path() feedbackId: string): Promise<ServiceResponse<any[]>> {
    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) return ServiceResponse.failure('Feedback not found', [], 404);
    const replies = await FeedbackReply.findAll({
      where: { feedbackId },
      order: [['createdAt', 'ASC']],
    });
    return ServiceResponse.success('Feedback replies retrieved successfully', replies);
  }

  @Security('jwt', ['feedback:update'])
  @Post('/{feedbackId}/replies')
  @asyncCatch
  public async addFeedbackReply(
    @Request() req: { user: IUserAttributes },
    @Path() feedbackId: string,
    @Body() data: FeedbackReplyCreateRequest,
  ): Promise<ServiceResponse<any | null>> {
    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) return ServiceResponse.failure('Feedback not found', null, 404);

    // Set organization for reply
    let orgId: string | null = feedback.organizationId ?? null;
    if (req?.user && (req.user as any)?.primaryOrganizationId) {
      orgId = (req.user as any)?.primaryOrganizationId;
    }

    const reply = await FeedbackReply.create({
      feedbackId,
      subject: data.subject ?? null,
      message: data.message,
      userId: req.user?.id || null,
      organizationId: orgId,
    });

    await createSystemLog(req ?? null, 'replied_feedback', 'Feedback', feedbackId, {
      replyId: reply.id,
    });

    // Notify feedback owner if email exists
    try {
      // Get user email if available
      const feedbackWithUser = await Feedback.findByPk(feedbackId, { include: [{ model: User, as: 'user', attributes: ['id', 'email'] }] });
      const recipientEmail = (feedbackWithUser as any)?.user?.email;
      const link = `${config.frontendUrl}/dashboard/feedback?feedbackId=${feedbackId}`;
      if (recipientEmail) {
        await sendFeedbackReplyEmail(recipientEmail, {
          subject: data.subject ?? null,
          message: data.message,
          link,
        });
      }

      const recipientUserId = (feedbackWithUser as any)?.user?.id as string | undefined;
      if (recipientUserId) {
        await createNotificationForUsers(
          'feedback',
          'New reply to your feedback',
          data.subject && data.subject.trim().length > 0 ? data.subject : 'You have a new reply',
          [recipientUserId],
          {
            icon: 'HiOutlineChatAlt2',
            link,
            entityId: feedbackId,
            entityType: 'Feedback',
            createdBy: req.user?.id,
            organizationId: orgId || undefined,
          }
        );
      }
    } catch (notifyErr) {
      console.error('Failed to send feedback reply notifications/email:', notifyErr);
    }

    return ServiceResponse.success('Reply added successfully', reply, 201);
  }

  @Security('jwt', ['feedback:update'])
  @Put('/{feedbackId}')
  @asyncCatch
  public async updateFeedback(
    @Request() req: any,
    @Path() feedbackId: string,
    @Body() data: FeedbackUpdateRequest
  ): Promise<ServiceResponse<any | null>> {
    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) return ServiceResponse.failure('Feedback not found', null, 404);

    // determine organization for update (preserve existing or set by user org)
    let orgId = (feedback as any).organizationId ?? null;
    if (req?.user && (req.user as any).primaryOrganizationId) {
      orgId = (req.user as any).primaryOrganizationId;
    } else if (!orgId) {
      const sys = await Organization.findOne({ where: { type: 'system_owner' } });
      orgId = sys?.id ?? null;
    }

    await feedback.update({
      projectId: data.projectId ?? feedback.projectId ?? null,
      mainMessage: data.mainMessage ?? feedback.mainMessage,
      feedbackType: data.feedbackType ?? feedback.feedbackType,
      feedbackMethod: data.feedbackMethod ?? feedback.feedbackMethod,
      suggestions: data.suggestions ?? feedback.suggestions,
      followUpNeeded: data.followUpNeeded ?? feedback.followUpNeeded,
      status: data.status ?? feedback.status,
      responderName: data.responderName ?? feedback.responderName,
      otherFeedbackOn: data.otherFeedbackOn ?? feedback.otherFeedbackOn,
      organizationId: orgId,
    } as any);

    if (data.documents) {
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
    await createSystemLog(req ?? null, 'updated_feedback', 'Feedback', feedback.id, { changes: Object.keys(data) });
    return ServiceResponse.success('Feedback updated successfully', result);
  }

  @Security('jwt', ['feedback:delete'])
  @Delete('/{feedbackId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteFeedback(
    @Request() req: any,
    @Path() feedbackId: string
  ): Promise<ServiceResponse<null>> {
    const feedback = await Feedback.findByPk(feedbackId);
    if (!feedback) return ServiceResponse.failure('Feedback not found', null, 404);

    const documents = await feedback.getDocuments();
    for (const doc of documents) {
      await doc.destroy();
    }

    await feedback.destroy();
    await createSystemLog(req ?? null, 'deleted_feedback', 'Feedback', feedbackId, { mainMessage: feedback.mainMessage });
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