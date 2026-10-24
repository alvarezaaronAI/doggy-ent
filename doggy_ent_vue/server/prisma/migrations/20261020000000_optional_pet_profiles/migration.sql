CREATE TYPE "public"."PetLifeStage" AS ENUM ('PUPPY', 'ADULT', 'SENIOR');
CREATE TYPE "public"."PetSizeBand" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'GIANT');
CREATE TYPE "public"."PetProteinPreference" AS ENUM ('CHICKEN', 'BEEF', 'TURKEY', 'DUCK', 'LAMB', 'SALMON');
CREATE TYPE "public"."PetTreatPurpose" AS ENUM ('TRAINING', 'REWARD', 'ENRICHMENT', 'EVERYDAY');

CREATE TABLE "public"."Pet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" VARCHAR(60) NOT NULL,
    "lifeStage" "public"."PetLifeStage",
    "sizeBand" "public"."PetSizeBand",
    "proteinPreferences" "public"."PetProteinPreference"[] NOT NULL DEFAULT ARRAY[]::"public"."PetProteinPreference"[],
    "treatPurpose" "public"."PetTreatPurpose",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pet_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Pet_nickname_check" CHECK (char_length(btrim("nickname")) BETWEEN 1 AND 60),
    CONSTRAINT "Pet_proteinPreferences_check" CHECK (cardinality("proteinPreferences") <= 6)
);

CREATE INDEX "Pet_userId_createdAt_idx" ON "public"."Pet"("userId", "createdAt");

ALTER TABLE "public"."Pet" ADD CONSTRAINT "Pet_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
