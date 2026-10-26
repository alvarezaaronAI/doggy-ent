CREATE TABLE "CheckoutReceiptSettings" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'DISABLED',
    "templateId" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CheckoutReceiptSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CheckoutReceiptSettings_mode_check" CHECK ("mode" IN ('DISABLED', 'DRY_RUN', 'LIVE'))
);

ALTER TABLE "CheckoutReceiptSettings" ADD CONSTRAINT "CheckoutReceiptSettings_templateId_fkey"
FOREIGN KEY ("templateId") REFERENCES "EmailTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EmailDelivery" ADD COLUMN "automatic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "renderedEmail" JSONB;

CREATE INDEX "EmailDelivery_automatic_status_createdAt_idx" ON "EmailDelivery"("automatic", "status", "createdAt");
