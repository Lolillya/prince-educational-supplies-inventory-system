import jsPDF from "jspdf";
import "jspdf-autotable";
import type { InventoryItem } from "~/types/inventory";

interface ExportProps {
  inventory: InventoryItem[];
}

export const handleExport = ({ inventory }: ExportProps): boolean => {
  if (!inventory || inventory.length === 0) {
    return false;
  }

  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Inventory Masterlist", 14, 15);

  const tableColumns = ["Item", "Brand", "Variant"];
  const tableRows: string[][] = [];

  for (const item of inventory) {
    const rowData = [
      item.variant.item.name,
      item.variant.item.brand.name,
      item.variant.name ?? "N/A",
    ];
    tableRows.push(rowData);
  }

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: 25,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [200, 200, 200], textColor: 0 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 40 },
      2: { cellWidth: 100 },
    },
  });

  doc.save("Inventory_Masterlist.pdf");
  return true;
};
