import { createFileRoute, useNavigate } from '@tanstack/react-router';
import Breadcrumb from '@/components/ui/breadcrum';
import SurveyAnswerForm from '@/components/survey/SurveyAnswerForm';
import { useSurvey } from '@/hooks/useSurveys';
import { useEffect } from 'react';

export const Route = createFileRoute('/dashboard/surveys/take-survey/$survey-answer')({
  component: SurveyAnswerPage,
});

function SurveyAnswerPage() {
  const params = Route.useParams();
  const surveyId = String(params['survey-answer'] ?? '');
  const navigate = useNavigate();

  const { data, isLoading, isError } = useSurvey(surveyId);
  const survey = data?.result;

  useEffect(() => {
    if (!surveyId) {
      // invalid param, go back to list
      navigate({ to: '/dashboard/surveys/take-survey' });
    }
  }, [surveyId, navigate]);

  if (isLoading) {
    return (
      <div>
        <Breadcrumb items={['Dashboard', 'Surveys']} title='Survey' className='absolute top-0 left-0 w-full' />
        <div className="pt-20 px-4">Loading survey...</div>
      </div>
    );
  }

  if (isError || !survey) {
    return (
      <div>
        <Breadcrumb items={['Dashboard', 'Surveys']} title='Survey' className='absolute top-0 left-0 w-full' />
        <div className="pt-20 px-4 text-red-600">Failed to load survey.</div>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb items={['Dashboard', 'Surveys']} title={survey.title || 'Survey'} className='absolute top-0 left-0 w-full' />
      <div className="container mx-auto pt-20 px-4 py-8">
        <SurveyAnswerForm
          survey={{
            id: survey.id,
            title: survey.title,
            description: survey.description,
            estimatedTime: survey.estimatedTime,
            questionItems: survey.questionItems || [],
            sections: (survey.sections || []).map((s: any) => ({ id: s.id, title: s.title, order: s.order }))
          }}
          onComplete={() => navigate({ to: '/dashboard/surveys/thank-you' })}
        />
      </div>
    </div>
  );
}