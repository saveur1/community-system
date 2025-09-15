import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/rapid-enquiry/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/rapid-enquiry/"!</div>
}
