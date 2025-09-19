import LandingPage from '@/components/features/landing-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(home-routes)/')({
  component: LandingPage,
})