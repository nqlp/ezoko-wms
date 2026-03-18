-- CreateEnum
CREATE TYPE "Activity" AS ENUM ('Correction', 'Goods RECEIPT', 'Movement', 'Putaway', 'Picking', 'Goods Issue', 'Inv Counting');

-- CreateTable
CREATE TABLE "store_integration" (
    "store_domain" TEXT NOT NULL DEFAULT 'ezokofishing.myshopify.com',
    "access_token" TEXT NOT NULL,

    CONSTRAINT "store_integration_pkey" PRIMARY KEY ("store_domain")
);

-- CreateTable
CREATE TABLE "stock_movement_logs" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT,
    "activity" "Activity" NOT NULL,
    "barcode" TEXT,
    "variant_title" TEXT,
    "src_location" TEXT,
    "src_qty" INTEGER,
    "destination_location" TEXT,
    "destination_qty" INTEGER,
    "reference_doc" TEXT,

    CONSTRAINT "stock_movement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "shopify_user_id" TEXT NOT NULL,
    "shopify_user_email" TEXT NOT NULL,
    "shopify_user_name" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "po_header" (
    "po_number" BIGSERIAL NOT NULL,
    "vendor" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "creation_user" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "import_duties" BOOLEAN NOT NULL DEFAULT false,
    "Import_type" TEXT NOT NULL DEFAULT 'NO_IMPORT',
    "expected_date" DATE,
    "shipping_fees" DECIMAL(12,2),
    "shipping_fees_currency" CHAR(3) DEFAULT 'CAD',
    "Notes" TEXT,

    CONSTRAINT "po_header_pkey" PRIMARY KEY ("po_number")
);

-- CreateTable
CREATE TABLE "po_item" (
    "po_number" BIGINT NOT NULL,
    "po_item" INTEGER NOT NULL,
    "product_title" TEXT NOT NULL,
    "variant_title" TEXT NOT NULL,
    "sku" TEXT,
    "order_qty" INTEGER NOT NULL DEFAULT 1,
    "received_qty" INTEGER DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "unit_cost" DECIMAL(12,2),
    "last_receiving_Date" TIMESTAMPTZ(6),
    "last_modification" TIMESTAMPTZ(6) NOT NULL,
    "last_modification_user" TEXT NOT NULL,

    CONSTRAINT "po_item_pkey" PRIMARY KEY ("po_number","po_item")
);

-- CreateTable
CREATE TABLE "shop_installation" (
    "shop" TEXT NOT NULL,
    "encrypted_access_token" TEXT NOT NULL,
    "scopes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shop_installation_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "shopify_vendor_cache" (
    "shop" TEXT NOT NULL,
    "vendors" JSONB NOT NULL,
    "refreshed_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "shopify_vendor_cache_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "user_prefs" (
    "shop" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "filters" JSONB,
    "sorting" JSONB,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_prefs_pkey" PRIMARY KEY ("shop","user_id")
);

-- CreateTable
CREATE TABLE "po_shop_scope" (
    "po_number" BIGINT NOT NULL,
    "shop" TEXT NOT NULL,

    CONSTRAINT "po_shop_scope_pkey" PRIMARY KEY ("po_number")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_shopify_user_id_key" ON "user_sessions"("shopify_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_session_token_key" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_session_token_idx" ON "user_sessions"("session_token");

-- CreateIndex
CREATE INDEX "user_sessions_shopify_user_id_idx" ON "user_sessions"("shopify_user_id");

-- CreateIndex
CREATE INDEX "po_header_vendor_idx" ON "po_header"("vendor");

-- CreateIndex
CREATE INDEX "po_header_status_idx" ON "po_header"("status");

-- CreateIndex
CREATE INDEX "po_header_created_at_idx" ON "po_header"("created_at");

-- CreateIndex
CREATE INDEX "po_header_expected_date_idx" ON "po_header"("expected_date");

-- CreateIndex
CREATE INDEX "po_item_po_number_idx" ON "po_item"("po_number");

-- CreateIndex
CREATE INDEX "po_item_po_item_idx" ON "po_item"("po_item");

-- CreateIndex
CREATE INDEX "po_item_product_title_idx" ON "po_item"("product_title");

-- CreateIndex
CREATE INDEX "po_item_variant_title_idx" ON "po_item"("variant_title");

-- CreateIndex
CREATE INDEX "po_item_sku_idx" ON "po_item"("sku");

-- CreateIndex
CREATE INDEX "po_item_status_idx" ON "po_item"("status");

-- CreateIndex
CREATE INDEX "po_shop_scope_shop_idx" ON "po_shop_scope"("shop");

-- AddForeignKey
ALTER TABLE "po_item" ADD CONSTRAINT "po_item_po_number_fkey" FOREIGN KEY ("po_number") REFERENCES "po_header"("po_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "po_shop_scope" ADD CONSTRAINT "po_shop_scope_po_number_fkey" FOREIGN KEY ("po_number") REFERENCES "po_header"("po_number") ON DELETE CASCADE ON UPDATE CASCADE;
