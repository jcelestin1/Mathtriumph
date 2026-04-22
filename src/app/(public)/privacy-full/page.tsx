import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Lock, Shield, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Privacy Policy & FERPA Compliance | MathTriumph",
  description: "Detailed privacy policy and FERPA compliance statement for MathTriumph.com",
}

export default function PrivacyPolicy() {
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
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex items-center gap-4">
            <Shield className="h-10 w-10 text-teal-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Privacy Policy &amp; FERPA Compliance
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">Last Updated: April 19, 2026</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-12 dark:prose-invert">
            <section>
              <h2>1. Introduction</h2>
              <p>
                MathTriumph.com (we, us, or our) provides personalized mathematics preparation tools focused
                on Florida B.E.S.T. EOC success. We are deeply committed to protecting student privacy and
                operate in full compliance with the Family Educational Rights and Privacy Act (FERPA).
              </p>
            </section>

            <section>
              <h2>2. FERPA Compliance Statement</h2>
              <p>
                When schools and districts use our platform, MathTriumph acts as a <strong>School Official</strong> under FERPA. We only process student education records for legitimate educational purposes, including adaptive practice, dual-stream AI error analysis, and real-time EOC score prediction.
              </p>

              <div className="my-8 rounded-2xl border border-teal-200 bg-teal-50 p-8 dark:border-teal-800 dark:bg-teal-950">
                <p className="mb-4 font-medium text-teal-800 dark:text-teal-300">
                  We commit to the following:
                </p>
                <ul className="space-y-3">
                  <li>• Student data is used solely for EOC mastery and educational improvement</li>
                  <li>• We never sell, rent, or market student information</li>
                  <li>• Our AI systems never train on identifiable student data</li>
                  <li>• All processing is purpose-limited and auditable</li>
                </ul>
              </div>
            </section>

            <section>
              <h2>3. Information We Collect</h2>
              <h3>Student Education Records</h3>
              <p>Quiz responses, error patterns, progress data, EOC score predictions, and mastery levels.</p>

              <h3>Account Information</h3>
              <p>Name, email, role (Student, Teacher, Parent, etc.), and school/district affiliation.</p>

              <h3>Usage Data</h3>
              <p>Session duration, features used, and performance metrics (anonymized where possible).</p>
            </section>

            <section>
              <h2>4. How We Use Your Information</h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>Deliver personalized EOC practice and adaptive learning</li>
                <li>Provide accurate dual-stream AI error analysis and remediation</li>
                <li>Generate real-time EOC score predictions</li>
                <li>Enable teachers and administrators to support student success</li>
                <li>Improve our platform through aggregated, de-identified analytics</li>
              </ul>
            </section>

            <section>
              <h2>5. Data Security &amp; AI Safeguards</h2>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border p-6">
                  <Lock className="mb-4 h-8 w-8 text-teal-600" />
                  <h3 className="mb-2 font-semibold">Technical Security</h3>
                  <ul className="space-y-1 text-sm">
                    <li>AES-256 encryption at rest</li>
                    <li>TLS 1.3 encryption in transit</li>
                    <li>Server-side processing of sensitive records</li>
                    <li>Regular security audits</li>
                  </ul>
                </div>
                <div className="rounded-xl border p-6">
                  <Users className="mb-4 h-8 w-8 text-teal-600" />
                  <h3 className="mb-2 font-semibold">AI-Specific Protections</h3>
                  <ul className="space-y-1 text-sm">
                    <li>RAG-only architecture (no training on student data)</li>
                    <li>Ephemeral processing (data deleted after use)</li>
                    <li>Per-district data isolation</li>
                    <li>Full audit logging of AI inferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2>6. Your Rights</h2>
              <p>Parents and eligible students have the right to:</p>
              <ul className="mt-4 list-disc space-y-3 pl-6">
                <li>Inspect and review education records</li>
                <li>Request correction of inaccurate records</li>
                <li>Request deletion of records (subject to legal obligations)</li>
                <li>Opt-out of certain data processing where applicable</li>
              </ul>
            </section>

            <section>
              <h2>7. Contact Us</h2>
              <p>For privacy inquiries, data requests, or FERPA-related questions, please contact:</p>
              <div className="mt-4 rounded-xl bg-gray-100 p-6 dark:bg-gray-900">
                <p className="font-medium">Privacy Team</p>
                <a href="mailto:privacy@mathtriumph.com" className="text-teal-600 hover:underline">
                  privacy@mathtriumph.com
                </a>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2>District Record Custodians</h2>
              <p>
                Please contact your school or district first for official record custodian workflows on
                inspection, amendment, and deletion requests.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
