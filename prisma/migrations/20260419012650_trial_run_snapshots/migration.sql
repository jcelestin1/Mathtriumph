-- CreateTable
CREATE TABLE "TrialRunSnapshot" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileName" TEXT,
    "rowCount" INTEGER NOT NULL,
    "invalidRows" INTEGER NOT NULL DEFAULT 0,
    "avgPre" DOUBLE PRECISION NOT NULL,
    "avgPost" DOUBLE PRECISION NOT NULL,
    "avgGain" DOUBLE PRECISION NOT NULL,
    "improvedCount" INTEGER NOT NULL,
    "rows" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialRunSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrialRunSnapshot_districtId_createdAt_idx" ON "TrialRunSnapshot"("districtId", "createdAt");

-- CreateIndex
CREATE INDEX "TrialRunSnapshot_userId_createdAt_idx" ON "TrialRunSnapshot"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "TrialRunSnapshot" ADD CONSTRAINT "TrialRunSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
