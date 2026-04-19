-- CreateTable
CREATE TABLE "DistrictPolicySnapshot" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "preset" TEXT,
    "reason" TEXT,
    "entries" JSONB NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DistrictPolicySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DistrictPolicySnapshot_districtId_createdAt_idx" ON "DistrictPolicySnapshot"("districtId", "createdAt");

-- AddForeignKey
ALTER TABLE "DistrictPolicySnapshot" ADD CONSTRAINT "DistrictPolicySnapshot_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
