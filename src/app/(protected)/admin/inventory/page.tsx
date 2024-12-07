"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";
import InventoryItemInfo from "./_components/item-info";
import InventorySearchAndButtonRouter from "./_components/inventory-search";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import BatchAccordion from "./_components/batch-accordion";
import { Pencil } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Batch, Variant_Attribute } from "@prisma/client";
import { LoadingSpinner } from "~/components/loading";

interface InventoryItemInfoProps {
  inventoryItems: InventoryItem[]; // Ensure this is always defined as an array
}

// InventoryItem and related interfaces
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
  description: string;
  brand: Brand;
  category: Category;
}

interface Variant {
  variant_id: number;
  item_id: number;
  unit: Unit;
  item: Item;
  name?: string; // Optional field for the variant name
  description?: string; // Optional description
  Batch: Batch[]; // Assuming Batch is defined elsewhere
  variantAttributes: Variant_Attribute[]; // Include variantAttributes
}

interface InventoryItem {
  inventory_id: number;
  variant_id: number;
  quantity: number;
  variant: Variant;
}

const InventoryPage = () => {
  const router = useRouter();
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const {
    data: inventoryItems,
    isLoading,
    isError,
  } = api.inventory.listInventory.useQuery();

  if (isLoading)
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  if (isError)
    return (
      <section className="flex h-screen w-full items-center justify-center">
        <span>Error fetching data...</span>
      </section>
    );

  const handleNewInventory = () => {
    router.push("/admin/inventory/newItem"); // Redirect to create new inventory
  };
  const handleEditItem = (id: number) => {
    router.push(`/admin/inventory/edit-item/${id}`); // Redirect to create new item
  };

  return (
    <section
      className={`flex h-auto w-screen flex-col gap-3 overflow-y-scroll p-10 pb-0`}
    >
      <InventorySearchAndButtonRouter />
      <div className="relative flex flex-grow gap-3 overflow-hidden px-3">
        {/* Records Section */}
        <div className="flex w-1/2 flex-col">
          <span>Records</span>
          <div className="scrollbar-hidden overflow-y-scroll">
            {/* <ScrollArea> */}
            <div className="flex flex-col gap-3 pb-3 pr-3">
              {Array.isArray(inventoryItems) && inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <div
                    className={`font-poppins border-gray-300 hover:bg-gray-100 flex cursor-pointer items-center justify-between rounded-md border p-7 shadow-md transition-all duration-200 ${
                      selectedItem?.inventory_id === item.inventory_id
                        ? "bg-gray-300"
                        : ""
                    }`}
                    key={item.inventory_id}
                    onClick={() => setSelectedItem(item)}
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
            {/* </ScrollArea> */}
          </div>
        </div>

        {/* Details Section */}
        <div className="flex w-1/2 flex-col">
          <span>Details</span>
          <div className="bg-gray-200 flex h-full flex-col gap-5 overflow-auto rounded-lg bg-gray p-7">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className="font-bold">
                      {selectedItem?.variant.item.name}
                    </span>
                    <span className="font-bold">
                      {selectedItem?.variant.item.brand.name}
                    </span>
                    <span className="font-bold">
                      {selectedItem?.variant.name}
                    </span>
                  </div>
                  <Badge>{selectedItem?.variant.item.category.name}</Badge>
                </div>
                <span>{selectedItem?.variant.item.item_id}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-gray-400 font-light">Notes</span>
                <span>{selectedItem?.variant.item.description}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>{selectedItem?.variant.Batch.length} Batches</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant={"link"} className="text-green">
                    View All
                  </Button>
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
                        // onClick={() => setIsDialogOpen(!isDialogOpen)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Separator orientation="horizontal" className="bg-textGray" />

            {/* Scrollable batches section */}
            {/* <ScrollArea className={"scrollbar-hidden"}> */}
            <div className="mt-5 flex flex-col gap-5 rounded-lg">
              <BatchAccordion />
            </div>
            {/* </ScrollArea> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPage;
