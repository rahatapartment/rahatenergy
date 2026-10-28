-- AlterTable
ALTER TABLE "InventoryMovement" ADD COLUMN     "reservedDelta" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "checkoutHash" TEXT,
ADD COLUMN     "checkoutKey" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "authorizationUrl" TEXT,
ADD COLUMN     "initializationState" TEXT NOT NULL DEFAULT 'NEW';

-- CreateTable
CREATE TABLE "DeliveryOption" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "state" TEXT,
    "city" TEXT,
    "pickupAddress" TEXT,
    "feeKobo" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "firstAttemptAt" TIMESTAMP(3),
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "lockToken" TEXT,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "providerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_eventKey_key" ON "Notification"("eventKey");

-- CreateIndex
CREATE INDEX "Notification_sentAt_nextAttemptAt_idx" ON "Notification"("sentAt", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_checkoutKey_key" ON "Order"("checkoutKey");

ALTER TABLE "DeliveryOption" ADD CONSTRAINT "delivery_option_values" CHECK ("feeKobo" >= 0 AND "method" IN ('DELIVERY','PICKUP') AND (("method"='DELIVERY' AND "state" IS NOT NULL) OR ("method"='PICKUP' AND "pickupAddress" IS NOT NULL)));
ALTER TABLE "Order" ADD CONSTRAINT "order_states" CHECK ("paymentStatus" IN ('PENDING','INITIATED','PAID','FAILED','CANCELLED','REFUNDED') AND "fulfillmentStatus" IN ('PENDING','PROCESSING','READY_FOR_PICKUP','DISPATCHED','DELIVERED','CANCELLED','PAYMENT_REVIEW'));
ALTER TABLE "Payment" ADD CONSTRAINT "payment_initialization_state" CHECK ("initializationState" IN ('NEW','IN_PROGRESS','READY','FAILED'));
-- Keep customer and payment tables inaccessible through Supabase's public Data API.
-- Prisma uses the server-side database role; no browser Supabase client is used.
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Inventory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryMovement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Customer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Delivery" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quotation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderEvent" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryReservation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DeliveryOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
