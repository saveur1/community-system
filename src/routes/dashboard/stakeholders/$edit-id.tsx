import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/stakeholders/$edit-id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/stakeholders/$edit-id"!</div>
}
