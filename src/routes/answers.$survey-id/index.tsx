import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Breadcrumb from '@/components/ui/breadcrum'
import SurveyAnswerForm from '@/components/survey/SurveyAnswerForm'
import { useSurvey } from '@/hooks/useSurveys'
import { useEffect } from 'react'
import MainHeader from '@/components/layouts/main-header'
import Footer from '@/components/layouts/main-footer/main-footer'

export const Route = createFileRoute('/answers/$survey-id/')({
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

  if (isLoading) {
    return (
      <div>
        <Breadcrumb items={['Surveys']} title='Survey' className='absolute top-0 left-0 w-full' />
        <div className="pt-20 px-4">Loading survey...</div>
      </div>
    )
  }

  if (isError || !survey) {
    return (
      <div>
        <Breadcrumb items={['Surveys']} title='Survey' className='absolute top-0 left-0 w-full' />
        <div className="pt-20 px-4 text-red-600">Failed to load survey.</div>
      </div>
    )
  }

  return (
    <div>
      <MainHeader />
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
          onComplete={() => navigate({ to: '/answers/$survey-id/thank-you', params: { 'survey-id': survey.id } })}
        />
      </div>
      <Footer />
    </div>
  )
}