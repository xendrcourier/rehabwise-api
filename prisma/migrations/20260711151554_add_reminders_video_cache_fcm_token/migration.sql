-- CreateEnum
CREATE TYPE "ReminderChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "video_path" TEXT,
ADD COLUMN     "video_url_expires_at" TIMESTAMP(3),
ALTER COLUMN "video_watch_url" DROP NOT NULL,
ALTER COLUMN "exercise_img_url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "last_reminded_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fcm_token" TEXT;

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channels" "ReminderChannel"[],
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patient_id" TEXT NOT NULL,
    "program_id" TEXT,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reminder_patient_id_read_idx" ON "Reminder"("patient_id", "read");

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
