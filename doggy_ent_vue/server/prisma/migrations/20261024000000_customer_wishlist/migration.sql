CREATE TABLE "public"."WishlistItem" (
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("userId", "productId")
);

CREATE INDEX "WishlistItem_userId_createdAt_idx" ON "public"."WishlistItem"("userId", "createdAt");

ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
