"use client";

import { Plus } from "lucide-react";
import { Poppins } from "next/font/google";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";

import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import Filter from "../_components/filter";
import SearchBar from "../_components/search-bar";
import InvoiceRecord from "./_components/invoice-record";
import { useState } from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InvoicePage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<String>("");

  interface InvoiceProps {
    invoiceId: number;
    date: string;
    customer: string;
    grandTotal: number;
    discountValue: string;
    orderItems: {
      variant: string;
      item: string;
      brand: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      discountValue: string;
      subtotal: number;
    }[];
  }

  type Invoices = InvoiceProps[];

  const sampleInvoice: Invoices = [
    {
      invoiceId: 12345678,
      date: "September 21, 2024",
      customer: "Rich Adrian Huang",
      grandTotal: 2500.0,
      discountValue: "0%",
      orderItems: [
        {
          variant: "Dustless Small",
          item: "Eraser",
          brand: "Joy",
          quantity: 15,
          unit: "Boxes",
          unitPrice: 100,
          discountValue: "0%",
          subtotal: 1500,
        },
        {
          variant: "Gel Fine Tip",
          item: "Pen",
          brand: "SmoothWrite",
          quantity: 20,
          unit: "Packs",
          unitPrice: 50,
          discountValue: "10%",
          subtotal: 900,
        },
        {
          variant: "A4",
          item: "Notebook",
          brand: "NotePro",
          quantity: 10,
          unit: "Pieces",
          unitPrice: 120,
          discountValue: "5%",
          subtotal: 1140,
        },
        {
          variant: "Plastic Cover",
          item: "Book Cover",
          brand: "CoverShield",
          quantity: 25,
          unit: "Rolls",
          unitPrice: 80,
          discountValue: "0%",
          subtotal: 2000,
        },
      ],
    },
    {
      invoiceId: 12345678,
      date: "September 21, 2024",
      customer: "Jerald Dagaang",
      grandTotal: 2500.0,
      discountValue: "0%",
      orderItems: [
        {
          variant: "Dustless Small",
          item: "Eraser",
          brand: "Joy",
          quantity: 15,
          unit: "Boxes",
          unitPrice: 100,
          discountValue: "0%",
          subtotal: 1500,
        },
        {
          variant: "Gel Fine Tip",
          item: "Pen",
          brand: "SmoothWrite",
          quantity: 20,
          unit: "Packs",
          unitPrice: 50,
          discountValue: "10%",
          subtotal: 900,
        },
        {
          variant: "A4",
          item: "Notebook",
          brand: "NotePro",
          quantity: 10,
          unit: "Pieces",
          unitPrice: 120,
          discountValue: "5%",
          subtotal: 1140,
        },
      ],
    },
  ];

  return (
    <section
      className={`h-auto w-full ${poppins.className} flex flex-col gap-3 overflow-y-scroll px-20 py-10`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchBar />
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
        {sampleInvoice.map((invoice, index) => (
          <InvoiceRecord
            key={index}
            invoiceId={invoice.invoiceId}
            date={invoice.date}
            customer={invoice.customer}
            grandTotal={invoice.grandTotal}
            orderItems={invoice.orderItems}
            discountValue={invoice.discountValue}
          />
        ))}
      </div>
    </section>
  );
};

export default InvoicePage;
