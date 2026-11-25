INSERT INTO "DeliveryOption"
  ("id", "label", "method", "state", "pickupAddress", "feeKobo", "enabled", "updatedAt")
VALUES
  ('lekki-phase-1-pickup', 'Pickup in Lekki Phase 1', 'PICKUP', NULL, 'Lekki Phase 1, Lagos', 0, true, CURRENT_TIMESTAMP),
  ('lagos-delivery-pay-on-arrival', 'Lagos delivery (fee quoted by courier and paid on arrival)', 'DELIVERY', 'Lagos', NULL, 0, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
