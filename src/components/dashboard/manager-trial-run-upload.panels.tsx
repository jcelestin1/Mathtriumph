"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SHORTCUTS_HINT_ID,
  formatRelativeTime,
  type DensityMode,
  type TrialSnapshot,
} from "@/components/dashboard/manager-trial-run-upload.shared"

type ActiveSnapshotsPanelProps = {
  snapshots: TrialSnapshot[]
  activeTotalCount: number
  isLoadingSnapshots: boolean
  lastRefreshedAt: number | null
  autoRefreshEnabled: boolean
  allActiveSelected: boolean
  selectedActiveIds: string[]
  isBulkApplying: boolean
  densityMode: DensityMode
  deletingSnapshotId: string | null
  hardDeletingSnapshotId: string | null
  restoringSnapshotId: string | null
  activePage: number
  activeTotalPages: number
  activeHasMore: boolean
  onExportVisibleSummaryCsv: () => void
  onManualRefresh: () => Promise<void>
  onToggleAutoRefresh: () => void
  onToggleSelectActivePage: () => void
  onBulkSoftDelete: () => Promise<void>
  onToggleSelection: (id: string) => void
  onLoadSnapshot: (snapshot: TrialSnapshot) => void
  onExportSnapshot: (snapshot: TrialSnapshot) => void
  onCopySnapshotName: (snapshot: TrialSnapshot) => Promise<void>
  onDeleteSnapshot: (snapshot: TrialSnapshot) => Promise<void>
  onClearSnapshotFilters: () => void
  onPrevPage: () => void
  onNextPage: () => void
}

export function ActiveSnapshotsPanel(props: ActiveSnapshotsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Saved Snapshots</CardTitle>
        <CardDescription>
          Reload previously saved trial runs for quick comparisons. Showing {props.snapshots.length} of{" "}
          {props.activeTotalCount}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2" aria-busy={props.isLoadingSnapshots}>
        <div
          id={SHORTCUTS_HINT_ID}
          className="rounded-md border border-border/70 bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
        >
          Shortcuts: Ctrl/Cmd+S save, Ctrl/Cmd+K focus search, Ctrl/Cmd+R refresh.
          {props.lastRefreshedAt
            ? ` Last refreshed: ${new Date(props.lastRefreshedAt).toLocaleTimeString()}.`
            : ""}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={props.onExportVisibleSummaryCsv}
          >
            Export Visible Summary
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              void props.onManualRefresh()
            }}
          >
            Refresh
          </Button>
          <Button
            variant={props.autoRefreshEnabled ? "default" : "outline"}
            size="sm"
            className="w-full sm:w-auto"
            onClick={props.onToggleAutoRefresh}
            aria-pressed={props.autoRefreshEnabled}
            aria-describedby={SHORTCUTS_HINT_ID}
          >
            Auto Refresh {props.autoRefreshEnabled ? "On" : "Off"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={props.onToggleSelectActivePage}
          >
            {props.allActiveSelected ? "Unselect Active" : "Select Active Page"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              void props.onBulkSoftDelete()
            }}
            disabled={!props.selectedActiveIds.length || props.isBulkApplying}
          >
            Move Selected to Deleted ({props.selectedActiveIds.length})
          </Button>
        </div>
        {props.isLoadingSnapshots ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            <Loader2 className="size-4 animate-spin" />
            Loading snapshots...
          </p>
        ) : props.snapshots.length ? (
          props.snapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 px-3 ${
                props.densityMode === "compact" ? "py-1.5" : "py-2"
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={props.selectedActiveIds.includes(snapshot.id)}
                  onChange={() => props.onToggleSelection(snapshot.id)}
                  className="mt-1 size-4 accent-teal-600"
                  aria-label={`Select active snapshot ${snapshot.name}`}
                />
                <div>
                  <p className="text-sm font-medium">{snapshot.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(snapshot.createdAt).toLocaleString()} · {snapshot.rowCount} rows · by{" "}
                    {snapshot.createdByName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Gain: {snapshot.avgGain >= 0 ? "+" : ""}
                    {snapshot.avgGain.toFixed(1)} pts · Improved {snapshot.improvedCount}/{snapshot.rowCount} ·{" "}
                    {formatRelativeTime(snapshot.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => props.onLoadSnapshot(snapshot)}
                  disabled={Boolean(props.deletingSnapshotId) || Boolean(props.hardDeletingSnapshotId)}
                >
                  Load
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => props.onExportSnapshot(snapshot)}
                  disabled={Boolean(props.deletingSnapshotId) || Boolean(props.hardDeletingSnapshotId)}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void props.onCopySnapshotName(snapshot)
                  }}
                  disabled={Boolean(props.deletingSnapshotId) || Boolean(props.hardDeletingSnapshotId)}
                >
                  Copy Name
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void props.onDeleteSnapshot(snapshot)
                  }}
                  disabled={
                    Boolean(props.deletingSnapshotId) ||
                    Boolean(props.restoringSnapshotId) ||
                    Boolean(props.hardDeletingSnapshotId)
                  }
                >
                  {props.deletingSnapshotId === snapshot.id ? (
                    <>
                      <Loader2 className="mr-1 size-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border p-3">
            <p className="text-sm text-muted-foreground">No saved snapshots match this view.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={props.onClearSnapshotFilters}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void props.onManualRefresh()
                }}
                className="w-full sm:w-auto"
              >
                Refresh List
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {props.activePage} of {props.activeTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={props.onPrevPage}
              disabled={props.activePage <= 1 || props.isLoadingSnapshots}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={props.onNextPage}
              disabled={!props.activeHasMore || props.isLoadingSnapshots}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type DeletedSnapshotsPanelProps = {
  deletedSnapshots: TrialSnapshot[]
  deletedTotalCount: number
  isLoadingDeletedSnapshots: boolean
  allDeletedSelected: boolean
  selectedDeletedIds: string[]
  isBulkApplying: boolean
  densityMode: DensityMode
  deletingSnapshotId: string | null
  hardDeletingSnapshotId: string | null
  restoringSnapshotId: string | null
  deletedPage: number
  deletedTotalPages: number
  deletedHasMore: boolean
  onToggleSelectDeletedPage: () => void
  onBulkRestore: () => Promise<void>
  onBulkHardDelete: () => Promise<void>
  onExportDeletedSummaryCsv: () => void
  onToggleSelection: (id: string) => void
  onRestoreDeletedSnapshot: (snapshot: TrialSnapshot) => Promise<void>
  onPermanentlyDeleteSnapshot: (snapshot: TrialSnapshot) => Promise<void>
  onSetDeletedWindowAll: () => void
  onManualRefresh: () => Promise<void>
  onPrevPage: () => void
  onNextPage: () => void
}

export function DeletedSnapshotsPanel(props: DeletedSnapshotsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recently Deleted</CardTitle>
        <CardDescription>
          Restore snapshots from the selected deleted window. Showing {props.deletedSnapshots.length} of{" "}
          {props.deletedTotalCount}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2" aria-busy={props.isLoadingDeletedSnapshots}>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={props.onToggleSelectDeletedPage}
          >
            {props.allDeletedSelected ? "Unselect Deleted" : "Select Deleted Page"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              void props.onBulkRestore()
            }}
            disabled={!props.selectedDeletedIds.length || props.isBulkApplying}
          >
            Restore Selected ({props.selectedDeletedIds.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => {
              void props.onBulkHardDelete()
            }}
            disabled={!props.selectedDeletedIds.length || props.isBulkApplying}
          >
            Delete Selected Forever ({props.selectedDeletedIds.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
            onClick={props.onExportDeletedSummaryCsv}
            disabled={!props.deletedSnapshots.length}
          >
            Export Deleted Summary
          </Button>
        </div>
        {props.isLoadingDeletedSnapshots ? (
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
            <Loader2 className="size-4 animate-spin" />
            Loading deleted snapshots...
          </p>
        ) : props.deletedSnapshots.length ? (
          props.deletedSnapshots.map((snapshot) => (
            <div
              key={snapshot.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 px-3 ${
                props.densityMode === "compact" ? "py-1.5" : "py-2"
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={props.selectedDeletedIds.includes(snapshot.id)}
                  onChange={() => props.onToggleSelection(snapshot.id)}
                  className="mt-1 size-4 accent-teal-600"
                  aria-label={`Select deleted snapshot ${snapshot.name}`}
                />
                <div>
                  <p className="text-sm font-medium">{snapshot.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Deleted {snapshot.deletedAt ? new Date(snapshot.deletedAt).toLocaleString() : "recently"} ·{" "}
                    {snapshot.rowCount} rows · by {snapshot.createdByName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Deleted {snapshot.deletedAt ? formatRelativeTime(snapshot.deletedAt) : "just now"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void props.onRestoreDeletedSnapshot(snapshot)
                  }}
                  disabled={
                    Boolean(props.deletingSnapshotId) ||
                    Boolean(props.restoringSnapshotId) ||
                    Boolean(props.hardDeletingSnapshotId)
                  }
                >
                  {props.restoringSnapshotId === snapshot.id ? (
                    <>
                      <Loader2 className="mr-1 size-3.5 animate-spin" />
                      Restoring...
                    </>
                  ) : (
                    "Restore"
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void props.onPermanentlyDeleteSnapshot(snapshot)
                  }}
                  disabled={
                    Boolean(props.deletingSnapshotId) ||
                    Boolean(props.restoringSnapshotId) ||
                    Boolean(props.hardDeletingSnapshotId)
                  }
                >
                  {props.hardDeletingSnapshotId === snapshot.id ? (
                    <>
                      <Loader2 className="mr-1 size-3.5 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Forever"
                  )}
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-md border border-dashed border-border p-3">
            <p className="text-sm text-muted-foreground">No deleted snapshots in this window.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={props.onSetDeletedWindowAll}
              >
                Show All Deleted
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => {
                  void props.onManualRefresh()
                }}
              >
                Refresh Deleted
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Page {props.deletedPage} of {props.deletedTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={props.onPrevPage}
              disabled={props.deletedPage <= 1 || props.isLoadingDeletedSnapshots}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={props.onNextPage}
              disabled={!props.deletedHasMore || props.isLoadingDeletedSnapshots}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
