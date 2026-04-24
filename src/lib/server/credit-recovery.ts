import {
  CreditRecoveryEnrollmentStatus,
  CreditRecoveryProgressStatus,
  CreditRecoveryReason,
  CreditRecoveryProgramType,
  type Prisma,
} from "@prisma/client"

import type { AppRole } from "@/lib/rbac"
import { prisma } from "@/lib/server/prisma"

const CATALOG_DISTRICT_ID = "catalog"

export type CreditRecoveryProgramSummary = Awaited<
  ReturnType<typeof listCreditRecoveryPrograms>
>[number]

export async function listCreditRecoveryPrograms(options?: {
  districtId?: string
  includeCatalog?: boolean
  recoveryType?: CreditRecoveryProgramType
  gradeLevel?: number
  eocCourse?: string
  subjectArea?: string
  includeModules?: boolean
}) {
  const districtId = options?.districtId?.trim()
  const subjectArea = options?.subjectArea?.trim()
  const where: Prisma.CreditRecoveryProgramWhereInput = {
    ...(districtId
      ? options?.includeCatalog === false
        ? { districtId }
        : { districtId: { in: [CATALOG_DISTRICT_ID, districtId] } }
      : { districtId: CATALOG_DISTRICT_ID }),
  }

  if (subjectArea) {
    where.subjectArea = subjectArea
  }
  if (options?.recoveryType) {
    where.recoveryType = options.recoveryType
  }
  if (options?.eocCourse) {
    where.eocCourse = options.eocCourse
  }
  if (typeof options?.gradeLevel === "number") {
    where.gradeBandStart = { lte: options.gradeLevel }
    where.gradeBandEnd = { gte: options.gradeLevel }
  }

  return prisma.creditRecoveryProgram.findMany({
    where,
    orderBy: [{ gradeBandStart: "asc" }, { title: "asc" }],
    include: {
      modules: options?.includeModules
        ? {
            orderBy: { sequence: "asc" },
          }
        : false,
    },
  })
}

export async function getCreditRecoveryProgramById(programId: string, districtId?: string) {
  return prisma.creditRecoveryProgram.findFirst({
    where: {
      id: programId,
      districtId: districtId?.trim()
        ? {
            in: [CATALOG_DISTRICT_ID, districtId.trim()],
          }
        : CATALOG_DISTRICT_ID,
    },
    include: {
      modules: {
        orderBy: { sequence: "asc" },
      },
    },
  })
}

async function getCreditRecoveryProgramBySlug(input: { districtId: string; programSlug: string }) {
  return prisma.creditRecoveryProgram.findFirst({
    where: {
      slug: input.programSlug,
      districtId: {
        in: [CATALOG_DISTRICT_ID, input.districtId],
      },
    },
    orderBy: {
      districtId: "desc",
    },
    include: {
      modules: {
        orderBy: { sequence: "asc" },
      },
    },
  })
}

function getProgramEocRequirement(policyConfig: Prisma.JsonValue, eocCourse: string | null) {
  if (eocCourse) return true
  if (
    policyConfig &&
    typeof policyConfig === "object" &&
    !Array.isArray(policyConfig) &&
    "floridaAlignment" in policyConfig
  ) {
    const floridaAlignment = policyConfig.floridaAlignment
    if (
      floridaAlignment &&
      typeof floridaAlignment === "object" &&
      !Array.isArray(floridaAlignment) &&
      "eocRequired" in floridaAlignment
    ) {
      return Boolean(floridaAlignment.eocRequired)
    }
  }
  return false
}

export async function assignCreditRecoveryEnrollment(input: {
  districtId: string
  studentUserId: string
  assignedByUserId: string
  programSlug: string
  reason: CreditRecoveryReason
  originalCourseCode?: string
  originalCourseName?: string
  targetCompletionAt?: string
  notes?: string
}) {
  const student = await prisma.user.findFirst({
    where: {
      id: input.studentUserId,
      districtId: input.districtId,
    },
    select: {
      id: true,
      role: true,
    },
  })
  if (!student || student.role !== "student") {
    throw new Error("Student not found in district.")
  }

  const program = await getCreditRecoveryProgramBySlug({
    districtId: input.districtId,
    programSlug: input.programSlug,
  })

  if (!program) {
    throw new Error("Credit recovery program not found.")
  }

  const enrollment = await prisma.creditRecoveryEnrollment.create({
    data: {
      districtId: input.districtId,
      studentUserId: input.studentUserId,
      assignedByUserId: input.assignedByUserId,
      programId: program.id,
      reason: input.reason,
      originalCourseCode: input.originalCourseCode,
      originalCourseName: input.originalCourseName,
      targetCompletionAt: input.targetCompletionAt ? new Date(input.targetCompletionAt) : undefined,
      transcriptReplacementEligible:
        input.reason === "credit_recovery" || input.reason === "grade_forgiveness",
      eocRequired: getProgramEocRequirement(program.policyConfig, program.eocCourse),
      transcriptFlags:
        input.reason === "credit_recovery" || input.reason === "grade_forgiveness"
          ? {
              originalAttempt: "X",
              replacementAttempt: "I",
            }
          : undefined,
      notes: input.notes,
      status: CreditRecoveryEnrollmentStatus.assigned,
      moduleProgress: {
        create: program.modules.map((module) => ({
          moduleId: module.id,
          status: CreditRecoveryProgressStatus.not_started,
        })),
      },
    },
    include: {
      program: {
        include: {
          modules: {
            orderBy: { sequence: "asc" },
          },
        },
      },
      moduleProgress: {
        include: {
          module: true,
        },
        orderBy: {
          module: {
            sequence: "asc",
          },
        },
      },
    },
  })

  return enrollment
}

export async function listCreditRecoveryEnrollments(input: {
  districtId: string
  role: AppRole
  userId: string
  studentUserId?: string
  status?: CreditRecoveryEnrollmentStatus
  programSlug?: string
}) {
  const scopedStudentUserId =
    input.role === "student" ? input.userId : input.studentUserId

  return prisma.creditRecoveryEnrollment.findMany({
    where: {
      districtId: input.districtId,
      ...(scopedStudentUserId ? { studentUserId: scopedStudentUserId } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.programSlug ? { program: { slug: input.programSlug } } : {}),
    },
    include: {
      program: true,
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      assignedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      moduleProgress: {
        include: {
          module: true,
        },
        orderBy: {
          module: {
            sequence: "asc",
          },
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  })
}

export async function updateCreditRecoveryEnrollmentProgress(input: {
  districtId: string
  enrollmentId: string
  moduleId: string
  status?: CreditRecoveryProgressStatus
  diagnosticScore?: number | null
  masteryScore?: number | null
  benchmarkReady?: boolean
  evidence?: Prisma.InputJsonValue
  teacherNotes?: string
}) {
  const enrollment = await prisma.creditRecoveryEnrollment.findFirst({
    where: {
      id: input.enrollmentId,
      districtId: input.districtId,
    },
    include: {
      moduleProgress: true,
    },
  })

  if (!enrollment) {
    throw new Error("Enrollment not found.")
  }

  await prisma.creditRecoveryEnrollmentProgress.update({
    where: {
      enrollmentId_moduleId: {
        enrollmentId: input.enrollmentId,
        moduleId: input.moduleId,
      },
    },
    data: {
      status: input.status,
      diagnosticScore: input.diagnosticScore,
      masteryScore: input.masteryScore,
      benchmarkReady: input.benchmarkReady,
      evidence: input.evidence,
      teacherNotes: input.teacherNotes,
      lastWorkedAt: new Date(),
      masteredAt:
        input.status === CreditRecoveryProgressStatus.mastered ? new Date() : undefined,
    },
  })

  const progressRows = await prisma.creditRecoveryEnrollmentProgress.findMany({
    where: {
      enrollmentId: input.enrollmentId,
    },
    select: {
      status: true,
      masteryScore: true,
      benchmarkReady: true,
    },
  })

  const completedCount = progressRows.filter(
    (progress) => progress.status === CreditRecoveryProgressStatus.mastered
  ).length
  const masteryPercent = progressRows.length
    ? (completedCount / progressRows.length) * 100
    : 0

  const nextStatus =
    completedCount === progressRows.length && progressRows.length > 0
      ? CreditRecoveryEnrollmentStatus.ready_for_review
      : completedCount > 0
        ? CreditRecoveryEnrollmentStatus.in_progress
        : CreditRecoveryEnrollmentStatus.assigned

  return prisma.creditRecoveryEnrollment.update({
    where: {
      id: input.enrollmentId,
    },
    data: {
      masteryPercent,
      status: nextStatus,
      startedAt:
        nextStatus === CreditRecoveryEnrollmentStatus.in_progress && !enrollment.startedAt
          ? new Date()
          : enrollment.startedAt,
      lastActivityAt: new Date(),
    },
    include: {
      program: true,
      moduleProgress: {
        include: {
          module: true,
        },
        orderBy: {
          module: {
            sequence: "asc",
          },
        },
      },
    },
  })
}
