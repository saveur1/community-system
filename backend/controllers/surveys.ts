import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import Survey from '../models/survey';
import { asyncCatch } from '../middlewares/errorHandler';
import Question from '../models/question';
import Answer from '../models/answer';

interface SurveyCreateRequest {
  title: string;
  description: string;
  project: string; // currently a string label as per UI
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
}

interface SurveyUpdateRequest extends Partial<SurveyCreateRequest> {
  status: "active" | "paused" | "archived";
}

@Route('api/surveys')
@Tags('Surveys')
export class SurveyController extends Controller {
  @Security('jwt', ['survey:read'])
  @Get('/')
  @asyncCatch
  public async getSurveys(
    @Query() page: number = 1,
    @Query() limit: number = 10,
    @Query() status?: 'active' | 'paused' | 'archived'
  ): Promise<ServiceResponse<any[]>> {
    const offset = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;
    const { count, rows } = await Survey.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      where,
      include: [
        { model: Question, as: 'questionItems' },
        { model: Answer, as: 'answers' },
      ],
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
      ],
    });
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);
    return ServiceResponse.success('Survey retrieved successfully', survey);
  }

  @Security('jwt', ['survey:create'])
  @Post('/')
  @asyncCatch
  public async createSurvey(@Body() data: SurveyCreateRequest): Promise<ServiceResponse<any | null>> {
    const created = await Survey.create({
      title: data.title,
      description: data.description,
      project: data.project,
      estimatedTime: data.estimatedTime,
      status: 'active',
    });

    // Persist authored questions into Question table
    if (data.questions && data.questions.length > 0) {
      const questionsToCreate = data.questions.map(q => {
        const { id, ...questionData } = q;
        return {
          ...questionData,
          surveyId: created.id,
          options: (q as any).options ?? null,
          placeholder: (q as any).placeholder ?? null,
        };
      });
      await Question.bulkCreate(questionsToCreate as any);
    }

    this.setStatus(201);
    const result = await Survey.findByPk(created.id, {
      include: [
        { model: Question, as: 'questionItems' },
        { model: Answer, as: 'answers' },
      ],
    });
    return ServiceResponse.success('Survey created successfully', result, 201);
  }

  @Security('jwt', ['survey:update'])
  @Put('/{surveyId}')
  @asyncCatch
  public async updateSurvey(
    @Path() surveyId: string,
    @Body() data: SurveyUpdateRequest
  ): Promise<ServiceResponse<any | null>> {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    await survey.update({
      title: data.title ?? survey.title,
      description: data.description ?? survey.description,
      project: (data.project as any) ?? survey.project,
      estimatedTime: (data.estimatedTime as any) ?? survey.estimatedTime,
      status: (data as any).status ?? survey.status,
    });

    if (data.questions) {
      // replace existing Question items with provided set
      await Question.destroy({ where: { surveyId: survey.id } });
      const questionsToCreate = data.questions.map(q => {
        const { id, ...questionData } = q;
        return {
          ...questionData,
          surveyId: survey.id,
          options: (q as any).options ?? null,
          placeholder: (q as any).placeholder ?? null,
        };
      });
      await Question.bulkCreate(questionsToCreate as any);
    }

    const result = await Survey.findByPk(survey.id, {
      include: [
        { model: Question, as: 'questionItems' },
        { model: Answer, as: 'answers' },
      ],
    });
    return ServiceResponse.success('Survey updated successfully', result);
  }

  @Security('jwt', ['survey:delete'])
  @Delete('/{surveyId}')
  @SuccessResponse(204, 'No Content')
  @asyncCatch
  public async deleteSurvey(@Path() surveyId: string): Promise<ServiceResponse<null>> {
    const survey = await Survey.findByPk(surveyId);
    if (!survey) return ServiceResponse.failure('Survey not found', null, 404);

    await survey.destroy();
    this.setStatus(204);
    return ServiceResponse.success('Survey deleted successfully', null, 204);
  }

  // New: submit answers for a survey
  @Security('jwt', ['survey:answer'])
  @Post('/{surveyId}/answers')
  @asyncCatch
  public async submitAnswers(
    @Path() surveyId: string,
    @Body()
    body: {
      answers: Array<{
        questionId: string;
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

    for (const a of body.answers || []) {
      await (survey as any).createAnswer({
        surveyId: survey.id,
        questionId: a.questionId,
        answerText: a.answerText ?? null,
        answerOptions: a.answerOptions ?? null,
      });
    }

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
