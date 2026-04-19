import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Crown,
  Gem,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react"

import { FaqAccordion } from "@/components/landing/faq-accordion"
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
import { pricingPlans } from "@/lib/mathtriumph-content"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose a MathTriumph plan: Free Starter, Pro Triumph, or Family/School for advanced assessment prep and measurable score growth.",
}

const guarantees = [
  "Cancel anytime, no lock-in contracts.",
  "Secure checkout and privacy-first data handling.",
  "Transparent features with no surprise add-ons.",
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-background dark:from-teal-950/35">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-gradient-to-br from-teal-600 to-amber-500" />
            <p className="text-lg font-semibold">MathTriumph</p>
          </Link>
          <div className="flex items-center gap-2">
            <Button render={<Link href="/login" />} variant="ghost" size="sm">
              Login
            </Button>
            <Button render={<Link href="/dashboard" />} variant="ghost" size="sm">
              Dashboard Mock
            </Button>
            <ThemeToggle />
          </div>
        </header>

        <section className="space-y-5 text-center">
          <Badge variant="secondary" className="mx-auto">
            Pricing built for confident score growth
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Pick your Triumph path
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Start free, then upgrade when you want deeper analytics, unlimited
            assessments, and personalized prep plans for big exam wins.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.featured
                  ? "relative border-teal-500 ring-2 ring-teal-500/30"
                  : undefined
              }
            >
              {plan.featured ? (
                <div className="absolute -top-3 left-4">
                  <Badge className="bg-amber-500 text-amber-950">
                    Most popular
                  </Badge>
                </div>
              ) : null}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.featured ? (
                    <Crown className="size-4 text-amber-500" />
                  ) : plan.name.includes("Family") ? (
                    <Gem className="size-4 text-teal-600" />
                  ) : (
                    <Sparkles className="size-4 text-teal-600" />
                  )}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.cadence}</CardDescription>
                <p className="pt-2 text-4xl font-bold">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                >
                  {plan.cta}
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-teal-600" />
                Why students choose Pro Triumph
              </CardTitle>
              <CardDescription>
                The highest-leverage plan for exam readiness.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Pro Triumph unlocks unlimited timed assessments and advanced
                predictor analytics so students can rehearse test pressure and
                close score gaps faster.
              </p>
              <p>
                Most learners upgrading to Pro use 3 to 5 focused sessions per
                week and report stronger confidence within the first month.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="size-4 text-amber-500" />
                Confidence guarantees
              </CardTitle>
              <CardDescription>Clear terms and learner-first flexibility.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {guarantees.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-teal-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator />

        <section className="py-4">
          <h2 className="mb-6 text-2xl font-semibold sm:text-3xl">
            Pricing FAQ
          </h2>
          <FaqAccordion />
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-1">
            <Crown className="size-4 text-amber-500" />
            © {new Date().getFullYear()} MathTriumph
          </p>
          <div className="flex items-center gap-4">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Privacy</Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
