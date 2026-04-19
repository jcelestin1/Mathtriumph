import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Award, Crown, ShieldCheck, Target, Trophy } from "lucide-react"

import { FaqAccordion } from "@/components/landing/faq-accordion"
import { InteractiveQuiz } from "@/components/landing/interactive-quiz"
import { TestimonialsCarousel } from "@/components/landing/testimonials-carousel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProgressRing } from "@/components/ui/progress-ring"
import { MathVisualCluster } from "@/components/visual/math-visual-cluster"
import { WaitlistForm } from "@/components/waitlist-form"
import {
  featureCards,
  howItWorks,
  pricingPlans,
  trustStats,
} from "@/lib/mathtriumph-content"

export const metadata: Metadata = {
  title: "Triumph at Every Math Assessment",
  description:
    "MathTriumph helps students master concepts, crush timed tests, and achieve higher scores across school exams, SAT/ACT Math, and AP tests.",
  openGraph: {
    title: "MathTriumph | Triumph at Every Math Assessment",
    description:
      "Master concepts, crush timed tests, and raise scores with confidence.",
    url: "https://mathtriumph.com",
    siteName: "MathTriumph",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MathTriumph",
    description:
      "A modern platform helping students triumph at mathematics assessments.",
  },
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-sky-50/40 text-foreground dark:from-teal-950/35 dark:to-sky-950/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3 py-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-gradient-to-br from-teal-600 to-amber-500" />
            <p className="text-lg font-semibold">MathTriumph</p>
          </Link>
          <div className="flex items-center gap-2">
            <Button render={<Link href="/login" />} variant="ghost" size="sm">
              Login
            </Button>
            <Button render={<Link href="/pricing" />} variant="ghost" size="sm">
              Pricing
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <section className="grid gap-8 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <Badge variant="secondary">Trusted growth engine for students, families, and schools</Badge>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Triumph at Every Math Assessment
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Adaptive practice, beautiful progress visuals, and confidence-building momentum that makes students want to return daily.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-teal-600 text-white hover:bg-teal-700"
                render={<a href="#quiz" />}
              >
                Start Free Triumph Quiz
              </Button>
              <Button variant="outline" size="lg" render={<a href="#how-it-works" />}>
                See Your Path to Victory
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge className="bg-teal-600 text-white">7-day streaks</Badge>
              <Badge variant="outline">Predictive score insights</Badge>
              <Badge variant="outline">District-ready reporting</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <MathVisualCluster />
            <Card className="premium-surface border-teal-300/60 dark:border-teal-900/70">
              <CardHeader>
                <CardTitle className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-teal-600" />
                  The Triumph momentum engine
                </CardTitle>
                <CardDescription>
                  Built to combine mastery depth with test-day performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/60 p-4">
                  <p className="text-2xl font-semibold">92%</p>
                  <p className="text-sm text-muted-foreground">
                    Report higher confidence before major exams
                  </p>
                </div>
                <div className="rounded-lg bg-muted/60 p-4">
                  <p className="text-2xl font-semibold">3.1x</p>
                  <p className="text-sm text-muted-foreground">
                    Faster identification of skill gaps
                  </p>
                </div>
                <div className="flex items-center justify-center rounded-lg bg-muted/60 p-4">
                  <ProgressRing value={84} label="readiness" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="premium-surface rounded-xl px-4 py-4 sm:px-6">
          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3 md:gap-6">
            {trustStats.map((stat) => (
              <p key={stat}>{stat}</p>
            ))}
          </div>
        </section>

        <section id="quiz" className="py-16">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Try the Triumph quiz experience
            </h2>
          </div>
          <p className="mb-6 max-w-3xl text-muted-foreground">
            This mini assessment mirrors real exam flow with instant scoring,
            detailed explanations, and retry loops that create measurable
            improvement.
          </p>
          <InteractiveQuiz />
        </section>

        <section className="py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Features designed for assessment growth
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((feature) => (
              <Card key={feature.title} className="premium-surface transition-transform hover:-translate-y-0.5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <feature.icon className="size-4 text-teal-600" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section id="how-it-works" className="py-16">
          <h2 className="mb-8 text-2xl font-semibold sm:text-3xl">
            How it works in 4 steps to Triumph
          </h2>
          <div className="grid gap-5 md:grid-cols-4">
            {howItWorks.map((step, index) => (
              <Card key={step} className="premium-surface">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-teal-100 text-sm text-teal-700 dark:bg-teal-500/20 dark:text-teal-200">
                      {index + 1}
                    </span>
                    Step {index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed text-foreground">
                    {step}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
            <Award className="size-4" />
            Triumph!
          </div>
        </section>

        <Separator />

        <section className="py-16">
          <h2 className="mb-8 text-2xl font-semibold sm:text-3xl">
            What students are saying
          </h2>
          <TestimonialsCarousel />
        </section>

        <Separator />

        <section className="py-16">
          <h2 className="mb-8 text-2xl font-semibold sm:text-3xl">
            Simple pricing for every stage
          </h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={
                  plan.featured
                    ? "premium-surface border-teal-500 ring-2 ring-teal-500/30"
                    : "premium-surface"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.featured ? <Badge>Most popular</Badge> : null}
                  </div>
                  <CardDescription>{plan.cadence}</CardDescription>
                  <p className="pt-2 text-3xl font-semibold">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {plan.highlights.map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.featured ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        <section className="py-16">
          <Card className="border-teal-300/60 bg-gradient-to-br from-teal-100/40 via-background to-amber-100/40 dark:from-teal-600/10 dark:to-amber-500/10">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl">
                Your next win starts now
              </CardTitle>
              <CardDescription>
                Join the early access list and get a personalized Triumph prep
                roadmap.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WaitlistForm />
            </CardContent>
            <CardFooter>
              <Button className="bg-amber-500 text-amber-950 hover:bg-amber-400">
                Claim My Triumph Plan
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </CardFooter>
          </Card>
        </section>

        <Separator />

        <section className="py-16">
          <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">FAQ</h2>
          <FaqAccordion />
        </section>
      </div>

      <footer className="border-t border-border/60 bg-background/90">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Crown className="size-4 text-amber-500" />©{" "}
            {new Date().getFullYear()} MathTriumph. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Contact</Link>
            <Link href="/dashboard" className="inline-flex items-center gap-1">
              <Target className="size-3.5" />
              Dashboard Mock
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
