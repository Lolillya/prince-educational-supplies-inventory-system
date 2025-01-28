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
import { Batch } from "@prisma/client";
import { LoadingSpinner } from "~/components/loading";
import { ScrollArea } from "~/components/ui/scroll-area";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Input } from "~/components/ui/input";

interface InventoryItemInfoProps {
  inventoryItems: InventoryItem[];
}

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
  name?: string;
  description?: string;
  Batch: Batch[];
  BatchVariant: BatchVariant[];
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

  const getStockLevelColor = (
      stockLevel: { low_stock: number; very_low_stock: number } | null,
      inventoryQuantity: number
  ): string => {
    if (!stockLevel) return "bg-black";

    const { low_stock, very_low_stock } = stockLevel;

    if (inventoryQuantity <= very_low_stock) {
      return "bg-red";
    }

    if (inventoryQuantity <= low_stock) {
      return "bg-orage";
    }

    return "bg-green";
  };

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
    router.push("/admin/inventory/newItem");
  };
  const handleEditItem = (id: number) => {
    router.push(`/admin/inventory/edit-item/${id}`);
  };

  const handleEditBatch = (id: number) => {
    router.push(`/admin/inventory/edit-batch/${id}`);
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
                        className={`flex cursor-pointer items-center justify-between rounded-md border p-7 shadow-md transition-all duration-300 hover:bg-gray ${
                            selectedItem?.inventory_id === item.inventory_id
                                ? "bg-gray"
                                : ""
                        }`}
                        key={item.inventory_id}
                        // onClick={() => setSelectedItem(item)}
                        onClick={() => {
                          setSelectedItem(item);
                          // Log inventory_id, inventory_quantity, and stock levels
                          const { low_stock, very_low_stock } = item.variant.StockLevel || {};
                          console.log("Selected Item:");
                          console.log("Inventory ID:", item.inventory_id);
                          console.log("Inventory Quantity:", item.quantity);
                          console.log("Low Stock:", low_stock);
                          console.log("Very Low Stock:", very_low_stock);
                          console.log("Variant ID:", item.variant?.variant_id); // Log variant_id
                        }}
                    >
                      <div className="flex items-center gap-3 relative pl-8">
                        <div
                            className={`absolute left-0 top-1/2 transform -translate-y-1/2 ml-2 h-2 w-2 rounded-full ${getStockLevelColor(item.variant.StockLevel, item.quantity)}`}
                        ></div>

                        <span>{item.variant.item.name}</span>
                        <span> - {item.variant.name || "N/A"}</span>
                        <span> - {item.variant.item.brand.name}</span>
                        <span className="text-xs text-textGray">
                        {item.variant.variant_id || "N/A"}
                      </span>
                      </div>
                      <div
                          className="hover:cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log("Item data:", item);
                            handleEditItem(item.variant.variant_id);
                          }}
                      >
                        <Pencil color="gray"/>
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
              {/*<span>{selectedItem?.variant.Batch.length} Batches</span>*/}
              <span>{selectedItem?.variant.BatchVariant?.length || 0} Batches</span>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant={"link"} className="text-green">
                    View All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle className="text-center font-bold">
                    Verify it's you!
                  </DialogTitle>

                  <div className="flex flex-col gap-1">
                    <Label className="text-textGray">Password</Label>
                    <Input
                        placeholder="Enter Password"
                        className="p-6 placeholder:text-textGray"
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button
                        size={"lg"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (selectedItem) {
                            handleEditBatch(selectedItem.variant.variant_id);
                          } else {
                            console.error("No item selected to continue.");
                          }
                        }}
                    >
                      Continue
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Separator orientation="horizontal" className="bg-textGray" />

            {/*old script*/}
            {/* Scrollable batches section */}
            {/* <ScrollArea className={"scrollbar-hidden"}> */}
            {/*<ScrollArea className={"scrollbar-hidden"}>*/}
            {/*  <div className="mt-5 flex flex-col gap-5 rounded-lg">*/}
            {/*    {selectedItem?.variant.BatchVariant && selectedItem?.variant.BatchVariant?.length > 0 ? (*/}
            {/*        selectedItem.variant.BatchVariant.filter(batchVariant => batchVariant.variant_id === selectedItem.variant.variant_id).map((batchVariant) => (*/}
            {/*            <BatchAccordion*/}
            {/*                key={batchVariant.batch.batch_id}*/}
            {/*                batch={batchVariant.batch}*/}
            {/*                selectedVariantId={selectedItem.variant.variant_id}*/}
            {/*            />*/}
            {/*        ))*/}
            {/*    ) : (*/}
            {/*        <div className="py-10 text-center">*/}
            {/*          <p className="text-gray-500 text-lg font-semibold">No batches available</p>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*  </div>*/}
            {/*</ScrollArea>*/}
            <ScrollArea className={"scrollbar-hidden"}>
              <div className="mt-5 flex flex-col gap-5 rounded-lg">
                {selectedItem?.variant.BatchVariant && selectedItem?.variant.BatchVariant.length > 0 ? (
                    selectedItem.variant.BatchVariant.map((batchVariant, index) => {
                      const batch = batchVariant.batch;
                      return (
                          <BatchAccordion
                              key={batch.batch_id}
                              batch={batch}
                              selectedVariantId={selectedItem.variant.variant_id}
                              batchNumber={index + 1}
                          />
                      );
                    })
                ) : (
                    <div className="py-10 text-center">
                      <p className="text-gray-500 text-lg font-semibold">No batches available</p>
                    </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPage;
