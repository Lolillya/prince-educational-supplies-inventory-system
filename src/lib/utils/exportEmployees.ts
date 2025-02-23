import jsPDF from "jspdf";
import "jspdf-autotable";
import { Employee } from "~/types/employees";

interface ExportProps {
  employees: Employee[];
}

export const handleExport = ({ employees }: ExportProps): boolean => {
  if (!employees || employees.length === 0) {
    return false; // No data to export
  }

  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text("Employee List", 14, 15);

  const tableColumns = ["Name", "Contact", "Email"];
  const tableRows: any[] = [];

  employees.forEach((employee) => {
    const rowData = [
      `${employee.Personal_Details.first_name ?? ""} ${employee.Personal_Details.last_name ?? ""}`.trim() ||
        "N/A",
      employee.Personal_Details.contact ?? "N/A",
      employee.Personal_Details.email ?? "N/A",
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
  });

  doc.save("Employees_List.pdf");
  return true;
};
