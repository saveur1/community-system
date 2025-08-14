import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/surveys/edit/$edit-id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/surveys/edit/$editId"!</div>
}
