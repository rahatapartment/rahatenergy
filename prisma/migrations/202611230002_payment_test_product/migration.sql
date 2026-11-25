BEGIN;

ALTER TABLE "Product" DROP CONSTRAINT "fixed_catalogue_identity";
ALTER TABLE "Product" ADD CONSTRAINT "fixed_catalogue_identity" CHECK (
  "id" ~ '^re-0(0[1-9]|1[0-9]|2[0-7])$' AND "sku" = upper("id")
);

INSERT INTO "Product" ("id", "sku") VALUES ('re-027', 'RE-027');
INSERT INTO "Inventory" ("productId", "priceKobo", "stock", "enabled", "updatedAt")
VALUES ('re-027', 20000, 10, true, CURRENT_TIMESTAMP);

INSERT INTO "DeliveryOption" ("id", "label", "method", "pickupAddress", "feeKobo", "enabled", "updatedAt")
VALUES ('payment-test-no-delivery', 'Payment test only', 'PICKUP', 'No collection required', 0, true, CURRENT_TIMESTAMP);

COMMIT;
