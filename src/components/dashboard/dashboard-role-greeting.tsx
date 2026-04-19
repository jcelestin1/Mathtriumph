"use client"

import { useAuth } from "@/context/AuthContext"
import type { DemoRole } from "@/lib/demo-auth"

type GreetingVariant =
  | "student"
  | "manager"
  | "parent"
  | "district"
  | "school"
  | "tech"
  | "intervention"
  | "coach"
  | "data"
  | "support"

type GreetingRole = "student" | "teacher" | "parent" | "admin_ops"

const greetingCopy: Record<
  GreetingVariant,
  Record<GreetingRole, string>
> = {
  student: {
    student: "Welcome back, Student. Your consistency is turning into measurable growth.",
    teacher: "Teacher context enabled. Reviewing the student journey and momentum signals.",
    parent: "Parent context enabled. Viewing the student dashboard and growth pathway.",
    admin_ops: "Operations context enabled. Validating student experience quality.",
  },
  manager: {
    student: "Student context enabled. Viewing teacher and manager insights.",
    teacher: "Welcome back, Teacher. Your classes are ready for targeted wins.",
    parent: "Parent context enabled. Exploring manager-level analytics and interventions.",
    admin_ops: "Admin operations context enabled for instructional oversight.",
  },
  parent: {
    student: "Student context enabled. Viewing family progress insights.",
    teacher: "Teacher context enabled. Reviewing parent reporting experience.",
    parent: "Welcome back, Parent. Clear, trustworthy progress updates are ready.",
    admin_ops: "Admin operations context enabled for parent transparency checks.",
  },
  district: {
    student: "Student context enabled while viewing district command metrics.",
    teacher: "Teacher context enabled while reviewing district performance trends.",
    parent: "Parent context enabled while reviewing district communication impact.",
    admin_ops: "District command center is active with cross-school accountability signals.",
  },
  school: {
    student: "Student context enabled for school-level readiness review.",
    teacher: "Teacher context enabled for school-level coaching and assignment uptake.",
    parent: "Parent context enabled for school-facing family engagement metrics.",
    admin_ops: "School operations workspace is ready for staffing and reporting actions.",
  },
  tech: {
    student: "Student context enabled while validating authentication and reliability.",
    teacher: "Teacher context enabled while validating SSO and roster sync status.",
    parent: "Parent context enabled while validating secure guardian access.",
    admin_ops: "Tech and security command view is active with compliance monitoring.",
  },
  intervention: {
    student: "Student context enabled for targeted remediation planning.",
    teacher: "Teacher context enabled for intervention alignment and follow-through.",
    parent: "Parent context enabled for intervention transparency and communication.",
    admin_ops: "Intervention queue is active with at-risk heat map prioritization.",
  },
  coach: {
    student: "Student context enabled for plan quality calibration.",
    teacher: "Teacher context enabled for coaching feedback and instructional plans.",
    parent: "Parent context enabled for family-facing instructional coherence checks.",
    admin_ops: "Coaching workspace is ready for PD insights and plan governance.",
  },
  data: {
    student: "Student context enabled while validating analytics model fit.",
    teacher: "Teacher context enabled while reviewing benchmark and export fidelity.",
    parent: "Parent context enabled while auditing report clarity and trust.",
    admin_ops: "Data intelligence workspace is active with predictor and benchmark insights.",
  },
  support: {
    student: "Student context enabled in read-only assisted support mode.",
    teacher: "Teacher context enabled in read-only assisted support mode.",
    parent: "Parent context enabled in read-only assisted support mode.",
    admin_ops: "Support admin mode is read-only and fully audited.",
  },
}

function normalizeRole(role: DemoRole): GreetingRole {
  if (role === "student" || role === "teacher" || role === "parent") return role
  return "admin_ops"
}

export function DashboardRoleGreeting({ variant }: { variant: GreetingVariant }) {
  const { role } = useAuth()
  const normalizedRole = normalizeRole(role)

  return (
    <p className="text-sm text-muted-foreground">
      {greetingCopy[variant][normalizedRole]}
    </p>
  )
}
