import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Terms of Service | MathTriumph",
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-xl font-bold text-white">
              MT
            </div>
            <span className="text-2xl font-semibold text-teal-700 dark:text-teal-400">MathTriumph</span>
          </Link>

          <Button variant="ghost" className="flex items-center gap-2" render={<Link href="/" />}>
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="prose mx-auto max-w-3xl dark:prose-invert">
          <h1 className="mb-2 text-4xl font-bold">Terms of Service</h1>
          <p className="mb-12 text-gray-600 dark:text-gray-400">Last Updated: April 19, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using MathTriumph.com, you agree to be bound by these Terms of Service and our
            Privacy Policy.
          </p>

          <h2>2. Use of the Service</h2>
          <p>
            MathTriumph provides tools to help students prepare for Florida B.E.S.T. EOC exams. The service
            is intended for educational use by students, teachers, parents, and school districts.
          </p>

          <h2>3. User Accounts and Roles</h2>
          <p>
            Accounts are role-based (Student, Teacher, Parent, School Admin, District Admin, etc.). You
            are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h2>4. Acceptable Use</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>You may not use the service for any unlawful purpose</li>
            <li>You may not attempt to reverse engineer or circumvent security measures</li>
            <li>You may not share login credentials with unauthorized users</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>
            All content, features, and functionality on MathTriumph are owned by MathTriumph, Inc. and are
            protected by copyright and other intellectual property laws.
          </p>

          <h2>6. Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>

          <h2>7. Limitation of Liability</h2>
          <p>
            MathTriumph is provided as is. We are not liable for any indirect, incidental, or consequential
            damages arising from use of the service.
          </p>

          <h2>8. Governing Law</h2>
          <p>These terms are governed by the laws of the State of Florida.</p>

          <div className="mt-16 text-sm text-gray-500">
            Questions about these Terms? Contact us at{" "}
            <a href="mailto:legal@mathtriumph.com" className="text-teal-600 hover:underline">
              legal@mathtriumph.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
