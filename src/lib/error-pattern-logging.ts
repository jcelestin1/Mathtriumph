import type { ErrorAnalysisEntry } from "@/lib/quiz-engine"

const ERROR_PATTERNS_KEY = "mathtriumph-error-patterns"

type ErrorPatternLog = {
  timestamp: string
  benchmark: string
  reportingCategory: string
  errorType: string
  misconceptionTag: string
  course: string
}

function readErrorPatterns(): ErrorPatternLog[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(ERROR_PATTERNS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ErrorPatternLog[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveErrorPatterns(patterns: ErrorPatternLog[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(ERROR_PATTERNS_KEY, JSON.stringify(patterns.slice(0, 500)))
}

export function logErrorPatterns(analyses: ErrorAnalysisEntry[]) {
  if (typeof window === "undefined" || analyses.length === 0) return
  const existing = readErrorPatterns()
  const next: ErrorPatternLog[] = analyses.map((entry) => ({
    timestamp: new Date().toISOString(),
    benchmark: entry.benchmark,
    reportingCategory: entry.reportingCategory,
    errorType: entry.errorType,
    misconceptionTag: entry.misconceptionTag,
    course: entry.course,
  }))
  saveErrorPatterns([...next, ...existing])
}

export function getErrorPatternSummary(limit = 8) {
  const patterns = readErrorPatterns()
  const bucket = new Map<
    string,
    {
      reportingCategory: string
      misconceptionTag: string
      errorType: string
      count: number
    }
  >()

  patterns.forEach((item) => {
    const key = `${item.reportingCategory}|${item.misconceptionTag}|${item.errorType}`
    const current = bucket.get(key) ?? {
      reportingCategory: item.reportingCategory,
      misconceptionTag: item.misconceptionTag,
      errorType: item.errorType,
      count: 0,
    }
    current.count += 1
    bucket.set(key, current)
  })

  return Array.from(bucket.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}
