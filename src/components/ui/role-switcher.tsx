"use client"

import {
  Activity,
  Heart,
  Loader2,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { useAuth } from "@/context/AuthContext"
import { type DemoRole, getDashboardPathByRole } from "@/lib/demo-auth"
import { canSwitchToRole, ROLE_DESCRIPTION, ROLE_LABELS } from "@/lib/rbac"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const roleOptions: {
  role: DemoRole
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { role: "district_admin", label: "District Admin", icon: ShieldCheck },
  { role: "school_admin", label: "School Admin", icon: Settings },
  { role: "tech_admin", label: "Tech / IT Admin", icon: Activity },
  { role: "interventionist", label: "Interventionist", icon: Users },
  { role: "instructional_coach", label: "Instructional Coach", icon: Users },
  { role: "data_analyst", label: "Data Analyst", icon: Activity },
  { role: "student", label: "Student", icon: User },
  { role: "teacher", label: "Teacher", icon: Users },
  { role: "parent", label: "Parent", icon: Heart },
  { role: "support_admin", label: "Support Admin", icon: ShieldCheck },
]

function getRoleLabel(role: DemoRole) {
  return ROLE_LABELS[role]
}

export function RoleSwitcher() {
  const router = useRouter()
  const { role, switchRole } = useAuth()
  const [isPending, startTransition] = useTransition()
  const currentRole = role
  const currentRoleLabel = getRoleLabel(role)
  const switchableRoles = roleOptions.filter(({ role: optionRole }) =>
    canSwitchToRole(role, optionRole)
  )
  const canSwitchRoles = switchableRoles.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="inline-flex items-center gap-2"
            aria-label="Switch current role"
          />
        }
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin text-teal-600" />
        ) : (
          <Users className="size-4 text-teal-600" />
        )}
        <span className="text-xs text-muted-foreground">Role</span>
        <Badge
          variant="secondary"
          className="bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200"
        >
          {currentRoleLabel}
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-56">
        <DropdownMenuLabel>Role Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!canSwitchRoles ? (
          <DropdownMenuItem disabled>
            Role switching unavailable for this account
          </DropdownMenuItem>
        ) : null}
        {canSwitchRoles
          ? switchableRoles.map(({ role: optionRole, label, icon: Icon }) => {
          const active = currentRole === optionRole
          return (
            <DropdownMenuItem
              key={optionRole}
              onClick={() => {
                startTransition(() => {
                  void switchRole(optionRole).then(() => {
                    router.push(getDashboardPathByRole(optionRole))
                  })
                })
              }}
              disabled={isPending}
              className={
                active
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200"
                  : ""
              }
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm">{label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {ROLE_DESCRIPTION[optionRole]}
                </p>
              </div>
            </DropdownMenuItem>
          )
          })
          : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
