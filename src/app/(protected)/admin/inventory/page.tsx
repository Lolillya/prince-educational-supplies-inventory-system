"use client";

import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Toaster } from "~/components/ui/sonner";
import { api } from "~/trpc/react";
import type { InventoryItem } from "~/types/inventory";
import Filter from "../_components/filter";
import NoRecordsMessage from "../_components/no-records-message";
import SearchBar from "../_components/search-bar";
import SelectRecordMessage from "../_components/select-record-message";
import RecordHeader from "./_components/record-header";
import RecordItem from "./_components/record-item";
import SelectedItem from "./_components/selected-item";

interface InventoryPageProps {
  // Add any page-specific props here
}

// Define the API response type
type APIInventoryResponse = NonNullable<Awaited<ReturnType<typeof api.inventory.listInventory.useQuery>['data']>>;

const InventoryPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<InventoryItem | null>(
    null,
  );

  const { data: inventoryData } = api.inventory.listInventory.useQuery();

  const utils = api.useUtils(); // Get the utils object

  const deleteVariantMutation = api.inventory.deleteVariant.useMutation({
    onSuccess: () => {
      console.log("Variant successfully deleted!");
      utils.inventory.listInventory.invalidate(); // Invalidate the cache for the listInventory query
    },
    onError: (error) => {
      console.error("Failed to delete variant:", error);
    },
  });

  const handleDeleteVariant = async (variantId: number) => {
    try {
      await deleteVariantMutation.mutateAsync({ variantId });
      console.log("Variant successfully deleted!");
    } catch (error) {
      console.error("Failed to delete variant:", error);
    }
  };

  const { data: session } = useSession();
  const personalDetailsId = session?.user?.id; // Get the personal_details_id from the session

  const verifyPasswordMutation = api.inventory.verifyPassword.useMutation({
    onSuccess: () => {
      // Handle successful password verification
      console.log("Password verified!");
    },
    onError: (error) => {
      // Handle password verification error
      console.error("Password verification failed:", error.message);
    },
  });

  const handleVerifyPassword = async (password: string): Promise<boolean> => {
    if (!personalDetailsId) {
      console.error("No personal details ID found in session.");
      return false;
    }

    try {
      await verifyPasswordMutation.mutateAsync({
        personalDetailsId,
        password,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const getStockLevel = (
    stockLevel: { low_stock: number; very_low_stock: number; } | null | undefined,
    inventoryQuantity: number,
  ): string => {
    if (!stockLevel) return "good";
    if (inventoryQuantity === 0) return "empty";
    if (inventoryQuantity <= stockLevel.very_low_stock) return "very low";
    if (inventoryQuantity <= stockLevel.low_stock) return "low";
    return "good";
  };

  const filteredInventory = (inventoryData?.filter((inventory) => {
    const item =
      `${inventory.variant.item.name} - ${inventory.variant.item.brand.name} - ${inventory.variant.name}`.toLowerCase();
    const id = inventory.variant_id;
    const search = searchTerm.toLowerCase();

    return item.includes(search) || id.toString().includes(search);
  }) ?? []) as unknown as InventoryItem[];

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
            data={filteredInventory as any}
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
                      inventoryNumber={item.inventory_number.toString()}
                      stockLevel={getStockLevel(
                        item.variant.StockLevel,
                        item.quantity,
                      )}
                      onClick={() => setSelectedRecord(item)}
                      isSelected={
                        selectedRecord?.variant_id === item.variant_id
                      }
                      recordType={"Inventory"}
                      variantId={item.variant_id}
                      onDelete={handleDeleteVariant}
                      onVerifyPassword={handleVerifyPassword}
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
                    inventoryNumber={selectedRecord.inventory_number.toString()}
                    variant={selectedRecord.variant.name ?? ""}
                    item={selectedRecord.variant.item.name}
                    brand={selectedRecord.variant.item.brand.name}
                    stockLevel={getStockLevel(
                      selectedRecord.variant.StockLevel,
                      selectedRecord.quantity,
                    )}
                    category={selectedRecord.variant.item.category.name}
                    notes={selectedRecord.variant.item.description ?? undefined}
                    batchVariants={selectedRecord.variant.BatchVariant.map(bv => ({
                      batch_variant_id: bv.batch_variant_id.toString(),
                      variant_id: bv.variant_id,
                      quantity: bv.quantity,
                      batch: {
                        batch_id: bv.batch_variant_id.toString(),
                        batch_number: bv.batch_variant_id.toString(),
                        batchVariants: [{
                          batch_variant_id: bv.batch_variant_id.toString(),
                          SupplierUnit: [{
                            supplier_unit_id: "0",
                            quantity_per_unit: bv.quantity,
                            price: 0,
                            unit: { name: "" }
                          }]
                        }]
                      }
                    }))}
                    onVerifyPassword={handleVerifyPassword}
                  />
                </div>
              </ScrollArea>
            ) : (
              <SelectRecordMessage />
            )}
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

export default InventoryPage;
