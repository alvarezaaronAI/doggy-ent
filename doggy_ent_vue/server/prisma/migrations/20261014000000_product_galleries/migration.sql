ALTER TABLE "Product"
  ADD COLUMN "galleryImages" JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN "isTestProduct" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Product" ADD CONSTRAINT "Product_galleryImages_limit"
  CHECK (jsonb_typeof("galleryImages") = 'array' AND jsonb_array_length("galleryImages") <= 4);
