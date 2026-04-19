import Link from "next/link"
import { Divide, Sigma, Triangle } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"

type AuthLayoutProps = {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-background to-sky-50 dark:from-teal-950/30 dark:to-sky-950/20">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-6 md:grid-cols-2 md:gap-10 md:px-6 lg:px-8">
        <section className="order-2 flex items-center justify-center md:order-1">
          <div className="w-full max-w-md rounded-2xl border border-border/70 bg-background/90 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold">
                MathTriumph
              </Link>
              <ThemeToggle />
            </div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="mb-6 mt-2 text-sm text-muted-foreground">{subtitle}</p>
            {children}
          </div>
        </section>

        <section className="order-1 flex items-center md:order-2">
          <div className="relative w-full overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-600 to-sky-600 p-8 text-white">
            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-amber-400/30 blur-2xl" />
            <div className="absolute -left-8 bottom-4 size-28 rounded-full bg-cyan-300/25 blur-2xl" />

            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              Triumph Mode
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Confidence-building math prep for every learner.
            </h2>
            <p className="mt-3 text-sm text-white/90">
              Practice with purpose, track gains, and walk into test day ready
              to win.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-white/15 p-3">
                <Triangle className="mx-auto mb-2 size-5" />
                <p className="text-xs">Geometry</p>
              </div>
              <div className="rounded-lg bg-white/15 p-3">
                <Sigma className="mx-auto mb-2 size-5" />
                <p className="text-xs">Algebra</p>
              </div>
              <div className="rounded-lg bg-white/15 p-3">
                <Divide className="mx-auto mb-2 size-5" />
                <p className="text-xs">Fluency</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
