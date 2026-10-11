CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "altText" TEXT NOT NULL DEFAULT '',
    "folder" TEXT NOT NULL DEFAULT 'general',
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "thumbnailByteSize" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "createdByType" TEXT NOT NULL DEFAULT 'ADMIN_ENV',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MediaAsset_dimensions_check" CHECK ("width" > 0 AND "height" > 0),
    CONSTRAINT "MediaAsset_size_check" CHECK ("byteSize" > 0 AND "byteSize" <= 2097152 AND "thumbnailByteSize" > 0),
    CONSTRAINT "MediaAsset_type_check" CHECK ("mimeType" = 'image/webp')
);

CREATE TABLE "MediaAssetData" (
    "assetId" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "thumbnailBytes" BYTEA NOT NULL,
    CONSTRAINT "MediaAssetData_pkey" PRIMARY KEY ("assetId")
);

CREATE UNIQUE INDEX "MediaAsset_checksum_key" ON "MediaAsset"("checksum");
CREATE INDEX "MediaAsset_folder_createdAt_idx" ON "MediaAsset"("folder", "createdAt");
CREATE INDEX "MediaAsset_createdAt_id_idx" ON "MediaAsset"("createdAt", "id");
ALTER TABLE "MediaAssetData" ADD CONSTRAINT "MediaAssetData_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
