import jsPDF from "jspdf";
import "jspdf-autotable";
import type { InventoryItem } from "~/types/inventory";

interface ExportProps {
  inventory: InventoryItem[];
  stockFilters: {
    sufficient: boolean;
    low: boolean;
    veryLow: boolean;
    noStock: boolean;
  };
}

const getStockLevel = (
  stockLevel: { low_stock: number; very_low_stock: number } | null,
  inventoryQuantity: number,
): string => {
  if (!stockLevel) return "good";
  if (inventoryQuantity === 0) return "empty";
  if (inventoryQuantity <= stockLevel.very_low_stock) return "very low";
  if (inventoryQuantity <= stockLevel.low_stock) return "low";
  return "good";
};

export const handleExport = ({
  inventory,
  stockFilters,
}: ExportProps): boolean => {
  try {
    if (!inventory || inventory.length === 0) {
      return false;
    }

    // Filter inventory based on stock levels
    const filteredInventory = inventory.filter((item) => {
      const stockStatus = getStockLevel(item.variant.StockLevel, item.quantity);

      return (
        (stockFilters.sufficient && stockStatus === "good") ||
        (stockFilters.low && stockStatus === "low") ||
        (stockFilters.veryLow && stockStatus === "very low") ||
        (stockFilters.noStock && stockStatus === "empty")
      );
    });

    if (filteredInventory.length === 0) {
      return false;
    }

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("INVENTORY STOCKLIST", 14, 15);

    // Add generation date
    const generationDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${generationDate}`, 14, 22);

    const tableColumns = ["Description", "Unit", "Quantity"];
    const tableRows: string[][] = [];

    // Sort inventory alphabetically
    const sortedInventory = [...filteredInventory].sort((a, b) => {
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

    // Group items by description and unit
    const groupedItems = sortedInventory.reduce(
      (acc, item) => {
        const description = [
          item.variant.item.name,
          item.variant.item.brand.name,
          item.variant.name,
        ]
          .filter(Boolean)
          .join(" - ");

        const batchVariants = item.variant.BatchVariant || [];

        if (batchVariants.length === 0) {
          const key = `${description}|N/A`;
          if (!acc[key]) {
            acc[key] = {
              description,
              unit: "N/A",
              quantities: new Set(["0"]),
            };
          }
          return acc;
        }

        batchVariants.forEach((batchVariant) => {
          const supplierUnits =
            batchVariant.batch?.batchVariants?.find(
              (bv) => bv.batch_variant_id === batchVariant.batch_variant_id,
            )?.SupplierUnit || [];

          if (supplierUnits.length === 0) {
            const key = `${description}|N/A`;
            if (!acc[key]) {
              acc[key] = {
                description,
                unit: "N/A",
                quantities: new Set(["0"]),
              };
            }
          } else {
            supplierUnits.forEach((supplierUnit) => {
              const unitName = supplierUnit.unit?.name || "N/A";
              const key = `${description}|${unitName}`;
              const quantity = batchVariant.quantity?.toString() || "0";

              if (!acc[key]) {
                acc[key] = {
                  description,
                  unit: unitName,
                  quantities: new Set([quantity]),
                };
              } else {
                acc[key].quantities.add(quantity);
              }
            });
          }
        });

        return acc;
      },
      {} as Record<
        string,
        { description: string; unit: string; quantities: Set<string> }
      >,
    );

    // Create final table data
    Object.values(groupedItems).forEach(({ description, unit, quantities }) => {
      if (quantities.size === 1) {
        tableRows.push([description, unit, Array.from(quantities)[0]]);
      } else {
        Array.from(quantities).forEach((quantity, idx) => {
          tableRows.push([description, `${unit}(${idx + 1})`, quantity]);
        });
      }
    });

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
    doc.save(`Inventory_StockList_${date}.pdf`);
    return true;
  } catch (error) {
    console.error("Error generating stock list:", error);
    return false;
  }
};
