"use client";

import { Batch, BatchVariant } from "@prisma/client";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";
import Filter from "../_components/filter";
import NoRecordsMessage from "../_components/no-records-message";
import SearchBar from "../_components/search-bar";
import SelectRecordMessage from "../_components/select-record-message";
import RecordHeader from "./_components/record-header";
import SelectedItem from "./_components/selected-item";
import RecordItem from "./_components/record-item";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<InventoryItem | null>(
    null,
  );

  const { data: inventoryData } = api.inventory.listInventory.useQuery();

  const getStockLevel = (
    stockLevel: { low_stock: number; very_low_stock: number } | null,
    inventoryQuantity: number,
  ): string => {
    if (!stockLevel) return "good";
    if (inventoryQuantity === 0) return "empty";
    if (inventoryQuantity <= stockLevel.very_low_stock) return "very low";
    if (inventoryQuantity <= stockLevel.low_stock) return "low";
    return "good";
  };

  const filteredInventory = inventoryData?.filter((inventory) => {
    const item =
      `${inventory.variant.item.name} - ${inventory.variant.item.brand.name} - ${inventory.variant.name}`.toLowerCase();
    const id = inventory.variant_id;
    const search = searchTerm.toLowerCase();

    return item.includes(search) || id.toString().includes(search);
  });

  return (
    <section className="flex min-h-screen flex-col px-20 py-10 text-base">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Filter />
        </div>
        <Button
          onClick={() => router.push("/admin/inventory/new-item")}
          className="bg-green hover:bg-green/80"
        >
          <Plus strokeWidth={3} /> New Item
        </Button>
      </div>
      <div className="mt-8 flex flex-grow gap-3">
        <div className="flex w-3/5 flex-grow flex-col gap-3">
          <RecordHeader
            record="Inventory"
            number={filteredInventory?.length ?? 0}
          />
          <div className="flex h-full flex-grow overflow-hidden rounded-lg">
            {(filteredInventory?.length ?? 0) > 0 ? (
              <ScrollArea className="h-full w-full">
                <div className="flex h-40 w-full flex-col items-center">
                  {filteredInventory?.map((item) => (
                    <RecordItem
                      key={item.inventory_id}
                      name={`${item.variant.item.name} - ${item.variant.item.brand.name} - ${item.variant.name}`}
                      id={item.inventory_id.toString()}
                      stockLevel={getStockLevel(
                        item.variant.StockLevel,
                        item.quantity,
                      )}
                      onClick={() => setSelectedRecord(item)}
                      isSelected={
                        selectedRecord?.variant_id === item.variant_id
                      }
                      recordType={"Inventory"}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <NoRecordsMessage
                records={"items"}
                link={"/admin/inventory/new-item"}
                item={"item"}
              />
            )}
          </div>
        </div>
        <div className="flex w-2/5 flex-grow flex-col gap-3">
          <div className="w-full rounded-lg bg-slate-100 px-6 py-3 text-lg">
            <p className="text-slate-500">Details</p>
          </div>
          <div className="flex flex-grow rounded-lg bg-slate-100">
            {selectedRecord ? (
              <ScrollArea className="h-full w-full">
                <div className="flex h-40 w-full flex-col">
                  <SelectedItem
                    id={selectedRecord.variant_id.toString()}
                    variant={selectedRecord.variant.name ?? ""}
                    item={selectedRecord.variant.item.name}
                    brand={selectedRecord.variant.item.brand.name}
                    stockLevel={getStockLevel(
                      selectedRecord.variant.StockLevel,
                      selectedRecord.quantity,
                    )}
                    category={selectedRecord.variant.item.category.name}
                    notes={selectedRecord.variant.item.description}
                    batchVariants={selectedRecord.variant.BatchVariant}
                  />
                </div>
              </ScrollArea>
            ) : (
              <SelectRecordMessage />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InventoryPage;
