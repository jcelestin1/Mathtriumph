import type { Metadata } from "next"

import { FileCheck2 } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "DPA FERPA School Official Addendum",
  description:
    "MathTriumph Data Processing Agreement (DPA) FERPA School Official Addendum for districts.",
}

export default function DpaFerpaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-sky-50/30 dark:from-teal-950/35 dark:to-sky-950/10">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="premium-surface">
          <CardHeader className="space-y-3">
            <CardTitle className="inline-flex items-center gap-2 text-2xl sm:text-3xl">
              <FileCheck2 className="size-6 text-teal-600" />
              Data Processing Agreement (DPA) - FERPA School Official Addendum
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm sm:text-base">
            <p>
              MathTriumph, Inc. (&quot;Processor&quot;) agrees to act as a &quot;School Official&quot;
              under FERPA when processing student education records on behalf of the District
              (&quot;Controller&quot;).
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">1. Permitted Use</h2>
              <p className="text-muted-foreground">
                Processor may access and process Student Data solely for the purpose of delivering
                personalized mathematics EOC preparation, adaptive practice, error analysis, and score
                prediction services as described in the Agreement.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">2. Data Minimization &amp; Purpose Limitation</h2>
              <p className="text-muted-foreground">
                Processor will only process the minimum Student Data necessary to provide the Services
                and will not use Student Data for any other purpose, including commercial or marketing
                purposes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">3. AI Safeguards</h2>
              <p className="text-muted-foreground">
                Any AI features (including dual-stream error analysis and EOC Score Predictor) use
                isolated, purpose-limited processing. Student PII is never used to train general AI
                models. Processing occurs via Retrieval-Augmented Generation (RAG) with per-district
                data segregation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">4. Security</h2>
              <p className="text-muted-foreground">
                Processor will maintain reasonable administrative, technical, and physical safeguards,
                including AES-256 encryption at rest, TLS 1.3 in transit, and strict role-based access
                controls.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">5. Audit &amp; Deletion</h2>
              <p className="text-muted-foreground">
                Processor will maintain audit logs of all access to Student Data and will delete or
                return all Student Data upon termination of the Agreement or at the District&apos;s
                request.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">6. No Redisclosure</h2>
              <p className="text-muted-foreground">
                Processor will not disclose Student Data to any third party without the District&apos;s
                prior written consent, except as required by law.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-semibold">7. Subprocessors</h2>
              <p className="text-muted-foreground">
                Any subprocessors (e.g., cloud hosting providers) are bound by the same obligations and
                listed in an up-to-date Subprocessor Schedule.
              </p>
            </section>

            <p>
              By signing this Agreement, the District designates MathTriumph, Inc. as a School Official
              under FERPA.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
