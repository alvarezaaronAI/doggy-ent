CREATE TABLE "OrderShipment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "carrier" TEXT NOT NULL,
  "trackingNumber" TEXT NOT NULL,
  "trackingUrl" TEXT,
  "shipmentStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "estimatedDelivery" TIMESTAMP(3),
  "shippedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "lastSyncedAt" TIMESTAMP(3),
  "source" TEXT NOT NULL DEFAULT 'ADMIN',
  "rawStatus" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OrderShipment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OrderShipmentEvent" (
  "id" TEXT NOT NULL,
  "shipmentId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "message" TEXT,
  "location" TEXT,
  "occurredAt" TIMESTAMP(3),
  "rawEvent" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "OrderShipmentEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailDelivery" (
  "id" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'MOCK',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "providerId" TEXT,
  "orderId" TEXT,
  "userId" TEXT,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EmailDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderShipment_orderId_trackingNumber_key" ON "OrderShipment"("orderId", "trackingNumber");
CREATE INDEX "OrderShipment_orderId_idx" ON "OrderShipment"("orderId");
CREATE INDEX "OrderShipment_trackingNumber_idx" ON "OrderShipment"("trackingNumber");
CREATE INDEX "OrderShipment_shipmentStatus_idx" ON "OrderShipment"("shipmentStatus");

CREATE INDEX "OrderShipmentEvent_shipmentId_idx" ON "OrderShipmentEvent"("shipmentId");
CREATE INDEX "OrderShipmentEvent_occurredAt_idx" ON "OrderShipmentEvent"("occurredAt");
CREATE UNIQUE INDEX "OrderShipmentEvent_shipmentId_status_occurredAt_key" ON "OrderShipmentEvent"("shipmentId", "status", "occurredAt");

CREATE UNIQUE INDEX "EmailDelivery_dedupeKey_key" ON "EmailDelivery"("dedupeKey");
CREATE INDEX "EmailDelivery_event_idx" ON "EmailDelivery"("event");
CREATE INDEX "EmailDelivery_recipient_idx" ON "EmailDelivery"("recipient");
CREATE INDEX "EmailDelivery_orderId_idx" ON "EmailDelivery"("orderId");
CREATE INDEX "EmailDelivery_userId_idx" ON "EmailDelivery"("userId");
CREATE INDEX "EmailDelivery_status_idx" ON "EmailDelivery"("status");

ALTER TABLE "OrderShipment"
ADD CONSTRAINT "OrderShipment_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderShipmentEvent"
ADD CONSTRAINT "OrderShipmentEvent_shipmentId_fkey"
FOREIGN KEY ("shipmentId") REFERENCES "OrderShipment"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EmailDelivery"
ADD CONSTRAINT "EmailDelivery_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
