import jsPDF from "jspdf";
import "jspdf-autotable";
import type { InventoryItem } from "~/types/inventory";

interface ExportProps {
  inventory: InventoryItem[];
  includeNoStock: boolean;
}

export const handleExport = ({
  inventory,
  includeNoStock,
}: ExportProps): boolean => {
  try {
    if (!inventory || inventory.length === 0) {
      return false;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("ITEM MASTERLIST", 14, 15);

    const tableColumns = ["Description", "Unit", "SRP"];
    const tableRows: string[][] = [];

    // Sort inventory alphabetically by description
    const sortedInventory = [...inventory].sort((a, b) => {
      const descA = [
        a.variant.item.name,
        a.variant.item.brand.name,
        a.variant.name,
      ]
        .filter(Boolean)
        .join(" - ")
        .toLowerCase();
      const descB = [
        b.variant.item.name,
        b.variant.item.brand.name,
        b.variant.name,
      ]
        .filter(Boolean)
        .join(" - ")
        .toLowerCase();
      return descA.localeCompare(descB);
    });

    sortedInventory.forEach((item) => {
      const description = [
        item.variant.item.name,
        item.variant.item.brand.name,
        item.variant.name,
      ]
        .filter(Boolean)
        .join(" - ");

      const batchVariants = item.variant.BatchVariant || [];

      if (batchVariants.length === 0) {
        if (includeNoStock) {
          tableRows.push([description, "N/A", "N/A"]);
        }
        return;
      }

      batchVariants.forEach((batchVariant, batchIndex) => {
        const batchNumber = batchIndex + 1;
        const supplierUnits =
          batchVariant.batch?.batchVariants?.find(
            (bv) => bv.batch_variant_id === batchVariant.batch_variant_id,
          )?.SupplierUnit || [];

        if (supplierUnits.length === 0) {
          tableRows.push([description, `N/A(${batchNumber})`, "N/A"]);
        } else {
          supplierUnits.forEach((supplierUnit) => {
            const unitName = supplierUnit.unit?.name;
            const row = [
              description,
              unitName ? `${unitName}(${batchNumber})` : `N/A(${batchNumber})`,
              unitName ? `P${supplierUnit.price.toFixed(2)}` : "N/A",
            ];
            tableRows.push(row);
          });
        }
      });
    });

    if (tableRows.length === 0) {
      return false;
    }

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 25,
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [200, 200, 200], textColor: 0 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
      },
    });

    const date = new Date().toLocaleDateString().replace(/\//g, "-");
    doc.save(`Inventory_Masterlist_${date}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating masterlist:", error);
    return false;
  }
};
