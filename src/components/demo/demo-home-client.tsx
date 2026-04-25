"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Heart,
  LineChart,
  Loader2,
  Sparkles,
  Target,
  User,
  Users,
} from "lucide-react"
import { useState } from "react"

import { useAuth } from "@/context/AuthContext"
import { type DemoRole, getDashboardPathByRole } from "@/lib/demo-auth"
import { launchSecureExamWindow } from "@/lib/secure-exam-session"
import { ThemeToggle } from "@/components/theme-toggle"
import { RoleSwitcher } from "@/components/ui/role-switcher"
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

type ShowcaseRole = "student" | "teacher" | "parent"

const roleCards: {
  role: ShowcaseRole
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  highlights: string[]
  gradient: string
}[] = [
  {
    role: "student",
    title: "Student Dashboard Demo",
    subtitle: "Motivation + mastery in one view",
    description:
      "Show streaks, skill growth, and score projections that keep learners engaged daily.",
    icon: User,
    highlights: [
      "Skill radar and progress trend",
      "Streak and achievement tracking",
      "Recommended practice actions",
    ],
    gradient:
      "from-teal-100/90 via-background to-sky-100/70 dark:from-teal-500/15 dark:to-sky-500/10",
  },
  {
    role: "teacher",
    title: "Teacher / Manager Dashboard Demo",
    subtitle: "Classroom decisions backed by data",
    description:
      "Explore class mastery, intervention insights, and reporting tools for faster learning gains.",
    icon: Users,
    highlights: [
      "Class + school analytics charts",
      "Topic mastery intervention views",
      "Actionable reporting workflows",
    ],
    gradient:
      "from-sky-100/80 via-background to-teal-100/70 dark:from-sky-500/15 dark:to-teal-500/10",
  },
  {
    role: "parent",
    title: "Parent Dashboard Demo",
    subtitle: "Clear progress families can trust",
    description:
      "See reassuring child progress snapshots, trend insights, and easy next-step recommendations.",
    icon: Heart,
    highlights: [
      "Family progress trend overview",
      "Child spotlight skill breakdown",
      "Simple weekly action plan",
    ],
    gradient:
      "from-teal-100/80 via-background to-emerald-100/70 dark:from-teal-500/15 dark:to-emerald-500/10",
  },
]

const techStack = ["Next.js", "Tailwind CSS", "Recharts", "shadcn/ui"]

function roleLabel(role: ShowcaseRole) {
  if (role === "teacher") return "Teacher"
  if (role === "parent") return "Parent"
  return "Student"
}

function normalizeAuthRole(
  role: DemoRole
): ShowcaseRole {
  if (role === "student" || role === "teacher" || role === "parent") return role
  return "teacher"
}

export function DemoHomeClient() {
  const router = useRouter()
  const { role, loginAs } = useAuth()
  const currentRole = normalizeAuthRole(role)
  const [loadingRole, setLoadingRole] = useState<ShowcaseRole | null>(null)

  const launchRole = async (targetRole: ShowcaseRole) => {
    setLoadingRole(targetRole)
    try {
      const result = await loginAs(
        targetRole as DemoRole,
        true,
        `${targetRole}@mathtriumph.local`,
        "MathTriumph2026!"
      )
      if (targetRole === "student") {
        const secureLaunch = launchSecureExamWindow("/practice/quiz")
        if (secureLaunch.opened) {
          window.location.replace("about:blank")
          return
        }
      }
      router.push(result.redirectTo ?? getDashboardPathByRole(targetRole))
    } finally {
      setLoadingRole(null)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-background dark:from-teal-950/35">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="size-9 rounded-lg bg-gradient-to-br from-teal-600 to-sky-500" />
            <span className="text-lg font-semibold">MathTriumph Demo</span>
          </Link>
          <div className="flex items-center gap-2">
            <RoleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <section className="mb-8 rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-100/60 via-background to-sky-100/50 p-6 dark:border-teal-500/30 dark:from-teal-500/10 dark:to-sky-500/10 sm:p-8">
          <Badge
            variant="secondary"
            className="mb-4 bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200"
          >
            Demo Experience
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Welcome to MathTriumph Demo
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Experience how students, teachers, and parents excel at math
            assessments.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {roleCards.map((item) => (
              <Button
                key={`quick-${item.role}`}
                variant={item.role === currentRole ? "default" : "outline"}
                className="border-teal-200"
                onClick={() => launchRole(item.role)}
                disabled={loadingRole !== null}
              >
                {loadingRole === item.role ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Loading {roleLabel(item.role)}...
                  </>
                ) : (
                  <>
                    <item.icon className="text-teal-600" />
                    Quick Launch {roleLabel(item.role)}
                  </>
                )}
              </Button>
            ))}
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {roleCards.map((item) => {
            const Icon = item.icon
            const active = item.role === currentRole
            return (
              <Card
                key={item.role}
                className={`relative overflow-hidden border-teal-200/70 bg-gradient-to-br ${item.gradient} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-teal-500/30`}
              >
                <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-teal-500/10 blur-2xl" />
                <CardHeader className="relative">
                  <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg border border-teal-200 bg-white/90 dark:border-teal-500/30 dark:bg-background/50">
                    <Icon className="size-5 text-teal-600" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{item.title}</CardTitle>
                    {active ? (
                      <Badge className="bg-teal-600 text-white">Current</Badge>
                    ) : null}
                  </div>
                  <CardDescription>{item.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="space-y-2">
                    {item.highlights.map((highlight) => (
                      <p
                        key={highlight}
                        className="inline-flex items-center gap-2 text-sm text-foreground/90"
                      >
                        <Sparkles className="size-3.5 text-teal-600" />
                        {highlight}
                      </p>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-teal-600 text-white hover:bg-teal-700"
                    onClick={() => launchRole(item.role)}
                    disabled={loadingRole !== null}
                  >
                    {loadingRole === item.role ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Launching...
                      </>
                    ) : (
                      <>
                        Launch {roleLabel(item.role)} Dashboard
                        <ArrowRight className="ml-1" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </section>

        <section className="mt-8 rounded-xl border border-border/70 bg-background/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-teal-300 text-teal-700 dark:border-teal-500/30 dark:text-teal-200">
              <BookOpenCheck className="mr-1" />
              Built with
            </Badge>
            {techStack.map((item) => (
              <Badge key={item} variant="secondary" className="gap-1">
                {item === "Next.js" ? <Target className="size-3.5 text-teal-600" /> : null}
                {item === "Tailwind CSS" ? <Sparkles className="size-3.5 text-sky-600" /> : null}
                {item === "Recharts" ? <LineChart className="size-3.5 text-emerald-600" /> : null}
                {item === "shadcn/ui" ? <GraduationCap className="size-3.5 text-teal-600" /> : null}
                {item}
              </Badge>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-border/60 py-6 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p>Showcase dashboards with one click and role-aware routing.</p>
            <Link className="inline-flex items-center gap-1 text-teal-700 hover:underline dark:text-teal-300" href="/">
              Back to Public Landing
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </footer>
      </div>
    </main>
  )
}
