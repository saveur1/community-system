import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/feedback/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/feedback/"!</div>
}
