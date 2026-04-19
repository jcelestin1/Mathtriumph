"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  AreaChart,
  Bell,
  BookOpenCheck,
  Bot,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileBarChart2,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Sparkles,
  ShieldCheck,
  Target,
  Trophy,
  UserCircle2,
  Users,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "@/components/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { RoleSwitcher } from "@/components/ui/role-switcher"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { type DemoRole } from "@/lib/demo-auth"
import { ROLE_LABELS } from "@/lib/rbac"

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navByRole: Record<DashboardRole, NavItem[]> = {
  district_admin: [
    { label: "District Command", href: "/dashboard/district", icon: LayoutDashboard },
    { label: "School Ops", href: "/dashboard/school", icon: GraduationCap },
    { label: "Data Intelligence", href: "/dashboard/data", icon: FileBarChart2 },
    { label: "Interventions", href: "/dashboard/intervention", icon: BookOpenCheck },
    { label: "Tech Health", href: "/dashboard/tech", icon: Bot },
    { label: "Support View", href: "/dashboard/support", icon: UserCircle2 },
  ],
  school_admin: [
    { label: "School Overview", href: "/dashboard/school", icon: LayoutDashboard },
    { label: "Teacher Workspace", href: "/dashboard/manager", icon: Users },
    { label: "Interventions", href: "/dashboard/intervention", icon: BookOpenCheck },
    { label: "Coaching", href: "/dashboard/coach", icon: Sparkles },
    { label: "Data Exports", href: "/dashboard/data", icon: FileBarChart2 },
  ],
  tech_admin: [
    { label: "Tech Overview", href: "/dashboard/tech", icon: LayoutDashboard },
    { label: "SSO Health", href: "/dashboard/tech", icon: ShieldCheck },
    { label: "Security", href: "/dashboard/tech", icon: Bell },
    { label: "System Logs", href: "/dashboard/tech", icon: FileBarChart2 },
  ],
  interventionist: [
    { label: "Intervention Hub", href: "/dashboard/intervention", icon: LayoutDashboard },
    { label: "At-Risk Groups", href: "/dashboard/intervention", icon: Users },
    { label: "Progress Monitoring", href: "/dashboard/intervention", icon: Target },
    { label: "Student Practice", href: "/practice/quiz", icon: ClipboardCheck },
  ],
  instructional_coach: [
    { label: "Coach Workspace", href: "/dashboard/coach", icon: LayoutDashboard },
    { label: "Teacher Usage", href: "/dashboard/coach", icon: Users },
    { label: "Shared Plans", href: "/dashboard/coach", icon: Sparkles },
    { label: "Classroom View", href: "/dashboard/manager", icon: GraduationCap },
  ],
  data_analyst: [
    { label: "Data Command", href: "/dashboard/data", icon: LayoutDashboard },
    { label: "Predictor Insights", href: "/dashboard/data", icon: AreaChart },
    { label: "Benchmarking", href: "/dashboard/data", icon: FileBarChart2 },
    { label: "District View", href: "/dashboard/district", icon: GraduationCap },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    {
      label: "Practice",
      href: "/practice/quiz",
      icon: Target,
    },
    {
      label: "Assessments",
      href: "/dashboard/student/assessments",
      icon: ClipboardCheck,
    },
    { label: "Progress", href: "/dashboard/student", icon: FileBarChart2 },
    { label: "Achievements", href: "/dashboard/student", icon: Trophy },
    { label: "Study Plan", href: "/dashboard/student", icon: BookOpenCheck },
    { label: "Charts Demo", href: "/dashboard/charts", icon: AreaChart },
  ],
  teacher: [
    { label: "Overview", href: "/dashboard/manager", icon: LayoutDashboard },
    { label: "Classes", href: "/dashboard/manager", icon: GraduationCap },
    { label: "Students", href: "/dashboard/manager", icon: Users },
    { label: "Analytics", href: "/dashboard/manager", icon: FileBarChart2 },
    { label: "Charts Demo", href: "/dashboard/charts", icon: AreaChart },
    { label: "Reports", href: "/dashboard/manager", icon: ClipboardCheck },
    { label: "Assign Quizzes", href: "/dashboard/manager", icon: Sparkles },
  ],
  parent: [
    { label: "Child Overview", href: "/dashboard/parent", icon: LayoutDashboard },
    { label: "Progress Reports", href: "/dashboard/parent", icon: FileBarChart2 },
    { label: "Activity Feed", href: "/dashboard/parent", icon: CalendarCheck },
    { label: "Recommendations", href: "/dashboard/parent", icon: Bot },
    { label: "Charts Demo", href: "/dashboard/charts", icon: AreaChart },
  ],
  support_admin: [
    { label: "Support Workspace", href: "/dashboard/support", icon: LayoutDashboard },
    { label: "Assisted Read-Only", href: "/dashboard/support", icon: ShieldCheck },
    { label: "Escalations", href: "/dashboard/support", icon: Bell },
  ],
}

type DashboardRole = DemoRole

function SideNavigation({
  role,
  collapsed,
  pathname,
  onNavigate,
}: {
  role: DashboardRole
  collapsed: boolean
  pathname: string
  onNavigate?: () => void
}) {
  const navItems = navByRole[role]

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={`${role}-${item.label}`}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
              active
                ? "border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-200"
                : "border-border/70 hover:bg-muted/50"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        )
      })}
    </nav>
  )
}

export function DashboardShell({
  children,
  initialRole,
}: {
  children: React.ReactNode
  initialRole: DashboardRole
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [showRoleBanner, setShowRoleBanner] = useState(true)
  const { role: authRole, logout } = useAuth()
  const role: DashboardRole = authRole ?? initialRole

  const roleLabel = useMemo(() => {
    return ROLE_LABELS[role]
  }, [role])

  const onLogout = () => {
    void logout().then(() => {
      router.push("/")
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-background to-sky-50/40 dark:from-teal-950/35 dark:to-sky-950/10">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl">
        <aside
          className={`hidden border-r border-border/60 bg-sidebar/90 p-3 backdrop-blur md:block ${
            collapsed ? "w-20" : "w-72"
          }`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-gradient-to-br from-teal-600 to-sky-500" />
              {!collapsed ? <span className="text-sm font-semibold">MathTriumph</span> : null}
            </Link>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setCollapsed((value) => !value)}
              aria-label="Toggle sidebar"
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </Button>
          </div>

          {!collapsed ? (
            <div className="mb-3 rounded-xl border border-teal-200/60 bg-gradient-to-r from-teal-50 to-sky-50 px-3 py-2 text-xs dark:border-teal-500/30 dark:from-teal-500/10 dark:to-sky-500/10">
              <p className="font-medium text-teal-800 dark:text-teal-200">Role: {roleLabel}</p>
              <p className="text-muted-foreground">Daily growth, visible momentum.</p>
            </div>
          ) : null}

          <SideNavigation role={role} collapsed={collapsed} pathname={pathname} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="md:hidden"
                      aria-label="Open mobile menu"
                    />
                  }
                >
                  <Menu className="size-4" />
                </SheetTrigger>
                <SheetContent side="left" className="w-[18rem] p-4">
                  <SheetHeader className="px-0">
                    <SheetTitle>MathTriumph Navigation</SheetTitle>
                    <SheetDescription>
                      Switch sections and keep your momentum.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <SideNavigation
                      role={role}
                      collapsed={false}
                      pathname={pathname}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="inline-flex items-center gap-2 md:hidden">
                <div className="size-7 rounded-md bg-gradient-to-br from-teal-600 to-sky-500" />
                <span className="text-sm font-semibold">MathTriumph</span>
              </Link>

              <div className="relative hidden max-w-md flex-1 md:block">
                <Input placeholder="Search students, reports, or assessments..." />
              </div>

              <Button variant="outline" size="icon-sm" aria-label="Notifications">
                <Bell className="size-4" />
              </Button>

              <RoleSwitcher />

              <ThemeToggle />

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      className="h-auto rounded-full p-0"
                      aria-label="Open user menu"
                    />
                  }
                >
                  <Avatar size="sm">
                    <AvatarFallback>MT</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <UserCircle2 className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <div className="flex-1 px-4 py-6 sm:px-6">
            <div className="mb-5">
              <h1 className="text-2xl font-semibold tracking-tight">Dashboard Workspace</h1>
              <p className="text-sm text-muted-foreground">
                Role-aware navigation with clear progress signals for students, families, and schools.
              </p>
            </div>
            {showRoleBanner ? (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-sky-50/80 px-4 py-2.5 text-sm text-teal-800 transition-all dark:border-teal-500/30 dark:from-teal-500/10 dark:to-sky-500/10 dark:text-teal-200">
                <p>
                  You are viewing as {roleLabel}. You&apos;re making real progress with every session.
                </p>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-teal-700 hover:bg-teal-100 dark:text-teal-200 dark:hover:bg-teal-500/20"
                  onClick={() => setShowRoleBanner(false)}
                  aria-label="Hide role banner"
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : null}
            <Separator className="mb-5" />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
