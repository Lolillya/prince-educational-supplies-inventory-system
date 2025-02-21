import jsPDF from "jspdf";
import "jspdf-autotable";
import { Supplier } from "~/types/suppliers";

interface ExportProps {
  suppliers: Supplier[];
}

export const handleExport = ({ suppliers }: ExportProps): boolean => {
  if (!suppliers || suppliers.length === 0) {
    return false; // Indicate failure
  }

  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Supplier List", 14, 15);

  const tableColumns = ["Company", "Representative", "Contact", "Email"];
  const tableRows: any[] = [];

  suppliers.forEach((supplier) => {
    const rowData = [
      supplier.Personal_Details.company ?? "N/A",
      `${supplier.Personal_Details.first_name ?? ""} ${supplier.Personal_Details.last_name ?? ""}`.trim() ||
        "N/A",
      supplier.Personal_Details.contact ?? "N/A",
      supplier.Personal_Details.email ?? "N/A",
    ];
    tableRows.push(rowData);
  });

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: 25,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [200, 200, 200], textColor: 0 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 50 },
    },
  });

  doc.save("Suppliers_List.pdf");
  return true;
};
