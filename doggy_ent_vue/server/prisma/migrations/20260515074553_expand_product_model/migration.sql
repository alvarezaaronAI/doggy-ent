-- CreateEnum
CREATE TYPE "public"."SellingMode" AS ENUM ('MADE_TO_ORDER', 'INVENTORY_LIMITED', 'PREORDER');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "bestFor" TEXT,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "cut" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "freshness" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "ingredients" TEXT,
ADD COLUMN     "protein" TEXT,
ADD COLUMN     "sellingMode" "public"."SellingMode",
ADD COLUMN     "storageFeeding" TEXT,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "texture" TEXT;
