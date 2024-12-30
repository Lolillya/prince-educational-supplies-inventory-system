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
import React, { useState } from "react";
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
import { api } from "~/trpc/react";
import UnitLine from "~/app/(protected)/admin/restock/_components/unit-line";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const RestockPage = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<RestockProps | null>(null); // Change type to RestockProps to handle full batch
  const {
    data: restockData,
    isLoading,
    error,
  } = api.restock.getRestockData.useQuery();

  const handleViewAll = (batch: RestockProps) => {
    console.log("View all restock batch:", batch); // Full batch data
    setSelectedBatch(batch);
    setIsOpen(true);
  };

  interface RestockProps {
    restockId: number;
    date: string;
    customer: string;
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

  return (
    <section
      className={`h-auto w-full ${poppins.className} flex flex-col gap-3 overflow-y-scroll px-20 py-10`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* ADD SEARCH FUNCTION */}
          <SearchBar />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("restock/add-stock")}
          className="bg-green hover:bg-green/80"
        >
          <Plus strokeWidth={3} /> Add Stock
        </Button>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {restockData?.map((restock: RestockProps) => (
          <RestockRecord
            key={restock.restockId}
            restockId={restock.restockId}
            date={restock.date}
            customer={restock.customer}
            addedStock={restock.addedStock}
            restockItems={restock.restockItems}
            onViewAll={handleViewAll}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between p-5">
          <div className="flex w-full items-center justify-between">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="flex h-full max-h-[80%] w-full max-w-3xl flex-col">
                <DialogTitle>
                  Batch {selectedBatch?.restockId} - {selectedBatch?.date}
                </DialogTitle>
                <div className="flex w-full flex-col gap-3">
                  <div className="text-gray-400 flex flex-col gap-1">
                    <Label>Supplier</Label>
                    <Input
                      placeholder="Supplier Name"
                      defaultValue={selectedBatch?.customer}
                    />
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
                      {selectedBatch?.restockItems &&
                      selectedBatch.restockItems.length > 0 ? (
                        selectedBatch.restockItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.item} - {item.brand} - {item.variant}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <HoverCard>
                                  <HoverCardTrigger className="text-sm text-textGray hover:underline">
                                    {item.mainUnit} {item.unitConversion.length}{" "}
                                    Conversions
                                  </HoverCardTrigger>
                                  <HoverCardContent className="flex flex-col gap-3 shadow-none">
                                    {item.unitConversion &&
                                    item.unitConversion.length > 0 ? (
                                      item.unitConversion.map(
                                        (conversion, index) => (
                                          <div key={index}>
                                            {" "}
                                            {/*className="text-xs text-slate-600"*/}
                                            {conversion.from} →{" "}
                                            {conversion.count} {conversion.to}
                                          </div>
                                        ),
                                      )
                                    ) : (
                                      <div className="text-xs text-slate-400">
                                        No conversions available
                                      </div>
                                    )}
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3}>No items available</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="bottom-0 flex w-full justify-end">
                    <div className="flex w-full items-center justify-between gap-3">
                      <span className="font-bold">
                        TOTAL: {selectedBatch?.addedStock}
                      </span>
                      <div className="flex items-center gap-3">
                        <Button
                          size={"lg"}
                          className="font-bold"
                          onClick={() => setIsOpen(false)} // Close the dialog
                        >
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
      </div>
    </section>
  );
};

export default RestockPage;
