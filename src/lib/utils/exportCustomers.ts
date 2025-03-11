import jsPDF from "jspdf";
import "jspdf-autotable";
import { type Customer } from "~/types/customers";

interface ExportProps {
  customers: Customer[];
}

export const handleExport = ({ customers }: ExportProps): boolean => {
  if (!customers || customers.length === 0) {
    return false; // No data to export
  }

  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Customer List", 14, 15);

  const tableColumns = ["Company", "Representative", "Contact", "Email"];
  const tableRows: any[] = [];

  customers.forEach((customer) => {
    const rowData = [
      customer.Personal_Details.company ?? "N/A",
      `${customer.Personal_Details.first_name ?? ""} ${customer.Personal_Details.last_name ?? ""}`.trim() ||
        "N/A",
      customer.Personal_Details.contact ?? "N/A",
      customer.Personal_Details.email ?? "N/A",
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

  doc.save("Customers_List.pdf");
  return true;
};
