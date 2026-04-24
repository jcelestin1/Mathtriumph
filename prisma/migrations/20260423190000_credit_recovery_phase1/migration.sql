-- CreateEnum
CREATE TYPE "CreditRecoveryProgramType" AS ENUM ('course_recovery', 'eoc_remediation', 'bridge_readiness');

-- CreateEnum
CREATE TYPE "CreditRecoveryEnrollmentStatus" AS ENUM ('assigned', 'in_progress', 'ready_for_review', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "CreditRecoveryReason" AS ENUM ('credit_recovery', 'grade_forgiveness', 'eoc_remediation', 'bridge_readiness');

-- CreateEnum
CREATE TYPE "CreditRecoveryProgressStatus" AS ENUM ('not_started', 'in_progress', 'mastered', 'needs_review');

-- CreateTable
CREATE TABLE "CreditRecoveryProgram" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL DEFAULT 'catalog',
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subjectArea" TEXT NOT NULL DEFAULT 'mathematics',
    "floridaCourseCode" TEXT,
    "recoveryType" "CreditRecoveryProgramType" NOT NULL,
    "eocCourse" TEXT,
    "gradeBandStart" INTEGER NOT NULL,
    "gradeBandEnd" INTEGER NOT NULL,
    "standardsFramework" TEXT NOT NULL DEFAULT 'Florida B.E.S.T.',
    "transcriptEligible" BOOLEAN NOT NULL DEFAULT false,
    "masteryModel" TEXT NOT NULL DEFAULT 'standards_mastery',
    "supportModel" JSONB NOT NULL,
    "policyConfig" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditRecoveryProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditRecoveryModule" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "benchmarkCode" TEXT NOT NULL,
    "reportingCategory" TEXT NOT NULL,
    "prerequisiteSkills" JSONB NOT NULL,
    "masteryThreshold" INTEGER NOT NULL DEFAULT 80,
    "estimatedMinutes" INTEGER NOT NULL,
    "supports" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditRecoveryModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditRecoveryEnrollment" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "studentUserId" TEXT NOT NULL,
    "assignedByUserId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "status" "CreditRecoveryEnrollmentStatus" NOT NULL DEFAULT 'assigned',
    "reason" "CreditRecoveryReason" NOT NULL,
    "originalCourseCode" TEXT,
    "originalCourseName" TEXT,
    "targetCompletionAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "masteryPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transcriptReplacementEligible" BOOLEAN NOT NULL DEFAULT false,
    "eocRequired" BOOLEAN NOT NULL DEFAULT false,
    "transcriptFlags" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditRecoveryEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditRecoveryEnrollmentProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "CreditRecoveryProgressStatus" NOT NULL DEFAULT 'not_started',
    "diagnosticScore" DOUBLE PRECISION,
    "masteryScore" DOUBLE PRECISION,
    "benchmarkReady" BOOLEAN NOT NULL DEFAULT false,
    "masteredAt" TIMESTAMP(3),
    "lastWorkedAt" TIMESTAMP(3),
    "evidence" JSONB,
    "teacherNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditRecoveryEnrollmentProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditRecoveryProgram_districtId_slug_key" ON "CreditRecoveryProgram"("districtId", "slug");

-- CreateIndex
CREATE INDEX "CreditRecoveryProgram_districtId_subjectArea_recoveryType_idx" ON "CreditRecoveryProgram"("districtId", "subjectArea", "recoveryType");

-- CreateIndex
CREATE UNIQUE INDEX "CreditRecoveryModule_programId_slug_key" ON "CreditRecoveryModule"("programId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "CreditRecoveryModule_programId_sequence_key" ON "CreditRecoveryModule"("programId", "sequence");

-- CreateIndex
CREATE INDEX "CreditRecoveryModule_benchmarkCode_idx" ON "CreditRecoveryModule"("benchmarkCode");

-- CreateIndex
CREATE INDEX "CreditRecoveryEnrollment_districtId_studentUserId_status_idx" ON "CreditRecoveryEnrollment"("districtId", "studentUserId", "status");

-- CreateIndex
CREATE INDEX "CreditRecoveryEnrollment_assignedByUserId_createdAt_idx" ON "CreditRecoveryEnrollment"("assignedByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "CreditRecoveryEnrollment_programId_status_idx" ON "CreditRecoveryEnrollment"("programId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CreditRecoveryEnrollmentProgress_enrollmentId_moduleId_key" ON "CreditRecoveryEnrollmentProgress"("enrollmentId", "moduleId");

-- CreateIndex
CREATE INDEX "CreditRecoveryEnrollmentProgress_status_benchmarkReady_idx" ON "CreditRecoveryEnrollmentProgress"("status", "benchmarkReady");

-- AddForeignKey
ALTER TABLE "CreditRecoveryModule" ADD CONSTRAINT "CreditRecoveryModule_programId_fkey" FOREIGN KEY ("programId") REFERENCES "CreditRecoveryProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRecoveryEnrollment" ADD CONSTRAINT "CreditRecoveryEnrollment_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRecoveryEnrollment" ADD CONSTRAINT "CreditRecoveryEnrollment_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRecoveryEnrollment" ADD CONSTRAINT "CreditRecoveryEnrollment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "CreditRecoveryProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRecoveryEnrollmentProgress" ADD CONSTRAINT "CreditRecoveryEnrollmentProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "CreditRecoveryEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditRecoveryEnrollmentProgress" ADD CONSTRAINT "CreditRecoveryEnrollmentProgress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CreditRecoveryModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
