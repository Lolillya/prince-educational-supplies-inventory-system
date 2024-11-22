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
    <section
      className={`mb-20 flex h-auto w-screen flex-col gap-3 overflow-y-scroll p-10`}
    >
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
          <Search className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 transform" />
          <Input
            placeholder="Search"
            className="bg-gray p-5 pl-10 placeholder-slate-500"
          />
        </div>
      </div>

      <div className="mt-4 grid auto-rows-auto grid-cols-3 gap-3">
        <InvoiceCard />
        <InvoiceCard />
        <InvoiceCard />
        <InvoiceCard />
        <InvoiceCard />
        <InvoiceCard />
      </div>

      <div className="absolute bottom-0 right-0 z-[5] flex w-full items-center justify-end gap-3 bg-white px-10 py-5 font-bold drop-shadow-2xl">
        <span>TOTAL: -----</span>
        {/* <Dialog>
          <DialogTrigger asChild>
            <Button size={"lg"} className="bg-green py-8 text-xl font-bold">
              Confirm Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h- flex w-full max-w-sm flex-col p-10">
            <DialogTitle className="text-center">VERIFY IT'S YOU</DialogTitle>

            <div className="flex flex-col gap-1">
              <Label className="text-gray-400 ml-3">Password</Label>
              <Input
                placeholder="Enter Password"
                type="password"
                className="p-6 text-xs"
              />
            </div>

            <div className="flex w-full justify-center">
              <Button
                size={"lg"}
                className="bg-green p-6 text-lg font-bold text-white"
              >
                Continue
              </Button>
            </div>
          </DialogContent>
        </Dialog> */}
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
