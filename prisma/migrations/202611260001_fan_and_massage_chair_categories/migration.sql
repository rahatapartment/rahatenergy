BEGIN;

UPDATE "ProductContent"
SET
  "category" = CASE "productId"
    WHEN 're-017' THEN 'Fans'
    WHEN 're-018' THEN 'Massage Chairs'
  END,
  "version" = "version" + 1,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "productId" IN ('re-017', 're-018')
  AND "category" = 'Energy Accessories';

COMMIT;
