"use client";

import { Plus } from "lucide-react";
import { Poppins } from "next/font/google";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
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

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InvoicePage = () => {
  const router = useRouter();

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

  const sampleInvoice: InvoiceProps = {
    invoiceId: 12345678,
    date: "September 21, 2024",
    customer: "Rich Adrian Huang",
    grandTotal: 2500.0,
    discountValue: '0%',
    orderItems: [
      {
        variant: 'Dustless Small',
        item: 'Eraser',
        brand: 'Joy',
        quantity: 15,
        unit: 'Boxes',
        unitPrice: 100,
        discountValue: '0%',
        subtotal: 1500,
      },
      {
        variant: 'Gel Fine Tip',
        item: 'Pen',
        brand: 'SmoothWrite',
        quantity: 20,
        unit: 'Packs',
        unitPrice: 50,
        discountValue: '10%',
        subtotal: 900,
      },
      {
        variant: 'A4',
        item: 'Notebook',
        brand: 'NotePro',
        quantity: 10,
        unit: 'Pieces',
        unitPrice: 120,
        discountValue: '5%',
        subtotal: 1140,
      },
      {
        variant: 'Plastic Cover',
        item: 'Book Cover',
        brand: 'CoverShield',
        quantity: 25,
        unit: 'Rolls',
        unitPrice: 80,
        discountValue: '0%',
        subtotal: 2000,
      },
      {
        variant: 'Neon Colors',
        item: 'Highlighter',
        brand: 'BrightMark',
        quantity: 30,
        unit: 'Sets',
        unitPrice: 75,
        discountValue: '15%',
        subtotal: 1912.5,
      },
    ],
  };

  return (
    <section className={`h-auto w-full ${poppins.className} flex flex-col gap-3 overflow-y-scroll py-10 px-20`}>
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <SearchBar />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("/admin/invoice/new-invoice")}
          className="bg-green hover:bg-green/80">
          <Plus strokeWidth={3} /> New Invoice
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <InvoiceRecord
          invoiceId={sampleInvoice.invoiceId}
          date={sampleInvoice.date}
          customer={sampleInvoice.customer}
          grandTotal={sampleInvoice.grandTotal}
          orderItems={sampleInvoice.orderItems}
          discountValue={sampleInvoice.discountValue}
        />
      </div>

      <Card>
        <CardContent className="flex w-full flex-col gap-3 rounded-lg p-5">
          <div className="flex items-center justify-between p-5">
            <div className="flex w-full flex-col justify-center">
              <span>#1233478 - September 20, 2024</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extralight text-textGray">
                  Customer | Term: 00
                </span>
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-3 border-l-2 pl-3">
                <span>Grand Total</span>
                <span>P 0000.00</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
            <div className="flex w-full flex-col gap-3">
              <span>#1233478 - September 20, 2024</span>
              <span className="text-sm text-textGray">
                3 Unit - P 0000.00 - 0% discount
              </span>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-3 border-l-2 pl-3">
                <span>Subtotal</span>
                <span>P 0000.00</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
            <div className="flex w-full flex-col gap-3">
              <span>#1233478 - September 20, 2024</span>
              <span className="text-sm text-textGray">
                3 Unit - P 0000.00 - 0% discount
              </span>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-3 border-l-2 pl-3">
                <span>Subtotal</span>
                <span>P 0000.00</span>
              </div>
            </div>
          </div>

          <div className="flex w-full justify-center p-5">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  size={"lg"}
                  variant={"link"}
                  className="font-bold shadow-none transition duration-300 hover:scale-110 hover:cursor-pointer"
                >
                  View All
                </Button>
              </DialogTrigger>
              <DialogContent className="flex h-full max-h-[80%] w-full max-w-3xl flex-col">
                <DialogTitle>#1233478 - Semptember 29, 2024</DialogTitle>

                <div className="flex w-full flex-col gap-3">
                  <div className="text-gray-400 flex flex-col gap-1">
                    <Label>Supplier</Label>
                    <Input placeholder="Supplier Name" />
                  </div>

                  <div className="w text-gray-400 flex flex-col gap-1">
                    <Label>Recorded by</Label>
                    <Input placeholder="Employee Name" />
                  </div>
                </div>

                <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Item - Brand - Variant</TableCell>
                        <TableCell>200</TableCell>
                        <TableCell>
                          Boxes{" "}
                          <Label className="text-textGray">3 Conversions</Label>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <div className="bottom-0 flex w-full justify-end">
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="font-bold">TOTAL: 000000</span>
                      <div className="flex items-center gap-3">
                        <Button size={"lg"} className="font-bold">
                          Close
                        </Button>
                        <Button className="bg-green px-7 font-bold" size={"lg"}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default InvoicePage;
