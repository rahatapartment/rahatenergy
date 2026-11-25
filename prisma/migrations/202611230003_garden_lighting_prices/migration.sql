UPDATE "Inventory" AS inventory
SET "priceKobo" = prices.kobo,
    "version" = inventory."version" + 1,
    "updatedAt" = CURRENT_TIMESTAMP
FROM (VALUES
    ('re-019', 130000000),
    ('re-020', 24000000)
) AS prices(product_id, kobo)
WHERE inventory."productId" = prices.product_id
  AND inventory."priceKobo" IS DISTINCT FROM prices.kobo;
