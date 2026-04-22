import { NextResponse } from "next/server"
import { z } from "zod"

import { canAccessPath } from "@/lib/rbac"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { getServerSession } from "@/lib/security/auth-server"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { prisma } from "@/lib/server/prisma"

const TrialRowSchema = z.object({
  studentId: z.string().min(1),
  studentName: z.string().min(1),
  className: z.string().min(1),
  preScore: z.number().finite(),
  postScore: z.number().finite(),
})

const SnapshotCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  fileName: z.string().trim().min(1).max(260).optional(),
  invalidRows: z.number().int().min(0).max(100_000),
  rows: z.array(TrialRowSchema).min(1).max(2_000),
})

const SnapshotDeleteSchema = z.object({
  snapshotId: z.string().min(1),
})

const SnapshotRestoreSchema = z.object({
  snapshotId: z.string().min(1),
})

function canManageTrialRuns(role: Parameters<typeof canAccessPath>[0]) {
  return canAccessPath(role, "/dashboard/manager")
}

function parseRows(rows: unknown) {
  if (!Array.isArray(rows)) return []
  return rows
    .map((entry) => TrialRowSchema.safeParse(entry))
    .filter((entry) => entry.success)
    .map((entry) => entry.data)
}

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (!canManageTrialRuns(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `trial-snapshots-read:${ip}`,
    limit: 80,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 })
  }
  const url = new URL(request.url)
  const state = url.searchParams.get("state")
  const query = url.searchParams.get("q")?.trim() ?? ""
  const sort = url.searchParams.get("sort")
  const limitRaw = Number(url.searchParams.get("limit"))
  const pageRaw = Number(url.searchParams.get("page"))
  const minGainRaw = Number(url.searchParams.get("minGain"))
  const includeRowsRaw = url.searchParams.get("includeRows")
  const sinceHoursRaw = url.searchParams.get("sinceHours")
  const sinceHours =
    sinceHoursRaw && Number.isFinite(Number(sinceHoursRaw)) ? Number(sinceHoursRaw) : null
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(50, Math.floor(limitRaw)) : 12
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const skip = (page - 1) * limit
  const minGain = Number.isFinite(minGainRaw) ? minGainRaw : null
  const includeRows = !(includeRowsRaw === "0" || includeRowsRaw === "false")
  const deletedSince =
    typeof sinceHours === "number" && sinceHours > 0
      ? new Date(Date.now() - sinceHours * 60 * 60 * 1000)
      : null

  const where: {
    districtId: string
    deletedAt: null | { not: null; gte?: Date }
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" }
      fileName?: { contains: string; mode: "insensitive" }
    }>
    avgGain?: { gte: number }
  } =
    state === "deleted"
      ? {
          districtId: session.districtId,
          deletedAt: deletedSince ? { not: null, gte: deletedSince } : { not: null },
        }
      : { districtId: session.districtId, deletedAt: null }
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { fileName: { contains: query, mode: "insensitive" } },
    ]
  }
  if (state !== "deleted" && typeof minGain === "number") {
    where.avgGain = { gte: minGain }
  }

  const orderBy =
    state === "deleted"
      ? { deletedAt: "desc" as const }
      : sort === "created_asc"
        ? { createdAt: "asc" as const }
        : sort === "gain_desc"
          ? { avgGain: "desc" as const }
          : sort === "gain_asc"
            ? { avgGain: "asc" as const }
            : { createdAt: "desc" as const }

  const [totalCount, snapshots] = await prisma.$transaction([
    prisma.trialRunSnapshot.count({ where }),
    prisma.trialRunSnapshot.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        fileName: true,
        rowCount: true,
        invalidRows: true,
        avgPre: true,
        avgPost: true,
        avgGain: true,
        improvedCount: true,
        createdAt: true,
        deletedAt: true,
        rows: includeRows,
        user: {
          select: {
            fullName: true,
          },
        },
      },
    }),
  ])

  return NextResponse.json({
    totalCount,
    page,
    pageSize: limit,
    hasMore: page * limit < totalCount,
    snapshots: snapshots.map((snapshot) => ({
      id: snapshot.id,
      name: snapshot.name,
      fileName: snapshot.fileName,
      rowCount: snapshot.rowCount,
      invalidRows: snapshot.invalidRows,
      avgPre: snapshot.avgPre,
      avgPost: snapshot.avgPost,
      avgGain: snapshot.avgGain,
      improvedCount: snapshot.improvedCount,
      createdAt: snapshot.createdAt.toISOString(),
      deletedAt: snapshot.deletedAt?.toISOString() ?? null,
      createdByName: snapshot.user.fullName,
      rows: parseRows(snapshot.rows),
    })),
  })
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (!canManageTrialRuns(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `trial-snapshots-write:${ip}`,
    limit: 40,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many writes." }, { status: 429 })
  }

  try {
    const payload = SnapshotCreateSchema.parse(await request.json())
    const preTotal = payload.rows.reduce((total, row) => total + row.preScore, 0)
    const postTotal = payload.rows.reduce((total, row) => total + row.postScore, 0)
    const improvedCount = payload.rows.filter((row) => row.postScore > row.preScore).length
    const avgPre = preTotal / payload.rows.length
    const avgPost = postTotal / payload.rows.length

    await prisma.trialRunSnapshot.create({
      data: {
        districtId: session.districtId,
        userId: session.userId,
        name: payload.name,
        fileName: payload.fileName,
        rowCount: payload.rows.length,
        invalidRows: payload.invalidRows,
        avgPre,
        avgPost,
        avgGain: avgPost - avgPre,
        improvedCount,
        rows: payload.rows,
      },
    })

    await logSecurityEvent({
      eventType: "trial_snapshot_saved",
      actorUserId: session.userId,
      districtId: session.districtId,
      rowCount: payload.rows.length,
      invalidRows: payload.invalidRows,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid trial snapshot payload." }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (!canManageTrialRuns(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `trial-snapshots-delete:${ip}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many delete requests." }, { status: 429 })
  }

  try {
    const url = new URL(request.url)
    const mode = url.searchParams.get("mode")
    const payload = SnapshotDeleteSchema.parse({
      snapshotId: url.searchParams.get("snapshotId"),
    })

    const result =
      mode === "hard"
        ? await prisma.trialRunSnapshot.deleteMany({
            where: {
              id: payload.snapshotId,
              districtId: session.districtId,
              NOT: { deletedAt: null },
            },
          })
        : await prisma.trialRunSnapshot.updateMany({
            where: {
              id: payload.snapshotId,
              districtId: session.districtId,
              deletedAt: null,
            },
            data: {
              deletedAt: new Date(),
            },
          })

    if (result.count === 0) {
      return NextResponse.json({ message: "Snapshot not found." }, { status: 404 })
    }

    await logSecurityEvent({
      eventType: mode === "hard" ? "trial_snapshot_permanently_deleted" : "trial_snapshot_deleted",
      actorUserId: session.userId,
      districtId: session.districtId,
      snapshotId: payload.snapshotId,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid snapshot delete payload." }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (!canManageTrialRuns(session.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `trial-snapshots-restore:${ip}`,
    limit: 30,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many restore requests." }, { status: 429 })
  }

  try {
    const payload = SnapshotRestoreSchema.parse(await request.json())
    const result = await prisma.trialRunSnapshot.updateMany({
      where: {
        id: payload.snapshotId,
        districtId: session.districtId,
        NOT: { deletedAt: null },
      },
      data: {
        deletedAt: null,
      },
    })

    if (result.count === 0) {
      return NextResponse.json({ message: "Snapshot not found or already active." }, { status: 404 })
    }

    await logSecurityEvent({
      eventType: "trial_snapshot_restored",
      actorUserId: session.userId,
      districtId: session.districtId,
      snapshotId: payload.snapshotId,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid snapshot restore payload." }, { status: 400 })
  }
}
