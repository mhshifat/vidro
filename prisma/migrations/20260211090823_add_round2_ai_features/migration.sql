-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "accessibility_audit" TEXT,
ADD COLUMN     "highlight_end" DOUBLE PRECISION,
ADD COLUMN     "highlight_start" DOUBLE PRECISION,
ADD COLUMN     "performance_analysis" TEXT,
ADD COLUMN     "security_scan" TEXT,
ADD COLUMN     "sentiment" TEXT,
ADD COLUMN     "test_cases" TEXT,
ADD COLUMN     "translations" JSONB;
