-- Persist order-level campaign donation attribution for admin traceability.
CREATE TABLE "public"."OrderCampaignUsage" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "donationAmount" DOUBLE PRECISION NOT NULL,
    "eligibleSubtotal" DOUBLE PRECISION NOT NULL,
    "matchedProductIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderCampaignUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrderCampaignUsage_orderId_campaignId_key" ON "public"."OrderCampaignUsage"("orderId", "campaignId");
CREATE INDEX "OrderCampaignUsage_orderId_idx" ON "public"."OrderCampaignUsage"("orderId");
CREATE INDEX "OrderCampaignUsage_campaignId_idx" ON "public"."OrderCampaignUsage"("campaignId");

ALTER TABLE "public"."OrderCampaignUsage" ADD CONSTRAINT "OrderCampaignUsage_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."OrderCampaignUsage" ADD CONSTRAINT "OrderCampaignUsage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
