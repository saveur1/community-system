import { createFileRoute } from '@tanstack/react-router'
import { useResponseById } from '@/hooks/useSurveys'
import Breadcrumb from '@/components/ui/breadcrum'
import SurveyAnswerReview from '@/components/survey/SurveyAnswerReview'
import { FaUser, FaCalendar, FaBuilding } from 'react-icons/fa'

export const Route = createFileRoute(
  '/dashboard/surveys/take-survey/response/$response-id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { 'response-id': responseId } = Route.useParams()
  const { data: response, isLoading, error } = useResponseById(responseId)

  const dynamicBreadcrumb = [
    {title: "Dashboard", link: "/dashboard"}, 
    {title: "Available Surveys", link: "/dashboard/surveys/take-survey"}, 
    "Survey Response Review"
  ]

  if (isLoading) {
    return (
      <div className="pb-10">
        <Breadcrumb
          items={dynamicBreadcrumb}
          title="Survey Response Review"
          className='absolute top-0 left-0 w-full px-6'
        />
        <div className="pt-14 px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !response?.result) {
    return (
      <div className="pb-10">
        <Breadcrumb
          items={dynamicBreadcrumb}
          title="Survey Response Review"
          className='absolute top-0 left-0 w-full px-6'
        />
        <div className="pt-14 px-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800">Error Loading Response</h3>
            <p className="text-red-600 mt-2">
              {error?.message || 'Failed to load response details. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const responseData = response.result
  const survey = responseData.survey
  const user = responseData.user
  const answers = responseData.answers || []
  const questions = survey?.questionItems || []

  return (
    <div className="pb-10">
      <Breadcrumb
        items={dynamicBreadcrumb}
        title="Survey Response Review"
        className='absolute top-0 left-0 w-full px-6'
      />

      <div className="pt-20 px-6">
        {/* Response Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Survey Response Review
              </h1>
              <p className="text-gray-600">
                Survey: <span className="font-medium">{survey?.title}</span>
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Response ID: {responseData.id}
            </div>
          </div>

          {/* Response Metadata */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {user && (
              <div className="flex items-center space-x-3">
                <FaUser className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  {user.roles && user.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <FaCalendar className="text-gray-400 w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Submitted</p>
                <p className="text-xs text-gray-500">
                  {new Date(responseData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {survey?.organization && (
              <div className="flex items-center space-x-3">
                <FaBuilding className="text-gray-400 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Organization</p>
                  <p className="text-xs text-gray-500">{survey.organization.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Survey Answers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Survey Responses</h2>
            <p className="text-sm text-gray-500 mt-1">
              {answers.length} of {questions.length} questions answered
            </p>
          </div>
          
          <SurveyAnswerReview
            questions={questions}
            answers={answers.map(answer => ({
              questionId: answer.questionId,
              answerText: answer.answerText,
              answerOptions: answer.answerOptions
            }))}
            className="divide-y divide-gray-100"
          />
        </div>
      </div>
    </div>
  )
}
