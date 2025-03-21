import jsPDF from "jspdf";
import "jspdf-autotable";

export interface LineItemsProp {
  line_items: {
    quantity: number;
    unit_price: number;
    total_price: number;
    discount: number;
    unit: { name: string };
    variant: {
      name: string;
      item: {
        name: string;
        brand: { name: string };
      };
    };
  }[];
  invoice_number: string;
  customer: string;
  date: Date;
  grandTotal: string;
}

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export const handleExport = ({
  line_items,
  invoice_number,
  customer,
  date,
  grandTotal,
}: LineItemsProp): void => {
  const margin = 10.16; // 0.4 inch in mm
  const pageWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const doc = new jsPDF({ unit: "mm" }); // Use millimeters

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });

  doc.setFontSize(10);

  // Draw a light gray rectangle border (no fill) around the header section
  const headerX = margin;
  const headerY = margin - 2;
  const headerWidth = pageWidth - 2 * margin;
  const headerHeight = 12; // Adjust based on your content

  doc.setDrawColor(211, 211, 211); // Light gray border
  doc.setLineWidth(0.2); // Thin border
  doc.rect(headerX, headerY, headerWidth, headerHeight); // Border only

  const headerPaddingX = margin + 3; // push right
  const headerPaddingY = margin + 2; // push down

  // Header Information
  doc.text(`CUSTOMER NAME: ${customer}`, headerPaddingX, headerPaddingY);
  doc.text(
    `TERM:                       30`,
    headerPaddingX,
    headerPaddingY + 5,
  );
  doc.text(
    `DR/INVOICE NO.: ${invoice_number}`,
    pageWidth - margin - 67,
    headerPaddingY,
  );
  doc.text(
    `DATE:                    ${formattedDate}`,
    pageWidth - margin - 67,
    headerPaddingY + 5,
  );
  const tableColumns = ["DESCRIPTION", "QTY", "UNIT", "UNIT PRICE", "TOTAL"];

  // Create the base rows
  const baseRows = line_items.map((item) => [
    `${item.variant.item.name} - ${item.variant.item.brand.name} - ${item.variant.name}`,
    item.quantity.toString(),
    item.unit.name,
    `${item.unit_price.toFixed(2)}`,
    `${item.total_price.toFixed(2)}`,
  ]);

  // const repeatedRows = Array(10).fill(baseRows).flat();

  // Add total row
  const totalRow = [
    "",
    "",
    "",
    { content: "*** TOTAL ***", styles: { fontStyle: "bold" } },
    { content: `${grandTotal}.00`, styles: { fontStyle: "bold" } },
  ];

  // Combine regular rows with total row
  const tableRows = [...baseRows, totalRow];

  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: margin + 12,
    theme: "plain",
    margin: { top: margin, bottom: margin, left: margin, right: margin },
    styles: {
      fontSize: 10,
      cellPadding: 1,
      lineColor: [211, 211, 211],
      lineWidth: 0,
    },
    headStyles: {
      fillColor: [230, 230, 230], // light gray background
      textColor: 0,
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
    },
    didDrawCell: (data: any) => {
      const { doc, cell, row, table } = data;
      const isLastRow = row.index === table.body.length - 1;

      if ((data.section === "body" || data.section === "head") && !isLastRow) {
        const lineY = cell.y + cell.height;
        doc.setLineWidth(0.1);
        doc.setDrawColor(211, 211, 211);
        doc.line(cell.x, lineY, cell.x + cell.width, lineY);
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || margin + 10;

  // Footer signatures section
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  // Common measurements
  const signatureWidth = 70;

  // Prepared by (Left side)
  const preparedByX = margin;
  doc.text("PREPARED BY:", preparedByX, finalY + 10);
  doc.line(preparedByX, finalY + 18, preparedByX + signatureWidth, finalY + 18);
  const preparedByTextWidth = doc.getTextWidth("SIGNATURE ABOVE PRINTED NAME");
  const preparedByTextX =
    preparedByX + signatureWidth / 2 - preparedByTextWidth / 2;
  doc.text("SIGNATURE ABOVE PRINTED NAME", preparedByTextX, finalY + 22);

  // Checked by (Below Prepared by)
  const checkedByY = finalY + 30;
  doc.text("CHECKED BY:", preparedByX, checkedByY);
  doc.line(
    preparedByX,
    checkedByY + 8,
    preparedByX + signatureWidth,
    checkedByY + 8,
  );
  const checkedByTextX =
    preparedByX + signatureWidth / 2 - preparedByTextWidth / 2;
  doc.text("SIGNATURE ABOVE PRINTED NAME", checkedByTextX, checkedByY + 12);

  // Received by (Right side)
  const receivedText = "RECEIVED THE ABOVE GOODS IN GOOD ORDER AND CONDITION:";
  const receivedTextWidth = doc.getTextWidth(receivedText);
  doc.text(receivedText, pageWidth - margin - receivedTextWidth, finalY + 10);

  const lineXStart = pageWidth - margin - 90;
  const lineXEnd = pageWidth - margin;
  doc.line(lineXStart, finalY + 18, lineXEnd, finalY + 18);

  const receivedTextX = (lineXStart + lineXEnd) / 2 - preparedByTextWidth / 2;
  doc.text("SIGNATURE ABOVE PRINTED NAME", receivedTextX, finalY + 22);

  doc.save(`invoice_${invoice_number}.pdf`);
};
