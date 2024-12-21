"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "~/components/ui/dialog";

import { Search, ListFilter } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { useState } from "react";

const RestockPage = () => {
  const router = useRouter();
  const [isOpen, setisOpen] = useState(false);
  return (
    <section
      className={`flex h-auto w-screen flex-col gap-3 overflow-y-scroll p-10`}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex h-16 w-full items-center justify-between gap-3">
          <div className="relative flex h-auto w-full max-w-md items-center gap-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-textGray" />
            <Input
              placeholder="Search"
              className="bg-gray p-6 pl-10 shadow-none placeholder:text-textGray"
            />

            <div className="rounded-md bg-gray p-3 hover:cursor-pointer">
              <ListFilter color="#989FB3" />
            </div>
          </div>
        </div>

        <Button
          size={"lg"}
          onClick={() => router.push("restock/add-stock")}
          className="bg-green py-5 font-bold"
        >
          + Add Stock
        </Button>
      </div>

      <Card>
        <CardContent className="flex w-full flex-col gap-3 rounded-lg p-5">
          <div className="flex items-center justify-between p-5">
            <div className="flex w-full flex-col justify-center">
              <span>#1233478 - September 20, 2024</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-extralight text-textGray">
                  Supplier
                </span>
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-3 border-l-2 pl-3">
                <span>Added Stock</span>
                <span>500</span>
              </div>
            </div>
          </div>

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
        </CardContent>
      </Card>
    </section>
  );
};

export default RestockPage;
