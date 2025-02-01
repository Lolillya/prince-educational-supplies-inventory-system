"use client";

import { Plus } from "lucide-react";
import { Poppins } from "next/font/google";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Filter from "../_components/filter";
import SearchBar from "../_components/search-bar";
import InvoiceRecord from "./_components/invoice-record";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/loading";

export type InvoiceProps = {
  invoiceId: string;
  date: Date;
  customer: string;
  grandTotal: number;
  discountValue: number | null;
  line_items: {
    quantity: number;
    unit_price: number;
    total_price: number;
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
};

type Invoices = InvoiceProps[];

const InvoicePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data: invoiceData, isLoading } = api.invoice.getInvoice.useQuery();
  // TODO: SEARCH FEATURE

  if (isLoading)
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );

  return (
    <section
      className={`flex h-auto w-full flex-col gap-3 overflow-y-scroll px-20 py-10`}
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

      <div className="mt-5 flex flex-col gap-4">
        {/* {filteredInvoices.map((invoice, index) => (
          <InvoiceRecord
            key={index}
            invoiceId={invoice.invoiceId}
            date={invoice.date}
            customer={invoice.customer}
            grandTotal={invoice.grandTotal}
            orderItem={invoice.orderItem}
            discountValue={invoice.discountValue}
          />
        ))} */}
        {invoiceData?.map((invoice, index) => (
          <InvoiceRecord
            key={index}
            invoiceId={invoice.invoice_number}
            date={invoice.created_at}
            customer={
              invoice.customer.Personal_Details.first_name +
              " " +
              invoice.customer.Personal_Details.last_name
            }
            grandTotal={invoice.total_amount}
            line_items={invoice.line_items}
            discountValue={invoice.discount}
          />
        ))}
        {/* {filteredInvoices.length === 0 && (
          <p className="text-center text-slate-500">No invoices found.</p>
        )} */}
      </div>
    </section>
  );
};

export default InvoicePage;
