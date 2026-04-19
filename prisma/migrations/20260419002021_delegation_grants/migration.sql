-- CreateTable
CREATE TABLE "DelegationGrant" (
    "id" TEXT NOT NULL,
    "grantorUserId" TEXT NOT NULL,
    "granteeUserId" TEXT NOT NULL,
    "targetRole" "UserRole" NOT NULL,
    "reason" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DelegationGrant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DelegationGrant_grantorUserId_idx" ON "DelegationGrant"("grantorUserId");

-- CreateIndex
CREATE INDEX "DelegationGrant_granteeUserId_idx" ON "DelegationGrant"("granteeUserId");

-- CreateIndex
CREATE INDEX "DelegationGrant_targetRole_idx" ON "DelegationGrant"("targetRole");

-- CreateIndex
CREATE INDEX "DelegationGrant_startsAt_endsAt_idx" ON "DelegationGrant"("startsAt", "endsAt");

-- AddForeignKey
ALTER TABLE "DelegationGrant" ADD CONSTRAINT "DelegationGrant_grantorUserId_fkey" FOREIGN KEY ("grantorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelegationGrant" ADD CONSTRAINT "DelegationGrant_granteeUserId_fkey" FOREIGN KEY ("granteeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
