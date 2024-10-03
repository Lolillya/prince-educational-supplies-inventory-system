/*
  Warnings:

  - The primary key for the `Customer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Address` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `CustomerId` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `PhoneNumber` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `orderOrderId` on the `Customer` table. All the data in the column will be lost.
  - The primary key for the `Supplier` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ContactInfo` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the column `SupplierId` on the `Supplier` table. All the data in the column will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseOrderProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Warehouse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductToSupplier` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[customer_Id]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supplier_Id]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `customer_Id` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personal_Details_Id` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_Id` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personal_Details_Id` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_Id` to the `Supplier` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplier_Id` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'EMPLOYEE');

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_orderOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_reportReportId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_InvoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_OrderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_OrderId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "fk_Product_Category";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "fk_Product_OrderProduct";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "fk_Product_PurchaseOrderProduct";

-- DropForeignKey
ALTER TABLE "PurchaseOrderProduct" DROP CONSTRAINT "PurchaseOrderProduct_purchaseOrderPurchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_auditLogLogId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_productProductID_fkey";

-- DropForeignKey
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_inventoryInventoryId_fkey";

-- DropForeignKey
ALTER TABLE "Warehouse" DROP CONSTRAINT "Warehouse_userUserId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSupplier" DROP CONSTRAINT "_ProductToSupplier_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToSupplier" DROP CONSTRAINT "_ProductToSupplier_B_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_pkey",
DROP COLUMN "Address",
DROP COLUMN "CustomerId",
DROP COLUMN "Name",
DROP COLUMN "PhoneNumber",
DROP COLUMN "orderOrderId",
ADD COLUMN     "customer_Id" INTEGER NOT NULL,
ADD COLUMN     "personal_Details_Id" TEXT NOT NULL,
ADD COLUMN     "role_Id" INTEGER NOT NULL,
ADD CONSTRAINT "Customer_pkey" PRIMARY KEY ("customer_Id");

-- AlterTable
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_pkey",
DROP COLUMN "ContactInfo",
DROP COLUMN "Name",
DROP COLUMN "SupplierId",
ADD COLUMN     "personal_Details_Id" TEXT NOT NULL,
ADD COLUMN     "role_Id" INTEGER NOT NULL,
ADD COLUMN     "supplier_Id" INTEGER NOT NULL,
ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY ("supplier_Id");

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Inventory";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderProduct";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "PurchaseOrder";

-- DropTable
DROP TABLE "PurchaseOrderProduct";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "Warehouse";

-- DropTable
DROP TABLE "_ProductToSupplier";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "Personal_Details" (
    "user_Id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "contact" INTEGER NOT NULL,
    "company" TEXT NOT NULL,
    "location_Id" INTEGER NOT NULL,
    "Notes" TEXT NOT NULL,

    CONSTRAINT "Personal_Details_pkey" PRIMARY KEY ("user_Id")
);

-- CreateTable
CREATE TABLE "Location" (
    "location_Id" SERIAL NOT NULL,
    "address_Line" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "State" TEXT NOT NULL,
    "Country" TEXT NOT NULL,
    "postal_Code" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("location_Id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_Id" INTEGER NOT NULL,
    "Role_name" "Roles" NOT NULL
);

-- CreateTable
CREATE TABLE "Admin" (
    "admin_Id" INTEGER NOT NULL,
    "personal_Details_Id" TEXT NOT NULL,
    "role_Id" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("admin_Id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "employee_Id" INTEGER NOT NULL,
    "personal_Details_Id" TEXT NOT NULL,
    "role_Id" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("employee_Id")
);

-- CreateTable
CREATE TABLE "Authentication" (
    "Authentication_Id" INTEGER NOT NULL,
    "personal_Details_Id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Authentication_pkey" PRIMARY KEY ("Authentication_Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Personal_Details_user_Id_key" ON "Personal_Details"("user_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Location_location_Id_key" ON "Location"("location_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_Id_key" ON "Role"("role_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_admin_Id_key" ON "Admin"("admin_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_Id_key" ON "Employee"("employee_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customer_Id_key" ON "Customer"("customer_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_supplier_Id_key" ON "Supplier"("supplier_Id");

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_personal_Details_Id_fkey" FOREIGN KEY ("personal_Details_Id") REFERENCES "Personal_Details"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_role_Id_fkey" FOREIGN KEY ("role_Id") REFERENCES "Role"("role_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_personal_Details_Id_fkey" FOREIGN KEY ("personal_Details_Id") REFERENCES "Personal_Details"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_role_Id_fkey" FOREIGN KEY ("role_Id") REFERENCES "Role"("role_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_personal_Details_Id_fkey" FOREIGN KEY ("personal_Details_Id") REFERENCES "Personal_Details"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_role_Id_fkey" FOREIGN KEY ("role_Id") REFERENCES "Role"("role_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_personal_Details_Id_fkey" FOREIGN KEY ("personal_Details_Id") REFERENCES "Personal_Details"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_role_Id_fkey" FOREIGN KEY ("role_Id") REFERENCES "Role"("role_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authentication" ADD CONSTRAINT "Authentication_personal_Details_Id_fkey" FOREIGN KEY ("personal_Details_Id") REFERENCES "Personal_Details"("user_Id") ON DELETE RESTRICT ON UPDATE CASCADE;
