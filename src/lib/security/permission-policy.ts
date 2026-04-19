import {
  APP_PERMISSIONS,
  APP_ROLES,
  hasPermission,
  ROLE_PERMISSIONS,
  type AppPermission,
  type AppRole,
} from "@/lib/rbac"
import { prisma } from "@/lib/server/prisma"

export type PolicyPreset = "strict" | "balanced" | "empowered"
export type PolicyOverrideEntry = {
  role: AppRole
  permission: AppPermission
  enabled: boolean
}
export type PolicyPresetPreview = {
  preset: PolicyPreset
  label: string
  description: string
  impacts: Array<{
    role: AppRole
    permission: AppPermission
    enabled: boolean
  }>
}
export type PolicySnapshotSummary = {
  id: string
  label: string
  preset: string | null
  reason: string | null
  createdAt: string
  createdByUserId: string | null
  overrideCount: number
}

const STRICT_PRESET_DISABLED: Array<{ role: AppRole; permission: AppPermission }> = [
  { role: "school_admin", permission: "role.delegate" },
  { role: "school_admin", permission: "role.switch.demo" },
  { role: "school_admin", permission: "analytics.exports.manage" },
  { role: "instructional_coach", permission: "school.reports.view" },
  { role: "interventionist", permission: "assignments.manage" },
  { role: "support_admin", permission: "audit.logs.view" },
]

const EMPOWERED_PRESET_ENABLED: Array<{ role: AppRole; permission: AppPermission }> = [
  { role: "school_admin", permission: "role.delegate" },
  { role: "school_admin", permission: "role.switch.demo" },
  { role: "instructional_coach", permission: "school.reports.view" },
  { role: "instructional_coach", permission: "analytics.exports.manage" },
  { role: "interventionist", permission: "assignments.manage" },
  { role: "data_analyst", permission: "district.reports.view" },
]

function rolePermissionKey(role: AppRole, permission: AppPermission) {
  return `${role}:${permission}`
}

function getPresetEntryMap(preset: PolicyPreset) {
  const map = new Map<string, boolean>()
  if (preset === "strict") {
    STRICT_PRESET_DISABLED.forEach(({ role, permission }) => {
      map.set(rolePermissionKey(role, permission), false)
    })
  }
  if (preset === "empowered") {
    EMPOWERED_PRESET_ENABLED.forEach(({ role, permission }) => {
      map.set(rolePermissionKey(role, permission), true)
    })
  }
  return map
}

export function getPolicyPresetPreview(): PolicyPresetPreview[] {
  return [
    {
      preset: "strict",
      label: "Strict",
      description:
        "Reduces delegation and sensitive export capabilities outside district-level leadership.",
      impacts: STRICT_PRESET_DISABLED.map((entry) => ({ ...entry, enabled: false })),
    },
    {
      preset: "balanced",
      label: "Balanced",
      description:
        "Returns all role permissions to the platform defaults for a stable baseline.",
      impacts: [],
    },
    {
      preset: "empowered",
      label: "Empowered",
      description:
        "Expands school-side operational flexibility for faster execution and coaching throughput.",
      impacts: EMPOWERED_PRESET_ENABLED.map((entry) => ({ ...entry, enabled: true })),
    },
  ]
}

export async function hasDistrictPermission({
  districtId,
  role,
  permission,
}: {
  districtId: string
  role: AppRole
  permission: AppPermission
}) {
  const override = await prisma.districtRolePermissionOverride.findUnique({
    where: {
      districtId_role_permission: {
        districtId,
        role,
        permission,
      },
    },
    select: { enabled: true },
  })
  if (override) {
    return override.enabled
  }
  return hasPermission(role, permission)
}

export async function getEffectivePermissions(districtId: string, role: AppRole) {
  const overrides = await prisma.districtRolePermissionOverride.findMany({
    where: { districtId, role },
    select: {
      permission: true,
      enabled: true,
    },
  })
  const overrideMap = new Map<string, boolean>()
  for (const override of overrides) {
    if (APP_PERMISSIONS.includes(override.permission as AppPermission)) {
      overrideMap.set(override.permission, override.enabled)
    }
  }

  return APP_PERMISSIONS.filter((permission) => {
    if (overrideMap.has(permission)) {
      return overrideMap.get(permission) === true
    }
    return ROLE_PERMISSIONS[role].includes(permission)
  })
}

export async function getDistrictPolicyMatrix(districtId: string) {
  const overrides = await prisma.districtRolePermissionOverride.findMany({
    where: { districtId },
    select: {
      role: true,
      permission: true,
      enabled: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  })
  const overrideMap = new Map<string, boolean>()
  for (const override of overrides) {
    if (!APP_PERMISSIONS.includes(override.permission as AppPermission)) continue
    const key = `${override.role}:${override.permission}`
    overrideMap.set(key, override.enabled)
  }

  return APP_ROLES.map((role) => ({
    role,
    permissions: APP_PERMISSIONS.map((permission) => {
      const key = `${role}:${permission}`
      const overrideEnabled = overrideMap.get(key)
      const defaultEnabled = ROLE_PERMISSIONS[role].includes(permission)
      return {
        permission,
        enabled:
          typeof overrideEnabled === "boolean" ? overrideEnabled : defaultEnabled,
        defaultEnabled,
        isOverridden: typeof overrideEnabled === "boolean",
      }
    }),
  }))
}

export async function getCurrentDistrictOverrideEntries(
  districtId: string
): Promise<PolicyOverrideEntry[]> {
  const overrides = await prisma.districtRolePermissionOverride.findMany({
    where: { districtId },
    select: { role: true, permission: true, enabled: true },
  })
  return overrides
    .filter((entry) => APP_PERMISSIONS.includes(entry.permission as AppPermission))
    .map((entry) => ({
      role: entry.role,
      permission: entry.permission as AppPermission,
      enabled: entry.enabled,
    }))
}

export async function createDistrictPolicySnapshot({
  districtId,
  createdByUserId,
  label,
  preset,
  reason,
}: {
  districtId: string
  createdByUserId: string
  label: string
  preset?: PolicyPreset
  reason?: string
}) {
  const entries = await getCurrentDistrictOverrideEntries(districtId)
  return prisma.districtPolicySnapshot.create({
    data: {
      districtId,
      label,
      preset,
      reason,
      entries,
      createdByUserId,
    },
  })
}

export async function listDistrictPolicySnapshots(
  districtId: string,
  limit = 12
): Promise<PolicySnapshotSummary[]> {
  const snapshots = await prisma.districtPolicySnapshot.findMany({
    where: { districtId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      label: true,
      preset: true,
      reason: true,
      createdAt: true,
      createdByUserId: true,
      entries: true,
    },
  })
  return snapshots.map((snapshot) => ({
    id: snapshot.id,
    label: snapshot.label,
    preset: snapshot.preset,
    reason: snapshot.reason,
    createdAt: snapshot.createdAt.toISOString(),
    createdByUserId: snapshot.createdByUserId,
    overrideCount: Array.isArray(snapshot.entries) ? snapshot.entries.length : 0,
  }))
}

export async function restoreDistrictPolicySnapshot({
  districtId,
  snapshotId,
}: {
  districtId: string
  snapshotId: string
}) {
  const snapshot = await prisma.districtPolicySnapshot.findFirst({
    where: {
      id: snapshotId,
      districtId,
    },
    select: {
      entries: true,
    },
  })
  if (!snapshot) {
    throw new Error("Policy snapshot not found.")
  }

  const rawEntries = Array.isArray(snapshot.entries)
    ? (snapshot.entries as Array<{
        role?: string
        permission?: string
        enabled?: boolean
      }>)
    : []
  const entries = rawEntries.filter(
    (entry): entry is { role: AppRole; permission: AppPermission; enabled: boolean } =>
      Boolean(entry.role) &&
      Boolean(entry.permission) &&
      typeof entry.enabled === "boolean" &&
      APP_ROLES.includes(entry.role as AppRole) &&
      APP_PERMISSIONS.includes(entry.permission as AppPermission)
  )

  await prisma.$transaction(async (tx) => {
    await tx.districtRolePermissionOverride.deleteMany({
      where: { districtId },
    })

    if (entries.length === 0) return

    await Promise.all(
      entries.map((entry) =>
        tx.districtRolePermissionOverride.create({
          data: {
            districtId,
            role: entry.role,
            permission: entry.permission,
            enabled: entry.enabled,
          },
        })
      )
    )
  })
}

export async function applyDistrictPolicyPreset({
  districtId,
  updatedByUserId,
  preset,
}: {
  districtId: string
  updatedByUserId: string
  preset: PolicyPreset
}) {
  if (preset === "balanced") {
    await prisma.districtRolePermissionOverride.deleteMany({
      where: { districtId },
    })
    return
  }

  const presetEntries = getPresetEntryMap(preset)
  await prisma.$transaction(async (tx) => {
    await tx.districtRolePermissionOverride.deleteMany({
      where: { districtId },
    })

    const upserts = Array.from(presetEntries.entries()).map(([key, enabled]) => {
      const [role, permission] = key.split(":")
      return tx.districtRolePermissionOverride.upsert({
        where: {
          districtId_role_permission: {
            districtId,
            role: role as AppRole,
            permission,
          },
        },
        update: {
          enabled,
          updatedByUserId,
        },
        create: {
          districtId,
          role: role as AppRole,
          permission,
          enabled,
          updatedByUserId,
        },
      })
    })

    await Promise.all(upserts)
  })
}
