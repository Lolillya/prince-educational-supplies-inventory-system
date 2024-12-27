"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import InvoiceCard from "../_components/invoice-card";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useRouter } from "next/navigation";

const NewInvoice = () => {
  const router = useRouter();
  return (
    <section className={`flex h-auto w-screen flex-col gap-3 p-10`}>
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <ArrowLeft
                size={25}
                color="#00B69B"
                className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="flex flex-col items-center">
              <DialogTitle className="text-center">Confirm</DialogTitle>
              <div className="max-w-sm text-center">
                <span>
                  You have unsaved changes. Are you sure you want to leave this
                  page?
                </span>
              </div>

              <div className="flex w-full justify-center gap-2">
                <Button
                  className="border-2 border-green bg-transparent font-bold text-green"
                  size={"lg"}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-green font-bold"
                  size={"lg"}
                  onClick={() => router.push("/admin/invoice")}
                >
                  Leave
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <span className="font-bold">NEW INVOICE</span>
          <span className="text-gray-400 ml-3 text-sm font-light">#12345</span>
        </div>
      </div>

      <div className="relative flex h-auto w-full justify-center gap-3">
        <div className="relative flex w-2/3 items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-textGray" />
          <Input
            placeholder="Search"
            className="bg-gray p-6 pl-10 placeholder:text-textGray"
          />
        </div>
      </div>

      <div className="mt-4 grid auto-rows-auto grid-cols-3 gap-3 overflow-y-auto">
        {/* <InvoiceCard /> */}

        {/* CONDITIONAL RENDERING */}
        <Label className="w-full text-center">
          Search and add an item to get started.
        </Label>
      </div>

      <div className="right-0 z-[5] mt-auto flex w-full items-center justify-between gap-3 bg-white font-bold">
        <span>TOTAL: -----</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size={"lg"}
              className="bg-green py-8 text-sm font-bold text-white"
            >
              Confirm Resock
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-full max-h-[80%] w-full max-w-3xl flex-col">
            <DialogTitle>ORDER CONFIRMATION</DialogTitle>

            <div className="flex w-full flex-col gap-3">
              <div className="text-gray-400 flex flex-col gap-1">
                <Label>Customer & Term</Label>
                <div className="flex w-full items-center">
                  <Input
                    placeholder="Business Name"
                    className="w-[90%] rounded-r-none"
                  />
                  <Input placeholder="30" className="w-[10%] rounded-l-none" />
                </div>
              </div>
            </div>

            <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Item - Brand - Variant</TableCell>
                    <TableCell>200</TableCell>
                    <TableCell>Boxes</TableCell>
                    <TableCell>P 0000.00</TableCell>
                    <TableCell>0%</TableCell>
                    <TableCell>10000</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="bottom-0 flex w-full justify-end">
                <div className="flex items-center gap-3">
                  <span>TOTAL: 000000</span>
                  <Button className="bg-green px-7 font-bold" size={"lg"}>
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default NewInvoice;
