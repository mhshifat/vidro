-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('VIDEO', 'SCREENSHOT');

-- AlterTable
ALTER TABLE "reports" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "type" "ReportType" NOT NULL DEFAULT 'VIDEO',
ALTER COLUMN "video_url" DROP NOT NULL;
