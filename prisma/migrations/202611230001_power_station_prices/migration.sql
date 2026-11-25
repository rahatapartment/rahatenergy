UPDATE "Inventory" AS inventory
SET "priceKobo" = prices.kobo,
    "version" = inventory."version" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
FROM (VALUES
    ('re-021', 12000000),
    ('re-022', 16000000),
    ('re-023', 26000000),
    ('re-024', 32500000),
    ('re-025', 61000000),
    ('re-026', 100000000)
) AS prices(product_id, kobo)
WHERE inventory."productId" = prices.product_id
  AND inventory."priceKobo" IS NULL;
