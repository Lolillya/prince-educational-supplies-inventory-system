"use client";

import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Pencil } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTrigger,
  DialogContent,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import BatchAccordion from "./batch-accordion";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// interface InventoryItemInfoProps {
//   inventoryItems: InventoryItem[];
// }

interface Unit {
  unit_id: number;
  name: string;
  conversion_rate: string;
}

interface Brand {
  brand_id: number;
  name: string;
}

interface Category {
  category_id: number;
  name: string;
}

interface Item {
  item_id: number;
  name: string;
  notes: string;
  brand: Brand;
  category: Category;
}

// interface Variant {
//   variant_id: number;
//   item_id: number;
//   unit: Unit;
//   item: Item;
//   name?: string;
//   description?: string;
//   Batch: Batch[];
//   variantAttributes: Variant_Attribute[];
// }

// interface InventoryItem {
//   inventory_id: number;
//   variant_id: number;
//   quantity: number;
//   variant: Variant;
// }

const InventoryItemInfo = (
  {
    // inventoryItems = [],
  },
) => {
  const router = useRouter();

  const handleEditItem = (variantId: number) => {
    router.push(`/admin/inventory/editItem/${variantId}`);
  };

  return (
    <div className="relative flex flex-grow gap-3 overflow-hidden px-3">
      {/* Records Section */}
      <div className="mx-4 my-4 flex w-1/2 flex-col md:mx-8 md:my-6">
        <span className="font-poppins p-5">Records</span>
        <div className="scrollbar-hidden overflow-auto">
          <ScrollArea>
            <div className="flex flex-col gap-3">
              {Array.isArray(inventoryItems) && inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <div
                    className={`font-poppins border-gray-300 hover:bg-gray-100 flex cursor-pointer items-center justify-between rounded-md border p-7 shadow-md transition-all duration-200 ${
                      selectedItem?.inventory_id === item.inventory_id
                        ? "bg-gray-300"
                        : ""
                    }`}
                    key={item.inventory_id}
                    onClick={() => handleUserClick(item)}
                  >
                    <div className="flex items-center gap-3">
                      <span>{item.variant.item.name}</span>
                      <span> - {item.variant.name || "N/A"}</span>
                      <span> - {item.variant.item.brand.name}</span>
                      <span className="text-gray-400 text-xs">
                        {item.variant.variant_id || "N/A"}
                      </span>
                    </div>
                    <div
                      className="hover:cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item.variant.variant_id);
                      }}
                    >
                      <Pencil color="gray" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="font-poppins text-gray-500 py-10 text-center">
                  No inventory items available.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex w-1/2 flex-col">
        <span className="p-5">Details</span>
        <div className="bg-gray-200 flex h-full flex-col gap-5 overflow-auto rounded-lg p-7">
          {selectedItem ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">
                      {selectedItem.variant.item.name}
                    </span>
                    <span className="font-bold">
                      {" "}
                      - {selectedItem.variant.name || "N/A"}
                    </span>
                    <span className="font-bold">
                      {" "}
                      - {selectedItem.variant.item.brand.name}
                    </span>
                  </div>
                  <Badge>{selectedItem.variant.item.category.name}</Badge>
                </div>
                <span>{selectedItem.variant.variant_id || "N/A"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-400 font-light">Description</span>
                <span>{selectedItem.variant.description || "N/A"}</span>
              </div>
            </div>
          ) : (
            <span>Select an item to view details</span>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span>
              {selectedItem ? selectedItem.variant.Batch.length : 0} Batch
            </span>
            <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
              <DialogTrigger asChild>
                <Button variant={"link"}>View All</Button>
              </DialogTrigger>
              <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="relative flex w-full max-w-2xl flex-col gap-5 rounded-lg bg-white p-6 shadow-lg">
                  <DialogHeader className="flex items-center text-2xl font-bold">
                    <span>Verify it's you!</span>
                  </DialogHeader>
                  <div className="flex flex-col gap-1">
                    <Label className="text-slate-400">Password</Label>
                    <input placeholder="Enter Password" className="p-6" />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button size={"lg"}>Continue</Button>
                    <Button
                      size={"lg"}
                      onClick={() => setIsDialogOpen(!isDialogOpen)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Separator orientation="horizontal" className="bg-[#989FB3]" />

          {/* Scrollable batches section */}
          <ScrollArea className={"scrollbar-hidden"}>
            <div className="mt-5 flex flex-col gap-5 rounded-lg">
              {selectedItem?.variant.Batch &&
              selectedItem.variant.Batch.length > 0 ? (
                selectedItem.variant.Batch.map((batch) => (
                  <BatchAccordion key={batch.batch_id} batch={batch} />
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-gray-500 text-lg font-semibold">
                    No batches available
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default InventoryItemInfo;
