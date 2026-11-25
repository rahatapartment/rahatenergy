UPDATE "DeliveryOption"
SET "enabled" = false, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'payment-test-no-delivery' AND "enabled";

UPDATE "Inventory"
SET "enabled" = false, "version" = "version" + 1, "updatedAt" = CURRENT_TIMESTAMP
WHERE "productId" = 're-027' AND "enabled";
