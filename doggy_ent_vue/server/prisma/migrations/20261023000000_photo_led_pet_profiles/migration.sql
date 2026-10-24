-- Additive only: retain existing pets, choices, scalar purpose and timestamps.
ALTER TYPE "public"."PetTreatPurpose" ADD VALUE 'BONDING' BEFORE 'EVERYDAY';

ALTER TABLE "public"."Pet"
    ADD COLUMN "treatPurposes" "public"."PetTreatPurpose"[] NOT NULL DEFAULT ARRAY[]::"public"."PetTreatPurpose"[],
    ADD COLUMN "breedId" VARCHAR(64),
    ADD COLUMN "isMixed" BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN "birthdayMonth" INTEGER,
    ADD COLUMN "birthdayDay" INTEGER,
    ADD COLUMN "birthdaySetAt" TIMESTAMP(3),
    ADD COLUMN "archivedAt" TIMESTAMP(3);

UPDATE "public"."Pet"
SET "treatPurposes" = ARRAY["treatPurpose"]
WHERE "treatPurpose" IS NOT NULL AND cardinality("treatPurposes") = 0;

ALTER TABLE "public"."Pet"
    ADD CONSTRAINT "Pet_breedId_check" CHECK ("breedId" IS NULL OR (char_length("breedId") BETWEEN 1 AND 64 AND "breedId" ~ '^[a-z0-9]+(-[a-z0-9]+)*$')),
    ADD CONSTRAINT "Pet_treatPurposes_check" CHECK (cardinality("treatPurposes") <= 5 AND array_position("treatPurposes", NULL) IS NULL),
    ADD CONSTRAINT "Pet_birthday_check" CHECK (
        ("birthdayMonth" IS NULL AND "birthdayDay" IS NULL AND "birthdaySetAt" IS NULL)
        OR ("birthdayMonth" IS NOT NULL AND "birthdayDay" IS NOT NULL AND "birthdaySetAt" IS NOT NULL
            AND "birthdayMonth" BETWEEN 1 AND 12 AND "birthdayDay" BETWEEN 1 AND
            CASE "birthdayMonth" WHEN 2 THEN 29 WHEN 4 THEN 30 WHEN 6 THEN 30 WHEN 9 THEN 30 WHEN 11 THEN 30 ELSE 31 END)
    );

CREATE INDEX "Pet_userId_archivedAt_createdAt_idx" ON "public"."Pet"("userId", "archivedAt", "createdAt");

CREATE TABLE "public"."PetPhoto" (
    "petId" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "contentType" VARCHAR(32) NOT NULL DEFAULT 'image/webp',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PetPhoto_pkey" PRIMARY KEY ("petId"),
    CONSTRAINT "PetPhoto_bytes_check" CHECK (octet_length("bytes") BETWEEN 1 AND 1048576),
    CONSTRAINT "PetPhoto_contentType_check" CHECK ("contentType" = 'image/webp'),
    CONSTRAINT "PetPhoto_petId_fkey" FOREIGN KEY ("petId") REFERENCES "public"."Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
