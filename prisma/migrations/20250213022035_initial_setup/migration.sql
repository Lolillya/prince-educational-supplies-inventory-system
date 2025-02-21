-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'EMPLOYEE', 'CUSTOMER', 'SUPPLIER');

-- CreateTable
CREATE TABLE "Location" (
    "location_id" SERIAL NOT NULL,
    "address_line" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "postal_code" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "Personal_Details" (
    "personal_details_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "contact" TEXT,
    "email" TEXT,
    "company" TEXT,
    "notes" TEXT,
    "location_id" INTEGER,

    CONSTRAINT "Personal_Details_pkey" PRIMARY KEY ("personal_details_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_Id" SERIAL NOT NULL,
    "Role_name" "Roles" NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_Id")
);

-- CreateTable
CREATE TABLE "User_Role" (
    "id" TEXT NOT NULL,
    "Personal_Details_Id" TEXT NOT NULL,
    "role_Id" INTEGER NOT NULL,
    "emoji" TEXT NOT NULL DEFAULT '👑',

    CONSTRAINT "User_Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Authentication" (
    "authentication_id" SERIAL NOT NULL,
    "personal_details_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Authentication_pkey" PRIMARY KEY ("authentication_id")
);

-- CreateTable
CREATE TABLE "Authentication_Log" (
    "log_id" SERIAL NOT NULL,
    "personal_details_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Authentication_Log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "brand_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("brand_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "unit_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "Item" (
    "item_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "discount_id" INTEGER,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "Variant" (
    "variant_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discount_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("variant_id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "batch_id" SERIAL NOT NULL,
    "batch_code" TEXT,
    "quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "restock_clerk" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("batch_id")
);

-- CreateTable
CREATE TABLE "BatchVariant" (
    "batch_variant_id" SERIAL NOT NULL,
    "batch_id" INTEGER NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "BatchVariant_pkey" PRIMARY KEY ("batch_variant_id")
);

-- CreateTable
CREATE TABLE "SupplierUnit" (
    "supplier_unit_id" SERIAL NOT NULL,
    "batch_variant_id" INTEGER NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity_per_unit" INTEGER NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "discount_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierUnit_pkey" PRIMARY KEY ("supplier_unit_id")
);

-- CreateTable
CREATE TABLE "ConversionRate" (
    "conversion_id" SERIAL NOT NULL,
    "supplier_unit_id" INTEGER NOT NULL,
    "from_unit_id" INTEGER NOT NULL,
    "to_unit_id" INTEGER NOT NULL,
    "conversion_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversionRate_pkey" PRIMARY KEY ("conversion_id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "inventory_id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("inventory_id")
);

-- CreateTable
CREATE TABLE "StockLevel" (
    "stock_level_id" SERIAL NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "low_stock" INTEGER NOT NULL,
    "very_low_stock" INTEGER NOT NULL,
    "restock_alert" BOOLEAN NOT NULL DEFAULT false,
    "last_notification_sent" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockLevel_pkey" PRIMARY KEY ("stock_level_id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "discount_id" SERIAL NOT NULL,
    "discount_type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "applies_to" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "variant_id" INTEGER,
    "unit_id" INTEGER,
    "item_id" INTEGER,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("discount_id")
);

-- CreateTable
CREATE TABLE "Inventory_Log" (
    "log_id" SERIAL NOT NULL,
    "item_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_Log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "invoice_id" SERIAL NOT NULL,
    "invoice_number" SERIAL NOT NULL,
    "notes" TEXT,
    "customer_id" TEXT NOT NULL,
    "invoice_clerk" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discount" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "payment_term_id" INTEGER NOT NULL,
    "user_RoleId" TEXT,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "Line_Item" (
    "line_item_id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "sub_total" DOUBLE PRECISION,

    CONSTRAINT "Line_Item_pkey" PRIMARY KEY ("line_item_id")
);

-- CreateTable
CREATE TABLE "Payment_Term" (
    "payment_term_id" SERIAL NOT NULL,
    "term_name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_Term_pkey" PRIMARY KEY ("payment_term_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_method" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "Payment_Log" (
    "payment_log_id" SERIAL NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_Log_pkey" PRIMARY KEY ("payment_log_id")
);

-- CreateTable
CREATE TABLE "History_Log" (
    "history_log_id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "user_id" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "History_Log_pkey" PRIMARY KEY ("history_log_id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "favorite_id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "variant_id" INTEGER,
    "contact_id" TEXT,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("favorite_id")
);

-- CreateTable
CREATE TABLE "Pin" (
    "pin_id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "invoice_id" INTEGER,
    "batch_id" INTEGER,

    CONSTRAINT "Pin_pkey" PRIMARY KEY ("pin_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_Id_key" ON "Role"("role_Id");

-- CreateIndex
CREATE UNIQUE INDEX "User_Role_Personal_Details_Id_key" ON "User_Role"("Personal_Details_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_personal_details_id_key" ON "Authentication"("personal_details_id");

-- CreateIndex
CREATE UNIQUE INDEX "Authentication_username_key" ON "Authentication"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_name_key" ON "Unit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batch_code_key" ON "Batch"("batch_code");

-- CreateIndex
CREATE UNIQUE INDEX "StockLevel_variant_id_key" ON "StockLevel"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoice_number_key" ON "Invoice"("invoice_number");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_Term_term_name_key" ON "Payment_Term"("term_name");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_user_id_variant_id_key" ON "Favorite"("user_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_user_id_contact_id_key" ON "Favorite"("user_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_user_id_invoice_id_key" ON "Pin"("user_id", "invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_user_id_batch_id_key" ON "Pin"("user_id", "batch_id");

-- AddForeignKey
ALTER TABLE "Personal_Details" ADD CONSTRAINT "Personal_Details_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Role" ADD CONSTRAINT "User_Role_Personal_Details_Id_fkey" FOREIGN KEY ("Personal_Details_Id") REFERENCES "Personal_Details"("personal_details_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Role" ADD CONSTRAINT "User_Role_role_Id_fkey" FOREIGN KEY ("role_Id") REFERENCES "Role"("role_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authentication" ADD CONSTRAINT "Authentication_personal_details_id_fkey" FOREIGN KEY ("personal_details_id") REFERENCES "Personal_Details"("personal_details_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authentication_Log" ADD CONSTRAINT "Authentication_Log_personal_details_id_fkey" FOREIGN KEY ("personal_details_id") REFERENCES "Personal_Details"("personal_details_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("brand_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "Discount"("discount_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "Discount"("discount_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_restock_clerk_fkey" FOREIGN KEY ("restock_clerk") REFERENCES "User_Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchVariant" ADD CONSTRAINT "BatchVariant_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("batch_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchVariant" ADD CONSTRAINT "BatchVariant_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "Variant"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierUnit" ADD CONSTRAINT "SupplierUnit_batch_variant_id_fkey" FOREIGN KEY ("batch_variant_id") REFERENCES "BatchVariant"("batch_variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierUnit" ADD CONSTRAINT "SupplierUnit_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "Discount"("discount_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierUnit" ADD CONSTRAINT "SupplierUnit_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "User_Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplierUnit" ADD CONSTRAINT "SupplierUnit_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversionRate" ADD CONSTRAINT "ConversionRate_from_unit_id_fkey" FOREIGN KEY ("from_unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversionRate" ADD CONSTRAINT "ConversionRate_supplier_unit_id_fkey" FOREIGN KEY ("supplier_unit_id") REFERENCES "SupplierUnit"("supplier_unit_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversionRate" ADD CONSTRAINT "ConversionRate_to_unit_id_fkey" FOREIGN KEY ("to_unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "Variant"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLevel" ADD CONSTRAINT "StockLevel_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "Variant"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory_Log" ADD CONSTRAINT "Inventory_Log_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "Item"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory_Log" ADD CONSTRAINT "Inventory_Log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User_Role"("Personal_Details_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "User_Role"("Personal_Details_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_invoice_clerk_fkey" FOREIGN KEY ("invoice_clerk") REFERENCES "User_Role"("Personal_Details_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_payment_term_id_fkey" FOREIGN KEY ("payment_term_id") REFERENCES "Payment_Term"("payment_term_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_user_RoleId_fkey" FOREIGN KEY ("user_RoleId") REFERENCES "User_Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Line_Item" ADD CONSTRAINT "Line_Item_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Line_Item" ADD CONSTRAINT "Line_Item_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "Unit"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Line_Item" ADD CONSTRAINT "Line_Item_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "Variant"("variant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment_Log" ADD CONSTRAINT "Payment_Log_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment_Log" ADD CONSTRAINT "Payment_Log_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "Payment"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History_Log" ADD CONSTRAINT "History_Log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User_Role"("Personal_Details_Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User_Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "Variant"("variant_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "User_Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User_Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "Invoice"("invoice_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("batch_id") ON DELETE SET NULL ON UPDATE CASCADE;
