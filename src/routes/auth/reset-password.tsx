import { createFileRoute } from '@tanstack/react-router'
import ResetPasswordPage from '../../components/pages/authentication/ResetPasswordPage'

export const Route = createFileRoute('/auth/reset-password')({
  component: ResetPasswordPage,
}) 