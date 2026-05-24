-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "address1" TEXT,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "saveInfo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zip" TEXT;
