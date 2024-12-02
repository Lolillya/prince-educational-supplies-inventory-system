"use client";

import { Search, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import StockCard from "../_components/stock-card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Label } from "~/components/ui/label";

const InvoiceAddStock = () => {
  const router = useRouter();
  return (
    <section className={`flex h-auto w-screen flex-col gap-3 p-10`}>
      <div className="border-b-100 relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-1">
          <Dialog>
            <DialogTrigger>
              <ArrowLeft
                size={25}
                color="#00B69B"
                className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
              />
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogTitle className="text-center">Confirm</DialogTitle>
              <div className="flex flex-col gap-3 text-center">
                <span>
                  You have unsaved changes. Are you sure you want to leave this
                  page?
                </span>
                <div className="flex items-center justify-center gap-3">
                  <Button className="border-2 border-green bg-transparent font-bold text-green">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => router.push("/admin/restock")}
                    className="bg-green font-bold"
                  >
                    Leave
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <span className="font-bold">ADD STOCK</span>
          <span className="text-gray-400 ml-3 text-sm font-light">#12345</span>
        </div>
      </div>

      <div className="flex w-full justify-center gap-3">
        <div className="relative flex w-full max-w-md items-center justify-center">
          <Search className="text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 transform" />
          <Input placeholder="Search" className="bg-gray p-5 pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StockCard />
        <StockCard />
        <StockCard />
        <StockCard />
        <StockCard />
      </div>

      <div className="right-0 z-[5] mt-auto flex w-full items-center justify-between gap-3 bg-white font-bold">
        <span>TOTAL: 0000.00</span>
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
            <DialogTitle>RESTOCK CONFIRMATION</DialogTitle>

            <div className="flex w-full flex-col gap-3">
              <div className="text-gray-400 flex flex-col gap-1">
                <Label>Supplier</Label>
                <Input placeholder="Supplier Name" />
              </div>
            </div>

            <div className="flex h-full w-full flex-col justify-between overflow-y-scroll">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Structure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Item - Brand - Variant</TableCell>
                    <TableCell>200</TableCell>
                    <TableCell>Boxes (10 Cases ( 20 Pieces ))</TableCell>
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

export default InvoiceAddStock;
