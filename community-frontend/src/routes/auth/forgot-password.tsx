import { createFileRoute } from '@tanstack/react-router'
import ForgotPasswordPage from '../../components/features/authentication/ForgotPasswordPage'

export const Route = createFileRoute('/auth/forgot-password')({
  component: ForgotPasswordPage,
}) 