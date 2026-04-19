"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, ShieldCheck, UserCog2 } from "lucide-react"

import { APP_ROLES, ROLE_LABELS, type AppRole } from "@/lib/rbac"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type DelegationRecord = {
  id: string
  targetRole: AppRole
  reason: string | null
  startsAt: string
  endsAt: string
  grantee: {
    email: string
    fullName: string
  }
}

const delegationRoleOptions: AppRole[] = [
  "school_admin",
  "tech_admin",
  "interventionist",
  "instructional_coach",
  "data_analyst",
  "teacher",
  "support_admin",
]

export function DelegationManager() {
  const [delegations, setDelegations] = useState<DelegationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [form, setForm] = useState({
    granteeEmail: "",
    targetRole: "school_admin" as AppRole,
    reason: "",
    durationHours: "24",
  })

  const availableRoleOptions = useMemo(
    () => delegationRoleOptions.filter((role) => APP_ROLES.includes(role)),
    []
  )

  const fetchDelegations = async () => {
    try {
      const response = await fetch("/api/auth/delegations", { method: "GET" })
      const json = (await response.json()) as { delegations?: DelegationRecord[]; message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to load delegations.")
      }
      setDelegations(json.delegations ?? [])
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to load delegations.")
    }
  }

  const loadDelegations = async () => {
    setIsLoading(true)
    setStatusMessage("")
    await fetchDelegations()
    setIsLoading(false)
  }

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const response = await fetch("/api/auth/delegations", { method: "GET" })
        const json = (await response.json()) as { delegations?: DelegationRecord[]; message?: string }
        if (!response.ok) {
          throw new Error(json.message ?? "Unable to load delegations.")
        }
        if (!active) return
        setDelegations(json.delegations ?? [])
      } catch (error) {
        if (!active) return
        setStatusMessage(error instanceof Error ? error.message : "Unable to load delegations.")
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

  const onCreateDelegation = async () => {
    setIsSaving(true)
    setStatusMessage("")
    try {
      const response = await fetch("/api/auth/delegations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          granteeEmail: form.granteeEmail,
          targetRole: form.targetRole,
          reason: form.reason || undefined,
          durationHours: Number(form.durationHours),
        }),
      })
      const json = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to create delegation.")
      }
      setForm((prev) => ({ ...prev, granteeEmail: "", reason: "", durationHours: "24" }))
      setStatusMessage("Delegation granted successfully.")
      await loadDelegations()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to create delegation.")
    } finally {
      setIsSaving(false)
    }
  }

  const onRevoke = async (delegationId: string) => {
    setStatusMessage("")
    try {
      const response = await fetch("/api/auth/delegations", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ delegationId }),
      })
      const json = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to revoke delegation.")
      }
      setStatusMessage("Delegation revoked.")
      await loadDelegations()
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to revoke delegation.")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <UserCog2 className="size-4 text-teal-600" />
          Temporary Delegation Controls
        </CardTitle>
        <CardDescription>
          Grant time-bounded elevated roles with audit logging and clean revocation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="delegation-email">Grantee Email</Label>
            <Input
              id="delegation-email"
              placeholder="coach@mathtriumph.local"
              value={form.granteeEmail}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, granteeEmail: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delegation-role">Target Role</Label>
            <select
              id="delegation-role"
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              value={form.targetRole}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  targetRole: event.target.value as AppRole,
                }))
              }
            >
              {availableRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_200px]">
          <div className="space-y-1.5">
            <Label htmlFor="delegation-reason">Reason (optional)</Label>
            <Input
              id="delegation-reason"
              placeholder="Coverage during benchmark week"
              value={form.reason}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, reason: event.target.value }))
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="delegation-hours">Duration (hours)</Label>
            <Input
              id="delegation-hours"
              type="number"
              min={1}
              max={168}
              value={form.durationHours}
              onChange={(event) =>
                setForm((previous) => ({ ...previous, durationHours: event.target.value }))
              }
            />
          </div>
        </div>

        <Button
          onClick={() => {
            void onCreateDelegation()
          }}
          disabled={isSaving}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-1 size-4 animate-spin" />
              Granting...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-1 size-4" />
              Grant Temporary Elevation
            </>
          )}
        </Button>

        {statusMessage ? (
          <p className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm">
            {statusMessage}
          </p>
        ) : null}

        <div className="space-y-2">
          <p className="text-sm font-medium">Active Delegations</p>
          {isLoading ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading delegation records...
            </p>
          ) : delegations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active delegations. Grants appear here once created.
            </p>
          ) : (
            <div className="space-y-2">
              {delegations.map((delegation) => (
                <div
                  key={delegation.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 p-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {delegation.grantee.fullName} ({delegation.grantee.email})
                    </p>
                    <p className="text-muted-foreground">
                      {ROLE_LABELS[delegation.targetRole]} until{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(delegation.endsAt))}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void onRevoke(delegation.id)
                    }}
                  >
                    Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
