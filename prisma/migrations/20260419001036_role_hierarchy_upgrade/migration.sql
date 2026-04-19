-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'district_admin';
ALTER TYPE "UserRole" ADD VALUE 'tech_admin';
ALTER TYPE "UserRole" ADD VALUE 'interventionist';
ALTER TYPE "UserRole" ADD VALUE 'instructional_coach';
ALTER TYPE "UserRole" ADD VALUE 'data_analyst';
ALTER TYPE "UserRole" ADD VALUE 'support_admin';
