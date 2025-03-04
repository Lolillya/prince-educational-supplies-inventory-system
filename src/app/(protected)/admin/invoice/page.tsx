"use client";

import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Filter from "../_components/filter";
import SearchBar from "../_components/search-bar";
import InvoiceRecord from "./_components/invoice-record";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/loading";

import jsPDF from "jspdf";
import "jspdf-autotable";
import { ScrollArea } from "~/components/ui/scroll-area";

export type InvoiceProps = {
  invoiceId: number;
  date: Date;
  customer: string;
  invoiceClerk: string;
  grandTotal: number;

  line_items: {
    quantity: number;
    unit_price: number;
    total_price: number;
    discount: number;
    unit: {
      name: string;
    };
    variant: {
      name: string;
      item: {
        name: string;
        brand: {
          name: string;
        };
      };
    };
  }[];
  handleExport: (invoiceData: LineItemsProp) => void;
};

export type LineItemsProp = {
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
};

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const InvoicePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data: invoiceData, isLoading } = api.invoice.getInvoice.useQuery();

  const filteredInvoices = invoiceData?.filter((invoice) => {
    const invoice_number = invoice.invoice_number.toString();
    const company = invoice.customer.Personal_Details.company?.toLowerCase();
    const first_name =
      invoice.customer.Personal_Details.first_name?.toLowerCase();
    const last_name =
      invoice.customer.Personal_Details.last_name?.toLowerCase();
    const invoiceClerk =
      (invoice.invoiceClerk.Personal_Details.first_name?.toLowerCase() ?? "") +
      (invoice.invoiceClerk.Personal_Details.last_name?.toLowerCase() ?? "");
    const dateMonth = invoice.created_at
      .toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      .toLowerCase();

    return (
      invoice_number.includes(searchTerm.toLowerCase()) ||
      company?.includes(searchTerm.toLowerCase()) ||
      first_name?.includes(searchTerm.toLowerCase()) ||
      last_name?.includes(searchTerm.toLowerCase()) ||
      invoiceClerk.includes(searchTerm.toLowerCase()) ||
      dateMonth.includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading)
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );

  const handleExport = ({
                          line_items,
                          invoice_number,
                          customer,
                          date,
                          grandTotal,
                        }: LineItemsProp) => {
    const margin = 10.16; // 0.4 inch in mm
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const doc = new jsPDF({ unit: "mm" }); // Use millimeters

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });

    doc.setFontSize(12);

    // Header Information
    doc.text(`Customer Name: ${customer}`, margin, margin);
    doc.text(`TERM: 30`, margin, margin + 7);
    doc.text(`DR/Invoice No.: ${invoice_number}`, pageWidth - margin - 50, margin);
    doc.text(`DATE: ${formattedDate}`, pageWidth - margin - 50, margin + 7);

    const tableColumns = ["DESCRIPTION", "QTY UNIT", "UNIT PRICE", "TOTAL"];

    const tableRows = line_items.map((item) => [
      `${item.variant.item.name} - ${item.variant.item.brand.name} - ${item.variant.name}`,
      item.quantity.toString(),
      `${item.unit_price.toFixed(2)}`,
      `${item.total_price}`,
    ]);

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: margin + 20,
      theme: "plain", // Removes the grid lines
      margin: { top: margin, bottom: margin, left: margin, right: margin },
      styles: {
        fontSize: 10,
        cellPadding: 1,
        lineColor: [255, 255, 255], // Makes lines transparent (white)
        lineWidth: 0,

      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: 0,
        lineWidth: 0,
        cellPadding:5,
        cellWidth: 6
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || margin + 20;

    // Footer
    doc.setFont("helvetica", "bold");
    const totalText = "*** TOTAL ***";
    const totalAmount = `${grandTotal}.00`;

    const totalTextWidth = doc.getTextWidth(totalText);
    const totalAmountWidth = doc.getTextWidth(totalAmount);

    doc.text(totalText, pageWidth - margin - totalAmountWidth - totalTextWidth - 30, finalY + 10);
    doc.text(totalAmount, pageWidth - margin - totalAmountWidth - 25, finalY + 10);

    doc.setFont("helvetica", "normal");
    doc.text(
        "RECEIVED THE ABOVE GOODS IN GOOD ORDER AND CONDITION:",
        margin,
        finalY + 20
    );
    doc.line(margin, finalY + 40, margin + 70, finalY + 40);
    doc.setFontSize(8);
    doc.text("PRINT NAME AND SIGN ABOVE NAME", margin, finalY + 45);

    doc.save(`invoice_${invoice_number}.pdf`);
  };


  return (
    <section
      className={`flex h-auto w-full flex-col gap-3 pt-10`}
    >
      <div className="flex px-20 items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("/admin/invoice/new-invoice")}
          className="bg-green hover:bg-green/80"
        >
          <Plus strokeWidth={3} /> New Invoice
        </Button>
      </div>

      <ScrollArea className="mt-5">
        <div className="grid grid-cols-2 px-20 gap-4 pb-10">
        {filteredInvoices
          ?.sort()
          ?.reverse()
          .map((invoice, index) => (
            <InvoiceRecord
              key={index}
              invoiceId={invoice.invoice_number}
              date={invoice.created_at}
              customer={invoice.customer.Personal_Details.company ?? ""}
              invoiceClerk={
                invoice.invoiceClerk.Personal_Details.first_name +
                " " +
                invoice.invoiceClerk.Personal_Details.last_name
              }
              grandTotal={invoice.total_amount}
              line_items={invoice.line_items}
              handleExport={handleExport}
            />
          ))}
        </div>
      </ScrollArea>
    </section>
  );
};

export default InvoicePage;
