"use client";

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
import { useRouter } from "next/navigation";
import BatchAccordion from "./batch-accordion";
import { useState } from "react";

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
  notes: string;
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
  variantAttributes: Variant_Attribute[];
}

interface InventoryItem {
  inventory_id: number;
  variant_id: number;
  quantity: number;
  variant: Variant;
}

const InventoryItemInfo = ({ inventoryItems = [] }) => {
  // const [selectedItem, setSelectedItem] = useState(null);
  const router = useRouter();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUserClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };
  const handleEditItem = (variantId: number) => {
    router.push(`/admin/inventory/editItem/${variantId}`);
  };

  return (
    <div className="relative flex flex-grow gap-3 overflow-hidden px-3">
      {/* Records Section */}
      <div className="flex w-1/2 flex-col">
        <span>Records</span>
        <div className="scrollbar-hidden overflow-y-scroll">
          {/* <ScrollArea> */}
          <div className="flex flex-col gap-3 pr-3">
            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>

            <div
              className={`flex cursor-pointer items-center justify-between rounded-xl bg-gray p-7 shadow-md transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <span>name</span>
                <span>variant</span>
                <span>brand</span>
                <span className="text-xs text-textGray">#1120202</span>
              </div>
              <div className="hover:cursor-pointer">
                <Pencil color="gray" />
              </div>
            </div>
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
                  <span className="font-bold">item</span>
                  <span className="font-bold"> brand</span>
                  <span className="font-bold"> name</span>
                </div>
                <Badge>category</Badge>
              </div>
              <span>00001</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-gray-400 font-light">Notes</span>
              <span>Lorem Ipsum Dolor sit Amet</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>5 Batches</span>
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
          <ScrollArea className={"scrollbar-hidden"}>
            <div className="mt-5 flex flex-col gap-5 rounded-lg">
              {selectedItem?.variant.Batch &&
              selectedItem.variant.Batch.length > 0 ? (
                  selectedItem.variant.Batch.map((batch) => (
                      <BatchAccordion key={batch.batch_id} batch={batch} />
                  ))
              ) : (
                  <div className="py-10 text-center">
                    <p className="text-lg font-semibold text-gray-500">
                      No batches available
                    </p>
                  </div>
              )}
            </div>
          </ScrollArea>
          {/* </ScrollArea> */}
        </div>
      </div>
    </div>
  );
};

export default InventoryItemInfo;
