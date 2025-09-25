import { createFileRoute } from '@tanstack/react-router'
import { useResponseById } from '@/hooks/useSurveys'
import Breadcrumb from '@/components/ui/breadcrum'
import SurveyAnswerReview from '@/components/survey/SurveyAnswerReview'
import { FaUser, FaCalendar, FaBuilding } from 'react-icons/fa'
import { getOptions } from '@/utility/logicFunctions'

export const Route = createFileRoute('/dashboard/reporting/$report-id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { 'report-id': reportId } = Route.useParams()
  const { data: response, isLoading, error } = useResponseById(reportId)

  const dynamicBreadcrumb = [
    {title: "Dashboard", link: "/dashboard"}, 
    {title: "Data Collection", link: "/dashboard/reporting"}, 
    "Report Review"
  ]

  if (isLoading) {
    return (
      <div className="pb-10">
        <Breadcrumb
          items={dynamicBreadcrumb}
          title="Report Review"
          className='absolute top-0 left-0 w-full px-6'
        />
        <div className="pt-14 px-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-400"></div>
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
          title="Report Review"
          className='absolute top-0 left-0 w-full px-6'
        />
        <div className="pt-14 px-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error Loading Report</h3>
            <p className="text-red-600 dark:text-red-300 mt-2">
              {error?.message || 'Failed to load report details. Please try again.'}
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
        title="Report Review"
        className='absolute top-0 left-0 w-full px-6'
      />

      <div className="pt-20 px-6 max-sm:px-2">
        {/* Response Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 max-sm:p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Report Review
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Survey: <span className="font-medium">{survey?.title}</span>
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 max-sm:hidden">
              Report ID: {responseData.id}
            </div>
          </div>

          {/* Response Metadata */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {user && (
              <div className="flex items-center space-x-3">
                <FaUser className="text-gray-400 dark:text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  {user.roles && user.roles.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {user.roles.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
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
              <FaCalendar className="text-gray-400 dark:text-gray-500 w-5 h-5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Submitted</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(responseData.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {survey?.organization && (
              <div className="flex items-center space-x-3">
                <FaBuilding className="text-gray-400 dark:text-gray-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Organization</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{survey.organization.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Survey Answers */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Report Responses</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {answers.length} of {questions.length} questions answered
            </p>
          </div>
          
          <SurveyAnswerReview
            questions={questions}
            answers={answers.map(answer => ({
              questionId: answer.questionId,
              answerText: answer.answerText,
              answerOptions: getOptions(answer.answerOptions)
            }))}
            className="divide-y divide-gray-100 dark:divide-gray-700"
          />
        </div>
      </div>
    </div>
  )
}
