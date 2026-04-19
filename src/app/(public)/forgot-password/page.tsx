import type { Metadata } from "next"

import { AuthLayout } from "@/components/auth/auth-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your MathTriumph account password.",
}

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we will send a reset link."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
