BEGIN;

ALTER TABLE "Product" DROP CONSTRAINT "fixed_catalogue_identity";
ALTER TABLE "Product" ADD CONSTRAINT "fixed_catalogue_identity" CHECK (
  "id" ~ '^re-0(0[1-9]|1[0-9]|2[0-8])$' AND "sku" = upper("id")
);

INSERT INTO "Product" ("id", "sku") VALUES ('re-028', 'RE-028');
INSERT INTO "Inventory" ("productId", "priceKobo", "stock", "enabled", "updatedAt")
VALUES ('re-028', 20000, 10, true, CURRENT_TIMESTAMP);

COMMIT;
