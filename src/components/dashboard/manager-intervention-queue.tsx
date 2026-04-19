"use client"

import { CheckCircle2, ClipboardList, Download } from "lucide-react"
import { useMemo, useState } from "react"

import {
  getInterventionQueue,
  updateInterventionQueueNotes,
  updateInterventionQueueStatus,
  updateInterventionQueueStatuses,
} from "@/lib/intervention-queue"
import { escapeCsvCell } from "@/lib/security/csv"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ManagerInterventionQueue() {
  const [refreshTick, setRefreshTick] = useState(0)
  const [filter, setFilter] = useState<"all" | "assigned" | "completed">("all")
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({})
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const queue = useMemo(() => {
    void refreshTick
    return getInterventionQueue().slice(0, 50)
  }, [refreshTick])

  const assignedCount = queue.filter((item) => item.status === "assigned").length
  const completedCount = queue.filter((item) => item.status === "completed").length
  const visibleQueue = useMemo(() => {
    const filteredByStatus =
      filter === "all" ? queue : queue.filter((item) => item.status === filter)

    return filteredByStatus.filter((item) => {
      const created = new Date(item.createdAt)
      if (Number.isNaN(created.getTime())) return false
      if (startDate) {
        const start = new Date(`${startDate}T00:00:00`)
        if (created < start) return false
      }
      if (endDate) {
        const end = new Date(`${endDate}T23:59:59`)
        if (created > end) return false
      }
      return true
    })
  }, [endDate, filter, queue, startDate])

  function onMarkCompleted(id: string) {
    updateInterventionQueueStatus(id, "completed")
    setRefreshTick((prev) => prev + 1)
  }

  function onBulkMarkCompleted() {
    const ids = Object.entries(selectedIds)
      .filter(([id, selected]) => selected && selectableVisibleIds.includes(id))
      .map(([id]) => id)
    if (!ids.length) return
    updateInterventionQueueStatuses(ids, "completed")
    setSelectedIds({})
    setRefreshTick((prev) => prev + 1)
  }

  function onSaveNotes(id: string) {
    const notes = noteDrafts[id] ?? ""
    updateInterventionQueueNotes(id, notes)
    setRefreshTick((prev) => prev + 1)
  }

  function onExportCsv() {
    const rows = visibleQueue.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt ?? "",
      completedAt: item.completedAt ?? "",
      reportingCategory: item.reportingCategory,
      misconceptionTag: item.misconceptionTag,
      errorType: item.errorType,
      status: item.status,
      teacherNotes: item.teacherNotes ?? "",
    }))
    if (!rows.length) return

    const headers = Object.keys(rows[0])
    const csvLines = [
      headers.map((header) => escapeCsvCell(header)).join(","),
      ...rows.map((row) =>
        headers
          .map((header) => escapeCsvCell(row[header as keyof typeof row]))
          .join(",")
      ),
    ]
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `intervention-queue-${filter}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const selectableVisibleIds = visibleQueue
    .filter((item) => item.status === "assigned")
    .map((item) => item.id)
  const selectedCount = Object.entries(selectedIds).filter(
    ([id, selected]) => selected && selectableVisibleIds.includes(id)
  ).length
  const allSelectableChecked =
    selectableVisibleIds.length > 0 &&
    selectableVisibleIds.every((id) => selectedIds[id])

  return (
    <Card className="premium-surface">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <ClipboardList className="size-4 text-teal-600" />
          Intervention Queue
        </CardTitle>
        <CardDescription>
          Persistent teacher action queue for misconception-based interventions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{assignedCount} assigned</Badge>
            <Badge variant="outline">{completedCount} completed</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === "assigned" ? "default" : "outline"}
              onClick={() => setFilter("assigned")}
            >
              Assigned
            </Button>
            <Button
              size="sm"
              variant={filter === "completed" ? "default" : "outline"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
            <Button size="sm" variant="outline" onClick={onExportCsv} disabled={!visibleQueue.length}>
              <Download className="mr-1 size-4" />
              Export CSV
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded-md border border-border/70 bg-muted/20 p-2">
          <label className="space-y-1 text-xs text-muted-foreground">
            Start date
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-8 w-[11rem]"
            />
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            End date
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-8 w-[11rem]"
            />
          </label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setStartDate("")
              setEndDate("")
            }}
          >
            Clear Dates
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border/70 px-2 py-1">
              <Checkbox
                checked={allSelectableChecked}
                onCheckedChange={(checked) => {
                  const isChecked = checked === true
                  setSelectedIds((prev) => {
                    const next = { ...prev }
                    selectableVisibleIds.forEach((id) => {
                      next[id] = isChecked
                    })
                    return next
                  })
                }}
              />
              <span className="text-xs text-muted-foreground">Select visible assigned</span>
            </div>
            <Button
              size="sm"
              onClick={onBulkMarkCompleted}
              disabled={selectedCount === 0}
            >
              <CheckCircle2 className="mr-1 size-4" />
              Bulk Complete ({selectedCount})
            </Button>
          </div>
        </div>
        {visibleQueue.length ? (
          visibleQueue.map((item) => (
            <div
              key={item.id}
              className="rounded-md border border-border/70 p-2 text-sm"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {item.status === "assigned" ? (
                  <Checkbox
                    checked={selectedIds[item.id] === true}
                    onCheckedChange={(checked) =>
                      setSelectedIds((prev) => ({
                        ...prev,
                        [item.id]: checked === true,
                      }))
                    }
                  />
                ) : null}
                <Badge variant="outline">{item.reportingCategory}</Badge>
                <Badge variant="outline">{item.misconceptionTag}</Badge>
                <Badge variant="outline">{item.errorType}</Badge>
                <Badge
                  className={
                    item.status === "completed"
                      ? "bg-emerald-600 text-white dark:bg-emerald-500"
                      : "bg-sky-600 text-white dark:bg-sky-500"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Added {formatDate(item.createdAt)}
                </p>
                {item.status === "assigned" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkCompleted(item.id)}
                  >
                    <CheckCircle2 className="mr-1 size-4" />
                    Mark Completed
                  </Button>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <textarea
                  value={noteDrafts[item.id] ?? item.teacherNotes ?? ""}
                  onChange={(event) =>
                    setNoteDrafts((prev) => ({
                      ...prev,
                      [item.id]: event.target.value,
                    }))
                  }
                  rows={2}
                  className="min-w-[16rem] flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
                  placeholder="Teacher notes for audit (grouping, strategy used, follow-up evidence)"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSaveNotes(item.id)}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            No interventions assigned yet. Use the misconception heatmap to assign.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
