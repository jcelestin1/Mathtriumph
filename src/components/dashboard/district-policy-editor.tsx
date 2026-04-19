"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Settings2 } from "lucide-react"

import { APP_ROLES, ROLE_LABELS, type AppPermission, type AppRole } from "@/lib/rbac"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type MatrixPermission = {
  permission: AppPermission
  enabled: boolean
  defaultEnabled: boolean
  isOverridden: boolean
}

type MatrixRow = {
  role: AppRole
  permissions: MatrixPermission[]
}

type PresetPreview = {
  preset: "strict" | "balanced" | "empowered"
  label: string
  description: string
  impacts: Array<{
    role: AppRole
    permission: AppPermission
    enabled: boolean
  }>
}

type PolicySnapshot = {
  id: string
  label: string
  preset: string | null
  reason: string | null
  createdAt: string
  createdByUserId: string | null
  overrideCount: number
}

const DISPLAY_PERMISSION_ORDER: AppPermission[] = [
  "district.settings.manage",
  "district.reports.view",
  "school.manage",
  "school.reports.view",
  "roster.manage",
  "sso.configure",
  "security.manage",
  "system.health.view",
  "interventions.manage",
  "coach.plans.manage",
  "analytics.advanced.view",
  "analytics.exports.manage",
  "assignments.manage",
  "student.practice.access",
  "parent.progress.view",
  "role.delegate",
  "role.switch.demo",
  "audit.logs.view",
]

export function DistrictPolicyEditor() {
  const [matrix, setMatrix] = useState<MatrixRow[]>([])
  const [presetPreview, setPresetPreview] = useState<PresetPreview[]>([])
  const [snapshots, setSnapshots] = useState<PolicySnapshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApplyingPreset, setIsApplyingPreset] = useState(false)
  const [isRollingBack, setIsRollingBack] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [activeRole, setActiveRole] = useState<AppRole>("school_admin")

  const activeRow = useMemo(
    () => matrix.find((row) => row.role === activeRole),
    [matrix, activeRole]
  )

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const response = await fetch("/api/auth/permissions/policy", { method: "GET" })
        const json = (await response.json()) as {
          matrix?: MatrixRow[]
          presetPreview?: PresetPreview[]
          snapshots?: PolicySnapshot[]
          message?: string
        }
        if (!response.ok) {
          throw new Error(json.message ?? "Unable to load district permission policy.")
        }
        if (!active) return
        setMatrix(json.matrix ?? [])
        setPresetPreview(json.presetPreview ?? [])
        setSnapshots(json.snapshots ?? [])
      } catch (error) {
        if (!active) return
        setStatusMessage(
          error instanceof Error ? error.message : "Unable to load district permission policy."
        )
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const onTogglePermission = async (
    role: AppRole,
    permission: AppPermission,
    enabled: boolean
  ) => {
    setStatusMessage("")
    try {
      const response = await fetch("/api/auth/permissions/policy", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          permission,
          enabled,
        }),
      })
      const json = (await response.json()) as {
        matrix?: MatrixRow[]
        snapshots?: PolicySnapshot[]
        message?: string
      }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to update permission policy.")
      }
      setMatrix(json.matrix ?? [])
      setSnapshots(json.snapshots ?? [])
      setStatusMessage("Policy updated.")
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to update permission policy."
      )
    }
  }

  const onApplyPreset = async (preset: "strict" | "balanced" | "empowered") => {
    setIsApplyingPreset(true)
    setStatusMessage("")
    try {
      const response = await fetch("/api/auth/permissions/policy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ preset }),
      })
      const json = (await response.json()) as {
        matrix?: MatrixRow[]
        snapshots?: PolicySnapshot[]
        message?: string
      }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to apply policy preset.")
      }
      setMatrix(json.matrix ?? [])
      setSnapshots(json.snapshots ?? [])
      setStatusMessage(`Applied ${preset} policy preset.`)
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to apply policy preset."
      )
    } finally {
      setIsApplyingPreset(false)
    }
  }

  const onRollbackSnapshot = async (snapshotId: string) => {
    setIsRollingBack(true)
    setStatusMessage("")
    try {
      const response = await fetch("/api/auth/permissions/policy", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapshotId }),
      })
      const json = (await response.json()) as {
        matrix?: MatrixRow[]
        snapshots?: PolicySnapshot[]
        message?: string
      }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to rollback policy.")
      }
      setMatrix(json.matrix ?? [])
      setSnapshots(json.snapshots ?? [])
      setStatusMessage("Policy rollback applied.")
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to rollback policy.")
    } finally {
      setIsRollingBack(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <Settings2 className="size-4 text-teal-600" />
          District Permission Policy Editor
        </CardTitle>
        <CardDescription>
          Customize district-level RBAC without redeploying code.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-border/70 bg-muted/20 p-3">
          <p className="mb-2 text-sm font-medium">One-click District Presets</p>
          <div className="grid gap-3 md:grid-cols-3">
            {presetPreview.map((preset) => (
              <div key={preset.preset} className="rounded-md border border-border/70 bg-background p-3">
                <p className="text-sm font-semibold">{preset.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
                {preset.impacts.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {preset.impacts.slice(0, 4).map((impact) => (
                      <p key={`${preset.preset}-${impact.role}-${impact.permission}`} className="text-xs">
                        {ROLE_LABELS[impact.role]}: {impact.permission} {impact.enabled ? "on" : "off"}
                      </p>
                    ))}
                    {preset.impacts.length > 4 ? (
                      <p className="text-xs text-muted-foreground">
                        +{preset.impacts.length - 4} more changes
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Resets all overrides to defaults.
                  </p>
                )}
                <Button
                  className="mt-3 w-full"
                  variant="outline"
                  onClick={() => {
                    void onApplyPreset(preset.preset)
                  }}
                  disabled={isApplyingPreset || isRollingBack}
                >
                  Apply {preset.label}
                </Button>
              </div>
            ))}
          </div>
          {isApplyingPreset ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Applying preset...
            </p>
          ) : null}
        </div>

        <div className="rounded-md border border-border/70 bg-muted/20 p-3">
          <p className="mb-2 text-sm font-medium">Policy History & Rollback</p>
          {snapshots.length === 0 ? (
            <p className="text-xs text-muted-foreground">No snapshots yet.</p>
          ) : (
            <div className="space-y-2">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-background px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{snapshot.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(snapshot.createdAt).toLocaleString()} · {snapshot.overrideCount} overrides
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void onRollbackSnapshot(snapshot.id)
                    }}
                    disabled={isApplyingPreset || isRollingBack}
                  >
                    Rollback
                  </Button>
                </div>
              ))}
            </div>
          )}
          {isRollingBack ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Rolling back policy...
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {APP_ROLES.map((role) => (
            <Button
              key={role}
              type="button"
              variant={activeRole === role ? "default" : "outline"}
              onClick={() => setActiveRole(role)}
              className={
                activeRole === role
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-500/40 dark:text-teal-200"
              }
            >
              {ROLE_LABELS[role]}
            </Button>
          ))}
        </div>

        {statusMessage ? (
          <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm">
            {statusMessage}
          </p>
        ) : null}

        {isLoading ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading policy matrix...
          </p>
        ) : activeRow ? (
          <div className="space-y-2">
            {DISPLAY_PERMISSION_ORDER.map((permission) => {
              const entry = activeRow.permissions.find((item) => item.permission === permission)
              if (!entry) return null
              return (
                <label
                  key={`${activeRole}-${permission}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{permission}</p>
                    <p className="text-xs text-muted-foreground">
                      Default: {entry.defaultEnabled ? "enabled" : "disabled"} ·{" "}
                      {entry.isOverridden ? "Overridden" : "Using default"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="size-4 accent-teal-600"
                    checked={entry.enabled}
                    onChange={(event) => {
                      void onTogglePermission(activeRole, permission, event.target.checked)
                    }}
                  />
                </label>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No matrix data available.</p>
        )}
      </CardContent>
    </Card>
  )
}
