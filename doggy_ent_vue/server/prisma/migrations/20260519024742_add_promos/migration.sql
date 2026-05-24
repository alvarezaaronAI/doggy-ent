-- CreateEnum
CREATE TYPE "public"."PromoType" AS ENUM ('GLOBAL', 'UNIQUE', 'REFERRAL');

-- CreateEnum
CREATE TYPE "public"."PromoStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'DISABLED');

-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('FIXED', 'PERCENT');

-- CreateTable
CREATE TABLE "public"."Promo" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."PromoType" NOT NULL DEFAULT 'GLOBAL',
    "status" "public"."PromoStatus" NOT NULL DEFAULT 'DRAFT',
    "discountType" "public"."DiscountType" NOT NULL DEFAULT 'FIXED',
    "discountValue" DOUBLE PRECISION NOT NULL,
    "minimumSubtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usageLimitTotal" INTEGER,
    "usageLimitPerCustomer" INTEGER,
    "assignedCustomerEmail" TEXT,
    "referralOwnerName" TEXT,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "revenueGenerated" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discountGiven" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Promo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromoUsage" (
    "id" TEXT NOT NULL,
    "promoId" TEXT NOT NULL,
    "orderId" TEXT,
    "customerEmail" TEXT NOT NULL,
    "discountAmount" DOUBLE PRECISION NOT NULL,
    "subtotalAmount" DOUBLE PRECISION NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promo_code_key" ON "public"."Promo"("code");

-- AddForeignKey
ALTER TABLE "public"."PromoUsage" ADD CONSTRAINT "PromoUsage_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "public"."Promo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
