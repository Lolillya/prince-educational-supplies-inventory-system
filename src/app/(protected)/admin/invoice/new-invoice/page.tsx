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
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/loading";
import { Batch } from "@prisma/client";

type InventoryItem = {
  inventory_id: number;
  variant: {
    name: string | null;
    Batch: Batch[];
    item: {
      name: string;
      brand: {
        name: string;
      };
    };
  };
};

const NewInvoice = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [stockTotals, setStockTotals] = useState<{ [key: number]: string }>({});

  const {
    data: inventoryItems,
    isLoading,
    isError,
  } = api.inventory.listInventory.useQuery();

  const handleSelectItem = (item: InventoryItem) => {
    if (
      !selectedItems.some(
        (selected) => selected.inventory_id === item.inventory_id,
      )
    ) {
      setSelectedItems([...selectedItems, item]);
      setStockTotals((prev) => ({ ...prev, [item.inventory_id]: "" })); // Initialize stock
    }
    setSearchTerm(""); // Clear the search term to hide the dropdown
  };

  useEffect(() => {
    if (searchTerm && inventoryItems) {
      const results = inventoryItems.filter(
        (item: InventoryItem) =>
          item.variant.item.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          item.variant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.variant.item.brand.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredItems(results);
    } else {
      setFilteredItems([]);
    }
  }, [searchTerm, inventoryItems]);

  if (isLoading) {
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

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

      <div className="flex w-full justify-center gap-3">
        <div className="relative flex w-full max-w-md items-center justify-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-textGray" />
          <Input
            placeholder="Search"
            className="bg-gray p-5 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && filteredItems.length > 0 && (
            <div className="absolute top-full z-10 mt-2 w-full rounded-lg bg-white p-3 shadow-md">
              <ul className="max-h-64 overflow-auto">
                {filteredItems.map((item) => (
                  <li
                    key={item.inventory_id}
                    className="flex cursor-pointer items-center rounded-lg p-3 hover:bg-gray"
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="flex w-full items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        <Label className="text-xs">
                          {item.variant.item.name} -
                        </Label>
                        <Label className="text-xs">
                          {item.variant.item.brand.name} -
                        </Label>
                        <Label className="text-xs">
                          {item.variant.name || "N/A"}
                        </Label>
                      </div>

                      <Label className="text-xs text-textGray">
                        {item.variant.Batch.length} Batche/s
                      </Label>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-4 grid h-full w-full auto-rows-auto grid-cols-3 gap-3 overflow-y-auto">
        {/* <InvoiceCard /> */}

        {selectedItems.map((item, index) =>
          item.variant.Batch.map((batch, batchIndex) => (
            <InvoiceCard
              key={`${item.inventory_id}-${batchIndex}`}
              batchNumber={batchIndex + 1}
              itemName={item.variant.item.name}
              brandName={item.variant.item.brand.name}
              variant={item.variant.name}
              batch={batch}
            />
          )),
        )}

        {/* CONDITIONAL RENDERING */}

        {selectedItems.length === 0 && (
          <Label className="absolute w-full self-center text-center">
            Search and add an item to get started.
          </Label>
        )}
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
