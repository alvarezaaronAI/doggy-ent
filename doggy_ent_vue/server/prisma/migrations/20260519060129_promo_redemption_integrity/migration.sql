/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `PromoUsage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "public"."PromoStatus" ADD VALUE 'ARCHIVED';

-- CreateIndex
CREATE INDEX "Promo_status_idx" ON "public"."Promo"("status");

-- CreateIndex
CREATE INDEX "Promo_type_idx" ON "public"."Promo"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PromoUsage_orderId_key" ON "public"."PromoUsage"("orderId");

-- CreateIndex
CREATE INDEX "PromoUsage_promoId_idx" ON "public"."PromoUsage"("promoId");

-- CreateIndex
CREATE INDEX "PromoUsage_customerEmail_idx" ON "public"."PromoUsage"("customerEmail");

-- CreateIndex
CREATE INDEX "PromoUsage_orderId_idx" ON "public"."PromoUsage"("orderId");
