import type { Metadata } from "next"

import { AuthLayout } from "@/components/auth/auth-layout"
import { SignupForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your MathTriumph account and begin building confidence for math assessments.",
}

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Choose your role and start your personalized Triumph path."
    >
      <SignupForm />
    </AuthLayout>
  )
}
