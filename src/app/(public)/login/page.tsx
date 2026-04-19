import type { Metadata } from "next"

import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to MathTriumph to continue your personalized math assessment prep.",
}

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your MathTriumph progress and keep your streak alive."
    >
      <LoginForm />
    </AuthLayout>
  )
}
