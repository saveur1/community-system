import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security, Request } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import Survey from '../models/survey';
import Role from '../models/role';
import { asyncCatch } from '../middlewares/errorHandler';
import Question from '../models/question';
import Answer from '../models/answer';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import db from '@/models';
import { createSystemLog } from '../utils/systemLog';

interface SurveyCreateRequest {
  title: string;
  description: string;
  project: string; // currently a string label as per UI
  surveyType: "general" | "report-form" | undefined
  startAt: string; // ISO timestamp, required
  endAt: string;   // ISO timestamp, required
  estimatedTime: string; // string to match UI
  questions: Array<
    | {
        id: number;
        type: 'single_choice' | 'multiple_choice';
        title: string;
        description: string;
        required: boolean;
        options: string[];
      }
    | {
        id: number;
        type: 'text_input' | 'textarea';
        title: string;
        description: string;
        required: boolean;
        placeholder: string;
      }
  >;
  allowedRoles?: string[]; // NEW: array of Role IDs allowed to view/answer
}

interface SurveyUpdateRequest extends Partial<SurveyCreateRequest> {
  status?: "active" | "paused" | "archived";
}

@Route('api/surveys')
@Tags('Surveys')
export class SurveyController extends Controller {
  @Security('jwt', ['survey:read'])
  @Get('/')
  @asyncCatch
  public async getSurveys(
    @Request() request: any,
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() status?: 'active' | 'paused' | 'archived',
    @Query() surveyType?: 'general' | 'report-form',
    @Query() owner?: 'me' | 'others' | 'any', // owner filter
    @Query() responded?: boolean, // if true, return only surveys the current user has answered
    @Query() allowed?: boolean, // if true, return only surveys that allow any of the current user's roles
    @Query() startDate?: string,
    @Query() endDate?: string
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const where: any = {};
    // base includes; we'll adjust allowedRoles include below if `allowed` is true
    const includeArr: any[] = [
      { model: Question, as: 'questionItems' },
      // include answers (non-required by default)
      { model: Answer, as: 'answers', include: [{ model: db.User, as: 'user', attributes: ['id', 'name'] }] },
      { model: Role, as: 'allowedRoles', through: { attributes: [] }, required: false },
    ];
    // DATE RANGE FILTER
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // STATUS FILTER
    if (status) where.status = status;

    // SURVEY TYPE FILTER
    if (surveyType) where.surveyType = surveyType;

    // OWNER FILTERING (requires authenticated user)
    const userId = request?.user?.id ?? null;
    if (owner === 'me') {
      if (!userId) {
        return ServiceResponse.failure('Authentication required to filter by owner', [], 401);
      }
      where.createdBy = userId;
    } else if (owner === 'others') {
      if (!userId) {
        return ServiceResponse.failure('Authentication required to filter by owner', [], 401);
      }
      where.createdBy = { [Op.ne]: userId };
    }

    // RESPONDED FILTERING (requires authenticated user)
    if (responded) {
      if (!userId) {
        return ServiceResponse.failure('Authentication required to filter by responded', [], 401);
      }
      // require at least one answer by this user (inner join)
      includeArr[1] = { model: Answer, as: 'answers', required: true, where: { userId }, include: [{ model: db.User, as: 'user', attributes: ['id', 'name'] }] };
    }

    // ALLOWED FILTERING: only surveys that allow any of the current user's roles
    if (allowed) {
      if (!userId) {
        return ServiceResponse.failure('Authentication required to filter by allowed', [], 401);
      }
      // load user's roles
      const user = await db.User.findByPk(userId, {
        include: [{ model: db.Role, as: 'roles', through: { attributes: [] } }],
      });
      
      const roleIds = (user?.roles ?? []).map((r: any) => r.id).filter(Boolean);
      if (!roleIds.length) {
        // user has no roles -> no surveys allowed
        return ServiceResponse.success('Surveys retrieved successfully', [], 200, { total: 0, page, totalPages: 0 });
      }

      // replace allowedRoles include to be required and filter by user's role ids (inner join)
      includeArr[2] = {
        model: Role,
        as: 'allowedRoles',
        through: { attributes: [] },
        required: true,
        where: { id: roleIds },
      };
    }

    const { count, rows } = await Survey.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where,
      include: includeArr,
      distinct: true,
    });

    return ServiceResponse.success(
      'Surveys retrieved successfully',
      rows,
      200,
      { total: count, page, totalPages: Math.ceil(count / limit) }
    );
  }

  @Security('jwt', ['survey:read'])
  @Get('/{surveyId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Survey not found')
  public async getSurveyById(@Path() surveyId: string): Promise<ServiceResponse<any | null>> {
    const survey = await Survey.findByPk(surveyId, {
      include: [
        { model: Question, as: 'questionItems' },
        { model: Answer, as: 'answers' },
        { model: Role, as: 'allowedRoles', through: { attributes: [] } },
      ],
    });
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);
    return ServiceResponse.success('Survey retrieved successfully', survey);
  }

  @Security('jwt', ['survey:create'])
  @Post('/')
  @asyncCatch
  public async createSurvey(@Request() request: any, @Body() data: SurveyCreateRequest): Promise<ServiceResponse<any | null>> {
    const userId = request?.user?.id ?? null;
    const start = new Date(data.startAt);
    const end = new Date(data.endAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return ServiceResponse.failure('Invalid startAt/endAt values', null, 400);
    }

    const created = await sequelize.transaction(async (t) => {
      const s = await Survey.create({
        title: data.title,
        description: data.description,
        project: data.project,
        surveyType: data.surveyType,
        estimatedTime: data.estimatedTime,
        startAt: start,
        endAt: end,
        status: 'active',
        createdBy: userId,
      }, { transaction: t });

      if (data.questions && data.questions.length > 0) {
        const questionsToCreate = data.questions.map(q => {
          const { id, ...questionData } = q;
          return {
            ...questionData,
            surveyId: s.id,
            options: (q as any).options ?? null,
            placeholder: (q as any).placeholder ?? null,
          };
        });
        await Question.bulkCreate(questionsToCreate as any, { transaction: t });
      }

      if (data.allowedRoles && data.allowedRoles.length > 0) {
        const roles = await Role.findAll({ where: { id: data.allowedRoles }, transaction: t });
        if (roles.length) {
          await (s as any).setAllowedRoles(roles, { transaction: t });
        }
      }

      return s;
    });

    this.setStatus(201);
    const result = await Survey.findByPk(created.id, {
      include: [
        { model: Question, as: 'questionItems' },
        { model: Answer, as: 'answers' },
        { model: Role, as: 'allowedRoles', through: { attributes: [] } },
      ],
    });

    // Log creation (best-effort)
    await createSystemLog(request ?? null, 'created_survey', 'Survey', created.id, { title: data.title });

    return ServiceResponse.success('Survey created successfully', result, 201);
  }

  @Security('jwt', ['survey:update'])
  @Put('/{surveyId}')
  @asyncCatch
  public async updateSurvey(
    @Path() surveyId: string,
    @Request() request: any,
    @Body() data: SurveyUpdateRequest
  ): Promise<ServiceResponse<any | null>> {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    await sequelize.transaction(async (t) => {
      if (data.startAt || data.endAt) {
        const start = data.startAt ? new Date(data.startAt) : survey.startAt;
        const end = data.endAt ? new Date(data.endAt) : survey.endAt;
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
          throw new Error('Invalid startAt/endAt values');
        }
      }

      await survey.update({
        title: data.title ?? survey.title,
        description: data.description ?? survey.description,
        project: data.project ?? survey.project,
        surveyType: data.surveyType ?? survey.surveyType,
        estimatedTime: data.estimatedTime ?? survey.estimatedTime,
        startAt: data.startAt ? new Date(data.startAt) : survey.startAt,
        endAt: data.endAt ? new Date(data.endAt) : survey.endAt,
        status: data.status ?? survey.status ?? 'active',
      }, { transaction: t });

      if (data.questions) {
        await Question.destroy({ where: { surveyId: survey.id }, transaction: t });
        const questionsToCreate = data.questions.map(q => {
          const { id, ...questionData } = q;
          return {
            ...questionData,
            surveyId: survey.id,
            options: (q as any).options ?? null,
            placeholder: (q as any).placeholder ?? null,
          };
        });
        await Question.bulkCreate(questionsToCreate as any, { transaction: t });
      }

      if (data.allowedRoles) {
        const roles = await Role.findAll({ where: { id: data.allowedRoles }, transaction: t });
        await (survey as any).setAllowedRoles(roles, { transaction: t });
      }
    });

    const result = await Survey.findByPk(survey.id, {
      include: [
        { model: Question, as: 'questionItems' },
        { model: Answer, as: 'answers' },
        { model: Role, as: 'allowedRoles', through: { attributes: [] } },
      ],
    });

    await createSystemLog(request ?? null, 'updated_survey', 'Survey', survey.id, { changes: Object.keys(data) });

    return ServiceResponse.success('Survey updated successfully', result);
  }

  @Security('jwt', ['survey:delete'])
  @Delete('/{surveyId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteSurvey(@Path() surveyId: string, @Request() request?: any): Promise<ServiceResponse<null>> {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    await survey.destroy();
    await createSystemLog(request ?? null, 'deleted_survey', 'Survey', surveyId, {});
    this.setStatus(204);
    return ServiceResponse.success('Survey deleted successfully', null, 204);
  }

  // New: submit answers for a survey
  @Security('jwt', ['survey:respond'])
  @Post('/{surveyId}/answers')
  @asyncCatch
  public async submitAnswers(
    @Path() surveyId: string,
    @Request() request: any,
    @Body()
    body: {
      answers: Array<{
        questionId: string;
        userId?: string | null;
        answerText?: string | null;
        answerOptions?: string[] | null;
      }>;
    }
  ): Promise<ServiceResponse<any | null>> {
    const survey = await Survey.findByPk(surveyId);

    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    if ((survey as any).status === 'paused' || (survey as any).status === 'archived') {
      return ServiceResponse.failure('Survey is not accepting responses', null, 403);
    }

    const createdAnswers: any[] = [];
    await sequelize.transaction(async (t) => {
      for (const a of body.answers || []) {
        const created = await (survey as any).createAnswer({
          userId: a.userId ?? request?.user?.id ?? null,
          surveyId: survey.id,
          questionId: a.questionId,
          answerText: a.answerText ?? null,
          answerOptions: a.answerOptions ?? null,
        }, { transaction: t });
        createdAnswers.push(created);
      }
    });

    await createSystemLog(request ?? null, 'responded_survey', survey?.dataValues?.title, surveyId, { answersCount: (body.answers || []).length });

    const result = await Survey.findByPk(survey.id, {
      include: [
        { model: Question, as: 'questionItems' },
        { model: Answer, as: 'answers' },
      ],
    });

    this.setStatus(201);
    return ServiceResponse.success('Answers submitted successfully', result, 201);
  }
}