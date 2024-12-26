"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

import { Ellipsis, Plus } from "lucide-react";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import RestockRecord from "./_components/restock-record";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface RestockProps {
  restockId: number;
  date: string;
  supplier: string;
  addedStock: number;
  restockItems: {
    variant: string;
    item: string;
    brand: string;
    quantity: number;
    mainUnit: string;
    unitConversion: {
      from: string;
      count: number;
      to: string;
    }[];
  }[];
}

const sampleRestock: RestockProps = {
  restockId: 12345678,
  date: "December 21, 2024",
  supplier: "Rich Adrian Huang",
  addedStock: 500,
  restockItems: [
    {
      variant: "Dustless Small",
      item: "Eraser",
      brand: "Joy",
      quantity: 100,
      mainUnit: "Boxes",
      unitConversion: [
        { from: "Cartons", count: 20, to: "Boxes" },
        { from: "Boxes", count: 5, to: "Pieces" },
      ],
    },
    {
      variant: "Gel Finetip",
      item: "Pen",
      brand: "Smoothwrite",
      quantity: 20,
      mainUnit: "Boxes",
      unitConversion: [
        { from: "Boxes", count: 10, to: "Pieces" },
      ],
    },
    {
      variant: "A4",
      item: "Notebook",
      brand: "Notepro",
      quantity: 300,
      mainUnit: "Pieces",
      unitConversion: [
        { from: "Pieces", count: 1, to: "Pieces" },
      ],
    },
    {
      variant: 'Plastic Cover',
      item: 'Book Cover',
      brand: 'CoverShield',
      quantity: 50,
      mainUnit: "Cartons",
      unitConversion: [
        { from: "Cartons", count: 10, to: "Pieces" },
      ],
    },
    {
      variant: 'Neon Colors',
      item: 'Highlighter',
      brand: 'BrightMark',
      quantity: 30,
      mainUnit: "Boxes",
      unitConversion: [
        { from: "Boxes", count: 10, to: "Cases" },
      ],
    },
  ],
};

const RestockPage = () => {

  const router = useRouter();

  return (

      <section className={`h-auto w-full ${poppins.className} flex flex-col gap-3 overflow-y-scroll py-10 px-20`}>
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <SearchBar />
            <Filter />

          </div>
          <Button
              onClick={() => router.push("restock/add-stock")}
              className="bg-green hover:bg-green/80">
            <Plus strokeWidth={3} /> Add Stock
          </Button>
        </div>


        <div className="mt-5 flex flex-col gap-4">
          <RestockRecord
              restockId={sampleRestock.restockId}
              date={sampleRestock.date}
              supplier={sampleRestock.supplier}
              addedStock={sampleRestock.addedStock}
              restockItems={sampleRestock.restockItems}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Card>
            <CardContent className="flex w-full flex-col gap-3 rounded-lg p-5">
              <div className="flex items-center justify-between p-5">
                <div className="flex w-full flex-col justify-center">
                  <span>#1233478 - September 20, 2024</span>
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-purple-500 h-8 w-8 text-xs">
                      <AvatarFallback className="bg-purple-300">
                        JD
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-500 text-sm font-extralight">
                    Supplier
                  </span>
                  </div>
                </div>

                <div className="flex w-full items-center justify-between">
                  <div className="flex flex-col gap-3">
                    <span>Added Stock</span>
                    <span>500</span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="rounded-md border-2 border-[#D3D6DF] p-3">
                        <Ellipsis color="gray" />
                      </div>
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
                                <Label className="text-textGray">
                                  3 Conversions
                                </Label>
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
                              <Button
                                  className="bg-green px-7 font-bold"
                                  size={"lg"}
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                </div>
              </div>

              <div className="flex w-full items-center justify-between">
                <div className="flex flex-col gap-3 border-l-2 pl-3">
                  <span>Added Stock</span>
                  <span>500</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
            <div className="flex w-full flex-col gap-3">
              <span>#1233478 - September 20, 2024</span>
              <span className="text-sm text-textGray">
              30 Boxes (No conversions)
            </span>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-3 border-l-2 pl-3">
                <span>Added Items</span>
                <span>250</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-[#F0F1F4] p-5">
            <div className="flex w-full flex-col gap-3">
              <span>#1233478 - September 20, 2024</span>
              <span className="text-sm text-textGray">
              30 Boxes (3 conversions)
            </span>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-3 border-l-2 pl-3">
                <span>Added Items</span>
                <span>250</span>
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
        </div>
      </section>
  );
};

export default RestockPage;
