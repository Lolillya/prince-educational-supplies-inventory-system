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
    const doc = new jsPDF();
    // const formatCurrency = (amount: number) =>
    //   `₱${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    const fomattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    });

    doc.setFontSize(12);
    doc.text(`Customer Code: INSERT CODE`, 14, 15);
    doc.text(`Customer Name: ${customer}`, 14, 22);
    doc.text(`TERM: 30`, 14, 29);

    doc.text(`DR/Invoice No.: ${invoice_number}`, 160, 15);
    doc.text(`DATE: ${fomattedDate}`, 160, 22);

    const tableColumns = [
      "DESCRIPTION",
      "QTY UNIT",
      "UNIT PRICE",
      "DISCOUNT",
      "TOTAL",
    ];

    const tableRows = line_items.map((item) => [
      `${item.variant.item.brand.name} - ${item.variant.item.name} - ${item.variant.name}`,
      item.quantity.toString(),
      `${item.unit_price}`,
      `${item.discount}`,
      `${item.total_price}`,
    ]);

    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 40,
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
        0: { cellWidth: 80 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFont("helvetica", "bold");
    doc.text("*** TOTAL ***", 14, finalY + 10);
    doc.text(`${grandTotal}.00`, 160, finalY + 10);

    doc.setFont("helvetica", "normal");
    doc.text(
      "RECEIVED THE ABOVE GOODS IN GOOD ORDER AND CONDITION:",
      14,
      finalY + 20,
    );
    doc.line(14, finalY + 25, 80, finalY + 25);
    doc.setFontSize(8);
    doc.text("FRINT NAME AND SIGN ABOVE NAME", 14, finalY + 30);

    doc.save(`invoice_${invoice_number}.pdf`);
  };

  return (
    <section
      className={`flex h-auto w-full flex-col gap-3 overflow-y-scroll px-20 pt-10`}
    >
      <div className="flex items-center justify-between">
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

      <div className="mt-5 grid grid-cols-2 gap-4 overflow-y-scroll rounded-lg">
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
    </section>
  );
};

export default InvoicePage;
