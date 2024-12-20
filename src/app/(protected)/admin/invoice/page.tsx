"use client";

import { Poppins } from "next/font/google";
import { Search, ListFilter } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
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
import { Input } from "~/components/ui/input";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const InvoicePage = () => {
  const router = useRouter();
  return (
    <section
      className={`h-auto w-screen ${poppins.className} flex flex-col gap-3 overflow-y-scroll p-10`}
    >
      <div className="relative flex items-center">
        <div className="flex h-16 w-full items-center justify-between gap-3">
          <div className="relative flex h-auto w-full max-w-md items-center gap-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-textGray" />
            <Input
              placeholder="Search"
              className="bg-gray p-6 pl-10 shadow-none placeholder:text-textGray"
            />

            <div className="hover:bg-gray-300 rounded-md bg-gray p-3 hover:cursor-pointer">
              {/* <Image src={Filter_Icon} alt="filter icon" /> */}
              <ListFilter className="text-textGray" />
            </div>
          </div>

          <Button
            onClick={() => router.push("/admin/invoice/new-invoice")}
            className="bg-green p-5 font-bold"
          >
            + New Invoice
          </Button>
        </div>
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
