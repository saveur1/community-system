import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security, Request } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import { asyncCatch } from '../middlewares/errorHandler';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import db from '@/models';
import { createSystemLog } from '../utils/systemLog';
import { randomUUID } from 'crypto';

interface SurveyCreateRequest {
  title: string;
  description: string;
  projectId: string; // currently a string uuid as per UI
  surveyType: "general" | "report-form" | undefined
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
      { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
      { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
      // Include responses with nested answers
      { model: db.Response, as: 'responses', include: [
        { model: db.Answer, as: 'answers', include: [{ model: db.User, as: 'user', attributes: ['id', 'name'] }] },
        { model: db.User, as: 'user', attributes: ['id', 'name'] }
      ] },
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
      includeArr[2] = { model: db.Response, as: 'responses', required: true, where: { userId }, include: [
        { model: db.Answer, as: 'answers', include: [{ model: db.User, as: 'user', attributes: ['id', 'name'] }] },
        { model: db.User, as: 'user', attributes: ['id', 'name'] }
      ] };
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

  // New: list responses for a survey with compact survey and user info
  @Security('jwt', ['survey:read'])
  @Get('/{surveyId}/responses')
  @asyncCatch
  public async getSurveyResponses(
    @Path() surveyId: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ): Promise<ServiceResponse<any[]>> {
    const survey = await db.Survey.findByPk(surveyId, {
      attributes: ['id', 'title', 'surveyType', 'projectId', 'estimatedTime'],
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
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email', 'phone'], include: [
          { model: db.Role, as: 'roles', through: { attributes: [] } },
        ] },
      ],
      distinct: true,
    });

    const compactSurvey = {
      id: survey.id,
      title: survey.title,
      surveyType: survey.surveyType,
      projectId: survey.projectId,
      estimatedTime: survey.estimatedTime,
      organizationId: survey.organizationId,
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

  @Security('jwt', ['survey:read'])
  @Get('/{surveyId}')
  @asyncCatch
  @Response<ServiceResponse<null>>(404, 'Survey not found')
  public async getSurveyById(@Path() surveyId: string): Promise<ServiceResponse<any | null>> {
    const survey = await db.Survey.findByPk(surveyId, {
      include: [
        { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
        { model: db.Question, as: 'questionItems', include: [{ model: db.Section, as: 'section' }] },
        { model: db.Response, as: 'responses', include: [{ model: db.Answer, as: 'answers' }, { model: db.User, as: 'user', attributes: ['id', 'name'] }] },
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
  @Security('jwt', ['survey:respond'])
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
        value?: any; // Main answer value (can be any type)
        fileInfo?: {
          fileName: string;
          fileType: string;
          fileSize: number;
          filePath: string;
        };
        metadata?: any; // Additional metadata for the answer
      }>;
    }
  ): Promise<ServiceResponse<any | null>> {
    const survey = await db.Survey.findByPk(surveyId, {
      include: [
        { 
          model: db.Question, 
          as: 'questionItems',
          attributes: ['id', 'type', 'title', 'required', 'maxSize', 'allowedTypes', 'maxRating', 'minValue', 'maxValue']
        }
      ]
    });

    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    if ((survey as any).status === 'paused' || (survey as any).status === 'archived') {
      return ServiceResponse.failure('Survey is not accepting responses', null, 403);
    }

    const questionsById = new Map(
      (survey as any).questionItems.map((q: any) => [q.id, q])
    );

    // Define a type for the question object with all possible properties
    interface QuestionWithProperties {
      id: string;
      type: string;
      title: string;
      required?: boolean;
      maxSize?: number;
      allowedTypes?: string[];
      maxRating?: number;
      ratingLabel?: string;
      minValue?: number;
      maxValue?: number;
      minLabel?: string;
      maxLabel?: string;
    }

    // Validate all answers before processing
    for (const answer of body.answers || []) {
      const question = questionsById.get(answer.questionId) as unknown as QuestionWithProperties;
      if (!question) {
        return ServiceResponse.failure(`Question with ID ${answer.questionId} not found in this survey`, null, 400);
      }

      // Check required fields
      if (question.required && (answer.value === undefined || answer.value === null || answer.value === '')) {
        return ServiceResponse.failure(`Answer for question "${question.title}" is required`, null, 400);
      }

      // Type-specific validation
      switch (question.type) {
        case 'file_upload':
          if (answer.fileInfo) {
            // Validate file size if maxSize is set
            const maxSize = question.maxSize || 10; // Default 10MB if not set
            if (answer.fileInfo.fileSize > maxSize * 1024 * 1024) {
              return ServiceResponse.failure(
                `File size exceeds maximum allowed size of ${maxSize}MB for question "${question.title}"`,
                null,
                400
              );
            }
            
            // Validate file type if allowedTypes is set
            const allowedTypes = question.allowedTypes || [];
            if (allowedTypes.length > 0 && !allowedTypes.includes('*')) {
              const fileExt = answer.fileInfo.fileType.split('/').pop()?.toLowerCase();
              if (!fileExt || !allowedTypes.some((t: string) => t.toLowerCase() === fileExt)) {
                return ServiceResponse.failure(
                  `File type not allowed for question "${question.title}". Allowed types: ${allowedTypes.join(', ')}`,
                  null,
                  400
                );
              }
            }
          }
          break;
          
        case 'rating':
          if (answer.value !== undefined && answer.value !== null) {
            const rating = Number(answer.value);
            const maxRating = question.maxRating || 5;
            if (isNaN(rating) || rating < 1 || rating > maxRating) {
              return ServiceResponse.failure(
                `Invalid rating value for question "${question.title}". Must be between 1 and ${maxRating}`,
                null,
                400
              );
            }
          }
          break;
          
        case 'linear_scale':
          if (answer.value !== undefined && answer.value !== null) {
            const value = Number(answer.value);
            const min = typeof question.minValue === 'number' ? question.minValue : 1;
            const max = typeof question.maxValue === 'number' ? question.maxValue : 5;
            
            if (isNaN(value) || value < min || value > max) {
              return ServiceResponse.failure(
                `Invalid value for question "${question.title}". Must be between ${min} and ${max}`,
                null,
                400
              );
            }
          }
          break;
      }
    }

    const effectiveUserId = body.userId ?? request?.user?.id ?? null;
    let createdResponse: any = null;
    
    await sequelize.transaction(async (t) => {
      // Create the response record
      createdResponse = await db.Response.create({
        surveyId: survey.id,
        userId: effectiveUserId,
      }, { transaction: t });

      // Process each answer
      for (const answer of body.answers || []) {
        const question = questionsById.get(answer.questionId);
        if (!question) continue;

        const answerData: any = {
          surveyId: survey.id,
          responseId: createdResponse.id,
          questionId: answer.questionId,
          value: answer.value,
          metadata: {}
        };

        // Add metadata based on question type
        const questionTyped = question as QuestionWithProperties;
        switch (questionTyped.type) {
          case 'file_upload':
            // Handle multiple files from Cloudinary
            if (Array.isArray(answer.value) && answer.value.length > 0) {
              // Create Answer record first
              const createdAnswer = await db.Answer.create({
                ...answerData,
                value: JSON.stringify(answer.value), // Store file metadata as JSON
                metadata: {
                  fileInfo: {
                    fileCount: answer.value.length,
                    totalSize: answer.value.reduce((sum: number, file: any) => sum + (file.fileSize || 0), 0)
                  }
                }
              }, { transaction: t });

              // Create Document records for each uploaded file
              for (const fileData of answer.value) {
                await db.Document.create({
                  documentName: fileData.fileName,
                  size: fileData.fileSize,
                  type: fileData.fileType,
                  documentUrl: fileData.fileUrl,
                  publicId: fileData.publicId,
                  deleteToken: fileData.deleteToken,
                  answerId: createdAnswer.id,
                  userId: effectiveUserId,
                  addedAt: new Date()
                }, { transaction: t });
              }
              
              // Skip the default Answer.create below since we already created it
              continue;
            }
            break;
            
          case 'rating':
            if (answer.value !== undefined && answer.value !== null) {
              answerData.metadata.ratingInfo = {
                maxRating: questionTyped.maxRating || 5,
                label: questionTyped.ratingLabel
              };
            }
            break;
            
          case 'linear_scale':
            if (answer.value !== undefined && answer.value !== null) {
              answerData.metadata.scaleInfo = {
                minValue: typeof questionTyped.minValue === 'number' ? questionTyped.minValue : 1,
                maxValue: typeof questionTyped.maxValue === 'number' ? questionTyped.maxValue : 5,
                minLabel: questionTyped.minLabel,
                maxLabel: questionTyped.maxLabel
              };
            }
            break;
        }

        // For backward compatibility
        if (questionTyped.type === 'text_input' || questionTyped.type === 'textarea') {
          answerData.answerText = answer.value;
        } else if (questionTyped.type === 'single_choice' || questionTyped.type === 'multiple_choice') {
          answerData.answerOptions = Array.isArray(answer.value) ? answer.value : [answer.value];
        }

        // Only create answer if not already handled (like file_upload)
        await db.Answer.create(answerData, { transaction: t });
      }
    });

    await createSystemLog(
      request ?? null, 
      'responded_survey', 
      survey?.dataValues?.title, 
      surveyId, 
      { answersCount: (body.answers || []).length }
    );

    // Return the updated survey with responses
    const result = await db.Survey.findByPk(survey.id, {
      include: [
        { model: db.Section, as: 'sections', order: [['order', 'ASC']] },
        { 
          model: db.Question, 
          as: 'questionItems', 
          include: [{ model: db.Section, as: 'section' }] 
        },
        { 
          model: db.Response, 
          as: 'responses', 
          where: { id: createdResponse.id },
          include: [
            { 
              model: db.Answer, 
              as: 'answers',
              include: [
                { model: db.Question, as: 'question', attributes: ['id', 'title', 'type'] },
                { model: db.Document, as: 'documents', attributes: ['id', 'documentName', 'documentUrl', 'size', 'type', 'publicId'] }
              ]
            }, 
            { 
              model: db.User, 
              as: 'user', 
              attributes: ['id', 'name'] 
            }
          ] 
        },
        { model: db.Organization, as: 'organization', attributes: ['id', 'name'] },
        { model: db.User, as: 'creator', attributes: ['id', 'name'] },
      ],
    });

    this.setStatus(201);
    return ServiceResponse.success('Answers submitted successfully', result, 201);
  }

  // New: Survey analytics endpoints
  @Security('jwt', ['survey:read'])
  @Get('/{surveyId}/analytics')
  @asyncCatch
  public async getSurveyAnalytics(
    @Path() surveyId: string
  ): Promise<ServiceResponse<any>> {
    const survey = await db.Survey.findByPk(surveyId, {
      include: [
        { 
          model: db.Question, 
          as: 'questionItems',
          attributes: ['id', 'title', 'type', 'required', 'options']
        },
        {
          model: db.Response,
          as: 'responses',
          include: [
            {
              model: db.Answer,
              as: 'answers',
              attributes: ['id', 'questionId', 'value', 'answerText', 'answerOptions', 'createdAt']
            },
            {
              model: db.User,
              as: 'user',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!survey) {
      return ServiceResponse.failure('Survey not found', null, 404);
    }

    const responses = (survey as any).responses || [];
    const questions = (survey as any).questionItems || [];
    const totalResponses = responses.length;
    const uniqueRespondents = new Set(responses.map((r: any) => r.userId).filter(Boolean)).size;

    // Calculate completion rate (responses that have answered at least one required question)
    const requiredQuestions = questions.filter((q: any) => q.required);
    const completedResponses = responses.filter((response: any) => {
      const responseAnswers = response.answers || [];
      const answeredRequiredQuestions = requiredQuestions.filter((rq: any) => 
        responseAnswers.some((a: any) => a.questionId === rq.id && (a.value || a.answerText || (a.answerOptions && a.answerOptions.length > 0)))
      );
      return answeredRequiredQuestions.length === requiredQuestions.length;
    });
    const completionRate = totalResponses > 0 ? completedResponses.length / totalResponses : 0;

    // Calculate response times (mock data for now - would need actual timing data)
    const avgTimeMins = 6.4; // Would calculate from actual response timing data
    const minTimeMins = 2.5;
    const maxTimeMins = 15.0;
    const medianTimeMins = 6.0;

    // Generate response trends (group by date)
    const trendsData = responses.reduce((acc: any, response: any) => {
      const date = new Date(response.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const trends = Object.keys(trendsData).sort().map(date => ({
      date,
      count: trendsData[date]
    }));

    // Per-question analytics
    const questionAnalytics = questions.map((question: any) => {
      const questionAnswers = responses.flatMap((r: any) => 
        (r.answers || []).filter((a: any) => a.questionId === question.id)
      );
      
      const responseCount = questionAnswers.length;
      const skipRate = totalResponses > 0 ? (totalResponses - responseCount) / totalResponses : 0;
      
      let answerDistribution: any = {};
      
      // Calculate answer distribution based on question type
      if (question.type === 'single_choice' || question.type === 'multiple_choice') {
        if (question.options) {
          question.options.forEach((option: string) => {
            answerDistribution[option] = 0;
          });
        }
        
        questionAnswers.forEach((answer: any) => {
          if (answer.answerOptions && Array.isArray(answer.answerOptions)) {
            answer.answerOptions.forEach((option: string) => {
              if (answerDistribution.hasOwnProperty(option)) {
                answerDistribution[option]++;
              }
            });
          } else if (answer.value) {
            if (answerDistribution.hasOwnProperty(answer.value)) {
              answerDistribution[answer.value]++;
            }
          }
        });
      } else if (question.type === 'rating' || question.type === 'linear_scale') {
        const values = questionAnswers.map((a: any) => {
          if (typeof a.value === 'number') return a.value;
          if (a.answerText) return parseFloat(a.answerText);
          return null;
        }).filter((v: any) => v !== null);
        
        if (values.length > 0) {
          const avg = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
          const min = Math.min(...values);
          const max = Math.max(...values);
          
          answerDistribution = { average: avg, min, max, values };
        }
      } else {
        // For text inputs, just count responses
        answerDistribution = { textResponses: responseCount };
      }
      
      return {
        questionId: question.id,
        title: question.title,
        type: question.type,
        required: question.required,
        responseCount,
        skipRate,
        answerDistribution
      };
    });

    const analytics = {
      surveyId: survey.id,
      surveyTitle: survey.title,
      totalResponses,
      uniqueRespondents,
      completionRate,
      avgTimeMins,
      minTimeMins,
      maxTimeMins,
      medianTimeMins,
      trends,
      questionAnalytics
    };

    return ServiceResponse.success('Analytics retrieved successfully', analytics);
  }

  @Security('jwt', ['survey:read'])
  @Get('/{surveyId}/analytics/question/{questionId}')
  @asyncCatch
  public async getQuestionAnalytics(
    @Path() surveyId: string,
    @Path() questionId: string
  ): Promise<ServiceResponse<any>> {
    const question = await db.Question.findOne({
      where: { id: questionId, surveyId },
      attributes: ['id', 'title', 'type', 'required', 'options', 'maxRating', 'minValue', 'maxValue']
    });

    if (!question) {
      return ServiceResponse.failure('Question not found', null, 404);
    }

    // Get all answers for this question
    const answers = await db.Answer.findAll({
      where: { questionId, surveyId },
      include: [
        {
          model: db.Response,
          as: 'response',
          attributes: ['id', 'userId', 'createdAt']
        }
      ],
      attributes: ['id', 'value', 'answerText', 'answerOptions', 'createdAt']
    });

    const totalAnswers = answers.length;
    let detailedAnalysis: any = {};

    if (question.type === 'single_choice' || question.type === 'multiple_choice') {
      const distribution: { [key: string]: number } = {};
      
      // Initialize with options if available
      if ((question as any).options) {
        (question as any).options.forEach((option: string) => {
          distribution[option] = 0;
        });
      }

      answers.forEach((answer: any) => {
        if (answer.answerOptions && Array.isArray(answer.answerOptions)) {
          answer.answerOptions.forEach((option: string) => {
            distribution[option] = (distribution[option] || 0) + 1;
          });
        } else if (answer.value) {
          distribution[answer.value] = (distribution[answer.value] || 0) + 1;
        }
      });

      detailedAnalysis = {
        type: 'choice',
        distribution,
        totalAnswers
      };
    } else if (question.type === 'rating' || question.type === 'linear_scale') {
      const values = answers.map((a: any) => {
        if (typeof a.value === 'number') return a.value;
        if (a.answerText) return parseFloat(a.answerText);
        return null;
      }).filter(v => v !== null && !isNaN(v));

      if (values.length > 0) {
        const avg = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const sorted = values.sort((a: number, b: number) => a - b);
        const median = sorted.length % 2 === 0 
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];

        // Create distribution histogram
        const histogram: { [key: string]: number } = {};
        values.forEach(val => {
          histogram[val.toString()] = (histogram[val.toString()] || 0) + 1;
        });

        detailedAnalysis = {
          type: 'numeric',
          average: avg,
          min,
          max,
          median,
          totalAnswers: values.length,
          histogram
        };
      } else {
        detailedAnalysis = {
          type: 'numeric',
          totalAnswers: 0,
          message: 'No valid numeric responses'
        };
      }
    } else {
      // Text responses
      const textResponses = answers.map((a: any) => ({
        text: a.answerText || a.value,
        createdAt: a.createdAt
      })).filter(r => r.text);

      detailedAnalysis = {
        type: 'text',
        totalAnswers,
        responses: textResponses.slice(0, 100) // Limit to first 100 for performance
      };
    }

    return ServiceResponse.success('Question analytics retrieved successfully', {
      questionId: question.id,
      title: question.title,
      type: question.type,
      required: question.required,
      ...detailedAnalysis
    });
  }
}
