export const APP_ROLES = [
  "district_admin",
  "school_admin",
  "tech_admin",
  "interventionist",
  "instructional_coach",
  "data_analyst",
  "teacher",
  "student",
  "parent",
  "support_admin",
] as const

export type AppRole = (typeof APP_ROLES)[number]

export const APP_PERMISSIONS = [
  "district.settings.manage",
  "district.reports.view",
  "district.assessments.manage",
  "school.manage",
  "school.reports.view",
  "roster.manage",
  "sso.configure",
  "security.manage",
  "system.health.view",
  "interventions.manage",
  "interventions.groups.manage",
  "coach.plans.manage",
  "coach.feedback.manage",
  "analytics.advanced.view",
  "analytics.exports.manage",
  "assignments.manage",
  "classroom.manage",
  "student.practice.access",
  "parent.progress.view",
  "support.assisted.read",
  "role.delegate",
  "role.switch.demo",
  "audit.logs.view",
] as const

export type AppPermission = (typeof APP_PERMISSIONS)[number]

export const ROLE_LABELS: Record<AppRole, string> = {
  district_admin: "District Admin",
  school_admin: "School Admin",
  tech_admin: "Tech / IT Admin",
  interventionist: "Interventionist / RTI Specialist",
  instructional_coach: "Instructional Coach",
  data_analyst: "Data Analyst",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent / Guardian",
  support_admin: "MathTriumph Support Admin",
}

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  district_admin: "District-wide control tower with cross-school accountability.",
  school_admin: "School-level operations, rostering, and usage leadership.",
  tech_admin: "SSO, integrations, security posture, and system health.",
  interventionist: "At-risk remediation workflows and targeted progress monitoring.",
  instructional_coach: "Instructional quality, shared plans, and teacher feedback loops.",
  data_analyst: "Advanced exports, benchmarking, and EOC predictor analytics.",
  teacher: "Classroom practice, assignment delivery, and instructional response.",
  student: "Adaptive practice, simulation, and mastery growth.",
  parent: "Transparent view-only progress and shareable family reports.",
  support_admin: "Temporary, read-only assisted support access.",
}

export const ROLE_PERMISSIONS: Record<AppRole, AppPermission[]> = {
  district_admin: [
    "district.settings.manage",
    "district.reports.view",
    "district.assessments.manage",
    "school.manage",
    "school.reports.view",
    "roster.manage",
    "sso.configure",
    "security.manage",
    "system.health.view",
    "interventions.manage",
    "interventions.groups.manage",
    "coach.plans.manage",
    "coach.feedback.manage",
    "analytics.advanced.view",
    "analytics.exports.manage",
    "role.delegate",
    "role.switch.demo",
    "audit.logs.view",
  ],
  school_admin: [
    "school.manage",
    "school.reports.view",
    "roster.manage",
    "interventions.manage",
    "interventions.groups.manage",
    "coach.feedback.manage",
    "analytics.advanced.view",
    "analytics.exports.manage",
    "role.delegate",
    "role.switch.demo",
    "audit.logs.view",
  ],
  tech_admin: [
    "sso.configure",
    "security.manage",
    "system.health.view",
    "audit.logs.view",
  ],
  interventionist: [
    "interventions.manage",
    "interventions.groups.manage",
    "analytics.advanced.view",
    "assignments.manage",
  ],
  instructional_coach: [
    "coach.plans.manage",
    "coach.feedback.manage",
    "analytics.advanced.view",
    "school.reports.view",
  ],
  data_analyst: [
    "district.reports.view",
    "school.reports.view",
    "analytics.advanced.view",
    "analytics.exports.manage",
  ],
  teacher: [
    "assignments.manage",
    "classroom.manage",
    "interventions.manage",
    "student.practice.access",
  ],
  student: ["student.practice.access"],
  parent: ["parent.progress.view"],
  support_admin: ["support.assisted.read", "audit.logs.view"],
}

export const DASHBOARD_PATH_BY_ROLE: Record<AppRole, string> = {
  district_admin: "/dashboard/district",
  school_admin: "/dashboard/school",
  tech_admin: "/dashboard/tech",
  interventionist: "/dashboard/intervention",
  instructional_coach: "/dashboard/coach",
  data_analyst: "/dashboard/data",
  teacher: "/dashboard/manager",
  student: "/dashboard/student",
  parent: "/dashboard/parent",
  support_admin: "/dashboard/support",
}

export const ROLE_ROUTE_RULES: Array<{ prefix: string; allowed: AppRole[] }> = [
  { prefix: "/dashboard/district", allowed: ["district_admin"] },
  { prefix: "/dashboard/school", allowed: ["school_admin", "district_admin"] },
  { prefix: "/dashboard/tech", allowed: ["tech_admin", "district_admin"] },
  {
    prefix: "/dashboard/intervention",
    allowed: ["interventionist", "school_admin", "district_admin"],
  },
  {
    prefix: "/dashboard/coach",
    allowed: ["instructional_coach", "school_admin", "district_admin"],
  },
  {
    prefix: "/dashboard/data",
    allowed: ["data_analyst", "school_admin", "district_admin"],
  },
  {
    prefix: "/dashboard/manager",
    allowed: ["teacher", "school_admin", "district_admin", "instructional_coach"],
  },
  { prefix: "/dashboard/student", allowed: ["student"] },
  { prefix: "/dashboard/parent", allowed: ["parent"] },
  { prefix: "/dashboard/support", allowed: ["support_admin", "district_admin"] },
  { prefix: "/dashboard/dev/users", allowed: ["district_admin", "school_admin"] },
  { prefix: "/dev/users", allowed: ["district_admin", "school_admin"] },
]

export const DEMO_SWITCH_TARGETS_BY_ROLE: Partial<Record<AppRole, AppRole[]>> = {
  district_admin: [
    "school_admin",
    "tech_admin",
    "interventionist",
    "instructional_coach",
    "data_analyst",
    "teacher",
    "student",
    "parent",
    "support_admin",
  ],
  school_admin: ["teacher", "interventionist", "instructional_coach", "data_analyst"],
}

export const DELEGABLE_TARGETS_BY_ROLE: Partial<Record<AppRole, AppRole[]>> = {
  district_admin: [
    "school_admin",
    "tech_admin",
    "interventionist",
    "instructional_coach",
    "data_analyst",
    "teacher",
    "support_admin",
  ],
  school_admin: [
    "interventionist",
    "instructional_coach",
    "data_analyst",
    "teacher",
  ],
}

export function getDashboardPathByRole(role: AppRole) {
  return DASHBOARD_PATH_BY_ROLE[role]
}

export function getAllowedRolesForPath(pathname: string): AppRole[] {
  const match = ROLE_ROUTE_RULES.find((rule) => pathname.startsWith(rule.prefix))
  return match ? match.allowed : APP_ROLES.slice()
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  return getAllowedRolesForPath(pathname).includes(role)
}

export function hasPermission(role: AppRole, permission: AppPermission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

export function canSwitchToRole(currentRole: AppRole, targetRole: AppRole): boolean {
  const allowedTargets = DEMO_SWITCH_TARGETS_BY_ROLE[currentRole] ?? []
  return allowedTargets.includes(targetRole)
}

export function canDelegateTarget(currentRole: AppRole, targetRole: AppRole): boolean {
  const allowedTargets = DELEGABLE_TARGETS_BY_ROLE[currentRole] ?? []
  return allowedTargets.includes(targetRole)
}
