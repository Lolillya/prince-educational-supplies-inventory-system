import jsPDF from "jspdf";
import "jspdf-autotable";
import type { RouterOutputs } from "~/trpc/shared";

interface ItemState {
  selectedBatchId?: string;
  selectedUnitName?: string;
  price: string;
}

interface ExportProps {
  selectedItems: RouterOutputs["inventory"]["listInventory"];
  itemStates: Record<string, ItemState>;
}

export const handleExport = ({
  selectedItems,
  itemStates,
}: ExportProps): boolean => {
  try {
    if (!selectedItems || selectedItems.length === 0) {
      return false;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(14);
    doc.text("ITEM PRICELIST", 14, 15);

    // Add generation date
    const generationDate = new Date().toLocaleDateString();
    doc.setFontSize(10);
    doc.text(`Generated on: ${generationDate}`, 14, 22);

    // Create array with indices and sort based on description
    const sortedItems = [...selectedItems]
      .map((item, index) => ({
        item,
        index,
        description: [
          item.variant.item.name,
          item.variant.item.brand.name,
          item.variant.name,
        ]
          .filter(Boolean)
          .join(" - ")
          .toLowerCase(),
      }))
      .sort((a, b) => a.description.localeCompare(b.description));

    // Group items by description and unit, tracking unique prices
    const groupedItems = sortedItems.reduce(
      (acc, { item, index }) => {
        const itemKey = `${item.variant.id}-${index}`;
        const state = itemStates[itemKey];
        const description = [
          item.variant.item.name,
          item.variant.item.brand.name,
          item.variant.name,
        ]
          .filter(Boolean)
          .join(" - ");

        const unit =
          state?.selectedUnitName === "unit"
            ? "N/A"
            : state?.selectedUnitName || "N/A";
        const price = state?.price
          ? `P${parseFloat(state.price).toFixed(2)}`
          : "N/A";

        const key = `${description}|${unit}`;

        if (!acc[key]) {
          acc[key] = {
            description,
            unit,
            prices: new Set([price]),
          };
        } else {
          acc[key].prices.add(price);
        }

        return acc;
      },
      {} as Record<
        string,
        { description: string; unit: string; prices: Set<string> }
      >,
    );

    // Create final table data
    const tableData = Object.values(groupedItems)
      .map(({ description, unit, prices }) => {
        if (prices.size === 1) {
          // If there's only one price, show as single row
          return [[description, unit, Array.from(prices)[0]]];
        } else {
          // If there are different prices, add indices
          return Array.from(prices).map((price, idx) => [
            description,
            `${unit}(${idx + 1})`,
            price,
          ]);
        }
      })
      .flat();

    // Add table
    doc.autoTable({
      head: [["Description", "Unit", "SRP"]],
      body: tableData,
      startY: 30,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 40 },
        2: { cellWidth: 30 },
      },
    });

    // Save the PDF
    const date = new Date().toLocaleDateString().replace(/\//g, "-");
    doc.save(`Inventory_PriceList_${date}.pdf`);
    return true;
  } catch (error) {
    console.error("Error exporting price list:", error);
    return false;
  }
};
