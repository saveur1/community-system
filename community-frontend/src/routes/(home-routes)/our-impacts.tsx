import { createFileRoute } from '@tanstack/react-router'
import OurImpacts from '@/components/features/landing-page/our-impacts'

export const Route = createFileRoute('/(home-routes)/our-impacts')({
  component: OurImpacts,
})
