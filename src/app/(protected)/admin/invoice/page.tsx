"use client";

import { Poppins } from "next/font/google";
import { Search, Ellipsis, ListFilter, Plus } from "lucide-react";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { useRouter } from "next/navigation";
import SearchBar from "../_components/search-bar";
import Filter from "../_components/filter";
import InvoiceRecord from "./_components/invoice-record";
import { WeekNumberLabel } from "react-day-picker";

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
    customer: "Adrian Huang",
    grandTotal: 2500.0,
    orderItems: [
      {
        variant: "Red - Large",
        item: "T-shirt",
        brand: "Brand A",
        quantity: 3,
        unit: "pcs",
        unitPrice: 250.0,
        discountValue: "5%",
        subtotal: 750.0,
      },
      {
        variant: "Blue - Medium",
        item: "Jeans",
        brand: "Brand B",
        quantity: 2,
        unit: "pcs",
        unitPrice: 600.0,
        discountValue: "10%",
        subtotal: 1200.0,
      },
      {
        variant: "Black - 42",
        item: "Shoes",
        brand: "Brand C",
        quantity: 1,
        unit: "pair",
        unitPrice: 550.0,
        discountValue: "0%",
        subtotal: 550.0,
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
          />
        </div>

        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <div className="flex w-full flex-col gap-3 p-3">
              <Label>#12345678 - September 29, 2024</Label>
              <div className="flex items-center gap-3">
                <Label className="text-slate-500">Customer | Term: 00.0</Label>
              </div>
            </div>

            <div className="relative flex items-center">
              <Separator orientation="vertical" className="my-4 h-16 w-[2px]" />
            </div>

            <div className="flex w-full items-center justify-between gap-3 p-3">
              <div className="flex flex-col gap-3">
                <Label className="text-slate-400">Grand Total</Label>
                <Label>₱ 0000.00</Label>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                    <Ellipsis color="gray" />
                  </div>
                </DialogTrigger>
                <DialogContent className="flex h-full max-h-[80%] w-full max-w-3xl flex-col">
                  <div className="w-full">
                    <span>#12345678 - September 29, 2024</span>
                  </div>

                  <div className="flex w-full items-center gap-3">
                    <div className="text-gray-400 flex w-full flex-col gap-1">
                      <Label>Business Name & Term</Label>
                      <div className="flex items-center">
                        <input
                            placeholder="Business Name"
                            className="rounded-l-xl rounded-r-none p-5"
                        />
                        <input
                            placeholder="30"
                            className="max-w-20 rounded-l-none rounded-r-xl p-5"
                        />
                      </div>
                    </div>

                    <div className="w text-gray-400 flex w-full flex-col gap-1">
                      <Label>Recorded by</Label>
                      <input
                          placeholder="Employee Name"
                          className="rounded-xl p-5"
                      />
                    </div>
                  </div>

                  <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Item - Brand - Variant</TableCell>
                          <TableCell>200</TableCell>
                          <TableCell>Boxes</TableCell>
                          <TableCell className="text-right">P 0000.00</TableCell>
                          <TableCell className="text-right">0%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="bottom-0 flex w-full justify-end">
                      <div className="flex items-center gap-3">
                        <span>TOTAL: 000000</span>
                        <Button
                            className="bg-[#FF7B7B] px-7 font-bold"
                            size={"lg"}
                        >
                          Save & Print
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 rounded-md bg-gray p-5">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
              <div className="flex flex-col gap-5">
                <div className="flex w-full items-center gap-3">
                  <Label>Brand</Label>
                  <Label> - </Label>
                  <Label>Item</Label>
                  <Label> - </Label>
                  <Label> Variant </Label>
                </div>

                <div className="flex w-full gap-2">
                  <Label>3 Unit</Label>
                  <Label>P 000.00</Label>
                  <Label>0% discount</Label>
                </div>
              </div>
            </div>

            <div className="flex w-1/2 items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="my-4 h-16 w-[2px]" />
                <div className="flex flex-col gap-3">
                  <Label className="text-slate-400">Grand Total</Label>
                  <Label>₱ 0000.00</Label>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                    <Ellipsis color="gray" />
                  </div>
                </DialogTrigger>
                <DialogContent className="flex h-full max-h-[80%] w-full max-w-3xl flex-col">
                  <div className="w-full">
                    <span>#12345678 - September 29, 2024</span>
                  </div>

                  <div className="flex w-full items-center gap-3">
                    <div className="text-gray-400 flex w-full flex-col gap-1">
                      <Label>Business Name & Term</Label>
                      <div className="flex items-center">
                        <input
                            placeholder="Business Name"
                            className="rounded-l-xl rounded-r-none p-5"
                        />
                        <input
                            placeholder="30"
                            className="max-w-20 rounded-l-none rounded-r-xl p-5"
                        />
                      </div>
                    </div>

                    <div className="w text-gray-400 flex w-full flex-col gap-1">
                      <Label>Recorded by</Label>
                      <input
                          placeholder="Employee Name"
                          className="rounded-xl p-5"
                      />
                    </div>
                  </div>

                  <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Item - Brand - Variant</TableCell>
                          <TableCell>200</TableCell>
                          <TableCell>Boxes</TableCell>
                          <TableCell className="text-right">P 0000.00</TableCell>
                          <TableCell className="text-right">0%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="bottom-0 flex w-full justify-end">
                      <div className="flex items-center gap-3">
                        <span>TOTAL: 000000</span>
                        <Button
                            className="bg-[#FF7B7B] px-7 font-bold"
                            size={"lg"}
                        >
                          Save & Print
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 rounded-md bg-gray p-5">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-md bg-[#D9D9D9]"></div>
              <div className="flex flex-col gap-5">
                <div className="flex w-full items-center gap-3">
                  <Label>Brand</Label>
                  <Label> - </Label>
                  <Label>Item</Label>
                  <Label> - </Label>
                  <Label> Variant </Label>
                </div>

                <div className="flex w-full gap-2">
                  <Label>3 Unit</Label>
                  <Label>P 000.00</Label>
                  <Label>0% discount</Label>
                </div>
              </div>
            </div>

            <div className="flex w-1/2 items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Separator orientation="vertical" className="my-4 h-16 w-[2px]" />
                <div className="flex flex-col gap-3">
                  <Label className="text-slate-400">Grand Total</Label>
                  <Label>₱ 0000.00</Label>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                    <Ellipsis color="gray" />
                  </div>
                </DialogTrigger>
                <DialogContent className="flex h-full max-h-[80%] w-full max-w-3xl flex-col">
                  <div className="w-full">
                    <span>#12345678 - September 29, 2024</span>
                  </div>

                  <div className="flex w-full items-center gap-3">
                    <div className="text-gray-400 flex w-full flex-col gap-1">
                      <Label>Business Name & Term</Label>
                      <div className="flex items-center">
                        <input
                            placeholder="Business Name"
                            className="rounded-l-xl rounded-r-none p-5"
                        />
                        <input
                            placeholder="30"
                            className="max-w-20 rounded-l-none rounded-r-xl p-5"
                        />
                      </div>
                    </div>

                    <div className="w text-gray-400 flex w-full flex-col gap-1">
                      <Label>Recorded by</Label>
                      <input
                          placeholder="Employee Name"
                          className="rounded-xl p-5"
                      />
                    </div>
                  </div>

                  <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Discount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Item - Brand - Variant</TableCell>
                          <TableCell>200</TableCell>
                          <TableCell>Boxes</TableCell>
                          <TableCell className="text-right">P 0000.00</TableCell>
                          <TableCell className="text-right">0%</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <div className="bottom-0 flex w-full justify-end">
                      <div className="flex items-center gap-3">
                        <span>TOTAL: 000000</span>
                        <Button
                            className="bg-[#FF7B7B] px-7 font-bold"
                            size={"lg"}
                        >
                          Save & Print
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex w-full justify-center">
            <Button
                size={"lg"}
                className="bg-transparent font-bold text-green shadow-none transition-all duration-300 hover:scale-110 hover:cursor-pointer hover:bg-transparent hover:shadow-md"
            >
              View All
            </Button>
          </div>
        </Card>
      </section>
  );
};

export default InvoicePage;