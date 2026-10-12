CREATE TABLE "EmailTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "heading" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "footer" TEXT NOT NULL,
  "archived" BOOLEAN NOT NULL DEFAULT false,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EmailTemplate_event_archived_idx" ON "EmailTemplate"("event", "archived");
