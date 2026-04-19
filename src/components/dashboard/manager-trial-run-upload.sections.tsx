"use client"

import type { RefObject } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  STATUS_REGION_ID,
  DELETED_WINDOW_OPTIONS,
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
  type SnapshotUndoState,
  type DeletedWindowHoursOption,
  type DensityMode,
  type SnapshotSortOption,
  type TrialRow,
} from "@/components/dashboard/manager-trial-run-upload.shared"
import { Badge } from "@/components/ui/badge"
import { DialogFooter } from "@/components/ui/dialog"
import { Download, FileUp, Loader2 } from "lucide-react"

export type TrialSummary = {
  avgPre: number
  avgPost: number
  avgGain: number
  improvedCount: number
}

type TrialUploadCsvSectionProps = {
  fileName: string
  parseError: string
  missingColumns: string[]
  invalidRows: number
  onDownloadTemplate: () => void
  onUploadFile: (file: File | undefined) => Promise<void>
}

export function TrialUploadCsvSection(props: TrialUploadCsvSectionProps) {
  const {
    fileName,
    parseError,
    missingColumns,
    invalidRows,
    onDownloadTemplate,
    onUploadFile,
  } = props
  return (
    <div className="rounded-md border border-border/70 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="block text-sm font-medium" htmlFor="trial-run-file">
          Trial run CSV file
        </label>
        <Button variant="outline" size="sm" onClick={onDownloadTemplate}>
          <Download className="mr-1 size-4" />
          Download Template
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id="trial-run-file"
          type="file"
          accept=".csv,text/csv"
          aria-describedby={STATUS_REGION_ID}
          onChange={(event) => {
            const file = event.target.files?.[0]
            void onUploadFile(file)
          }}
        />
        {fileName ? (
          <Badge variant="outline">
            <FileUp className="mr-1 size-3" />
            {fileName}
          </Badge>
        ) : null}
      </div>
      {parseError ? <p className="mt-2 text-sm text-destructive">{parseError}</p> : null}
      {missingColumns.length ? (
        <p className="mt-2 text-sm text-destructive">
          Missing required columns: {missingColumns.join(", ")}
        </p>
      ) : null}
      {invalidRows > 0 ? (
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {invalidRows} row(s) skipped due to invalid or incomplete values.
        </p>
      ) : null}
    </div>
  )
}

type SnapshotNameSectionProps = {
  snapshotName: string
  onSnapshotNameChange: (value: string) => void
}

export function SnapshotNameSection(props: SnapshotNameSectionProps) {
  const { snapshotName, onSnapshotNameChange } = props
  return (
    <div className="rounded-md border border-border/70 p-3">
      <label className="mb-2 block text-sm font-medium" htmlFor="snapshot-name">
        Snapshot name
      </label>
      <Input
        id="snapshot-name"
        value={snapshotName}
        onChange={(event) => onSnapshotNameChange(event.target.value)}
        placeholder="Spring district pilot snapshot"
        maxLength={100}
        aria-describedby={STATUS_REGION_ID}
      />
    </div>
  )
}

type TrialRunDialogControlsProps = {
  showFilters: boolean
  densityMode: DensityMode
  searchDraft: string
  sortBy: SnapshotSortOption
  pageSize: number
  minGainDraft: string
  deletedWindowHours: DeletedWindowHoursOption
  searchInputRef?: RefObject<HTMLInputElement | null>
  onToggleShowFilters: () => void
  onToggleDensity: () => void
  onLoadLatestSnapshot: () => void
  onSearchDraftChange: (value: string) => void
  onSortChange: (value: SnapshotSortOption) => void
  onPageSizeChange: (value: number) => void
  onMinGainDraftChange: (value: string) => void
  onDeletedWindowChange: (value: DeletedWindowHoursOption) => void
  onApplyMinGainFilter: () => void
  onClearSnapshotFilters: () => void
}

export function TrialRunDialogControls(props: TrialRunDialogControlsProps) {
  const {
    showFilters,
    densityMode,
    searchDraft,
    sortBy,
    pageSize,
    minGainDraft,
    deletedWindowHours,
    searchInputRef,
    onToggleShowFilters,
    onToggleDensity,
    onLoadLatestSnapshot,
    onSearchDraftChange,
    onSortChange,
    onPageSizeChange,
    onMinGainDraftChange,
    onDeletedWindowChange,
    onApplyMinGainFilter,
    onClearSnapshotFilters,
  } = props
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-muted/20 p-3">
        <Button variant="outline" size="sm" onClick={onToggleShowFilters}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
        <Button variant="outline" size="sm" onClick={onToggleDensity}>
          Density: {densityMode === "comfortable" ? "Comfortable" : "Compact"}
        </Button>
        <Button variant="outline" size="sm" onClick={onLoadLatestSnapshot}>
          Load Latest Snapshot
        </Button>
      </div>

      {showFilters ? (
        <div className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Search snapshots
            </label>
            <Input
              ref={searchInputRef}
              value={searchDraft}
              onChange={(event) => onSearchDraftChange(event.target.value)}
              placeholder="Search by name or file..."
              aria-label="Search snapshots by name or file"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Sort</label>
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as SnapshotSortOption)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Sort snapshot results"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Rows shown</label>
            <select
              value={String(pageSize)}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Select number of snapshot rows shown"
            >
              {PAGE_SIZE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {showFilters ? (
        <div className="grid gap-3 rounded-md border border-border/70 p-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Min gain filter
            </label>
            <Input
              value={minGainDraft}
              onChange={(event) => onMinGainDraftChange(event.target.value)}
              placeholder="e.g. 5"
              aria-label="Minimum gain filter"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Deleted window
            </label>
            <select
              value={String(deletedWindowHours)}
              onChange={(event) => onDeletedWindowChange(Number(event.target.value) as DeletedWindowHoursOption)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-label="Select deleted snapshots time window"
            >
              {DELETED_WINDOW_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={onApplyMinGainFilter}>
              Apply Gain Filter
            </Button>
          </div>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={onClearSnapshotFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}

type TrialSummaryPreviewSectionProps = {
  rows: TrialRow[]
  summary: TrialSummary
  canCompute: boolean
  previewRows: TrialRow[]
}

export function TrialSummaryPreviewSection(props: TrialSummaryPreviewSectionProps) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Students Parsed</CardDescription>
            <CardTitle className="text-2xl">{props.rows.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Pre-Score</CardDescription>
            <CardTitle className="text-2xl">{props.summary.avgPre.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Post-Score</CardDescription>
            <CardTitle className="text-2xl">{props.summary.avgPost.toFixed(1)}%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Learning Gain</CardDescription>
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">
              +{props.summary.avgGain.toFixed(1)} pts
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {props.canCompute ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parsed Trial Preview</CardTitle>
            <CardDescription>
              {props.summary.improvedCount}/{props.rows.length} students improved in post-assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <caption className="sr-only">Preview of up to eight parsed student trial run rows.</caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Pre</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Gain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.previewRows.map((row) => {
                  const gain = row.postScore - row.preScore
                  return (
                    <TableRow key={`${row.studentId}-${row.className}`}>
                      <TableCell className="font-medium">{row.studentId}</TableCell>
                      <TableCell>{row.studentName}</TableCell>
                      <TableCell>{row.className}</TableCell>
                      <TableCell>{row.preScore}%</TableCell>
                      <TableCell>{row.postScore}%</TableCell>
                      <TableCell
                        className={
                          gain >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        }
                      >
                        {gain >= 0 ? "+" : ""}
                        {gain.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
          Upload a valid CSV to preview cohort data and learning-gain calculations.
        </p>
      )}
    </>
  )
}

type TrialUndoAndStatusProps = {
  undoState: SnapshotUndoState | null
  undoNowMs: number
  restoringSnapshotId: string | null
  statusMessage: string
  onUndoDelete: () => Promise<void>
}

export function TrialUndoAndStatus(props: TrialUndoAndStatusProps) {
  const { undoState, undoNowMs, restoringSnapshotId, statusMessage, onUndoDelete } = props
  return (
    <>
      {undoState ? (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-600/40 dark:bg-amber-900/20 dark:text-amber-100"
          role="status"
          aria-live="assertive"
        >
          <p>
            {undoState.snapshotName} deleted. Undo in{" "}
            {Math.max(0, Math.ceil((undoState.expiresAtMs - undoNowMs) / 1000))}s.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void onUndoDelete()
            }}
            disabled={Boolean(restoringSnapshotId)}
          >
            {restoringSnapshotId === undoState.snapshotId ? (
              <>
                <Loader2 className="mr-1 size-3.5 animate-spin" />
                Restoring...
              </>
            ) : (
              "Undo Delete"
            )}
          </Button>
        </div>
      ) : null}

      {statusMessage ? (
        <p
          id={STATUS_REGION_ID}
          className="rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-sm"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
    </>
  )
}

type TrialDialogFooterActionsProps = {
  canCompute: boolean
  isSavingSnapshot: boolean
  onReset: () => void
  onSaveSnapshot: () => Promise<void>
}

export function TrialDialogFooterActions(props: TrialDialogFooterActionsProps) {
  const { canCompute, isSavingSnapshot, onReset, onSaveSnapshot } = props
  return (
    <DialogFooter showCloseButton>
      <Button variant="outline" onClick={onReset}>
        Reset
      </Button>
      <Button
        onClick={() => {
          void onSaveSnapshot()
        }}
        disabled={!canCompute || isSavingSnapshot}
        className="bg-teal-600 text-white hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
      >
        {isSavingSnapshot ? (
          <>
            <Loader2 className="mr-1 size-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Trial Snapshot"
        )}
      </Button>
    </DialogFooter>
  )
}
