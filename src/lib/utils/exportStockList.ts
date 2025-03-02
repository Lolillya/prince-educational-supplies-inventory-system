import type { InventoryItem } from "~/types/inventory";
import jsPDF from "jspdf";
import "jspdf-autotable";

interface ExportStockListOptions {
  inventory: InventoryItem[];
  includeOutOfStock?: boolean;
  onlyOutOfStock?: boolean;
}

export const handleExport = ({
  inventory,
  includeOutOfStock = true,
  onlyOutOfStock = false,
}: ExportStockListOptions): boolean => {
  try {
    if (!inventory || inventory.length === 0) return false;

    // Filter based on stock options
    let filteredInventory = inventory;
    if (!includeOutOfStock) {
      filteredInventory = inventory.filter((item) => {
        const totalQuantity =
          item.variant.BatchVariant?.reduce(
            (sum, bv) => sum + (bv.quantity || 0),
            0,
          ) || 0;
        return totalQuantity > 0;
      });
    } else if (onlyOutOfStock) {
      filteredInventory = inventory.filter((item) => {
        const totalQuantity =
          item.variant.BatchVariant?.reduce(
            (sum, bv) => sum + (bv.quantity || 0),
            0,
          ) || 0;
        return totalQuantity === 0;
      });
    }

    if (filteredInventory.length === 0) return false;

    // Transform data for export
    const tableData = filteredInventory.flatMap((item) => {
      // Get all BatchVariants for this item
      const batchVariants = item.variant.BatchVariant || [];

      // If no batch variants, return single row
      if (batchVariants.length === 0) {
        return [
          [
            `${item.variant.item.name} - ${item.variant.item.brand.name}${item.variant.name ? ` - ${item.variant.name}` : ""} (1)`,
            "N/A",
            0,
          ],
        ];
      }

      // Map each batch variant to a row with its individual quantity
      return batchVariants.map((batchVariant, index) => {
        // Get the first SupplierUnit for this batch variant from the nested structure
        const supplierUnits =
          batchVariant.batch?.batchVariants?.find(
            (bv) => bv.batch_variant_id === batchVariant.batch_variant_id,
          )?.SupplierUnit || [];
        const mainSupplierUnit = supplierUnits[0];
        const unitName = mainSupplierUnit?.unit?.name || "N/A";

        return [
          `${item.variant.item.name} - ${item.variant.item.brand.name}${item.variant.name ? ` - ${item.variant.name}` : ""} (${index + 1})`,
          unitName,
          batchVariant.quantity || 0,
        ];
      });
    });

    // Create PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(12);
    doc.text(
      `Inventory Stock List${onlyOutOfStock ? " (Out of Stock)" : ""}`,
      14,
      15,
    );

    // Add generation date
    const generationDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${generationDate}`, 14, 22);

    // Add table
    doc.autoTable({
      head: [["Description", "Unit", "Quantity"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
      },
    });

    // Save the PDF
    const date = new Date().toLocaleDateString().replace(/\//g, "-");
    doc.save(`Inventory_StockList_${date}.pdf`);
    return true;
  } catch (error) {
    console.error("Error exporting stock list:", error);
    return false;
  }
};
