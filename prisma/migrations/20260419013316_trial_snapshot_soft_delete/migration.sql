-- AlterTable
ALTER TABLE "TrialRunSnapshot" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "TrialRunSnapshot_districtId_deletedAt_createdAt_idx" ON "TrialRunSnapshot"("districtId", "deletedAt", "createdAt");
