-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('Test', 'tset1');

-- CreateTable
CREATE TABLE "public"."Order" (
    "OrderId" SERIAL NOT NULL,
    "OrderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("OrderId")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "InvoiceId" SERIAL NOT NULL,
    "IssueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "TotalAmount" DECIMAL(65,30) NOT NULL,
    "DiscountApplied" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("InvoiceId")
);

-- CreateTable
CREATE TABLE "public"."OrderProduct" (
    "OrderProductId" SERIAL NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "OrderId" INTEGER NOT NULL,

    CONSTRAINT "OrderProduct_pkey" PRIMARY KEY ("OrderProductId")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "ProductID" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "WarehousePrice" DECIMAL(65,30) NOT NULL,
    "SpecialPrice" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("ProductID")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "CategoryId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Descripion" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("CategoryId")
);

-- CreateTable
CREATE TABLE "public"."PurchaseOrderProduct" (
    "PurchaseOrderProductId" SERIAL NOT NULL,
    "Quanity" INTEGER NOT NULL,
    "purchaseOrderPurchaseOrderId" INTEGER,

    CONSTRAINT "PurchaseOrderProduct_pkey" PRIMARY KEY ("PurchaseOrderProductId")
);

-- CreateTable
CREATE TABLE "public"."PurchaseOrder" (
    "PurchaseOrderId" SERIAL NOT NULL,
    "OrderDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("PurchaseOrderId")
);

-- CreateTable
CREATE TABLE "public"."Supplier" (
    "SupplierId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "ContactInfo" TEXT NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("SupplierId")
);

-- CreateTable
CREATE TABLE "public"."Warehouse" (
    "WarehouseId" SERIAL NOT NULL,
    "Address" TEXT NOT NULL,
    "userUserId" INTEGER,
    "inventoryInventoryId" INTEGER,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("WarehouseId")
);

-- CreateTable
CREATE TABLE "public"."Customer" (
    "CustomerId" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "PhoneNumber" TEXT NOT NULL,
    "Address" TEXT NOT NULL,
    "orderOrderId" INTEGER,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("CustomerId")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "UserId" SERIAL NOT NULL,
    "Username" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    "auditLogLogId" INTEGER,
    "productProductID" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserId")
);

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "LogId" SERIAL NOT NULL,
    "Action" TEXT NOT NULL,
    "Timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("LogId")
);

-- CreateTable
CREATE TABLE "public"."Inventory" (
    "InventoryId" SERIAL NOT NULL,
    "Location" TEXT NOT NULL,
    "LastUpdated" TIMESTAMP(3) NOT NULL,
    "reportReportId" INTEGER,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("InventoryId")
);

-- CreateTable
CREATE TABLE "public"."Report" (
    "ReportId" SERIAL NOT NULL,
    "ReportDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("ReportId")
);

-- CreateTable
CREATE TABLE "public"."_ProductToSupplier" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToSupplier_AB_unique" ON "public"."_ProductToSupplier"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToSupplier_B_index" ON "public"."_ProductToSupplier"("B");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "public"."Warehouse"("WarehouseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invoice" ADD CONSTRAINT "Invoice_InvoiceId_fkey" FOREIGN KEY ("InvoiceId") REFERENCES "public"."Order"("OrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderProduct" ADD CONSTRAINT "OrderProduct_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "public"."Order"("OrderId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "fk_Product_OrderProduct" FOREIGN KEY ("ProductID") REFERENCES "public"."OrderProduct"("OrderProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "fk_Product_Category" FOREIGN KEY ("ProductID") REFERENCES "public"."Category"("CategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "fk_Product_PurchaseOrderProduct" FOREIGN KEY ("ProductID") REFERENCES "public"."PurchaseOrderProduct"("PurchaseOrderProductId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PurchaseOrderProduct" ADD CONSTRAINT "PurchaseOrderProduct_purchaseOrderPurchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderPurchaseOrderId") REFERENCES "public"."PurchaseOrder"("PurchaseOrderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Warehouse" ADD CONSTRAINT "Warehouse_userUserId_fkey" FOREIGN KEY ("userUserId") REFERENCES "public"."User"("UserId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Warehouse" ADD CONSTRAINT "Warehouse_inventoryInventoryId_fkey" FOREIGN KEY ("inventoryInventoryId") REFERENCES "public"."Inventory"("InventoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Customer" ADD CONSTRAINT "Customer_orderOrderId_fkey" FOREIGN KEY ("orderOrderId") REFERENCES "public"."Order"("OrderId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_auditLogLogId_fkey" FOREIGN KEY ("auditLogLogId") REFERENCES "public"."AuditLog"("LogId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_productProductID_fkey" FOREIGN KEY ("productProductID") REFERENCES "public"."Product"("ProductID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Inventory" ADD CONSTRAINT "Inventory_reportReportId_fkey" FOREIGN KEY ("reportReportId") REFERENCES "public"."Report"("ReportId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToSupplier" ADD CONSTRAINT "_ProductToSupplier_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Product"("ProductID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProductToSupplier" ADD CONSTRAINT "_ProductToSupplier_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Supplier"("SupplierId") ON DELETE CASCADE ON UPDATE CASCADE;
