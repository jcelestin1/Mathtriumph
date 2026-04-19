"use client"

import { FileCheck2, LockKeyhole, ShieldCheck, UserCheck } from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FerpaStatusResponse = {
  generatedAt: string
  districtId: string
  checks: Array<{
    key: string
    label: string
    status: "pass" | "warn" | "fail"
    detail: string
  }>
  aiPolicy: {
    policyVersion: string
    architecture: string
    trainingPolicy: string
    inferenceRetention: string
    highImpactDecisionPolicy: string
  }
  modelCardPath: string
}

function statusClass(status: "pass" | "warn" | "fail") {
  if (status === "pass") {
    return "border-emerald-300 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300"
  }
  if (status === "warn") {
    return "border-amber-300 text-amber-700 dark:border-amber-500/40 dark:text-amber-300"
  }
  return "border-rose-300 text-rose-700 dark:border-rose-500/40 dark:text-rose-300"
}

export function ManagerPrivacyFerpaStatus() {
  const [status, setStatus] = useState<FerpaStatusResponse | null>(null)

  useEffect(() => {
    void fetch("/api/privacy/ferpa-status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setStatus(json as FerpaStatusResponse)
      })
      .catch(() => {})
  }, [])

  return (
    <Card className="premium-surface">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <ShieldCheck className="size-4 text-teal-600" />
          Privacy & FERPA
        </CardTitle>
        <CardDescription>
          Compliance posture for AI dual-stream diagnostics and EOC score prediction.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {status ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">District: {status.districtId}</Badge>
              <Badge variant="outline">Policy {status.aiPolicy.policyVersion}</Badge>
              <Badge variant="outline">Architecture: {status.aiPolicy.architecture}</Badge>
            </div>
            <div className="space-y-2">
              {status.checks.map((check) => (
                <div
                  key={check.key}
                  className="rounded-md border border-border/70 p-2"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className={statusClass(check.status)}>
                      {check.status.toUpperCase()}
                    </Badge>
                    <p className="font-medium">{check.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{check.detail}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-border/70 p-2 text-xs">
                <p className="inline-flex items-center gap-1 font-medium">
                  <LockKeyhole className="size-3.5 text-teal-600" />
                  Training policy
                </p>
                <p className="text-muted-foreground">{status.aiPolicy.trainingPolicy}</p>
              </div>
              <div className="rounded-md border border-border/70 p-2 text-xs">
                <p className="inline-flex items-center gap-1 font-medium">
                  <UserCheck className="size-3.5 text-teal-600" />
                  High-impact decision policy
                </p>
                <p className="text-muted-foreground">
                  {status.aiPolicy.highImpactDecisionPolicy}
                </p>
              </div>
              <div className="rounded-md border border-border/70 p-2 text-xs">
                <p className="inline-flex items-center gap-1 font-medium">
                  <FileCheck2 className="size-3.5 text-teal-600" />
                  Model card
                </p>
                <p className="text-muted-foreground">{status.modelCardPath}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="rounded-md border border-dashed border-border p-3 text-muted-foreground">
            Loading compliance status...
          </p>
        )}
      </CardContent>
    </Card>
  )
}
