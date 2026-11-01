ALTER TABLE "Order" ADD COLUMN "attributionSnapshot" JSONB;

CREATE TABLE "CheckoutAttempt" (
  "id" TEXT NOT NULL,
  "recoveryHash" TEXT NOT NULL,
  "inputHash" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "amountCents" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'usd',
  "paymentMode" TEXT NOT NULL,
  "stripeAccountId" TEXT NOT NULL,
  "paymentIntentId" TEXT,
  "orderId" TEXT,
  "userId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PREPARED',
  "leaseToken" TEXT,
  "leaseUntil" TIMESTAMP(3),
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "nextRetryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastErrorCode" TEXT,
  "paidAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "recoveryExpiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CheckoutAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CheckoutAttempt_amount_check" CHECK ("amountCents" > 0 AND "currency" = 'usd'),
  CONSTRAINT "CheckoutAttempt_mode_check" CHECK ("paymentMode" IN ('sandbox', 'live')),
  CONSTRAINT "CheckoutAttempt_status_check" CHECK ("status" IN ('PREPARED', 'OPEN', 'PROCESSING', 'PAID_PENDING_ORDER', 'COMPLETED', 'PAID_REVIEW', 'CANCELED', 'EXPIRED')),
  CONSTRAINT "CheckoutAttempt_hash_check" CHECK ("recoveryHash" ~ '^[a-f0-9]{64}$' AND "inputHash" ~ '^[a-f0-9]{64}$')
);
CREATE UNIQUE INDEX "CheckoutAttempt_paymentIntentId_key" ON "CheckoutAttempt"("paymentIntentId");
CREATE UNIQUE INDEX "CheckoutAttempt_orderId_key" ON "CheckoutAttempt"("orderId");
CREATE INDEX "CheckoutAttempt_status_nextRetryAt_idx" ON "CheckoutAttempt"("status", "nextRetryAt");
CREATE INDEX "CheckoutAttempt_userId_createdAt_idx" ON "CheckoutAttempt"("userId", "createdAt");
ALTER TABLE "CheckoutAttempt" ADD CONSTRAINT "CheckoutAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CheckoutAttempt" ADD CONSTRAINT "CheckoutAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "StripePaymentEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "paymentIntentId" TEXT NOT NULL,
  "stripeAccountId" TEXT NOT NULL,
  "paymentMode" TEXT NOT NULL,
  "attemptId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "StripePaymentEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StripePaymentEvent_mode_check" CHECK ("paymentMode" IN ('sandbox', 'live')),
  CONSTRAINT "StripePaymentEvent_status_check" CHECK ("status" IN ('PENDING', 'PROCESSED', 'IGNORED'))
);
CREATE INDEX "StripePaymentEvent_status_receivedAt_idx" ON "StripePaymentEvent"("status", "receivedAt");
CREATE INDEX "StripePaymentEvent_paymentIntentId_idx" ON "StripePaymentEvent"("paymentIntentId");
ALTER TABLE "StripePaymentEvent" ADD CONSTRAINT "StripePaymentEvent_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "CheckoutAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
