"use client"

import { Heart, User, Users } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { type DemoRole } from "@/lib/demo-auth"
import { launchSecureExamWindow, writeSecureExamSession } from "@/lib/secure-exam-session"
import { Button } from "@/components/ui/button"

const quickRoles: {
  role: DemoRole
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { role: "student", label: "Continue as Student", icon: User },
  { role: "teacher", label: "Continue as Teacher", icon: Users },
  { role: "parent", label: "Continue as Parent", icon: Heart },
]

export function DemoLoginButtons() {
  const { loginAs } = useAuth()

  return (
    <div className="space-y-2 rounded-lg border border-teal-200/70 bg-teal-50/80 p-3 dark:border-teal-500/30 dark:bg-teal-500/10">
      <p className="text-xs font-medium text-teal-800 dark:text-teal-200">
        Demo Quick Login
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {quickRoles.map(({ role, label, icon: Icon }) => (
          <Button
            key={role}
            type="button"
            variant="outline"
            className="justify-start border-teal-200 bg-white/90 text-xs text-teal-900 hover:bg-teal-100 dark:border-teal-500/30 dark:bg-transparent dark:text-teal-100"
            onClick={async () => {
              const seededEmail =
                role === "teacher"
                  ? "teacher@mathtriumph.local"
                  : role === "parent"
                    ? "parent@mathtriumph.local"
                    : "student@mathtriumph.local"
              const result = await loginAs(role, true, seededEmail, "MathTriumph2026!")
              if (role === "student") {
                const opened = launchSecureExamWindow("/practice/quiz?mode=secure")
                if (opened.opened) {
                  window.location.replace("about:blank")
                  return
                }
              }
              writeSecureExamSession("login")
              window.location.assign(result.redirectTo)
            }}
          >
            <Icon className="mr-1 size-4" />
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
