-- CreateEnum
CREATE TYPE "ReportActionType" AS ENUM ('REPORT_CREATED', 'REPORT_UPDATED', 'REPORT_DELETED', 'COMMENT_ADDED', 'COMMENT_DELETED', 'AI_INSIGHTS_GENERATED', 'SEVERITY_CHANGED', 'PRIORITY_CHANGED', 'ANNOTATIONS_UPDATED', 'STATUS_CHANGED', 'ASSIGNED');

-- CreateTable
CREATE TABLE "report_actions" (
    "id" TEXT NOT NULL,
    "action_type" "ReportActionType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "report_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_actions_report_id_created_at_idx" ON "report_actions"("report_id", "created_at");

-- CreateIndex
CREATE INDEX "report_actions_user_id_idx" ON "report_actions"("user_id");

-- AddForeignKey
ALTER TABLE "report_actions" ADD CONSTRAINT "report_actions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_actions" ADD CONSTRAINT "report_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
