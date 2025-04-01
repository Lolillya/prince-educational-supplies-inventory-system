"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";

import { LoadingSpinner } from "~/components/loading";
import { api } from "~/trpc/react";
import Filter from "../_components/filter";
import SearchBar from "../_components/search-bar";
import InvoiceRecord from "./_components/invoice-record";

import { type LineItemsProp } from "~/lib/utils/exportInvoice";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "~/components/ui/scroll-area";
import { toast } from "~/hooks/use-toast";
export type InvoiceProps = {
  voidPending: boolean;
  status: string;
  invoice_number: number;
  invoice_id: number;
  date: Date;
  customer: string;
  invoiceClerk: string;
  grandTotal: number;
  notes: string;
  line_items: LineItemsProp["line_items"];
  voidInvoice: (invoice_id: number) => void;
};

const InvoicePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchParams = useSearchParams();
  const clerkId = searchParams.get("clerkId");
  const customerId = searchParams.get("customerId");

  const { data: invoiceData, isLoading } = api.invoice.getInvoice.useQuery(
    clerkId ? { clerkId } : customerId ? { customerId } : undefined,
  );

  const { mutateAsync: voidInvoice, isPending: voidPending } =
    api.invoice.voidInvoice.useMutation({
      onSuccess: (data) => {
        console.log("invoice voided!", data);
        window.location.reload();
        toast({
          title: "Success",
          description: "Invoice Voided successfully!",
          variant: "default",
          className: "bg-green text-white",
        });
      },
    });

  const handleVoidInvoice = (invoice_id: number) => {
    voidInvoice(invoice_id);
  };

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

  return (
    <>
      <section className={`flex h-auto w-full flex-col gap-3 pt-10`}>
        <div className="flex items-center justify-between px-20">
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
          <div className="grid grid-cols-2 gap-4 px-20 pb-10">
            {filteredInvoices
              ?.sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .map((invoice, index) => (
                <InvoiceRecord
                  voidPending={voidPending}
                  status={invoice.status}
                  voidInvoice={handleVoidInvoice}
                  key={index}
                  invoice_number={invoice.invoice_number}
                  invoice_id={invoice.invoice_id}
                  date={invoice.created_at}
                  customer={invoice.customer.Personal_Details.company ?? ""}
                  invoiceClerk={
                    invoice.invoiceClerk.Personal_Details.first_name +
                    " " +
                    invoice.invoiceClerk.Personal_Details.last_name
                  }
                  grandTotal={invoice.total_amount}
                  line_items={invoice.line_items}
                  notes={invoice.notes ?? "No customer notes."}
                />
              ))}
          </div>
        </ScrollArea>
      </section>
    </>
  );
};

export default InvoicePage;
