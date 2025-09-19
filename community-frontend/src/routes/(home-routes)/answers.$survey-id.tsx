import { createFileRoute, useNavigate } from '@tanstack/react-router'
import SurveyAnswerForm from '@/components/survey/SurveyAnswerForm'
import { useSurvey } from '@/hooks/useSurveys'
import { useEffect } from 'react'

// React icons
import { HiOutlineExclamationCircle } from 'react-icons/hi'
import { TbLoader3 } from 'react-icons/tb'

export const Route = createFileRoute('/(home-routes)/answers/$survey-id')({
  component: PublicSurveyAnswerPage,
})

function PublicSurveyAnswerPage() {
  const params = Route.useParams()
  const surveyId = String(params['survey-id'] ?? '')
  const navigate = useNavigate()

  const { data, isLoading, isError } = useSurvey(surveyId, true)
  const survey = data?.result

  useEffect(() => {
    if (!surveyId) {
      navigate({ to: '/' })
    }
  }, [surveyId, navigate])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(57vh)]">
        <TbLoader3 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading survey...</p>
      </div>
    )
  }

  // Error state
  if (isError || !survey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(57vh)]">
        <HiOutlineExclamationCircle className="w-24 h-24 text-red-500 mb-4" />
        <p className="text-xl font-semibold text-red-600 dark:text-red-400">Failed to load survey.</p>
      </div>
    )
  }

  // Success state
  return (
    <div>
      <div className="container mx-auto pt-20 px-4 py-8">
        <SurveyAnswerForm
          survey={{
            id: survey.id,
            title: survey.title,
            description: survey.description,
            estimatedTime: survey.estimatedTime,
            questionItems: survey.questionItems || [],
            sections: (survey.sections || []).map((s: any) => ({
              id: s.id,
              title: s.title,
              order: s.order,
            })),
          }}
          onComplete={() => {
            const type = survey?.surveyType;
            const isRapid = typeof type === 'string' && type.toLowerCase().includes('rapid');
            if (isRapid) {
              try {
                localStorage.setItem(`rapid_enquiry_answered_${survey.id}`, 'true');
              } catch (_) {}
            }
            navigate({
              to: '/answers/$survey-id/thank-you',
              params: { 'survey-id': survey.id },
            });
          }}
        />
      </div>
    </div>
  )
}

export default PublicSurveyAnswerPage
