ALTER TABLE "public"."Pet"
  ADD COLUMN "weightGrams" INTEGER,
  ADD COLUMN "weightUnit" VARCHAR(2),
  ADD COLUMN "weightUpdatedAt" TIMESTAMP(3),
  ADD CONSTRAINT "Pet_weight_check" CHECK (
    ("weightGrams" IS NULL AND "weightUnit" IS NULL AND "weightUpdatedAt" IS NULL)
    OR ("weightGrams" IS NOT NULL AND "weightGrams" BETWEEN 100 AND 250000
      AND "weightUnit" IS NOT NULL AND "weightUnit" IN ('LB', 'KG') AND "weightUpdatedAt" IS NOT NULL)
  );
