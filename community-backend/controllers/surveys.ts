import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security, Request } from '@tsoa/runtime';
import { ServiceResponse } from '../utils/serviceResponse';
import { asyncCatch } from '../middlewares/errorHandler';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import db from '@/models';
import { createSystemLog } from '../utils/systemLog';
import { randomUUID } from 'crypto';
import type { Includeable } from 'sequelize';

interface SurveyCreateRequest {
  title: string;
  description: string;
  projectId?: string;
  surveyType: "general" | "report-form" | "rapid-enquiry" | undefined
  startAt: string; // ISO timestamp, required
  endAt: string;   // ISO timestamp, required
  estimatedTime: string; // string to match UI
  sections: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
  questions: Array<
    | {
      id: number;
      type: 'single_choice' | 'multiple_choice';
      title: string;
      description: string;
      required: boolean;
      sectionId: string;
      questionNumber?: number;
      options: string[];
    }
    | {
      id: number;
      type: 'text_input' | 'textarea';
      title: string;
      description: string;
      required: boolean;
      sectionId: string;
      questionNumber?: number;
      placeholder: string;
    }
    | {
      id: number;
      type: 'file_upload';
      title: string;
      description: string;
      required: boolean;
      sectionId: string;
      questionNumber?: number;
      allowedTypes: string[];
      maxSize: number;
    }
    | {
      id: number;
      type: 'rating';
      title: string;
      description: string;
      required: boolean;
      sectionId: string;
      questionNumber?: number;
      maxRating: number;
      ratingLabel?: string;
    }
    | {
      id: number;
      type: 'linear_scale';
      title: string;
      description: string;
      required: boolean;
      sectionId: string;
      questionNumber?: number;
      minValue: number;
      maxValue: number;
      minLabel?: string;
      maxLabel?: string;
    }
  >;
  allowedRoles?: string[]; // NEW: array of Role IDs allowed to view/answer
}

interface SurveyUpdateRequest extends Partial<SurveyCreateRequest> {
  status?: "draft" | "active" | "paused" | "archived";
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
    @Query() status?: 'draft' | 'active' | 'paused' | 'archived',
    @Query() surveyType?: 'general' | 'report-form' | 'rapid-enquiry',
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
      { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
      { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
      // Include responses with nested answers
      {
        model: db.Response, as: 'responses', include: [
          { model: db.Answer, as: 'answers', include: [{ model: db.User, as: 'user', attributes: ['id', 'name'] }] },
          { model: db.User, as: 'user', attributes: ['id', 'name'] }
        ]
      },
      { model: db.Role, as: 'allowedRoles', through: { attributes: [] }, required: false },
      { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
      { model: db.User, as: 'creator', attributes: ['id', 'name'] },
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
      includeArr[2] = {
        model: db.Response, as: 'responses', required: true, where: { userId }, include: [
          { model: db.Answer, as: 'answers', include: [{ model: db.User, as: 'user', attributes: ['id', 'name'] }] },
          { model: db.User, as: 'user', attributes: ['id', 'name'] }
        ]
      };
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
      includeArr[3] = {
        model: db.Role,
        as: 'allowedRoles',
        through: { attributes: [] },
        required: true,
        where: { id: roleIds },
      };
    }

    const { count, rows } = await db.Survey.findAndCountAll({
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
  @Get('/{surveyId}/analytics')
  @asyncCatch
  public async getSurveyAnalytics(@Path() surveyId: string, @Query() startDate?: string, @Query() endDate?: string): Promise<ServiceResponse<any>> {

    const where: any = {};
    if (startDate) where.createdAt = { [Op.gte]: new Date(startDate) };
    if (endDate) where.createdAt = { [Op.lte]: new Date(endDate) };

    const survey = await db.Survey.findByPk(surveyId, {
      attributes: ['id', 'title', 'estimatedTime', 'status', 'surveyType', 'createdAt'],
      include: [
        { model: db.Question, as: 'questionItems', attributes: ['id', 'type', 'title', 'required', 'options', 'minValue', 'maxValue', 'maxRating'] } as Includeable,
      ],
    });
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    // Load responses and answers
    const responses = await db.Response.findAll({
      where: { surveyId, ...where },
      attributes: ['id', 'userId', 'createdAt'],
      order: [['createdAt', 'ASC']],
      include: [
        { model: db.Answer, as: 'answers', attributes: ['id', 'questionId', 'answerText', 'answerOptions', 'createdAt'] },
        { model: db.User, as: 'user', attributes: ['id'] },
      ],
    });

    const totalResponses = responses.length;
    const uniqueRespondents = new Set<string>();
    const trendsMap: Record<string, number> = {};

    for (const r of responses as any[]) {
      if (r.user?.id) uniqueRespondents.add(r.user.id);
      const d = new Date(r.createdAt);
      const key = d.toISOString().slice(0, 10);
      trendsMap[key] = (trendsMap[key] ?? 0) + 1;
    }

    const trends = Object.keys(trendsMap)
      .sort()
      .map(date => ({ date, count: trendsMap[date] }));

    // Build question analytics
    const questionItems = (survey as any).questionItems || [];
    const questionById: Record<string, any> = {};
    for (const q of questionItems) questionById[q.id] = q;

    const questionAnalytics: any[] = [];
    for (const q of questionItems) {
      const answersForQ: any[] = [];
      for (const r of responses as any[]) {
        const found = (r.answers || []).filter((a: any) => a.questionId === q.id);
        answersForQ.push(...found);
      }

      const responseCount = answersForQ.length;
      const required = !!q.required;
      const skipRate = totalResponses > 0 ? Math.max(0, (totalResponses - responseCount) / totalResponses) : 0;

      let answerDistribution: any = {};
      if (q.type === 'single_choice' || q.type === 'multiple_choice') {
        answerDistribution = {} as Record<string, number>;
        
        // Initialize all possible options with 0 count
        if (q.options) {
          let allOptions: string[] = [];
          try {
            allOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          } catch (e) {
            allOptions = [];
          }
          
          // Initialize all options with 0
          for (const option of allOptions) {
            answerDistribution[String(option)] = 0;
          }
        }
        
        // Count actual responses
        for (const a of answersForQ) {
          const opts: string[] = Array.isArray(a.answerOptions) ? a.answerOptions : (a.answerOptions ? [a.answerOptions] : []);
          if (!opts.length && a.answerText) {
            // fallback when stored as text
            const k = String(a.answerText);
            answerDistribution[k] = (answerDistribution[k] ?? 0) + 1;
          } else {
            for (const opt of opts) {
              const k = String(opt);
              answerDistribution[k] = (answerDistribution[k] ?? 0) + 1;
            }
          }
        }
      } else if (q.type === 'rating' || q.type === 'linear_scale') {
        const values: number[] = [];
        for (const a of answersForQ) {
          const v = a.answerText != null ? Number(a.answerText) : NaN;
          if (!Number.isNaN(v)) values.push(v);
        }
        const sum = values.reduce((acc, n) => acc + n, 0);
        const avg = values.length ? sum / values.length : 0;
        const min = values.length ? Math.min(...values) : 0;
        const max = values.length ? Math.max(...values) : 0;
        answerDistribution = { values, average: avg, min, max };
      } else {
        // text/textarea/file: report counts
        const textResponses = answersForQ.filter(a => a.answerText && String(a.answerText).trim().length > 0).length;
        answerDistribution = { textResponses };
      }

      questionAnalytics.push({
        questionId: q.id,
        title: q.title,
        type: q.type,
        required,
        responseCount,
        skipRate,
        answerDistribution,
      });
    }

    // Completion rate: percentage of responses that answered all required questions
    const requiredIds = questionItems.filter((q: any) => q.required).map((q: any) => q.id);
    let completed = 0;
    if (requiredIds.length === 0) {
      completed = totalResponses;
    } else {
      for (const r of responses as any[]) {
        const answeredIds = new Set((r.answers || []).map((a: any) => a.questionId));
        const all = requiredIds.every((id: string) => answeredIds.has(id));
        if (all) completed += 1;
      }
    }
    const completionRate = totalResponses > 0 ? completed / totalResponses : 0;

    return ServiceResponse.success('Survey analytics retrieved', {
      surveyId: survey.id,
      surveyTitle: (survey as any).title,
      totalResponses,
      uniqueRespondents: uniqueRespondents.size,
      completionRate,
      trends,
      questionAnalytics,
    });
  }

  // list responses for a survey with compact survey and user info
  @Security('jwt', ['survey:read'])
  @Get('/responses/{surveyId}')
  @asyncCatch
  public async getSurveyResponses(
    @Path() surveyId: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ): Promise<ServiceResponse<any[]>> {
    const survey = await db.Survey.findByPk(surveyId, {
      attributes: ['id', 'title', 'surveyType', 'estimatedTime'],
      include: [
        { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
      ],
    });
    if (!survey) return ServiceResponse.failure('Survey not found', [], 404);

    const offset = (page - 1) * limit;
    const { count, rows } = await db.Response.findAndCountAll({
      where: { surveyId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: db.Answer, as: 'answers' },
        {
          model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone'], include: [
            { model: db.Role, as: 'roles', through: { attributes: [] } },
          ]
        },
      ],
      distinct: true,
    });

    const compactSurvey = {
      id: survey.id,
      title: survey.title,
      surveyType: survey.surveyType,
      projectId: survey.projectId,
      estimatedTime: survey.estimatedTime,
      organization: survey.organization ? { id: survey.organization.id, name: survey.organization.name } : null,
    };

    const payload = rows.map((r: any) => ({
      id: r.id,
      survey: compactSurvey,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user ? {
        id: r.user.id,
        name: r.user.name,
        email: r.user.email,
        phone: r.user.phone,
        roles: Array.isArray(r.user.roles) ? r.user.roles.map((role: any) => ({ id: role.id, name: role.name, category: role.category })) : [],
      } : null,
      answers: (r.answers || []).map((a: any) => ({
        id: a.id,
        questionId: a.questionId,
        answerText: a.answerText,
        answerOptions: a.answerOptions,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    }));

    return ServiceResponse.success('Survey responses retrieved successfully', payload, 200, { total: count, page, totalPages: Math.ceil(count / limit) });
  }


  @Security('optionalJwt')
  @Get('/{surveyId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Survey not found')
  public async getSurveyById(@Path() surveyId: string): Promise<ServiceResponse<any | null>> {
    const survey = await db.Survey.findByPk(surveyId, {
      include: [
        { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
        { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
        { model: db.Response, as: 'responses', include: [{ model: db.Answer, as: 'answers' }, { model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone', 'status'], include: [{ model: db.Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } }] }] },
        { model: db.Role, as: 'allowedRoles', through: { attributes: [] } },
        { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: db.User, as: 'creator', attributes: ['id', 'name'] },
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
    const organizationId = request?.user?.primaryOrganizationId ?? null;
    const start = new Date(data.startAt);
    const end = new Date(data.endAt);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return ServiceResponse.failure('Invalid startAt/endAt values', null, 400);
    }

    const created = await sequelize.transaction(async (t) => {
      const s = await db.Survey.create({
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        surveyType: data.surveyType,
        estimatedTime: data.estimatedTime,
        startAt: start,
        endAt: end,
        status: 'active',
        createdBy: userId,
        organizationId: organizationId,
      }, { transaction: t });

      // Create sections with backend-generated IDs and build a mapping
      const sectionIdMap = new Map<string, string>();
      if (data.sections && data.sections.length > 0) {
        const sectionsToCreate = data.sections.map((section, index) => {
          const newId = randomUUID();
          sectionIdMap.set(section.id, newId);
          return {
            id: newId,
            surveyId: s.id,
            title: section.title,
            description: section.description || null,
            order: index + 1,
          };
        });
        await db.Section.bulkCreate(sectionsToCreate, { transaction: t });
      }

      // Create questions (remap sectionId using generated IDs)
      if (data.questions && data.questions.length > 0) {
        const questionsToCreate = data.questions.map(q => {
          const { id, ...questionData } = q;
          const baseQuestion = {
            ...questionData,
            surveyId: s.id,
            sectionId: questionData.sectionId ? (sectionIdMap.get(questionData.sectionId) ?? null) : null,
            questionNumber: questionData.questionNumber || null,
          };

          // Handle different question types
          switch (q.type) {
            case 'single_choice':
            case 'multiple_choice':
              return {
                ...baseQuestion,
                options: (q as any).options ?? null,
                placeholder: null,
                allowedTypes: null,
                maxSize: null,
                maxRating: null,
                ratingLabel: null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'text_input':
            case 'textarea':
              return {
                ...baseQuestion,
                options: null,
                placeholder: (q as any).placeholder ?? null,
                allowedTypes: null,
                maxSize: null,
                maxRating: null,
                ratingLabel: null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'file_upload':
              return {
                ...baseQuestion,
                options: null,
                placeholder: null,
                allowedTypes: (q as any).allowedTypes ?? null,
                maxSize: (q as any).maxSize ?? null,
                maxRating: null,
                ratingLabel: null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'rating':
              return {
                ...baseQuestion,
                options: null,
                placeholder: null,
                allowedTypes: null,
                maxSize: null,
                maxRating: (q as any).maxRating ?? null,
                ratingLabel: (q as any).ratingLabel ?? null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'linear_scale':
              return {
                ...baseQuestion,
                options: null,
                placeholder: null,
                allowedTypes: null,
                maxSize: null,
                maxRating: null,
                ratingLabel: null,
                minValue: (q as any).minValue ?? null,
                maxValue: (q as any).maxValue ?? null,
                minLabel: (q as any).minLabel ?? null,
                maxLabel: (q as any).maxLabel ?? null,
              };
            default:
              return baseQuestion;
          }
        });
        await db.Question.bulkCreate(questionsToCreate as any, { transaction: t });
      }

      if (data.allowedRoles && data.allowedRoles.length > 0) {
        const roles = await db.Role.findAll({ where: { id: data.allowedRoles }, transaction: t });
        if (roles.length) {
          await (s as any).setAllowedRoles(roles, { transaction: t });
        }
      }

      return s;
    });

    this.setStatus(201);
    const result = await db.Survey.findByPk(created.id, {
      include: [
        { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
        { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
        { model: db.Response, as: 'responses', include: [{ model: db.Answer, as: 'answers' }, { model: db.User, as: 'user', attributes: ['id', 'name'] }] },
        { model: db.Role, as: 'allowedRoles', through: { attributes: [] } },
        { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: db.User, as: 'creator', attributes: ['id', 'name'] },
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
    const survey = await db.Survey.findByPk(surveyId);
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
        projectId: data.projectId ?? survey.projectId,
        surveyType: data.surveyType ?? survey.surveyType,
        estimatedTime: data.estimatedTime ?? survey.estimatedTime,
        startAt: data.startAt ? new Date(data.startAt) : survey.startAt,
        endAt: data.endAt ? new Date(data.endAt) : survey.endAt,
        status: data.status ?? survey.status ?? 'active',
      }, { transaction: t });

      if (data.sections) {
        await db.Section.destroy({ where: { surveyId: survey.id }, transaction: t });
        const sectionsToCreate = data.sections.map((section, index) => ({
          id: section.id,
          surveyId: survey.id,
          title: section.title,
          description: section.description || null,
          order: index + 1,
        }));
        await db.Section.bulkCreate(sectionsToCreate, { transaction: t });
      }

      if (data.questions) {
        await db.Question.destroy({ where: { surveyId: survey.id }, transaction: t });
        const questionsToCreate = data.questions.map(q => {
          const { id, ...questionData } = q;
          const baseQuestion = {
            ...questionData,
            surveyId: survey.id,
            sectionId: questionData.sectionId,
            questionNumber: questionData.questionNumber || null,
          };

          // Handle different question types
          switch (q.type) {
            case 'single_choice':
            case 'multiple_choice':
              return {
                ...baseQuestion,
                options: (q as any).options ?? null,
                placeholder: null,
                allowedTypes: null,
                maxSize: null,
                maxRating: null,
                ratingLabel: null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'text_input':
            case 'textarea':
              return {
                ...baseQuestion,
                options: null,
                placeholder: (q as any).placeholder ?? null,
                allowedTypes: null,
                maxSize: null,
                maxRating: null,
                ratingLabel: null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'file_upload':
              return {
                ...baseQuestion,
                options: null,
                placeholder: null,
                allowedTypes: (q as any).allowedTypes ?? null,
                maxSize: (q as any).maxSize ?? null,
                maxRating: null,
                ratingLabel: null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'rating':
              return {
                ...baseQuestion,
                options: null,
                placeholder: null,
                allowedTypes: null,
                maxSize: null,
                maxRating: (q as any).maxRating ?? null,
                ratingLabel: (q as any).ratingLabel ?? null,
                minValue: null,
                maxValue: null,
                minLabel: null,
                maxLabel: null,
              };
            case 'linear_scale':
              return {
                ...baseQuestion,
                options: null,
                placeholder: null,
                allowedTypes: null,
                maxSize: null,
                maxRating: null,
                ratingLabel: null,
                minValue: (q as any).minValue ?? null,
                maxValue: (q as any).maxValue ?? null,
                minLabel: (q as any).minLabel ?? null,
                maxLabel: (q as any).maxLabel ?? null,
              };
            default:
              return baseQuestion;
          }
        });
        await db.Question.bulkCreate(questionsToCreate as any, { transaction: t });
      }

      if (data.allowedRoles) {
        const roles = await db.Role.findAll({ where: { id: data.allowedRoles }, transaction: t });
        await (survey as any).setAllowedRoles(roles, { transaction: t });
      }
    });

    const result = await db.Survey.findByPk(survey.id, {
      include: [
        { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
        { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
        { model: db.Response, as: 'responses', include: [{ model: db.Answer, as: 'answers' }, { model: db.User, as: 'user', attributes: ['id', 'name'] }] },
        { model: db.Role, as: 'allowedRoles', through: { attributes: [] } },
        { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: db.User, as: 'creator', attributes: ['id', 'name'] },
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
    const survey = await db.Survey.findByPk(surveyId);
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    await survey.destroy();
    await createSystemLog(request ?? null, 'deleted_survey', 'Survey', surveyId, {});
    this.setStatus(204);
    return ServiceResponse.success('Survey deleted successfully', null, 204);
  }

  // New: submit answers for a survey
  @Security('optionalJwt')
  @Post('/{surveyId}/answers')
  @asyncCatch
  public async submitAnswers(
    @Path() surveyId: string,
    @Request() request: any,
    @Body()
    body: {
      userId?: string | null; // optional explicit userId (else use auth or anonymous)
      answers: Array<{
        questionId: string;
        answerText?: string | null;
        answerOptions?: string[] | null;
      }>;
    }
  ): Promise<ServiceResponse<any | null>> {
    const survey = await db.Survey.findByPk(surveyId);

    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    if ((survey as any).status === 'paused' || (survey as any).status === 'archived') {
      return ServiceResponse.failure('Survey is not accepting responses', null, 403);
    }

    const effectiveUserId = body.userId ?? request?.user?.id ?? null;
    let createdResponse: any = null;
    await sequelize.transaction(async (t) => {
      createdResponse = await db.Response.create({
        surveyId: survey.id,
        userId: effectiveUserId,
      }, { transaction: t });

      for (const a of body.answers || []) {
        await db.Answer.create({
          surveyId: survey.id,
          responseId: createdResponse.id,
          questionId: a.questionId,
          answerText: a.answerText ?? null,
          answerOptions: a.answerOptions ?? null,
        }, { transaction: t });
      }
    });

    await createSystemLog(request ?? null, 'responded_survey', survey?.dataValues?.title, surveyId, { answersCount: (body.answers || []).length });

    const result = await db.Survey.findByPk(survey.id, {
      include: [
        { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
        { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
        { model: db.Response, as: 'responses', include: [{ model: db.Answer, as: 'answers' }, { model: db.User, as: 'user', attributes: ['id', 'name'] }] },
        { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: db.User, as: 'creator', attributes: ['id', 'name'] },
      ],
    });

    this.setStatus(201);
    return ServiceResponse.success('Answers submitted successfully', result, 201);
  }

  // GET RESPONSE BY ID with populated fields
  @Security('jwt', ['survey:read'])
  @Get('/response/{responseId}')
  @asyncCatch
  public async getResponseById(@Path() responseId: string): Promise<ServiceResponse<any | null>> {
    const response = await db.Response.findByPk(responseId, {
      include: [
        {
          model: db.Answer,
          as: 'answers'
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
          include: [
            { model: db.Role, as: 'roles', through: { attributes: [] } }
          ]
        },
        {
          model: db.Survey,
          as: 'survey',
          include: [
            { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
            { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
            { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
            { model: db.User, as: 'creator', attributes: ['id', 'name'] },
          ]
        }
      ]
    });

    if (!response) {
      return ServiceResponse.failure('Response not found', null, 404);
    }

    return ServiceResponse.success('Response retrieved successfully', response);
  }

  // GET RAPID ENQUIRY FOR PUBLIC ACCESS
  @Security('optionalJwt')
  @Get('/public/rapid-enquiry/latest')
  @asyncCatch
  public async getLatestRapidEnquiry(): Promise<ServiceResponse<any | null>> {
    const survey = await db.Survey.findOne({
      where: {
        surveyType: 'rapid-enquiry',
        status: 'active'
      },
      order: [['createdAt', 'DESC']], // Get the latest one
      include: [
        { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
        { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
        { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: db.User, as: 'creator', attributes: ['id', 'name'] },
      ],
    });

    if (!survey) {
      return ServiceResponse.failure('No active rapid enquiry survey found', null, 404);
    }

    return ServiceResponse.success('Latest rapid enquiry survey retrieved successfully', survey);
  }
}