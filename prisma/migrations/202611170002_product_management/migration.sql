-- Editable presentation data is separate from immutable identities/order snapshots.
CREATE TABLE "ProductContent" (
  "productId" TEXT PRIMARY KEY REFERENCES "Product"("id") ON DELETE RESTRICT,
  "name" TEXT NOT NULL, "description" TEXT NOT NULL, "category" TEXT NOT NULL,
  "images" TEXT[] NOT NULL, "specifications" JSONB NOT NULL,
  "seoTitle" TEXT NOT NULL, "seoDescription" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_content_values" CHECK ("version" >= 0 AND cardinality("images") BETWEEN 1 AND 20 AND length("name") BETWEEN 2 AND 150)
);
CREATE TABLE "ProductImage" (
  "id" TEXT PRIMARY KEY, "data" BYTEA NOT NULL, "thumbnail" BYTEA NOT NULL,
  "medium" BYTEA NOT NULL, "width" INTEGER NOT NULL, "height" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_image_values" CHECK ("id" ~ '^[a-f0-9]{64}$' AND "width" BETWEEN 1 AND 1600 AND "height" BETWEEN 1 AND 1600 AND octet_length("data") <= 2000000)
);
ALTER TABLE "ProductContent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProductImage" ENABLE ROW LEVEL SECURITY;
