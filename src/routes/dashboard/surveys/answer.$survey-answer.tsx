import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/surveys/answer/$survey-answer')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/surveys/$survey-answer"!</div>
}
