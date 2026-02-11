-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "log_summary" TEXT,
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "repro_steps" TEXT,
ADD COLUMN     "root_cause" TEXT,
ADD COLUMN     "severity" TEXT,
ADD COLUMN     "stakeholder_summary" TEXT,
ADD COLUMN     "suggested_fix" TEXT,
ADD COLUMN     "tags" JSONB;
