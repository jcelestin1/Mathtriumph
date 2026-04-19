-- CreateTable
CREATE TABLE "DistrictRolePermissionOverride" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "permission" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictRolePermissionOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DistrictRolePermissionOverride_districtId_role_idx" ON "DistrictRolePermissionOverride"("districtId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "DistrictRolePermissionOverride_districtId_role_permission_key" ON "DistrictRolePermissionOverride"("districtId", "role", "permission");

-- AddForeignKey
ALTER TABLE "DistrictRolePermissionOverride" ADD CONSTRAINT "DistrictRolePermissionOverride_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
