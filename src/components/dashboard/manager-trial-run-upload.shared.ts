export type TrialRow = {
  studentId: string
  studentName: string
  className: string
  preScore: number
  postScore: number
}

export type TrialSnapshot = {
  id: string
  name: string
  fileName: string | null
  rowCount: number
  invalidRows: number
  avgPre: number
  avgPost: number
  avgGain: number
  improvedCount: number
  createdAt: string
  deletedAt: string | null
  createdByName: string
  rows: TrialRow[]
}

export type SnapshotListResponse = {
  snapshots: TrialSnapshot[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type SnapshotUndoState = {
  snapshotId: string
  snapshotName: string
  expiresAtMs: number
}

export type SnapshotSortOption = "created_desc" | "created_asc" | "gain_desc" | "gain_asc"
export type DeletedWindowHoursOption = 24 | 168 | 720 | 0

export type DensityMode = "comfortable" | "compact"

export const REQUIRED_COLUMNS = [
  "studentId",
  "studentName",
  "className",
  "preScore",
  "postScore",
] as const

export const DELETE_UNDO_WINDOW_MS = 10_000
export const STATUS_REGION_ID = "trial-run-status-region"
export const SHORTCUTS_HINT_ID = "trial-run-shortcuts-hint"
export const PAGE_SIZE_OPTIONS = [6, 12, 24] as const
export const SORT_OPTIONS: Array<{ value: SnapshotSortOption; label: string }> = [
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
  { value: "gain_desc", label: "Highest gain" },
  { value: "gain_asc", label: "Lowest gain" },
]
export const DELETED_WINDOW_OPTIONS: Array<{
  value: DeletedWindowHoursOption
  label: string
}> = [
  { value: 24, label: "24 hours" },
  { value: 168, label: "7 days" },
  { value: 720, label: "30 days" },
  { value: 0, label: "All time" },
]

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]

    if (char === '"') {
      const isEscapedQuote = inQuotes && line[i + 1] === '"'
      if (isEscapedQuote) {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim())
      current = ""
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

export function parseTrialRunCsv(raw: string) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    return {
      rows: [] as TrialRow[],
      missingColumns: [...REQUIRED_COLUMNS],
      invalidRows: 0,
    }
  }

  const headers = parseCsvLine(lines[0])
  const indexByHeader = new Map(headers.map((header, index) => [header, index]))
  const missingColumns = REQUIRED_COLUMNS.filter((column) => !indexByHeader.has(column))

  if (missingColumns.length) {
    return {
      rows: [] as TrialRow[],
      missingColumns,
      invalidRows: lines.length - 1,
    }
  }

  const rows: TrialRow[] = []
  let invalidRows = 0

  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line)
    const studentId = cells[indexByHeader.get("studentId") ?? -1] ?? ""
    const studentName = cells[indexByHeader.get("studentName") ?? -1] ?? ""
    const className = cells[indexByHeader.get("className") ?? -1] ?? ""
    const preScoreRaw = cells[indexByHeader.get("preScore") ?? -1] ?? ""
    const postScoreRaw = cells[indexByHeader.get("postScore") ?? -1] ?? ""

    const preScore = Number(preScoreRaw)
    const postScore = Number(postScoreRaw)
    const isValid =
      Boolean(studentId && studentName && className) &&
      Number.isFinite(preScore) &&
      Number.isFinite(postScore)

    if (!isValid) {
      invalidRows += 1
      continue
    }

    rows.push({
      studentId,
      studentName,
      className,
      preScore,
      postScore,
    })
  }

  return { rows, missingColumns, invalidRows }
}

export function csvCell(value: string | number) {
  const asString = String(value)
  if (/[",\n]/.test(asString)) {
    return `"${asString.replace(/"/g, '""')}"`
  }
  return asString
}

export function formatRelativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(ms / (60 * 1000))
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
