-- Extend customer support requests into order issues and add internal issue tracking.

ALTER TABLE "CustomerSupportRequest"
ADD COLUMN "caseNumber" TEXT,
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'OTHER',
ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL',
ADD COLUMN "resolutionSummary" TEXT,
ADD COLUMN "deliveryEligibilityEndsAt" TIMESTAMP(3),
ADD COLUMN "resolvedAt" TIMESTAMP(3),
ADD COLUMN "closedAt" TIMESTAMP(3);

UPDATE "CustomerSupportRequest"
SET "caseNumber" = 'CE-' || UPPER(SUBSTRING("id", GREATEST(LENGTH("id") - 7, 1), 8))
WHERE "caseNumber" IS NULL;

ALTER TABLE "CustomerSupportRequest"
ALTER COLUMN "caseNumber" SET NOT NULL;

CREATE UNIQUE INDEX "CustomerSupportRequest_caseNumber_key"
ON "CustomerSupportRequest"("caseNumber");

CREATE INDEX "CustomerSupportRequest_caseNumber_idx"
ON "CustomerSupportRequest"("caseNumber");

CREATE INDEX "CustomerSupportRequest_category_idx"
ON "CustomerSupportRequest"("category");

CREATE INDEX "CustomerSupportRequest_priority_idx"
ON "CustomerSupportRequest"("priority");

CREATE INDEX "CustomerSupportRequest_createdAt_idx"
ON "CustomerSupportRequest"("createdAt");

UPDATE "CustomerSupportRequest"
SET "orderId" = NULL
WHERE "orderId" IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM "Order"
  WHERE "Order"."id" = "CustomerSupportRequest"."orderId"
);

ALTER TABLE "CustomerSupportRequest"
ADD CONSTRAINT "CustomerSupportRequest_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "CustomerSupportMessage" (
  "id" TEXT NOT NULL,
  "supportRequestId" TEXT NOT NULL,
  "authorType" TEXT NOT NULL,
  "authorUserId" TEXT,
  "body" TEXT NOT NULL,
  "visibility" TEXT NOT NULL DEFAULT 'CUSTOMER',
  "emailRequested" BOOLEAN NOT NULL DEFAULT false,
  "emailDeliveryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CustomerSupportMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerSupportMessage_supportRequestId_idx"
ON "CustomerSupportMessage"("supportRequestId");

CREATE INDEX "CustomerSupportMessage_visibility_idx"
ON "CustomerSupportMessage"("visibility");

CREATE INDEX "CustomerSupportMessage_createdAt_idx"
ON "CustomerSupportMessage"("createdAt");

ALTER TABLE "CustomerSupportMessage"
ADD CONSTRAINT "CustomerSupportMessage_supportRequestId_fkey"
FOREIGN KEY ("supportRequestId") REFERENCES "CustomerSupportRequest"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "CustomerSupportEvent" (
  "id" TEXT NOT NULL,
  "supportRequestId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "metadata" JSONB,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CustomerSupportEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerSupportEvent_supportRequestId_idx"
ON "CustomerSupportEvent"("supportRequestId");

CREATE INDEX "CustomerSupportEvent_eventType_idx"
ON "CustomerSupportEvent"("eventType");

CREATE INDEX "CustomerSupportEvent_createdAt_idx"
ON "CustomerSupportEvent"("createdAt");

ALTER TABLE "CustomerSupportEvent"
ADD CONSTRAINT "CustomerSupportEvent_supportRequestId_fkey"
FOREIGN KEY ("supportRequestId") REFERENCES "CustomerSupportRequest"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "InternalIssue" (
  "id" TEXT NOT NULL,
  "caseNumber" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "source" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "safeDetails" TEXT,
  "route" TEXT,
  "customerId" TEXT,
  "orderId" TEXT,
  "occurrenceCount" INTEGER NOT NULL DEFAULT 1,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "reviewNotes" TEXT,
  "resolutionNotes" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InternalIssue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InternalIssue_caseNumber_key"
ON "InternalIssue"("caseNumber");

CREATE UNIQUE INDEX "InternalIssue_fingerprint_key"
ON "InternalIssue"("fingerprint");

CREATE INDEX "InternalIssue_category_idx"
ON "InternalIssue"("category");

CREATE INDEX "InternalIssue_severity_idx"
ON "InternalIssue"("severity");

CREATE INDEX "InternalIssue_source_idx"
ON "InternalIssue"("source");

CREATE INDEX "InternalIssue_status_idx"
ON "InternalIssue"("status");

CREATE INDEX "InternalIssue_lastSeenAt_idx"
ON "InternalIssue"("lastSeenAt");

CREATE INDEX "InternalIssue_orderId_idx"
ON "InternalIssue"("orderId");

CREATE INDEX "InternalIssue_customerId_idx"
ON "InternalIssue"("customerId");

CREATE TABLE "InternalIssueEvent" (
  "id" TEXT NOT NULL,
  "internalIssueId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "metadata" JSONB,
  "actorType" TEXT NOT NULL,
  "actorId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "InternalIssueEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InternalIssueEvent_internalIssueId_idx"
ON "InternalIssueEvent"("internalIssueId");

CREATE INDEX "InternalIssueEvent_eventType_idx"
ON "InternalIssueEvent"("eventType");

CREATE INDEX "InternalIssueEvent_createdAt_idx"
ON "InternalIssueEvent"("createdAt");

ALTER TABLE "InternalIssueEvent"
ADD CONSTRAINT "InternalIssueEvent_internalIssueId_fkey"
FOREIGN KEY ("internalIssueId") REFERENCES "InternalIssue"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
