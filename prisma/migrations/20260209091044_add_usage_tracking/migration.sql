/*
  Warnings:

  - You are about to drop the column `youtube_video_id` on the `reports` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reports" DROP COLUMN "youtube_video_id",
ADD COLUMN     "file_size" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "storage_key" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "max_reports" INTEGER NOT NULL DEFAULT 25,
ADD COLUMN     "storage_limit" BIGINT NOT NULL DEFAULT 524288000,
ADD COLUMN     "storage_used" BIGINT NOT NULL DEFAULT 0;
