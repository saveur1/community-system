import { createFileRoute } from '@tanstack/react-router'
import SignupPage from '../../components/pages/authentication/SignupPage'

export const Route = createFileRoute('/auth/signup')({
  component: SignupPage,
}) 