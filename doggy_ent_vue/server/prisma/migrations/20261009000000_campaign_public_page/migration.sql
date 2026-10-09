ALTER TABLE "Campaign"
ADD COLUMN "story" TEXT,
ADD COLUMN "beneficiaryUrl" TEXT,
ADD COLUMN "imageAlt" TEXT,
ADD COLUMN "publicPageEnabled" BOOLEAN NOT NULL DEFAULT false;
