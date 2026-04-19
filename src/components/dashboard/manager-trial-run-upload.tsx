"use client"

import { FlaskConical, UploadCloud } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DELETE_UNDO_WINDOW_MS,
  REQUIRED_COLUMNS,
  csvCell,
  parseTrialRunCsv,
  type DeletedWindowHoursOption,
  type DensityMode,
  type SnapshotListResponse,
  type SnapshotSortOption,
  type SnapshotUndoState,
  type TrialRow,
  type TrialSnapshot,
} from "@/components/dashboard/manager-trial-run-upload.shared"
import {
  ActiveSnapshotsPanel,
  DeletedSnapshotsPanel,
} from "@/components/dashboard/manager-trial-run-upload.panels"
import {
  SnapshotNameSection,
  TrialDialogFooterActions,
  TrialUndoAndStatus,
  TrialUploadCsvSection,
  TrialRunDialogControls,
  TrialSummaryPreviewSection,
} from "@/components/dashboard/manager-trial-run-upload.sections"

export function ManagerTrialRunUpload() {
  const [isOpen, setIsOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [parseError, setParseError] = useState("")
  const [rows, setRows] = useState<TrialRow[]>([])
  const [missingColumns, setMissingColumns] = useState<string[]>([])
  const [invalidRows, setInvalidRows] = useState(0)
  const [snapshotName, setSnapshotName] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const [isSavingSnapshot, setIsSavingSnapshot] = useState(false)
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false)
  const [isLoadingDeletedSnapshots, setIsLoadingDeletedSnapshots] = useState(false)
  const [deletingSnapshotId, setDeletingSnapshotId] = useState<string | null>(null)
  const [hardDeletingSnapshotId, setHardDeletingSnapshotId] = useState<string | null>(null)
  const [restoringSnapshotId, setRestoringSnapshotId] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<TrialSnapshot[]>([])
  const [deletedSnapshots, setDeletedSnapshots] = useState<TrialSnapshot[]>([])
  const [undoState, setUndoState] = useState<SnapshotUndoState | null>(null)
  const [undoNowMs, setUndoNowMs] = useState<number>(0)
  const [searchDraft, setSearchDraft] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SnapshotSortOption>("created_desc")
  const [minGainDraft, setMinGainDraft] = useState("")
  const [minGain, setMinGain] = useState<number | null>(null)
  const [deletedWindowHours, setDeletedWindowHours] = useState<DeletedWindowHoursOption>(24)
  const [pageSize, setPageSize] = useState(6)
  const [activePage, setActivePage] = useState(1)
  const [deletedPage, setDeletedPage] = useState(1)
  const [activeTotalCount, setActiveTotalCount] = useState(0)
  const [deletedTotalCount, setDeletedTotalCount] = useState(0)
  const [activeHasMore, setActiveHasMore] = useState(false)
  const [deletedHasMore, setDeletedHasMore] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [densityMode, setDensityMode] = useState<DensityMode>("comfortable")
  const [selectedActiveIds, setSelectedActiveIds] = useState<string[]>([])
  const [selectedDeletedIds, setSelectedDeletedIds] = useState<string[]>([])
  const [isBulkApplying, setIsBulkApplying] = useState(false)

  const summary = useMemo(() => {
    if (!rows.length) {
      return {
        avgPre: 0,
        avgPost: 0,
        avgGain: 0,
        improvedCount: 0,
      }
    }

    const preTotal = rows.reduce((total, row) => total + row.preScore, 0)
    const postTotal = rows.reduce((total, row) => total + row.postScore, 0)
    const improvedCount = rows.filter((row) => row.postScore > row.preScore).length
    const avgPre = preTotal / rows.length
    const avgPost = postTotal / rows.length

    return {
      avgPre,
      avgPost,
      avgGain: avgPost - avgPre,
      improvedCount,
    }
  }, [rows])

  const activeTotalPages = Math.max(1, Math.ceil(activeTotalCount / pageSize))
  const deletedTotalPages = Math.max(1, Math.ceil(deletedTotalCount / pageSize))
  const previewRows = useMemo(() => rows.slice(0, 8), [rows])
  const allActiveSelected =
    snapshots.length > 0 && snapshots.every((snapshot) => selectedActiveIds.includes(snapshot.id))
  const allDeletedSelected =
    deletedSnapshots.length > 0 &&
    deletedSnapshots.every((snapshot) => selectedDeletedIds.includes(snapshot.id))

  async function onUploadFile(file: File | undefined) {
    if (!file) return

    setFileName(file.name)
    setParseError("")
    setStatusMessage("")
    const autoName = file.name.replace(/\.[^.]+$/, "").trim()
    if (!snapshotName) {
      setSnapshotName(autoName ? `${autoName} Snapshot` : "Trial Run Snapshot")
    }

    try {
      const raw = await file.text()
      const parsed = parseTrialRunCsv(raw)
      setRows(parsed.rows)
      setMissingColumns(parsed.missingColumns)
      setInvalidRows(parsed.invalidRows)
    } catch {
      setParseError("Could not read this CSV file. Please upload a UTF-8 .csv file.")
      setRows([])
      setMissingColumns([...REQUIRED_COLUMNS])
      setInvalidRows(0)
    }
  }

  const canCompute = rows.length > 0 && !missingColumns.length

  const fetchSnapshots = useCallback(
    async ({
      state,
      sinceHours,
      query,
      sort,
      limit,
      page,
      minGain,
      includeRows,
    }: {
      state: "active" | "deleted"
      sinceHours?: number
      query?: string
      sort?: SnapshotSortOption
      limit?: number
      page?: number
      minGain?: number | null
      includeRows?: boolean
    }): Promise<SnapshotListResponse> => {
      const params = new URLSearchParams()
      if (state === "deleted") {
        params.set("state", "deleted")
      }
      if (typeof sinceHours === "number") {
        params.set("sinceHours", String(sinceHours))
      }
      if (query?.trim()) {
        params.set("q", query.trim())
      }
      if (sort) {
        params.set("sort", sort)
      }
      if (typeof limit === "number") {
        params.set("limit", String(limit))
      }
      if (typeof page === "number") {
        params.set("page", String(page))
      }
      if (typeof minGain === "number" && Number.isFinite(minGain)) {
        params.set("minGain", String(minGain))
      }
      if (typeof includeRows === "boolean") {
        params.set("includeRows", includeRows ? "1" : "0")
      }
      const suffix = params.toString() ? `?${params.toString()}` : ""
      const response = await fetch(`/api/trial-runs/snapshots${suffix}`, { method: "GET" })
      const json = (await response.json()) as Partial<SnapshotListResponse> & { message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to load saved trial snapshots.")
      }
      return {
        snapshots: json.snapshots ?? [],
        totalCount: json.totalCount ?? 0,
        page: json.page ?? 1,
        pageSize: json.pageSize ?? limit ?? 12,
        hasMore: json.hasMore ?? false,
      }
    },
    []
  )

  const refreshSnapshots = useCallback(async () => {
    const [active, deleted] = await Promise.all([
      fetchSnapshots({
        state: "active",
        query: searchQuery,
        sort: sortBy,
        limit: pageSize,
        page: activePage,
        minGain,
        includeRows: true,
      }),
      fetchSnapshots({
        state: "deleted",
        sinceHours: deletedWindowHours > 0 ? deletedWindowHours : undefined,
        limit: pageSize,
        page: deletedPage,
        includeRows: false,
      }),
    ])
    setSnapshots(active.snapshots)
    setDeletedSnapshots(deleted.snapshots)
    setActiveTotalCount(active.totalCount)
    setDeletedTotalCount(deleted.totalCount)
    setActiveHasMore(active.hasMore)
    setDeletedHasMore(deleted.hasMore)
    const activeIds = new Set(active.snapshots.map((snapshot) => snapshot.id))
    const deletedIds = new Set(deleted.snapshots.map((snapshot) => snapshot.id))
    setSelectedActiveIds((current) => current.filter((id) => activeIds.has(id)))
    setSelectedDeletedIds((current) => current.filter((id) => deletedIds.has(id)))
    setLastRefreshedAt(Date.now())
  }, [
    activePage,
    deletedPage,
    deletedWindowHours,
    fetchSnapshots,
    minGain,
    pageSize,
    searchQuery,
    sortBy,
  ])

  useEffect(() => {
    if (!isOpen) return
    let active = true
    void (async () => {
      try {
        await refreshSnapshots()
        if (!active) return
      } catch (error) {
        if (!active) return
        setStatusMessage(
          error instanceof Error ? error.message : "Unable to load saved trial snapshots."
        )
      } finally {
        if (active) {
          setIsLoadingSnapshots(false)
          setIsLoadingDeletedSnapshots(false)
        }
      }
    })()
    return () => {
      active = false
    }
  }, [isOpen, refreshSnapshots])

  useEffect(() => {
    if (!undoState) return
    const timer = window.setInterval(() => {
      const now = Date.now()
      setUndoNowMs(now)
      if (now >= undoState.expiresAtMs) {
        setUndoState(null)
      }
    }, 1000)
    return () => {
      window.clearInterval(timer)
    }
  }, [undoState])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchQuery(searchDraft.trim())
    }, 300)
    return () => {
      window.clearTimeout(timer)
    }
  }, [searchDraft])

  useEffect(() => {
    if (!(isOpen && autoRefreshEnabled)) return
    const interval = window.setInterval(() => {
      void refreshSnapshots()
    }, 60_000)
    return () => {
      window.clearInterval(interval)
    }
  }, [autoRefreshEnabled, isOpen, refreshSnapshots])

  function onDownloadTemplate() {
    const template = [
      "studentId,studentName,className,preScore,postScore",
      "S-001,Alex Rivera,Grade10-A,62,78",
      "S-002,Sarah Rivera,Grade8-B,70,81",
      "S-003,Jordan Lee,Grade10-A,55,69",
    ].join("\n")
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "mathtriumph-trial-run-template.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  function onExportVisibleSummaryCsv() {
    if (!snapshots.length) {
      setStatusMessage("No visible snapshots to export.")
      return
    }
    const lines = [
      "name,createdAt,createdBy,rowCount,avgPre,avgPost,avgGain,improvedCount,fileName",
      ...snapshots.map((snapshot) =>
        [
          csvCell(snapshot.name),
          csvCell(new Date(snapshot.createdAt).toISOString()),
          csvCell(snapshot.createdByName),
          csvCell(snapshot.rowCount),
          csvCell(snapshot.avgPre.toFixed(2)),
          csvCell(snapshot.avgPost.toFixed(2)),
          csvCell(snapshot.avgGain.toFixed(2)),
          csvCell(snapshot.improvedCount),
          csvCell(snapshot.fileName ?? ""),
        ].join(",")
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "trial-snapshots-visible-summary.csv"
    link.click()
    URL.revokeObjectURL(url)
    setStatusMessage("Exported visible snapshot summary CSV.")
  }

  const onSaveSnapshot = useCallback(async () => {
    if (!canCompute) return

    setStatusMessage("")
    setIsSavingSnapshot(true)
    try {
      const response = await fetch("/api/trial-runs/snapshots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: snapshotName.trim() || "Trial Run Snapshot",
          fileName: fileName || undefined,
          invalidRows,
          rows,
        }),
      })
      const json = (await response.json()) as { ok?: boolean; message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to save trial snapshot.")
      }
      await refreshSnapshots()
      setStatusMessage("Trial snapshot saved.")
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to save trial snapshot.")
    } finally {
      setIsSavingSnapshot(false)
    }
  }, [canCompute, fileName, invalidRows, refreshSnapshots, rows, snapshotName])

  function onLoadSnapshot(snapshot: TrialSnapshot) {
    setRows(snapshot.rows)
    setInvalidRows(snapshot.invalidRows)
    setMissingColumns([])
    setParseError("")
    setFileName(snapshot.fileName ?? "")
    setSnapshotName(snapshot.name)
    setStatusMessage(`Loaded snapshot "${snapshot.name}".`)
  }

  function onExportSnapshot(snapshot: TrialSnapshot) {
    if (!snapshot.rows.length) {
      setStatusMessage("This snapshot has no exportable rows.")
      return
    }
    const csvLines = [
      "studentId,studentName,className,preScore,postScore",
      ...snapshot.rows.map((row) =>
        [
          csvCell(row.studentId),
          csvCell(row.studentName),
          csvCell(row.className),
          csvCell(row.preScore),
          csvCell(row.postScore),
        ].join(",")
      ),
    ]
    const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    const safeName = snapshot.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
    link.download = `${safeName || "trial-snapshot"}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setStatusMessage(`Exported "${snapshot.name}" to CSV.`)
  }

  async function onDeleteSnapshot(snapshot: TrialSnapshot) {
    const confirmed = window.confirm(
      `Move "${snapshot.name}" to Recently Deleted? You can restore it later.`
    )
    if (!confirmed) return

    setDeletingSnapshotId(snapshot.id)
    setStatusMessage("")
    const deletedAtIso = new Date().toISOString()
    setSnapshots((current) => current.filter((entry) => entry.id !== snapshot.id))
    setDeletedSnapshots((current) => [
      { ...snapshot, deletedAt: deletedAtIso },
      ...current.filter((entry) => entry.id !== snapshot.id),
    ])
    setActiveTotalCount((count) => Math.max(0, count - 1))
    setDeletedTotalCount((count) => count + 1)
    try {
      const response = await fetch(
        `/api/trial-runs/snapshots?snapshotId=${encodeURIComponent(snapshot.id)}`,
        { method: "DELETE" }
      )
      const json = (await response.json()) as { ok?: boolean; message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to delete snapshot.")
      }
      await refreshSnapshots()
      const now = Date.now()
      setUndoNowMs(now)
      setUndoState({
        snapshotId: snapshot.id,
        snapshotName: snapshot.name,
        expiresAtMs: now + DELETE_UNDO_WINDOW_MS,
      })
      setStatusMessage(`Moved snapshot "${snapshot.name}" to Recently Deleted. Undo available for 10 seconds.`)
    } catch (error) {
      await refreshSnapshots()
      setStatusMessage(error instanceof Error ? error.message : "Unable to delete snapshot.")
    } finally {
      setDeletingSnapshotId(null)
    }
  }

  async function onUndoDelete() {
    if (!undoState) return
    setRestoringSnapshotId(undoState.snapshotId)
    setStatusMessage("")
    try {
      const response = await fetch("/api/trial-runs/snapshots", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapshotId: undoState.snapshotId }),
      })
      const json = (await response.json()) as { ok?: boolean; message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to restore snapshot.")
      }
      await refreshSnapshots()
      setStatusMessage(`Restored snapshot "${undoState.snapshotName}".`)
      setUndoState(null)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to restore snapshot.")
    } finally {
      setRestoringSnapshotId(null)
    }
  }

  async function onRestoreDeletedSnapshot(snapshot: TrialSnapshot) {
    setRestoringSnapshotId(snapshot.id)
    setStatusMessage("")
    setDeletedSnapshots((current) => current.filter((entry) => entry.id !== snapshot.id))
    setDeletedTotalCount((count) => Math.max(0, count - 1))
    try {
      const response = await fetch("/api/trial-runs/snapshots", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ snapshotId: snapshot.id }),
      })
      const json = (await response.json()) as { ok?: boolean; message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to restore snapshot.")
      }
      await refreshSnapshots()
      setStatusMessage(`Restored snapshot "${snapshot.name}".`)
    } catch (error) {
      await refreshSnapshots()
      setStatusMessage(error instanceof Error ? error.message : "Unable to restore snapshot.")
    } finally {
      setRestoringSnapshotId(null)
    }
  }

  async function onPermanentlyDeleteSnapshot(snapshot: TrialSnapshot) {
    const confirmed = window.confirm(
      `Delete "${snapshot.name}" forever? This cannot be undone.`
    )
    if (!confirmed) return
    setHardDeletingSnapshotId(snapshot.id)
    setStatusMessage("")
    setDeletedSnapshots((current) => current.filter((entry) => entry.id !== snapshot.id))
    setDeletedTotalCount((count) => Math.max(0, count - 1))
    try {
      const response = await fetch(
        `/api/trial-runs/snapshots?snapshotId=${encodeURIComponent(snapshot.id)}&mode=hard`,
        { method: "DELETE" }
      )
      const json = (await response.json()) as { ok?: boolean; message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to permanently delete snapshot.")
      }
      await refreshSnapshots()
      setStatusMessage(`Permanently deleted snapshot "${snapshot.name}".`)
    } catch (error) {
      await refreshSnapshots()
      setStatusMessage(
        error instanceof Error ? error.message : "Unable to permanently delete snapshot."
      )
    } finally {
      setHardDeletingSnapshotId(null)
    }
  }

  const onManualRefresh = useCallback(async () => {
    setIsLoadingSnapshots(true)
    setIsLoadingDeletedSnapshots(true)
    setStatusMessage("")
    try {
      await refreshSnapshots()
      setStatusMessage("Snapshot lists refreshed.")
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to refresh snapshots.")
    } finally {
      setIsLoadingSnapshots(false)
      setIsLoadingDeletedSnapshots(false)
    }
  }, [refreshSnapshots])

  function onApplyMinGainFilter() {
    if (!minGainDraft.trim()) {
      setMinGain(null)
      setActivePage(1)
      return
    }
    const parsed = Number(minGainDraft)
    if (!Number.isFinite(parsed)) {
      setStatusMessage("Minimum gain must be a valid number.")
      return
    }
    setMinGain(parsed)
    setActivePage(1)
  }

  function onClearSnapshotFilters() {
    setSearchDraft("")
    setSearchQuery("")
    setSortBy("created_desc")
    setMinGainDraft("")
    setMinGain(null)
    setDeletedWindowHours(24)
    setPageSize(6)
    setActivePage(1)
    setDeletedPage(1)
  }

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      const isMetaSave = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s"
      const isMetaSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k"
      const isMetaRefresh = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "r"
      if (isMetaSave) {
        event.preventDefault()
        if (!isSavingSnapshot && canCompute) {
          void onSaveSnapshot()
        }
      }
      if (isMetaSearch) {
        event.preventDefault()
        const searchField = document.querySelector<HTMLInputElement>(
          'input[aria-label="Search snapshots by name or file"]'
        )
        searchField?.focus()
      }
      if (isMetaRefresh) {
        event.preventDefault()
        void onManualRefresh()
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault()
        setSelectedActiveIds(allActiveSelected ? [] : snapshots.map((snapshot) => snapshot.id))
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault()
        setSelectedDeletedIds(
          allDeletedSelected ? [] : deletedSnapshots.map((snapshot) => snapshot.id)
        )
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [
    allActiveSelected,
    allDeletedSelected,
    canCompute,
    deletedSnapshots,
    isOpen,
    isSavingSnapshot,
    onManualRefresh,
    onSaveSnapshot,
    snapshots,
  ])

  function toggleSelection(id: string, state: "active" | "deleted") {
    if (state === "active") {
      setSelectedActiveIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      )
      return
    }
    setSelectedDeletedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  async function onCopySnapshotName(snapshot: TrialSnapshot) {
    try {
      await navigator.clipboard.writeText(snapshot.name)
      setStatusMessage(`Copied snapshot name "${snapshot.name}".`)
    } catch {
      setStatusMessage("Unable to copy snapshot name.")
    }
  }

  function onLoadLatestSnapshot() {
    if (!snapshots.length) {
      setStatusMessage("No snapshot available to load.")
      return
    }
    onLoadSnapshot(snapshots[0])
  }

  function onExportDeletedSummaryCsv() {
    if (!deletedSnapshots.length) {
      setStatusMessage("No deleted snapshots to export.")
      return
    }
    const lines = [
      "name,deletedAt,createdBy,rowCount,avgGain",
      ...deletedSnapshots.map((snapshot) =>
        [
          csvCell(snapshot.name),
          csvCell(snapshot.deletedAt ?? ""),
          csvCell(snapshot.createdByName),
          csvCell(snapshot.rowCount),
          csvCell(snapshot.avgGain.toFixed(2)),
        ].join(",")
      ),
    ]
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "trial-snapshots-deleted-summary.csv"
    link.click()
    URL.revokeObjectURL(url)
    setStatusMessage("Exported deleted snapshot summary CSV.")
  }

  async function onBulkSoftDelete() {
    if (!selectedActiveIds.length) return
    setIsBulkApplying(true)
    setStatusMessage("")
    try {
      await Promise.all(
        selectedActiveIds.map((id) =>
          fetch(`/api/trial-runs/snapshots?snapshotId=${encodeURIComponent(id)}`, { method: "DELETE" })
        )
      )
      setSelectedActiveIds([])
      await refreshSnapshots()
      setStatusMessage("Moved selected snapshots to Recently Deleted.")
    } catch {
      setStatusMessage("Bulk delete failed.")
    } finally {
      setIsBulkApplying(false)
    }
  }

  async function onBulkRestore() {
    if (!selectedDeletedIds.length) return
    setIsBulkApplying(true)
    setStatusMessage("")
    try {
      await Promise.all(
        selectedDeletedIds.map((id) =>
          fetch("/api/trial-runs/snapshots", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ snapshotId: id }),
          })
        )
      )
      setSelectedDeletedIds([])
      await refreshSnapshots()
      setStatusMessage("Restored selected deleted snapshots.")
    } catch {
      setStatusMessage("Bulk restore failed.")
    } finally {
      setIsBulkApplying(false)
    }
  }

  async function onBulkHardDelete() {
    if (!selectedDeletedIds.length) return
    const confirmed = window.confirm("Delete selected snapshots forever? This cannot be undone.")
    if (!confirmed) return
    setIsBulkApplying(true)
    setStatusMessage("")
    try {
      await Promise.all(
        selectedDeletedIds.map((id) =>
          fetch(`/api/trial-runs/snapshots?snapshotId=${encodeURIComponent(id)}&mode=hard`, {
            method: "DELETE",
          })
        )
      )
      setSelectedDeletedIds([])
      await refreshSnapshots()
      setStatusMessage("Permanently deleted selected snapshots.")
    } catch {
      setStatusMessage("Bulk permanent delete failed.")
    } finally {
      setIsBulkApplying(false)
    }
  }

  return (
    <Card className="border-teal-200/70 bg-teal-50/30 dark:border-teal-500/40 dark:bg-teal-500/10">
      <CardHeader className="space-y-2">
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <FlaskConical className="size-4 text-teal-600" />
          Trial Run Upload
        </CardTitle>
        <CardDescription>
          Upload free pre/post assessment results to preview learning gains before full launch.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">CSV parser + validation</Badge>
          <Badge variant="outline">Learning-gain summary</Badge>
          <Badge variant="outline">Preview first 8 records</Badge>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (open) {
              setIsLoadingSnapshots(true)
              setIsLoadingDeletedSnapshots(true)
            }
            if (!open) {
              setStatusMessage("")
              setUndoState(null)
            }
          }}
        >
          <DialogTrigger
            render={
              <Button className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400" />
            }
          >
            <UploadCloud className="mr-1 size-4" />
            Upload Trial Student Data
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Trial Run Cohort Upload</DialogTitle>
              <DialogDescription>
                Required CSV columns: {REQUIRED_COLUMNS.join(", ")}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <TrialRunDialogControls
                showFilters={showFilters}
                densityMode={densityMode}
                searchDraft={searchDraft}
                sortBy={sortBy}
                pageSize={pageSize}
                minGainDraft={minGainDraft}
                deletedWindowHours={deletedWindowHours}
                searchInputRef={undefined}
                onToggleShowFilters={() => setShowFilters((value) => !value)}
                onToggleDensity={() =>
                  setDensityMode((mode) => (mode === "comfortable" ? "compact" : "comfortable"))
                }
                onLoadLatestSnapshot={onLoadLatestSnapshot}
                onSearchDraftChange={(value) => {
                  setSearchDraft(value)
                  setActivePage(1)
                }}
                onSortChange={(value) => {
                  setSortBy(value)
                  setActivePage(1)
                }}
                onPageSizeChange={(value) => {
                  setPageSize(value)
                  setActivePage(1)
                  setDeletedPage(1)
                }}
                onMinGainDraftChange={setMinGainDraft}
                onDeletedWindowChange={(value) => {
                  setDeletedWindowHours(value)
                  setDeletedPage(1)
                }}
                onApplyMinGainFilter={onApplyMinGainFilter}
                onClearSnapshotFilters={onClearSnapshotFilters}
              />

              <TrialUploadCsvSection
                fileName={fileName}
                parseError={parseError}
                missingColumns={missingColumns}
                invalidRows={invalidRows}
                onDownloadTemplate={onDownloadTemplate}
                onUploadFile={onUploadFile}
              />

              <SnapshotNameSection
                snapshotName={snapshotName}
                onSnapshotNameChange={setSnapshotName}
              />

              <TrialSummaryPreviewSection
                rows={rows}
                summary={summary}
                canCompute={canCompute}
                previewRows={previewRows}
              />

              <ActiveSnapshotsPanel
                snapshots={snapshots}
                activeTotalCount={activeTotalCount}
                isLoadingSnapshots={isLoadingSnapshots}
                lastRefreshedAt={lastRefreshedAt}
                autoRefreshEnabled={autoRefreshEnabled}
                allActiveSelected={allActiveSelected}
                selectedActiveIds={selectedActiveIds}
                isBulkApplying={isBulkApplying}
                densityMode={densityMode}
                deletingSnapshotId={deletingSnapshotId}
                hardDeletingSnapshotId={hardDeletingSnapshotId}
                restoringSnapshotId={restoringSnapshotId}
                activePage={activePage}
                activeTotalPages={activeTotalPages}
                activeHasMore={activeHasMore}
                onExportVisibleSummaryCsv={onExportVisibleSummaryCsv}
                onManualRefresh={onManualRefresh}
                onToggleAutoRefresh={() => setAutoRefreshEnabled((value) => !value)}
                onToggleSelectActivePage={() => {
                  setSelectedActiveIds(allActiveSelected ? [] : snapshots.map((s) => s.id))
                }}
                onBulkSoftDelete={onBulkSoftDelete}
                onToggleSelection={(id) => toggleSelection(id, "active")}
                onLoadSnapshot={onLoadSnapshot}
                onExportSnapshot={onExportSnapshot}
                onCopySnapshotName={onCopySnapshotName}
                onDeleteSnapshot={onDeleteSnapshot}
                onClearSnapshotFilters={onClearSnapshotFilters}
                onPrevPage={() => setActivePage((value) => Math.max(1, value - 1))}
                onNextPage={() => setActivePage((value) => value + 1)}
              />

              <DeletedSnapshotsPanel
                deletedSnapshots={deletedSnapshots}
                deletedTotalCount={deletedTotalCount}
                isLoadingDeletedSnapshots={isLoadingDeletedSnapshots}
                allDeletedSelected={allDeletedSelected}
                selectedDeletedIds={selectedDeletedIds}
                isBulkApplying={isBulkApplying}
                densityMode={densityMode}
                deletingSnapshotId={deletingSnapshotId}
                hardDeletingSnapshotId={hardDeletingSnapshotId}
                restoringSnapshotId={restoringSnapshotId}
                deletedPage={deletedPage}
                deletedTotalPages={deletedTotalPages}
                deletedHasMore={deletedHasMore}
                onToggleSelectDeletedPage={() => {
                  setSelectedDeletedIds(
                    allDeletedSelected ? [] : deletedSnapshots.map((snapshot) => snapshot.id)
                  )
                }}
                onBulkRestore={onBulkRestore}
                onBulkHardDelete={onBulkHardDelete}
                onExportDeletedSummaryCsv={onExportDeletedSummaryCsv}
                onToggleSelection={(id) => toggleSelection(id, "deleted")}
                onRestoreDeletedSnapshot={onRestoreDeletedSnapshot}
                onPermanentlyDeleteSnapshot={onPermanentlyDeleteSnapshot}
                onSetDeletedWindowAll={() => {
                  setDeletedWindowHours(0)
                  setDeletedPage(1)
                }}
                onManualRefresh={onManualRefresh}
                onPrevPage={() => setDeletedPage((value) => Math.max(1, value - 1))}
                onNextPage={() => setDeletedPage((value) => value + 1)}
              />

              <TrialUndoAndStatus
                undoState={undoState}
                undoNowMs={undoNowMs}
                restoringSnapshotId={restoringSnapshotId}
                statusMessage={statusMessage}
                onUndoDelete={onUndoDelete}
              />
            </div>

            <TrialDialogFooterActions
              canCompute={canCompute}
              isSavingSnapshot={isSavingSnapshot}
              onReset={() => {
                setRows([])
                setFileName("")
                setSnapshotName("")
                setMissingColumns([])
                setInvalidRows(0)
                setParseError("")
                setStatusMessage("")
                setUndoState(null)
              }}
              onSaveSnapshot={onSaveSnapshot}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

