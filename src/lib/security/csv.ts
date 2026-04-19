const DANGEROUS_PREFIX = /^[=+\-@]/

export function escapeCsvCell(value: string | number | null | undefined) {
  const stringValue = String(value ?? "").replace(/"/g, '""')
  const prefixed = DANGEROUS_PREFIX.test(stringValue)
    ? `'${stringValue}`
    : stringValue
  return `"${prefixed}"`
}
