"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import InventoryCard from "../../_components/inventory-card";
import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import { Button } from "~/components/ui/button";

// Props for the InventoryItemInfo component
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
  notes: string;
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
}

interface InventoryItem {
  inventory_id: number;
  variant_id: number;
  quantity: number;
  variant: Variant;
}

// Define your types/interfaces as needed...

const EditItem = () => {
  const router = useRouter();
  const { itemId } = useParams();
  const [itemData, setItemData] = useState<InventoryItem | null>(null);
  const [units, setUnits] = useState<Unit[]>([]); // State to hold the units data

  const itemIdAsNumber = Number(itemId);

  // Fetch item data
  const {
    data: itemDataResponse,
    isLoading: itemLoading,
    isError: itemError,
  } = api.inventory.getInventoryItem.useQuery(
    { id: itemIdAsNumber },
    { enabled: !isNaN(itemIdAsNumber) },
  );

  // Fetch all data including units
  const {
    data: allData,
    isLoading: allLoading,
    isError: allError,
  } = api.inventoryData.listAllData.useQuery();

  // Effect to set item data
  useEffect(() => {
    if (itemDataResponse) {
      setItemData(itemDataResponse);
    }
  }, [itemDataResponse]);

  // Effect to set units data
  useEffect(() => {
    if (allData) {
      setUnits(allData.units); // Set the units from fetched data
    }
  }, [allData]);

  // Handle loading and error states
  if (itemLoading || allLoading) return <div>Loading...</div>;
  if (itemError || allError) return <div>Error loading data</div>;

  return (
    <section className="flex h-screen w-screen flex-col gap-3 overflow-hidden p-10 pb-0">
      <div className="flex items-center gap-2">
        <ArrowLeft
          size={25}
          color="#FF7B7B"
          className="transition-all duration-300 hover:scale-125 hover:cursor-pointer"
          onClick={() => router.push("/admin/inventory")}
        />
        <span className="font-bold">
          {itemData?.variant?.item?.name || "N/A"} -{" "}
          {itemData?.variant?.name || "N/A"} -{" "}
          {itemData?.variant?.item?.brand?.name || "N/A"}
        </span>
        <span className="text-gray-400 ml-3 text-sm font-light">{itemId}</span>
      </div>

      <Separator orientation="horizontal" />
      <div className="grid grid-cols-2 gap-4">
        {itemData?.variant?.Batch && itemData.variant.Batch.length > 0 ? (
          itemData.variant.Batch.map((batch) => (
            <InventoryCard key={batch.batch_id} batch={batch} units={units} />
          ))
        ) : (
          <div className="py-10 text-center">
            <p className="text-gray-500 text-lg font-semibold">
              No batches available
            </p>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 z-[5] flex w-full items-center justify-end gap-3 bg-white px-10 py-5 pl-36 font-bold drop-shadow-2xl">
        <Button size={"lg"} className="bg-green py-8 text-sm font-bold">
          Save Changes
        </Button>
      </div>
    </section>
  );
};

export default EditItem;
